const nodemailer = require('nodemailer');
const twilio = require('twilio');
const axios = require('axios');
const config = require('../config/production');

class AlertService {
  constructor() {
    this.emailTransporter = null;
    this.twilioClient = null;
    this.alertRules = new Map();
    this.alertHistory = [];
    this.initializeServices();
  }

  initializeServices() {
    // Initialize email service
    if (config.email.apiKey) {
      this.emailTransporter = nodemailer.createTransporter({
        service: config.email.service,
        auth: {
          user: config.email.from,
          pass: config.email.apiKey
        }
      });
    }

    // Initialize SMS service
    if (config.sms.accountSid && config.sms.authToken) {
      this.twilioClient = twilio(config.sms.accountSid, config.sms.authToken);
    }
  }

  // Define alert rules
  defineAlertRule(name, condition, actions, options = {}) {
    const rule = {
      name,
      condition,
      actions,
      enabled: options.enabled !== false,
      cooldown: options.cooldown || 300000, // 5 minutes default
      lastTriggered: null,
      triggerCount: 0,
      maxTriggers: options.maxTriggers || 10
    };

    this.alertRules.set(name, rule);
    console.log(`Alert rule defined: ${name}`);
  }

  // Check alert conditions
  checkAlert(ruleName, data) {
    try {
      const rule = this.alertRules.get(ruleName);
      
      if (!rule || !rule.enabled) {
        return false;
      }

      // Check cooldown
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered < rule.cooldown) {
        return false;
      }

      // Check max triggers
      if (rule.triggerCount >= rule.maxTriggers) {
        return false;
      }

      // Evaluate condition
      const conditionMet = this.evaluateCondition(rule.condition, data);
      
      if (conditionMet) {
        this.triggerAlert(ruleName, data);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to check alert ${ruleName}:`, error);
      return false;
    }
  }

  // Evaluate alert condition
  evaluateCondition(condition, data) {
    try {
      const { metric, operator, threshold, timeWindow } = condition;
      
      let value = this.getMetricValue(metric, data);
      
      if (timeWindow) {
        // Get average value over time window
        value = this.getAverageValue(metric, timeWindow);
      }

      switch (operator) {
        case '>':
          return value > threshold;
        case '>=':
          return value >= threshold;
        case '<':
          return value < threshold;
        case '<=':
          return value <= threshold;
        case '==':
          return value === threshold;
        case '!=':
          return value !== threshold;
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to evaluate condition:', error);
      return false;
    }
  }

  // Get metric value from data
  getMetricValue(metric, data) {
    const keys = metric.split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  }

  // Get average value over time window
  getAverageValue(metric, timeWindow) {
    // This would typically query a metrics store
    // For now, return a mock value
    return 0;
  }

  // Trigger alert
  async triggerAlert(ruleName, data) {
    try {
      const rule = this.alertRules.get(ruleName);
      
      if (!rule) {
        return;
      }

      // Update rule state
      rule.lastTriggered = Date.now();
      rule.triggerCount++;

      // Create alert record
      const alert = {
        id: this.generateAlertId(),
        ruleName,
        timestamp: Date.now(),
        data,
        severity: this.determineSeverity(rule, data),
        status: 'active'
      };

      this.alertHistory.push(alert);

      // Execute alert actions
      for (const action of rule.actions) {
        await this.executeAction(action, alert);
      }

      console.log(`Alert triggered: ${ruleName}`);
      
    } catch (error) {
      console.error(`Failed to trigger alert ${ruleName}:`, error);
    }
  }

  // Determine alert severity
  determineSeverity(rule, data) {
    // Default severity logic
    if (rule.condition.threshold > 1000) return 'critical';
    if (rule.condition.threshold > 100) return 'high';
    if (rule.condition.threshold > 10) return 'medium';
    return 'low';
  }

  // Execute alert action
  async executeAction(action, alert) {
    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailAlert(action, alert);
          break;
        case 'sms':
          await this.sendSmsAlert(action, alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(action, alert);
          break;
        case 'slack':
          await this.sendSlackAlert(action, alert);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error);
    }
  }

  // Send email alert
  async sendEmailAlert(action, alert) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: config.email.from,
        to: action.recipients.join(', '),
        subject: `🚨 Alert: ${alert.ruleName} - ${alert.severity.toUpperCase()}`,
        html: this.generateEmailTemplate(alert)
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email alert sent for ${alert.ruleName}`);
      
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  // Send SMS alert
  async sendSmsAlert(action, alert) {
    try {
      if (!this.twilioClient) {
        throw new Error('SMS service not configured');
      }

      const message = `🚨 Alert: ${alert.ruleName}\nSeverity: ${alert.severity}\nTime: ${new Date(alert.timestamp).toLocaleString()}`;

      for (const phoneNumber of action.recipients) {
        await this.twilioClient.messages.create({
          body: message,
          from: config.sms.fromNumber,
          to: phoneNumber
        });
      }

      console.log(`SMS alert sent for ${alert.ruleName}`);
      
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  }

  // Send webhook alert
  async sendWebhookAlert(action, alert) {
    try {
      const payload = {
        alert: {
          id: alert.id,
          ruleName: alert.ruleName,
          severity: alert.severity,
          timestamp: alert.timestamp,
          data: alert.data
        }
      };

      await axios.post(action.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': action.auth ? `Bearer ${action.auth}` : undefined
        },
        timeout: 10000
      });

      console.log(`Webhook alert sent for ${alert.ruleName}`);
      
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  // Send Slack alert
  async sendSlackAlert(action, alert) {
    try {
      const payload = {
        text: `🚨 Alert: ${alert.ruleName}`,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: 'Rule',
                value: alert.ruleName,
                short: true
              },
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Time',
                value: new Date(alert.timestamp).toLocaleString(),
                short: true
              },
              {
                title: 'Data',
                value: JSON.stringify(alert.data, null, 2),
                short: false
              }
            ]
          }
        ]
      };

      await axios.post(action.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`Slack alert sent for ${alert.ruleName}`);
      
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Generate email template
  generateEmailTemplate(alert) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; border-radius: 5px; }
          .content { margin: 20px 0; }
          .severity { font-weight: bold; color: #f44336; }
          .data { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 System Alert</h1>
        </div>
        <div class="content">
          <h2>Alert Details</h2>
          <p><strong>Rule:</strong> ${alert.ruleName}</p>
          <p><strong>Severity:</strong> <span class="severity">${alert.severity.toUpperCase()}</span></p>
          <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
          <p><strong>Alert ID:</strong> ${alert.id}</p>
          
          <h3>Data</h3>
          <div class="data">
            <pre>${JSON.stringify(alert.data, null, 2)}</pre>
          </div>
        </div>
        <div class="footer">
          <p>This alert was generated by the Volunteer App monitoring system.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Get severity color for Slack
  getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      case 'low': return '#36a64f';
      default: return '#36a64f';
    }
  }

  // Generate unique alert ID
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Get alert history
  getAlertHistory(limit = 100) {
    return this.alertHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get active alerts
  getActiveAlerts() {
    return this.alertHistory.filter(alert => alert.status === 'active');
  }

  // Acknowledge alert
  acknowledgeAlert(alertId, userId) {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  // Resolve alert
  resolveAlert(alertId, userId) {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedBy = userId;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  // Get alert statistics
  getAlertStats() {
    const stats = {
      total: this.alertHistory.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };

    for (const alert of this.alertHistory) {
      stats[alert.status]++;
      stats.bySeverity[alert.severity]++;
    }

    return stats;
  }

  // Test alert system
  async testAlert(ruleName) {
    try {
      const testData = {
        timestamp: Date.now(),
        test: true
      };

      await this.triggerAlert(ruleName, testData);
      
      return {
        success: true,
        message: `Test alert triggered for ${ruleName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Initialize default alert rules
  initializeDefaultRules() {
    // High error rate alert
    this.defineAlertRule(
      'high_error_rate',
      {
        metric: 'error_rate',
        operator: '>',
        threshold: 0.05, // 5%
        timeWindow: 300000 // 5 minutes
      },
      [
        {
          type: 'email',
          recipients: ['admin@volunteer-app.com']
        },
        {
          type: 'slack',
          webhookUrl: process.env.SLACK_WEBHOOK_URL
        }
      ],
      {
        cooldown: 600000, // 10 minutes
        maxTriggers: 5
      }
    );

    // High response time alert
    this.defineAlertRule(
      'high_response_time',
      {
        metric: 'response_time',
        operator: '>',
        threshold: 2000, // 2 seconds
        timeWindow: 300000 // 5 minutes
      },
      [
        {
          type: 'email',
          recipients: ['admin@volunteer-app.com']
        }
      ],
      {
        cooldown: 300000, // 5 minutes
        maxTriggers: 10
      }
    );

    // Database connection alert
    this.defineAlertRule(
      'database_connection_error',
      {
        metric: 'database_errors',
        operator: '>',
        threshold: 0,
        timeWindow: 60000 // 1 minute
      },
      [
        {
          type: 'email',
          recipients: ['admin@volunteer-app.com', 'dba@volunteer-app.com']
        },
        {
          type: 'sms',
          recipients: ['+1234567890']
        }
      ],
      {
        cooldown: 300000, // 5 minutes
        maxTriggers: 3
      }
    );

    console.log('Default alert rules initialized');
  }
}

// Create singleton instance
const alertService = new AlertService();

module.exports = alertService;
