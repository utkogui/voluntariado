const newrelic = require('newrelic');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const config = require('../config/production');

class APMService {
  constructor() {
    this.newrelic = null;
    this.sentry = null;
    this.metrics = new Map();
    this.customMetrics = new Map();
    this.initializeServices();
  }

  initializeServices() {
    // Initialize New Relic
    if (config.monitoring.newRelic?.licenseKey) {
      this.newrelic = newrelic;
      console.log('New Relic APM initialized');
    }

    // Initialize Sentry
    if (config.monitoring.sentry?.dsn) {
      Sentry.init({
        dsn: config.monitoring.sentry.dsn,
        environment: config.server.nodeEnv,
        integrations: [
          new ProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        beforeSend(event) {
          // Filter out sensitive data
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.request?.headers?.authorization) {
            delete event.request.headers.authorization;
          }
          return event;
        }
      });
      this.sentry = Sentry;
      console.log('Sentry APM initialized');
    }
  }

  // Custom metrics tracking
  recordMetric(name, value, tags = {}) {
    try {
      // Store in memory for local tracking
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const metricData = {
        name,
        value,
        tags,
        timestamp: Date.now()
      };
      
      this.metrics.get(name).push(metricData);
      
      // Keep only last 1000 entries per metric
      if (this.metrics.get(name).length > 1000) {
        this.metrics.get(name).shift();
      }
      
      // Send to New Relic
      if (this.newrelic) {
        this.newrelic.recordMetric(name, value);
        if (Object.keys(tags).length > 0) {
          this.newrelic.recordMetric(name, value, tags);
        }
      }
      
      // Send to Sentry
      if (this.sentry) {
        this.sentry.addBreadcrumb({
          message: `Metric: ${name}`,
          data: { value, tags },
          level: 'info'
        });
      }
      
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  // Custom event tracking
  recordEvent(name, attributes = {}) {
    try {
      // Send to New Relic
      if (this.newrelic) {
        this.newrelic.recordCustomEvent(name, attributes);
      }
      
      // Send to Sentry
      if (this.sentry) {
        this.sentry.addBreadcrumb({
          message: `Event: ${name}`,
          data: attributes,
          level: 'info'
        });
      }
      
    } catch (error) {
      console.error('Failed to record event:', error);
    }
  }

  // Performance monitoring
  startTransaction(name, category = 'custom') {
    try {
      if (this.newrelic) {
        return this.newrelic.startWebTransaction(name, () => {});
      }
      
      if (this.sentry) {
        return this.sentry.startTransaction({
          name,
          op: category
        });
      }
      
      return null;
    } catch (error) {
      console.error('Failed to start transaction:', error);
      return null;
    }
  }

  endTransaction(transaction) {
    try {
      if (transaction) {
        if (this.newrelic) {
          transaction.end();
        }
        
        if (this.sentry) {
          transaction.finish();
        }
      }
    } catch (error) {
      console.error('Failed to end transaction:', error);
    }
  }

  // Error tracking
  captureError(error, context = {}) {
    try {
      // Send to Sentry
      if (this.sentry) {
        this.sentry.withScope((scope) => {
          Object.keys(context).forEach(key => {
            scope.setContext(key, context[key]);
          });
          this.sentry.captureException(error);
        });
      }
      
      // Send to New Relic
      if (this.newrelic) {
        this.newrelic.noticeError(error, context);
      }
      
    } catch (err) {
      console.error('Failed to capture error:', err);
    }
  }

  // Database query monitoring
  monitorDatabaseQuery(query, params, duration, error = null) {
    try {
      const attributes = {
        query: query.substring(0, 200), // Truncate long queries
        paramCount: params ? params.length : 0,
        duration: duration,
        hasError: !!error
      };
      
      this.recordMetric('Database.Query.Duration', duration, {
        hasError: !!error
      });
      
      this.recordEvent('DatabaseQuery', attributes);
      
      if (error) {
        this.captureError(error, {
          query: query.substring(0, 200),
          params: params,
          duration: duration
        });
      }
      
    } catch (err) {
      console.error('Failed to monitor database query:', err);
    }
  }

  // HTTP request monitoring
  monitorHttpRequest(req, res, responseTime, error = null) {
    try {
      const attributes = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: responseTime,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
      };
      
      this.recordMetric('HTTP.Request.Duration', responseTime, {
        method: req.method,
        statusCode: res.statusCode
      });
      
      this.recordMetric('HTTP.Request.Count', 1, {
        method: req.method,
        statusCode: res.statusCode
      });
      
      this.recordEvent('HTTPRequest', attributes);
      
      if (error) {
        this.captureError(error, attributes);
      }
      
    } catch (err) {
      console.error('Failed to monitor HTTP request:', err);
    }
  }

  // Business metrics
  recordBusinessMetric(event, userId, data = {}) {
    try {
      const attributes = {
        event: event,
        userId: userId,
        timestamp: Date.now(),
        ...data
      };
      
      this.recordMetric(`Business.${event}`, 1, {
        userId: userId
      });
      
      this.recordEvent('BusinessEvent', attributes);
      
    } catch (error) {
      console.error('Failed to record business metric:', error);
    }
  }

  // Performance metrics
  recordPerformanceMetric(metric, value, unit, tags = {}) {
    try {
      const attributes = {
        metric: metric,
        value: value,
        unit: unit,
        tags: tags,
        timestamp: Date.now()
      };
      
      this.recordMetric(`Performance.${metric}`, value, tags);
      
      this.recordEvent('PerformanceMetric', attributes);
      
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    try {
      const usage = process.memoryUsage();
      
      this.recordMetric('Memory.HeapUsed', usage.heapUsed);
      this.recordMetric('Memory.HeapTotal', usage.heapTotal);
      this.recordMetric('Memory.External', usage.external);
      this.recordMetric('Memory.RSS', usage.rss);
      
      // Calculate heap usage percentage
      const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
      this.recordMetric('Memory.HeapUsagePercent', heapUsagePercent);
      
    } catch (error) {
      console.error('Failed to monitor memory usage:', error);
    }
  }

  // CPU usage monitoring
  monitorCpuUsage() {
    try {
      const usage = process.cpuUsage();
      
      this.recordMetric('CPU.User', usage.user);
      this.recordMetric('CPU.System', usage.system);
      
    } catch (error) {
      console.error('Failed to monitor CPU usage:', error);
    }
  }

  // Custom span for tracing
  startSpan(name, operation, data = {}) {
    try {
      if (this.sentry) {
        return this.sentry.startSpan({
          name,
          op: operation,
          data
        });
      }
      
      return null;
    } catch (error) {
      console.error('Failed to start span:', error);
      return null;
    }
  }

  endSpan(span) {
    try {
      if (span) {
        span.finish();
      }
    } catch (error) {
      console.error('Failed to end span:', error);
    }
  }

  // Get metrics summary
  getMetricsSummary() {
    try {
      const summary = {};
      
      for (const [name, data] of this.metrics.entries()) {
        if (data.length > 0) {
          const values = data.map(d => d.value);
          summary[name] = {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            lastValue: values[values.length - 1],
            lastTimestamp: data[data.length - 1].timestamp
          };
        }
      }
      
      return summary;
    } catch (error) {
      console.error('Failed to get metrics summary:', error);
      return {};
    }
  }

  // Health check
  getHealthStatus() {
    try {
      const status = {
        newrelic: !!this.newrelic,
        sentry: !!this.sentry,
        metricsCount: this.metrics.size,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: Date.now()
      };
      
      return status;
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Start periodic monitoring
  startPeriodicMonitoring() {
    try {
      // Monitor memory usage every 30 seconds
      setInterval(() => {
        this.monitorMemoryUsage();
      }, 30000);
      
      // Monitor CPU usage every 60 seconds
      setInterval(() => {
        this.monitorCpuUsage();
      }, 60000);
      
      console.log('Periodic monitoring started');
    } catch (error) {
      console.error('Failed to start periodic monitoring:', error);
    }
  }

  // Close APM services
  async close() {
    try {
      if (this.sentry) {
        await this.sentry.close();
      }
      
      console.log('APM services closed');
    } catch (error) {
      console.error('Failed to close APM services:', error);
    }
  }
}

// Create singleton instance
const apmService = new APMService();

module.exports = apmService;
