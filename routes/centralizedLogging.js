const express = require('express');
const centralizedLoggingService = require('../services/centralizedLoggingService');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Log middleware
const logMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate request ID
  req.requestId = req.headers['x-request-id'] || 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    centralizedLoggingService.logRequest(req, res, responseTime);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Log authentication events
router.post('/auth', authMiddleware, (req, res) => {
  try {
    const { event, userId, ip, userAgent, success, error } = req.body;
    
    centralizedLoggingService.logAuth(event, userId, ip, userAgent, success, error);
    
    res.json({
      success: true,
      message: 'Authentication event logged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to log authentication event'
    });
  }
});

// Log business events
router.post('/business', authMiddleware, (req, res) => {
  try {
    const { event, userId, data } = req.body;
    
    centralizedLoggingService.logBusinessEvent(event, userId, data);
    
    res.json({
      success: true,
      message: 'Business event logged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to log business event'
    });
  }
});

// Log security events
router.post('/security', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { event, severity, ip, userAgent, details } = req.body;
    
    centralizedLoggingService.logSecurityEvent(event, severity, ip, userAgent, details);
    
    res.json({
      success: true,
      message: 'Security event logged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to log security event'
    });
  }
});

// Log performance metrics
router.post('/performance', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { metric, value, unit, tags } = req.body;
    
    centralizedLoggingService.logPerformance(metric, value, unit, tags);
    
    res.json({
      success: true,
      message: 'Performance metric logged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to log performance metric'
    });
  }
});

// Log system events
router.post('/system', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { event, details } = req.body;
    
    centralizedLoggingService.logSystemEvent(event, details);
    
    res.json({
      success: true,
      message: 'System event logged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to log system event'
    });
  }
});

// Get log statistics
router.get('/stats', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const stats = {
      totalLogs: 0,
      errorLogs: 0,
      warningLogs: 0,
      infoLogs: 0,
      debugLogs: 0,
      lastLogTime: null
    };
    
    // This would typically query a log aggregation service
    // For now, return mock data
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get log statistics'
    });
  }
});

// Search logs
router.get('/search', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { 
      level, 
      startDate, 
      endDate, 
      userId, 
      event, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    // This would typically query a log aggregation service
    // For now, return mock data
    const logs = [];
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search logs'
    });
  }
});

// Export logs
router.get('/export', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    // This would typically generate and return log files
    // For now, return mock data
    res.json({
      success: true,
      message: 'Log export initiated',
      downloadUrl: '/api/logs/download/export-123.zip'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export logs'
    });
  }
});

// Download exported logs
router.get('/download/:exportId', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { exportId } = req.params;
    
    // This would typically serve the exported log file
    res.json({
      success: true,
      message: 'Log download initiated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to download logs'
    });
  }
});

// Get log levels
router.get('/levels', authMiddleware, (req, res) => {
  try {
    const levels = [
      { value: 'error', label: 'Error', color: '#f56565' },
      { value: 'warn', label: 'Warning', color: '#ed8936' },
      { value: 'info', label: 'Info', color: '#4299e1' },
      { value: 'debug', label: 'Debug', color: '#68d391' }
    ];
    
    res.json({
      success: true,
      data: levels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get log levels'
    });
  }
});

// Get log types
router.get('/types', authMiddleware, (req, res) => {
  try {
    const types = [
      { value: 'authentication', label: 'Authentication' },
      { value: 'business', label: 'Business' },
      { value: 'security', label: 'Security' },
      { value: 'performance', label: 'Performance' },
      { value: 'system', label: 'System' },
      { value: 'database', label: 'Database' }
    ];
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get log types'
    });
  }
});

module.exports = { router, logMiddleware };
