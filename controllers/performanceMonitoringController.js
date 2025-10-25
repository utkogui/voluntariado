import performanceMonitoring from '../services/performanceMonitoringService.js';

const getHealthStatus = async (req, res) => {
  try {
    const healthStatus = performanceMonitoring.getHealthStatus();
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Error getting health status:', error);
    res.status(500).json({ 
      message: 'Failed to get health status', 
      error: error.message 
    });
  }
};

const getMetrics = async (req, res) => {
  try {
    const metrics = performanceMonitoring.getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ 
      message: 'Failed to get metrics', 
      error: error.message 
    });
  }
};

const getSummaryMetrics = async (req, res) => {
  try {
    const summary = performanceMonitoring.getSummaryMetrics();
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error getting summary metrics:', error);
    res.status(500).json({ 
      message: 'Failed to get summary metrics', 
      error: error.message 
    });
  }
};

const resetMetrics = async (req, res) => {
  try {
    performanceMonitoring.resetMetrics();
    res.status(200).json({ 
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({ 
      message: 'Failed to reset metrics', 
      error: error.message 
    });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = performanceMonitoring.checkAlerts();
    res.status(200).json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ 
      message: 'Failed to get alerts', 
      error: error.message 
    });
  }
};

const updateAlertThresholds = async (req, res) => {
  try {
    const { responseTime, cpuUsage, memoryUsage, errorRate } = req.body;
    
    if (responseTime !== undefined) {
      performanceMonitoring.alertThresholds.responseTime = responseTime;
    }
    if (cpuUsage !== undefined) {
      performanceMonitoring.alertThresholds.cpuUsage = cpuUsage;
    }
    if (memoryUsage !== undefined) {
      performanceMonitoring.alertThresholds.memoryUsage = memoryUsage;
    }
    if (errorRate !== undefined) {
      performanceMonitoring.alertThresholds.errorRate = errorRate;
    }
    
    res.status(200).json({ 
      message: 'Alert thresholds updated successfully',
      thresholds: performanceMonitoring.alertThresholds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating alert thresholds:', error);
    res.status(500).json({ 
      message: 'Failed to update alert thresholds', 
      error: error.message 
    });
  }
};

export {
  getHealthStatus,
  getMetrics,
  getSummaryMetrics,
  resetMetrics,
  getAlerts,
  updateAlertThresholds
};
