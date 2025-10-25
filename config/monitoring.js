const { log } = require('./logger');
const config = require('./env');

// Métricas básicas do sistema
const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byMethod: {},
    byRoute: {},
    byStatus: {}
  },
  performance: {
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    responseTimes: []
  },
  errors: {
    total: 0,
    byType: {},
    recent: []
  },
  uptime: {
    startTime: Date.now(),
    lastRequest: null,
    lastError: null
  },
  memory: {
    used: 0,
    total: 0,
    percentage: 0
  }
};

// Função para atualizar métricas de requisição
const updateRequestMetrics = (req, res, duration) => {
  metrics.requests.total++;
  metrics.uptime.lastRequest = Date.now();
  
  // Contar por método
  const method = req.method;
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  
  // Contar por rota
  const route = req.route?.path || req.originalUrl;
  metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;
  
  // Contar por status
  const status = res.statusCode;
  metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;
  
  // Contar sucessos e erros
  if (status >= 200 && status < 400) {
    metrics.requests.success++;
  } else if (status >= 400) {
    metrics.requests.error++;
  }
  
  // Atualizar métricas de performance
  updatePerformanceMetrics(duration);
};

// Função para atualizar métricas de performance
const updatePerformanceMetrics = (duration) => {
  metrics.performance.responseTimes.push(duration);
  
  // Manter apenas os últimos 1000 tempos de resposta
  if (metrics.performance.responseTimes.length > 1000) {
    metrics.performance.responseTimes = metrics.performance.responseTimes.slice(-1000);
  }
  
  // Atualizar estatísticas
  metrics.performance.maxResponseTime = Math.max(metrics.performance.maxResponseTime, duration);
  metrics.performance.minResponseTime = Math.min(metrics.performance.minResponseTime, duration);
  
  // Calcular média
  const sum = metrics.performance.responseTimes.reduce((a, b) => a + b, 0);
  metrics.performance.averageResponseTime = sum / metrics.performance.responseTimes.length;
};

// Função para atualizar métricas de erro
const updateErrorMetrics = (error, req) => {
  metrics.errors.total++;
  metrics.uptime.lastError = Date.now();
  
  // Contar por tipo de erro
  const errorType = error.name || 'Unknown';
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
  
  // Manter apenas os últimos 50 erros
  metrics.errors.recent.push({
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    route: req?.originalUrl,
    method: req?.method,
    ip: req?.ip
  });
  
  if (metrics.errors.recent.length > 50) {
    metrics.errors.recent = metrics.errors.recent.slice(-50);
  }
};

// Função para atualizar métricas de memória
const updateMemoryMetrics = () => {
  const memUsage = process.memoryUsage();
  metrics.memory.used = memUsage.heapUsed;
  metrics.memory.total = memUsage.heapTotal;
  metrics.memory.percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
};

// Função para obter métricas atuais
const getMetrics = () => {
  updateMemoryMetrics();
  
  const uptime = Date.now() - metrics.uptime.startTime;
  
  return {
    ...metrics,
    uptime: {
      ...metrics.uptime,
      current: uptime,
      formatted: formatUptime(uptime)
    },
    timestamp: new Date().toISOString()
  };
};

// Função para formatar uptime
const formatUptime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Função para verificar saúde do sistema
const healthCheck = () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(Date.now() - metrics.uptime.startTime),
    memory: {
      used: `${Math.round(metrics.memory.used / 1024 / 1024)}MB`,
      total: `${Math.round(metrics.memory.total / 1024 / 1024)}MB`,
      percentage: `${Math.round(metrics.memory.percentage)}%`
    },
    requests: {
      total: metrics.requests.total,
      successRate: metrics.requests.total > 0 
        ? `${Math.round((metrics.requests.success / metrics.requests.total) * 100)}%`
        : '0%'
    },
    performance: {
      averageResponseTime: `${Math.round(metrics.performance.averageResponseTime)}ms`,
      maxResponseTime: `${metrics.performance.maxResponseTime}ms`
    },
    errors: {
      total: metrics.errors.total,
      recent: metrics.errors.recent.length
    }
  };
  
  // Verificar se o sistema está saudável
  if (metrics.memory.percentage > 90) {
    health.status = 'warning';
    health.warnings = ['High memory usage'];
  }
  
  if (metrics.performance.averageResponseTime > 5000) {
    health.status = 'warning';
    health.warnings = [...(health.warnings || []), 'Slow response times'];
  }
  
  if (metrics.errors.total > 100 && metrics.requests.total > 0) {
    const errorRate = (metrics.errors.total / metrics.requests.total) * 100;
    if (errorRate > 10) {
      health.status = 'unhealthy';
      health.warnings = [...(health.warnings || []), 'High error rate'];
    }
  }
  
  return health;
};

// Função para resetar métricas
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    success: 0,
    error: 0,
    byMethod: {},
    byRoute: {},
    byStatus: {}
  };
  
  metrics.performance = {
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    responseTimes: []
  };
  
  metrics.errors = {
    total: 0,
    byType: {},
    recent: []
  };
  
  log.info('Métricas resetadas');
};

// Middleware para monitoramento de requests
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    updateRequestMetrics(req, res, duration);
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para monitoramento de erros
const errorMonitoringMiddleware = (err, req, res, next) => {
  updateErrorMetrics(err, req);
  next(err);
};

// Função para gerar relatório de métricas
const generateReport = () => {
  const report = {
    summary: {
      totalRequests: metrics.requests.total,
      successRate: metrics.requests.total > 0 
        ? Math.round((metrics.requests.success / metrics.requests.total) * 100)
        : 0,
      averageResponseTime: Math.round(metrics.performance.averageResponseTime),
      totalErrors: metrics.errors.total,
      uptime: formatUptime(Date.now() - metrics.uptime.startTime)
    },
    topRoutes: Object.entries(metrics.requests.byRoute)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ route, count })),
    topErrors: Object.entries(metrics.errors.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count })),
    statusCodes: metrics.requests.byStatus,
    recentErrors: metrics.errors.recent.slice(-10)
  };
  
  return report;
};

// Executar atualização de métricas de memória a cada 30 segundos
setInterval(updateMemoryMetrics, 30000);

// Log de métricas a cada 5 minutos em produção
if (config.server.nodeEnv === 'production') {
  setInterval(() => {
    const report = generateReport();
    log.info('Métricas do sistema', report);
  }, 5 * 60 * 1000);
}

module.exports = {
  metrics,
  updateRequestMetrics,
  updateErrorMetrics,
  updateMemoryMetrics,
  getMetrics,
  healthCheck,
  resetMetrics,
  monitoringMiddleware,
  errorMonitoringMiddleware,
  generateReport
};
