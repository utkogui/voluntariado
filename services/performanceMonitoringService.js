import os from 'os';
import fs from 'fs';
import path from 'path';

class PerformanceMonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimeHistory: []
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0
      },
      database: {
        connectionCount: 0,
        queryCount: 0,
        averageQueryTime: 0,
        slowQueries: 0
      },
      errors: {
        total: 0,
        byType: {},
        recent: []
      }
    };
    this.startTime = Date.now();
    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      cpuUsage: 80, // 80%
      memoryUsage: 85, // 85%
      errorRate: 5 // 5%
    };
  }

  // Métricas de requisições
  recordRequest(responseTime, success = true, errorType = null) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
      this.metrics.errors.total++;
      
      if (errorType) {
        this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
      }
      
      this.metrics.errors.recent.push({
        timestamp: new Date().toISOString(),
        type: errorType,
        responseTime
      });
      
      // Manter apenas os últimos 100 erros
      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift();
      }
    }

    // Atualizar tempo de resposta médio
    this.metrics.requests.responseTimeHistory.push(responseTime);
    if (this.metrics.requests.responseTimeHistory.length > 1000) {
      this.metrics.requests.responseTimeHistory.shift();
    }
    
    this.metrics.requests.averageResponseTime = 
      this.metrics.requests.responseTimeHistory.reduce((a, b) => a + b, 0) / 
      this.metrics.requests.responseTimeHistory.length;

    // Verificar alertas
    this.checkAlerts();
  }

  // Métricas do sistema
  updateSystemMetrics() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((a, b) => a + b, 0);
    }, 0);
    
    this.metrics.system.cpuUsage = 100 - Math.round(100 * totalIdle / totalTick);
    this.metrics.system.memoryUsage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
    this.metrics.system.uptime = Math.round((Date.now() - this.startTime) / 1000);
    
    // Verificar uso de disco
    try {
      const stats = fs.statSync(process.cwd());
      // Implementação simplificada - em produção usar biblioteca específica
      this.metrics.system.diskUsage = 0; // Placeholder
    } catch (error) {
      console.error('Error checking disk usage:', error);
    }
  }

  // Métricas do banco de dados
  recordDatabaseQuery(queryTime, isSlow = false) {
    this.metrics.database.queryCount++;
    
    if (isSlow) {
      this.metrics.database.slowQueries++;
    }
    
    // Atualizar tempo médio de query
    const currentAvg = this.metrics.database.averageQueryTime;
    const totalQueries = this.metrics.database.queryCount;
    this.metrics.database.averageQueryTime = 
      ((currentAvg * (totalQueries - 1)) + queryTime) / totalQueries;
  }

  // Verificar alertas
  checkAlerts() {
    const alerts = [];
    
    // Alerta de tempo de resposta
    if (this.metrics.requests.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        message: `Average response time is ${this.metrics.requests.averageResponseTime}ms`,
        severity: 'WARNING',
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerta de CPU
    if (this.metrics.system.cpuUsage > this.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'HIGH_CPU_USAGE',
        message: `CPU usage is ${this.metrics.system.cpuUsage}%`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerta de memória
    if (this.metrics.system.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `Memory usage is ${this.metrics.system.memoryUsage}%`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerta de taxa de erro
    const errorRate = (this.metrics.requests.failed / this.metrics.requests.total) * 100;
    if (errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Error rate is ${errorRate.toFixed(2)}%`,
        severity: 'WARNING',
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  // Health check
  getHealthStatus() {
    this.updateSystemMetrics();
    const alerts = this.checkAlerts();
    
    const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL');
    const warningAlerts = alerts.filter(alert => alert.severity === 'WARNING');
    
    let status = 'HEALTHY';
    if (criticalAlerts.length > 0) {
      status = 'UNHEALTHY';
    } else if (warningAlerts.length > 0) {
      status = 'DEGRADED';
    }
    
    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.metrics.system.uptime,
      alerts,
      metrics: this.getMetrics()
    };
  }

  // Obter métricas
  getMetrics() {
    this.updateSystemMetrics();
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  // Obter métricas resumidas
  getSummaryMetrics() {
    this.updateSystemMetrics();
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100 
      : 0;
    
    return {
      requests: {
        total: this.metrics.requests.total,
        successRate: ((this.metrics.requests.successful / this.metrics.requests.total) * 100).toFixed(2),
        averageResponseTime: Math.round(this.metrics.requests.averageResponseTime),
        errorRate: errorRate.toFixed(2)
      },
      system: {
        cpuUsage: this.metrics.system.cpuUsage,
        memoryUsage: this.metrics.system.memoryUsage,
        uptime: this.metrics.system.uptime
      },
      database: {
        queryCount: this.metrics.database.queryCount,
        averageQueryTime: Math.round(this.metrics.database.averageQueryTime),
        slowQueries: this.metrics.database.slowQueries
      },
      errors: {
        total: this.metrics.errors.total,
        recentCount: this.metrics.errors.recent.length
      }
    };
  }

  // Reset métricas
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimeHistory: []
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0
      },
      database: {
        connectionCount: 0,
        queryCount: 0,
        averageQueryTime: 0,
        slowQueries: 0
      },
      errors: {
        total: 0,
        byType: {},
        recent: []
      }
    };
    this.startTime = Date.now();
  }
}

// Singleton instance
const performanceMonitoring = new PerformanceMonitoringService();

export default performanceMonitoring;
