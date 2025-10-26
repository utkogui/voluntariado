const winston = require('winston');
const { createLogger, format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const config = require('../config/production');

class CentralizedLoggingService {
  constructor() {
    this.logger = null;
    this.initializeLogger();
  }

  initializeLogger() {
    const logFormat = format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.json(),
      format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = {
          timestamp,
          level,
          message,
          service: 'volunteer-app',
          environment: config.server.nodeEnv,
          ...meta
        };

        if (stack) {
          log.stack = stack;
        }

        return JSON.stringify(log);
      })
    );

    const transports = [
      // Console transport
      new transports.Console({
        level: config.logging.level,
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      }),

      // File transport for all logs
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: config.logging.level,
        format: logFormat
      }),

      // Error logs
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: logFormat
      }),

      // Access logs
      new DailyRotateFile({
        filename: 'logs/access-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        level: 'info',
        format: logFormat
      })
    ];

    // Add Elasticsearch transport if configured
    if (config.monitoring.elasticsearch) {
      transports.push(new ElasticsearchTransport({
        level: config.logging.level,
        clientOpts: {
          node: config.monitoring.elasticsearch.url,
          auth: {
            username: config.monitoring.elasticsearch.username,
            password: config.monitoring.elasticsearch.password
          }
        },
        index: 'volunteer-app-logs',
        indexTemplate: {
          index_patterns: ['volunteer-app-logs-*'],
          template: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0
            },
            mappings: {
              properties: {
                timestamp: { type: 'date' },
                level: { type: 'keyword' },
                message: { type: 'text' },
                service: { type: 'keyword' },
                environment: { type: 'keyword' },
                userId: { type: 'keyword' },
                requestId: { type: 'keyword' },
                ip: { type: 'ip' },
                userAgent: { type: 'text' },
                method: { type: 'keyword' },
                url: { type: 'keyword' },
                statusCode: { type: 'integer' },
                responseTime: { type: 'integer' }
              }
            }
          }
        }
      }));
    }

    this.logger = createLogger({
      level: config.logging.level,
      format: logFormat,
      transports,
      exitOnError: false
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new transports.File({ filename: 'logs/exceptions.log' })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new transports.File({ filename: 'logs/rejections.log' })
    );
  }

  // Log info message
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  // Log error message
  error(message, error = null, meta = {}) {
    const logMeta = { ...meta };
    
    if (error) {
      logMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    this.logger.error(message, logMeta);
  }

  // Log warning message
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  // Log debug message
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Log HTTP request
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTime,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      this.logger.warn('HTTP Request', logData);
    } else {
      this.logger.info('HTTP Request', logData);
    }
  }

  // Log database query
  logQuery(query, params, duration, error = null) {
    const logData = {
      query: query.substring(0, 200), // Truncate long queries
      params: params,
      duration: duration,
      type: 'database'
    };

    if (error) {
      logData.error = {
        message: error.message,
        code: error.code
      };
      this.logger.error('Database Query Error', logData);
    } else {
      this.logger.debug('Database Query', logData);
    }
  }

  // Log authentication events
  logAuth(event, userId, ip, userAgent, success = true, error = null) {
    const logData = {
      event: event,
      userId: userId,
      ip: ip,
      userAgent: userAgent,
      success: success,
      type: 'authentication'
    };

    if (error) {
      logData.error = {
        message: error.message,
        code: error.code
      };
    }

    if (success) {
      this.logger.info('Authentication Event', logData);
    } else {
      this.logger.warn('Authentication Event', logData);
    }
  }

  // Log business events
  logBusinessEvent(event, userId, data = {}) {
    const logData = {
      event: event,
      userId: userId,
      data: data,
      type: 'business'
    };

    this.logger.info('Business Event', logData);
  }

  // Log security events
  logSecurityEvent(event, severity, ip, userAgent, details = {}) {
    const logData = {
      event: event,
      severity: severity,
      ip: ip,
      userAgent: userAgent,
      details: details,
      type: 'security'
    };

    if (severity === 'high') {
      this.logger.error('Security Event', logData);
    } else if (severity === 'medium') {
      this.logger.warn('Security Event', logData);
    } else {
      this.logger.info('Security Event', logData);
    }
  }

  // Log performance metrics
  logPerformance(metric, value, unit, tags = {}) {
    const logData = {
      metric: metric,
      value: value,
      unit: unit,
      tags: tags,
      type: 'performance'
    };

    this.logger.info('Performance Metric', logData);
  }

  // Log system events
  logSystemEvent(event, details = {}) {
    const logData = {
      event: event,
      details: details,
      type: 'system'
    };

    this.logger.info('System Event', logData);
  }

  // Get logger instance
  getLogger() {
    return this.logger;
  }

  // Create child logger with additional context
  child(defaultMeta = {}) {
    return this.logger.child(defaultMeta);
  }

  // Close logger
  close() {
    return new Promise((resolve) => {
      this.logger.close(() => {
        resolve();
      });
    });
  }
}

// Create singleton instance
const loggingService = new CentralizedLoggingService();

module.exports = loggingService;
