import performanceMonitoring from '../services/performanceMonitoringService.js';

// Middleware para monitorar performance de requisições
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar o método end da resposta
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Registrar métricas
    performanceMonitoring.recordRequest(
      responseTime, 
      success, 
      success ? null : `HTTP_${res.statusCode}`
    );
    
    // Chamar o método original
    originalEnd.apply(this, args);
  };
  
  next();
};

// Middleware para monitorar queries do banco de dados
export const databasePerformanceMiddleware = (req, res, next) => {
  // Interceptar chamadas de banco de dados
  const originalQuery = req.query;
  
  // Adicionar timing para queries
  if (req.query && typeof req.query === 'function') {
    const wrappedQuery = function(...args) {
      const startTime = Date.now();
      
      return originalQuery.apply(this, args)
        .then(result => {
          const queryTime = Date.now() - startTime;
          const isSlow = queryTime > 1000; // Considerar lento se > 1s
          
          performanceMonitoring.recordDatabaseQuery(queryTime, isSlow);
          
          return result;
        })
        .catch(error => {
          const queryTime = Date.now() - startTime;
          performanceMonitoring.recordDatabaseQuery(queryTime, true);
          throw error;
        });
    };
    
    req.query = wrappedQuery;
  }
  
  next();
};

// Middleware para logging de erros
export const errorLoggingMiddleware = (error, req, res, next) => {
  // Registrar erro nas métricas
  performanceMonitoring.recordRequest(
    Date.now() - req.startTime || 0, 
    false, 
    error.name || 'UNKNOWN_ERROR'
  );
  
  // Log detalhado do erro
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(error);
};

// Middleware para adicionar timestamp de início da requisição
export const requestStartMiddleware = (req, res, next) => {
  req.startTime = Date.now();
  next();
};
