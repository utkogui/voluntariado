const express = require('express');
const alertService = require('../services/alertService');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get alert history
router.get('/history', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { limit = 100, status, severity } = req.query;
    
    let alerts = alertService.getAlertHistory(parseInt(limit));
    
    // Filter by status
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }
    
    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert history'
    });
  }
});

// Get active alerts
router.get('/active', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const alerts = alertService.getActiveAlerts();
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get active alerts'
    });
  }
});

// Get alert statistics
router.get('/stats', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const stats = alertService.getAlertStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert statistics'
    });
  }
});

// Acknowledge alert
router.post('/:alertId/acknowledge', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;
    
    const success = alertService.acknowledgeAlert(alertId, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

// Resolve alert
router.post('/:alertId/resolve', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;
    
    const success = alertService.resolveAlert(alertId, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert'
    });
  }
});

// Define alert rule
router.post('/rules', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { name, condition, actions, options } = req.body;
    
    if (!name || !condition || !actions) {
      return res.status(400).json({
        success: false,
        error: 'Name, condition, and actions are required'
      });
    }
    
    alertService.defineAlertRule(name, condition, actions, options);
    
    res.json({
      success: true,
      message: 'Alert rule defined successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to define alert rule'
    });
  }
});

// Test alert
router.post('/test/:ruleName', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { ruleName } = req.params;
    
    alertService.testAlert(ruleName).then(result => {
      res.json(result);
    }).catch(error => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test alert'
    });
  }
});

// Get alert rules
router.get('/rules', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const rules = Array.from(alertService.alertRules.entries()).map(([name, rule]) => ({
      name,
      condition: rule.condition,
      actions: rule.actions,
      enabled: rule.enabled,
      cooldown: rule.cooldown,
      maxTriggers: rule.maxTriggers,
      lastTriggered: rule.lastTriggered,
      triggerCount: rule.triggerCount
    }));
    
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert rules'
    });
  }
});

// Update alert rule
router.put('/rules/:ruleName', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { ruleName } = req.params;
    const { condition, actions, options } = req.body;
    
    const rule = alertService.alertRules.get(ruleName);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Alert rule not found'
      });
    }
    
    if (condition) rule.condition = condition;
    if (actions) rule.actions = actions;
    if (options) {
      if (options.enabled !== undefined) rule.enabled = options.enabled;
      if (options.cooldown !== undefined) rule.cooldown = options.cooldown;
      if (options.maxTriggers !== undefined) rule.maxTriggers = options.maxTriggers;
    }
    
    res.json({
      success: true,
      message: 'Alert rule updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update alert rule'
    });
  }
});

// Delete alert rule
router.delete('/rules/:ruleName', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { ruleName } = req.params;
    
    const success = alertService.alertRules.delete(ruleName);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert rule deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert rule not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert rule'
    });
  }
});

// Enable/disable alert rule
router.post('/rules/:ruleName/toggle', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { ruleName } = req.params;
    
    const rule = alertService.alertRules.get(ruleName);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Alert rule not found'
      });
    }
    
    rule.enabled = !rule.enabled;
    
    res.json({
      success: true,
      message: `Alert rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`,
      data: { enabled: rule.enabled }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle alert rule'
    });
  }
});

// Get alert severity levels
router.get('/severities', authMiddleware, (req, res) => {
  try {
    const severities = [
      { value: 'critical', label: 'Critical', color: '#f44336', description: 'Immediate attention required' },
      { value: 'high', label: 'High', color: '#ff9800', description: 'High priority issue' },
      { value: 'medium', label: 'Medium', color: '#ffeb3b', description: 'Medium priority issue' },
      { value: 'low', label: 'Low', color: '#4caf50', description: 'Low priority issue' }
    ];
    
    res.json({
      success: true,
      data: severities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get severity levels'
    });
  }
});

// Get alert statuses
router.get('/statuses', authMiddleware, (req, res) => {
  try {
    const statuses = [
      { value: 'active', label: 'Active', color: '#f44336', description: 'Alert is active and requires attention' },
      { value: 'acknowledged', label: 'Acknowledged', color: '#ff9800', description: 'Alert has been acknowledged' },
      { value: 'resolved', label: 'Resolved', color: '#4caf50', description: 'Alert has been resolved' }
    ];
    
    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get alert statuses'
    });
  }
});

// Get alert action types
router.get('/action-types', authMiddleware, (req, res) => {
  try {
    const actionTypes = [
      { value: 'email', label: 'Email', description: 'Send email notification' },
      { value: 'sms', label: 'SMS', description: 'Send SMS notification' },
      { value: 'webhook', label: 'Webhook', description: 'Send webhook notification' },
      { value: 'slack', label: 'Slack', description: 'Send Slack notification' }
    ];
    
    res.json({
      success: true,
      data: actionTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get action types'
    });
  }
});

// Initialize default alert rules
router.post('/initialize-defaults', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    alertService.initializeDefaultRules();
    
    res.json({
      success: true,
      message: 'Default alert rules initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize default alert rules'
    });
  }
});

module.exports = router;
