const express = require('express');
const apmService = require('../services/apmService');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// APM middleware
const apmMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Start transaction
  const transaction = apmService.startTransaction(`${req.method} ${req.url}`, 'http');
  
  // Override res.end to monitor response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Monitor HTTP request
    apmService.monitorHttpRequest(req, res, responseTime);
    
    // End transaction
    apmService.endTransaction(transaction);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Get APM health status
router.get('/health', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const health = apmService.getHealthStatus();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get APM health status'
    });
  }
});

// Get metrics summary
router.get('/metrics', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const metrics = apmService.getMetricsSummary();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics summary'
    });
  }
});

// Record custom metric
router.post('/metrics', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { name, value, tags } = req.body;
    
    if (!name || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name and value are required'
      });
    }
    
    apmService.recordMetric(name, value, tags);
    
    res.json({
      success: true,
      message: 'Metric recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record metric'
    });
  }
});

// Record custom event
router.post('/events', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { name, attributes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Event name is required'
      });
    }
    
    apmService.recordEvent(name, attributes);
    
    res.json({
      success: true,
      message: 'Event recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record event'
    });
  }
});

// Record business metric
router.post('/business', authMiddleware, (req, res) => {
  try {
    const { event, userId, data } = req.body;
    
    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Event is required'
      });
    }
    
    apmService.recordBusinessMetric(event, userId, data);
    
    res.json({
      success: true,
      message: 'Business metric recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record business metric'
    });
  }
});

// Record performance metric
router.post('/performance', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { metric, value, unit, tags } = req.body;
    
    if (!metric || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Metric and value are required'
      });
    }
    
    apmService.recordPerformanceMetric(metric, value, unit, tags);
    
    res.json({
      success: true,
      message: 'Performance metric recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record performance metric'
    });
  }
});

// Capture error
router.post('/errors', authMiddleware, (req, res) => {
  try {
    const { error, context } = req.body;
    
    if (!error) {
      return res.status(400).json({
        success: false,
        error: 'Error is required'
      });
    }
    
    const errorObj = new Error(error.message || error);
    if (error.stack) {
      errorObj.stack = error.stack;
    }
    
    apmService.captureError(errorObj, context);
    
    res.json({
      success: true,
      message: 'Error captured successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to capture error'
    });
  }
});

// Start span
router.post('/spans', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { name, operation, data } = req.body;
    
    if (!name || !operation) {
      return res.status(400).json({
        success: false,
        error: 'Name and operation are required'
      });
    }
    
    const span = apmService.startSpan(name, operation, data);
    
    res.json({
      success: true,
      message: 'Span started successfully',
      data: {
        spanId: span?.spanId || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start span'
    });
  }
});

// End span
router.post('/spans/:spanId/end', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { spanId } = req.params;
    
    // In a real implementation, you would store spans and retrieve them by ID
    // For now, we'll just acknowledge the request
    res.json({
      success: true,
      message: 'Span ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to end span'
    });
  }
});

// Get performance dashboard data
router.get('/dashboard', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const dashboard = {
      metrics: apmService.getMetricsSummary(),
      health: apmService.getHealthStatus(),
      timestamp: Date.now()
    };
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

// Get error trends
router.get('/errors/trends', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    // This would typically query an APM service for error trends
    // For now, return mock data
    const trends = [];
    
    res.json({
      success: true,
      data: {
        trends,
        total: trends.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get error trends'
    });
  }
});

// Get performance trends
router.get('/performance/trends', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    // This would typically query an APM service for performance trends
    // For now, return mock data
    const trends = [];
    
    res.json({
      success: true,
      data: {
        trends,
        total: trends.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get performance trends'
    });
  }
});

module.exports = { router, apmMiddleware };
