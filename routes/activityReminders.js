const express = require('express');
const { body, param, query } = require('express-validator');
const {
  scheduleActivityReminders,
  sendConfirmationReminder,
  sendBulkConfirmationReminders,
  scheduleCustomReminder,
  cancelActivityReminders,
  getActivityReminders,
  getReminderStats
} = require('../controllers/activityReminderController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/activity-reminders/:activityId/schedule
 * @desc Agendar lembretes automáticos para atividade
 * @access Private
 */
router.post(
  '/:activityId/schedule',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  scheduleActivityReminders
);

/**
 * @route POST /api/activity-reminders/:activityId/user/:userId/confirmation
 * @desc Enviar lembrete de confirmação de presença
 * @access Private
 */
router.post(
  '/:activityId/user/:userId/confirmation',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  sendConfirmationReminder
);

/**
 * @route POST /api/activity-reminders/:activityId/bulk-confirmation
 * @desc Enviar lembretes em massa para confirmação
 * @access Private
 */
router.post(
  '/:activityId/bulk-confirmation',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  sendBulkConfirmationReminders
);

/**
 * @route POST /api/activity-reminders/:activityId/user/:userId/custom
 * @desc Agendar lembrete personalizado
 * @access Private
 */
router.post(
  '/:activityId/user/:userId/custom',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('reminderDate')
      .isISO8601()
      .withMessage('Data do lembrete deve ser válida'),
    body('title')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Título deve ser uma string entre 1 e 255 caracteres'),
    body('message')
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Mensagem deve ser uma string entre 1 e 1000 caracteres')
  ],
  validateRequest,
  scheduleCustomReminder
);

/**
 * @route DELETE /api/activity-reminders/:activityId/cancel
 * @desc Cancelar lembretes de uma atividade
 * @access Private
 */
router.delete(
  '/:activityId/cancel',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('userId')
      .optional()
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido')
  ],
  validateRequest,
  cancelActivityReminders
);

/**
 * @route GET /api/activity-reminders/:activityId
 * @desc Obter lembretes agendados de uma atividade
 * @access Private
 */
router.get(
  '/:activityId',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getActivityReminders
);

/**
 * @route GET /api/activity-reminders/:activityId/stats
 * @desc Obter estatísticas de lembretes
 * @access Private
 */
router.get(
  '/:activityId/stats',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getReminderStats
);

module.exports = router;
