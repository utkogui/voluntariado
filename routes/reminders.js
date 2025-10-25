const express = require('express');
const { body, param, query } = require('express-validator');
const {
  scheduleActivityReminders,
  sendConfirmationReminder,
  sendReminderPush,
  sendBulkReminders,
  getUserReminderPreferences,
  updateUserReminderPreferences,
  getEmailTemplates,
  processEmailTemplate,
  getReminderStats,
  getReminderPreferencesStats
} = require('../controllers/reminderController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/reminders/activity/:activityId/schedule
 * @desc Agendar lembretes automáticos para atividade
 * @access Private
 */
router.post(
  '/activity/:activityId/schedule',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  scheduleActivityReminders
);

/**
 * @route POST /api/reminders/activity/:activityId/user/:userId/confirmation
 * @desc Enviar lembrete de confirmação
 * @access Private
 */
router.post(
  '/activity/:activityId/user/:userId/confirmation',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  sendConfirmationReminder
);

/**
 * @route POST /api/reminders/activity/:activityId/user/:userId/push
 * @desc Enviar lembrete push
 * @access Private
 */
router.post(
  '/activity/:activityId/user/:userId/push',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('reminderType')
      .isIn(['ACTIVITY_REMINDER_24H', 'ACTIVITY_REMINDER_2H', 'ACTIVITY_REMINDER_30MIN', 'CONFIRMATION_REMINDER', 'ACTIVITY_CANCELLED'])
      .withMessage('Tipo de lembrete inválido'),
    body('reminderData')
      .optional()
      .isObject()
      .withMessage('Dados do lembrete devem ser um objeto')
  ],
  validateRequest,
  sendReminderPush
);

/**
 * @route POST /api/reminders/activity/:activityId/bulk
 * @desc Enviar lembretes em massa
 * @access Private
 */
router.post(
  '/activity/:activityId/bulk',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('userIds')
      .isArray({ min: 1 })
      .withMessage('Lista de IDs de usuários é obrigatória'),
    body('userIds.*')
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido'),
    body('reminderType')
      .isIn(['ACTIVITY_REMINDER_24H', 'ACTIVITY_REMINDER_2H', 'ACTIVITY_REMINDER_30MIN', 'CONFIRMATION_REMINDER', 'ACTIVITY_CANCELLED'])
      .withMessage('Tipo de lembrete inválido'),
    body('reminderData')
      .optional()
      .isObject()
      .withMessage('Dados do lembrete devem ser um objeto')
  ],
  validateRequest,
  sendBulkReminders
);

/**
 * @route GET /api/reminders/preferences/user/:userId
 * @desc Obter preferências de lembretes do usuário
 * @access Private
 */
router.get(
  '/preferences/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getUserReminderPreferences
);

/**
 * @route PUT /api/reminders/preferences/user/:userId
 * @desc Atualizar preferências de lembretes do usuário
 * @access Private
 */
router.put(
  '/preferences/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('enabled')
      .optional()
      .isBoolean()
      .withMessage('enabled deve ser um valor booleano'),
    body('frequency')
      .optional()
      .isIn(['IMMEDIATE', 'DAILY', 'WEEKLY'])
      .withMessage('Frequência deve ser IMMEDIATE, DAILY ou WEEKLY'),
    body('reminderTypes')
      .optional()
      .isObject()
      .withMessage('Tipos de lembretes devem ser um objeto'),
    body('channels')
      .optional()
      .isObject()
      .withMessage('Canais devem ser um objeto'),
    body('filters')
      .optional()
      .isObject()
      .withMessage('Filtros devem ser um objeto'),
    body('advanced')
      .optional()
      .isObject()
      .withMessage('Configurações avançadas devem ser um objeto')
  ],
  validateRequest,
  updateUserReminderPreferences
);

/**
 * @route GET /api/reminders/templates/email
 * @desc Obter templates de email
 * @access Private
 */
router.get(
  '/templates/email',
  getEmailTemplates
);

/**
 * @route POST /api/reminders/templates/email/process
 * @desc Processar template de email
 * @access Private
 */
router.post(
  '/templates/email/process',
  [
    body('templateType')
      .isIn(['ACTIVITY_REMINDER_24H', 'ACTIVITY_REMINDER_2H', 'ACTIVITY_REMINDER_30MIN', 'CONFIRMATION_REMINDER', 'ACTIVITY_CANCELLED'])
      .withMessage('Tipo de template inválido'),
    body('data')
      .isObject()
      .withMessage('Dados são obrigatórios')
  ],
  validateRequest,
  processEmailTemplate
);

/**
 * @route GET /api/reminders/activity/:activityId/stats
 * @desc Obter estatísticas de lembretes
 * @access Private
 */
router.get(
  '/activity/:activityId/stats',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getReminderStats
);

/**
 * @route GET /api/reminders/preferences/stats
 * @desc Obter estatísticas de preferências de lembretes
 * @access Private (Admin only)
 */
router.get(
  '/preferences/stats',
  getReminderPreferencesStats
);

module.exports = router;
