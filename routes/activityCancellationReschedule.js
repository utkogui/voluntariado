const express = require('express');
const { body, param, query } = require('express-validator');
const {
  cancelActivity,
  requestReschedule,
  approveReschedule,
  rejectReschedule,
  getCancellationHistory,
  getRescheduleHistory,
  getCancellationStats,
  getRescheduleStats,
  processRefund,
  restoreCancelledActivity,
  sendChangeNotification,
  getChangeNotificationHistory,
  createActivityBackup,
  restoreFromBackup,
  getBackupHistory,
  getBackup,
  deleteBackup
} = require('../controllers/activityCancellationRescheduleController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/activities/:activityId/cancel
 * @desc Cancelar atividade
 * @access Private
 */
router.post(
  '/:activityId/cancel',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('reason')
      .notEmpty()
      .withMessage('Motivo do cancelamento é obrigatório')
      .isLength({ min: 5, max: 500 })
      .withMessage('Motivo deve ter entre 5 e 500 caracteres'),
    body('reasonCode')
      .isIn(['WEATHER', 'EMERGENCY', 'LOW_PARTICIPATION', 'VENUE_UNAVAILABLE', 'ORGANIZER_UNAVAILABLE', 'TECHNICAL_ISSUES', 'COVID_RESTRICTIONS', 'OTHER'])
      .withMessage('Código do motivo inválido'),
    body('details')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Detalhes devem ter no máximo 1000 caracteres'),
    body('refundRequired')
      .optional()
      .isBoolean()
      .withMessage('refundRequired deve ser um valor booleano'),
    body('refundAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do reembolso deve ser um número positivo')
  ],
  validateRequest,
  cancelActivity
);

/**
 * @route POST /api/activities/:activityId/reschedule
 * @desc Solicitar reagendamento de atividade
 * @access Private
 */
router.post(
  '/:activityId/reschedule',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('reason')
      .notEmpty()
      .withMessage('Motivo do reagendamento é obrigatório')
      .isLength({ min: 5, max: 500 })
      .withMessage('Motivo deve ter entre 5 e 500 caracteres'),
    body('reasonCode')
      .isIn(['WEATHER', 'VENUE_UNAVAILABLE', 'ORGANIZER_UNAVAILABLE', 'LOW_PARTICIPATION', 'TECHNICAL_ISSUES', 'COVID_RESTRICTIONS', 'CONFLICTING_EVENT', 'OTHER'])
      .withMessage('Código do motivo inválido'),
    body('details')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Detalhes devem ter no máximo 1000 caracteres'),
    body('newStartDate')
      .isISO8601()
      .withMessage('Nova data de início deve ser uma data válida'),
    body('newEndDate')
      .isISO8601()
      .withMessage('Nova data de fim deve ser uma data válida')
  ],
  validateRequest,
  requestReschedule
);

/**
 * @route POST /api/reschedules/:rescheduleId/approve
 * @desc Aprovar reagendamento
 * @access Private
 */
router.post(
  '/reschedules/:rescheduleId/approve',
  [
    param('rescheduleId').isUUID().withMessage('ID do reagendamento inválido')
  ],
  validateRequest,
  approveReschedule
);

/**
 * @route POST /api/reschedules/:rescheduleId/reject
 * @desc Rejeitar reagendamento
 * @access Private
 */
router.post(
  '/reschedules/:rescheduleId/reject',
  [
    param('rescheduleId').isUUID().withMessage('ID do reagendamento inválido'),
    body('rejectionReason')
      .notEmpty()
      .withMessage('Motivo da rejeição é obrigatório')
      .isLength({ min: 5, max: 500 })
      .withMessage('Motivo da rejeição deve ter entre 5 e 500 caracteres')
  ],
  validateRequest,
  rejectReschedule
);

/**
 * @route GET /api/activities/:activityId/cancellations
 * @desc Obter histórico de cancelamentos
 * @access Private
 */
router.get(
  '/:activityId/cancellations',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getCancellationHistory
);

/**
 * @route GET /api/activities/:activityId/reschedules
 * @desc Obter histórico de reagendamentos
 * @access Private
 */
router.get(
  '/:activityId/reschedules',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getRescheduleHistory
);

/**
 * @route GET /api/cancellations/stats
 * @desc Obter estatísticas de cancelamentos
 * @access Private
 */
router.get(
  '/cancellations/stats',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('reasonCode')
      .optional()
      .isIn(['WEATHER', 'EMERGENCY', 'LOW_PARTICIPATION', 'VENUE_UNAVAILABLE', 'ORGANIZER_UNAVAILABLE', 'TECHNICAL_ISSUES', 'COVID_RESTRICTIONS', 'OTHER'])
      .withMessage('Código do motivo inválido'),
    query('refundRequired')
      .optional()
      .isBoolean()
      .withMessage('refundRequired deve ser um valor booleano')
  ],
  validateRequest,
  getCancellationStats
);

/**
 * @route GET /api/reschedules/stats
 * @desc Obter estatísticas de reagendamentos
 * @access Private
 */
router.get(
  '/reschedules/stats',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('reasonCode')
      .optional()
      .isIn(['WEATHER', 'VENUE_UNAVAILABLE', 'ORGANIZER_UNAVAILABLE', 'LOW_PARTICIPATION', 'TECHNICAL_ISSUES', 'COVID_RESTRICTIONS', 'CONFLICTING_EVENT', 'OTHER'])
      .withMessage('Código do motivo inválido'),
    query('status')
      .optional()
      .isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
      .withMessage('Status inválido')
  ],
  validateRequest,
  getRescheduleStats
);

/**
 * @route POST /api/cancellations/:cancellationId/refund
 * @desc Processar reembolso
 * @access Private
 */
router.post(
  '/cancellations/:cancellationId/refund',
  [
    param('cancellationId').isUUID().withMessage('ID do cancelamento inválido'),
    body('status')
      .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'])
      .withMessage('Status do reembolso inválido'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor do reembolso deve ser um número positivo'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  processRefund
);

/**
 * @route POST /api/activities/:activityId/restore
 * @desc Restaurar atividade cancelada
 * @access Private
 */
router.post(
  '/:activityId/restore',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('reason')
      .notEmpty()
      .withMessage('Motivo da restauração é obrigatório')
      .isLength({ min: 5, max: 500 })
      .withMessage('Motivo deve ter entre 5 e 500 caracteres')
  ],
  validateRequest,
  restoreCancelledActivity
);

/**
 * @route POST /api/activities/:activityId/notify-change
 * @desc Enviar notificação de mudança
 * @access Private
 */
router.post(
  '/:activityId/notify-change',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('changeType')
      .isIn(['CANCELLED', 'RESCHEDULED', 'VENUE_CHANGED', 'TIME_CHANGED', 'DESCRIPTION_CHANGED', 'REQUIREMENTS_CHANGED', 'MATERIALS_CHANGED'])
      .withMessage('Tipo de mudança inválido'),
    body('changeData')
      .isObject()
      .withMessage('Dados da mudança devem ser um objeto'),
    body('targetUsers')
      .optional()
      .isArray()
      .withMessage('Usuários alvo devem ser um array'),
    body('targetUsers.*')
      .optional()
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido')
  ],
  validateRequest,
  sendChangeNotification
);

/**
 * @route GET /api/activities/:activityId/change-notifications
 * @desc Obter histórico de notificações de mudança
 * @access Private
 */
router.get(
  '/:activityId/change-notifications',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getChangeNotificationHistory
);

/**
 * @route POST /api/activities/:activityId/backup
 * @desc Criar backup da atividade
 * @access Private
 */
router.post(
  '/:activityId/backup',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('backupType')
      .isIn(['BEFORE_CANCELLATION', 'BEFORE_RESCHEDULE', 'BEFORE_MAJOR_CHANGE', 'AUTOMATIC_BACKUP'])
      .withMessage('Tipo de backup inválido'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Motivo deve ter no máximo 500 caracteres'),
    body('customData')
      .optional()
      .isObject()
      .withMessage('Dados customizados devem ser um objeto')
  ],
  validateRequest,
  createActivityBackup
);

/**
 * @route POST /api/backups/:backupId/restore
 * @desc Restaurar atividade do backup
 * @access Private
 */
router.post(
  '/backups/:backupId/restore',
  [
    param('backupId').isUUID().withMessage('ID do backup inválido'),
    body('restoreParticipants')
      .optional()
      .isBoolean()
      .withMessage('restoreParticipants deve ser um valor booleano'),
    body('restoreConfirmations')
      .optional()
      .isBoolean()
      .withMessage('restoreConfirmations deve ser um valor booleano'),
    body('restoreMaterials')
      .optional()
      .isBoolean()
      .withMessage('restoreMaterials deve ser um valor booleano'),
    body('restoreRequirements')
      .optional()
      .isBoolean()
      .withMessage('restoreRequirements deve ser um valor booleano'),
    body('restoreEvaluations')
      .optional()
      .isBoolean()
      .withMessage('restoreEvaluations deve ser um valor booleano'),
    body('createNewActivity')
      .optional()
      .isBoolean()
      .withMessage('createNewActivity deve ser um valor booleano')
  ],
  validateRequest,
  restoreFromBackup
);

/**
 * @route GET /api/activities/:activityId/backups
 * @desc Obter histórico de backups
 * @access Private
 */
router.get(
  '/:activityId/backups',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getBackupHistory
);

/**
 * @route GET /api/backups/:backupId
 * @desc Obter backup específico
 * @access Private
 */
router.get(
  '/backups/:backupId',
  [
    param('backupId').isUUID().withMessage('ID do backup inválido')
  ],
  validateRequest,
  getBackup
);

/**
 * @route DELETE /api/backups/:backupId
 * @desc Excluir backup
 * @access Private
 */
router.delete(
  '/backups/:backupId',
  [
    param('backupId').isUUID().withMessage('ID do backup inválido')
  ],
  validateRequest,
  deleteBackup
);

module.exports = router;
