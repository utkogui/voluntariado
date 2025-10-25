require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  corsOptions,
  helmetOptions,
  apiLimiter,
  securityHeaders,
  bodySizeLimiter,
  securityLogger
} = require('./middleware/security');
const { httpLoggingMiddleware } = require('./config/logger');
const { monitoringMiddleware, errorMonitoringMiddleware } = require('./config/monitoring');

const app = express();
const PORT = config.server.port;

// Middleware de segurança
app.use(helmet(helmetOptions));
app.use(compression());
app.use(securityHeaders);
app.use(securityLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// CORS
app.use(cors(corsOptions));

// Logging e monitoramento
app.use(httpLoggingMiddleware);
app.use(monitoringMiddleware);

// Body parsing com limitação de tamanho
app.use(bodySizeLimiter('10mb'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/document-validation', require('./routes/documentValidation'));
app.use('/api/background-check', require('./routes/backgroundCheck'));
app.use('/api/official-documents', require('./routes/officialDocuments'));
app.use('/api/opportunity-requirements', require('./routes/opportunityRequirements'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/push-notifications', require('./routes/pushNotifications'));
app.use('/api/notification-templates', require('./routes/notificationTemplates'));
app.use('/api/notification-preferences', require('./routes/notificationPreferences'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activity-reminders', require('./routes/activityReminders'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/activities', require('./routes/activityCancellationReschedule'));
app.use('/api/attendance', require('./routes/attendanceConfirmation'));
app.use('/api/mass-messages', require('./routes/massMessage'));
app.use('/api/communication-history', require('./routes/communicationHistory'));
app.use('/api/message-templates', require('./routes/messageTemplate'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/evaluation-history', require('./routes/evaluationHistory'));
app.use('/api/behavior-reports', require('./routes/behaviorReport'));
app.use('/api/volunteer-approvals', require('./routes/volunteerApproval'));
app.use('/api/participation-history', require('./routes/participationHistory'));
app.use('/api/user-blocks', require('./routes/userBlock'));
app.use('/api/impact-reports', require('./routes/impactReport'));
app.use('/api/engagement-tracking', require('./routes/engagementTracking'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/content-moderation', require('./routes/contentModeration'));
app.use('/api/hybrid-matching', require('./routes/hybridMatching'));

// Rota de health check
app.get('/api/health', (req, res) => {
  const { healthCheck } = require('./config/monitoring');
  const health = healthCheck();

  const statusCode = health.status === 'healthy' ? 200 :
                    health.status === 'warning' ? 200 : 503;

  res.status(statusCode).json(health);
});

// Rota de teste para categorias
app.get('/api/test-categories', async (req, res) => {
  try {
    // Categorias de demonstração diretas
    const demoCategories = [
      { id: '1', name: 'Educação', description: 'Oportunidades relacionadas ao ensino', icon: '🎓', color: '#3498db', isActive: true },
      { id: '2', name: 'Saúde', description: 'Oportunidades na área da saúde', icon: '🏥', color: '#e74c3c', isActive: true },
      { id: '3', name: 'Meio Ambiente', description: 'Projetos de preservação ambiental', icon: '🌱', color: '#27ae60', isActive: true }
    ];
    
    res.json({
      success: true,
      data: demoCategories,
      demo: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de métricas (apenas em desenvolvimento)
if (config.server.nodeEnv === 'development') {
  app.get('/api/metrics', (req, res) => {
    const { getMetrics } = require('./config/monitoring');
    res.json(getMetrics());
  });
  
  app.get('/api/metrics/report', (req, res) => {
    const { generateReport } = require('./config/monitoring');
    res.json(generateReport());
  });
}

// Middleware de tratamento de erros
app.use(errorMonitoringMiddleware);
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Ambiente: ${config.server.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.server.frontendUrl}`);
});

// Configurar WebSocket para chat em tempo real
const WebSocketService = require('./services/websocketService');
const wsService = new WebSocketService(server);

// Tornar o serviço WebSocket disponível globalmente
app.set('wsService', wsService);

module.exports = app;
