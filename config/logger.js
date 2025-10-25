const winston = require('winston');
const path = require('path');
const config = require('./env');

// Definir níveis de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Definir cores para cada nível
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para arquivos (sem cores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transportes
const transports = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: logFormat
  })
];

// Adicionar transporte de arquivo apenas em produção
if (config.server.nodeEnv === 'production') {
  // Criar diretório de logs se não existir
  const logDir = path.dirname(config.logging.file);
  require('fs').mkdirSync(logDir, { recursive: true });

  // Transport para todos os logs
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Transport para erros
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Transport para HTTP requests
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  );
}

// Criar logger principal
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Logger específico para HTTP requests
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger específico para erros
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger específico para auditoria
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Adicionar transportes de arquivo para auditoria em produção
if (config.server.nodeEnv === 'production') {
  const logDir = path.dirname(config.logging.file);
  
  auditLogger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  );
}

// Funções de log personalizadas
const log = {
  // Log de erro com stack trace
  error: (message, error = null, meta = {}) => {
    if (error && error.stack) {
      logger.error(`${message} - Stack: ${error.stack}`, meta);
    } else {
      logger.error(message, meta);
    }
  },

  // Log de warning
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  // Log de informação
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  // Log de debug
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // Log de HTTP request
  http: (message, meta = {}) => {
    httpLogger.http(message, meta);
  },

  // Log de auditoria
  audit: (action, userId, details = {}) => {
    auditLogger.info('AUDIT', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      details
    });
  },

  // Log de segurança
  security: (event, details = {}) => {
    logger.warn('SECURITY', {
      event,
      timestamp: new Date().toISOString(),
      details
    });
  },

  // Log de performance
  performance: (operation, duration, details = {}) => {
    logger.info('PERFORMANCE', {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      details
    });
  }
};

// Middleware para logging de requests HTTP
const httpLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  httpLogger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer
  });

  // Interceptar resposta para log de duração
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log da resposta
    httpLogger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      ip: req.ip,
      duration: `${duration}ms`,
      statusCode: res.statusCode
    });

    // Log de performance se demorar muito
    if (duration > 1000) {
      log.performance(`${req.method} ${req.originalUrl}`, duration, {
        ip: req.ip,
        statusCode: res.statusCode
      });
    }

    originalSend.call(this, data);
  };

  next();
};

// Função para limpar logs antigos
const cleanupLogs = async () => {
  try {
    const fs = require('fs').promises;
    const logDir = path.dirname(config.logging.file);
    
    // Listar arquivos de log
    const files = await fs.readdir(logDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    for (const file of logFiles) {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      // Deletar logs com mais de 30 dias
      if (daysSinceModified > 30) {
        await fs.unlink(filePath);
        log.info(`Log antigo removido: ${file}`);
      }
    }
  } catch (error) {
    log.error('Erro ao limpar logs antigos', error);
  }
};

// Executar limpeza de logs diariamente
if (config.server.nodeEnv === 'production') {
  setInterval(cleanupLogs, 24 * 60 * 60 * 1000); // 24 horas
}

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  auditLogger,
  log,
  httpLoggingMiddleware,
  cleanupLogs
};
