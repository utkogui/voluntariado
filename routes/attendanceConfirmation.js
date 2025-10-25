const express = require('express');
const { body, param, query } = require('express-validator');
const {
  confirmAttendance,
  declineAttendance,
  maybeAttendance,
  checkIn,
  checkOut,
  markAbsence,
  getActivityConfirmations,
  getUserConfirmations,
  sendConfirmationReminders,
  getActivityAttendanceRecords,
  getUserAttendanceRecords,
  canCheckIn,
  getUserAttendanceFrequency,
  getActivityAttendanceFrequency,
  getAttendanceRanking,
  getAttendanceAlerts,
  generateAttendanceReport,
  getSavedReports,
  getReport,
  deleteReport,
  getConfirmationStats,
  getAttendanceStats
} = require('../controllers/attendanceConfirmationController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/activities/:activityId/confirm
 * @desc Confirmar presença na atividade
 * @access Private
 */
router.post(
  '/:activityId/confirm',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  confirmAttendance
);

/**
 * @route POST /api/activities/:activityId/decline
 * @desc Declinar presença na atividade
 * @access Private
 */
router.post(
  '/:activityId/decline',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  declineAttendance
);

/**
 * @route POST /api/activities/:activityId/maybe
 * @desc Marcar como "talvez" na atividade
 * @access Private
 */
router.post(
  '/:activityId/maybe',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  maybeAttendance
);

/**
 * @route POST /api/activities/:activityId/check-in
 * @desc Fazer check-in na atividade
 * @access Private
 */
router.post(
  '/:activityId/check-in',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Localização deve ter no máximo 200 caracteres'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude deve ser um número entre -90 e 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude deve ser um número entre -180 e 180'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Informações do dispositivo devem ser um objeto'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  checkIn
);

/**
 * @route POST /api/activities/:activityId/check-out
 * @desc Fazer check-out na atividade
 * @access Private
 */
router.post(
  '/:activityId/check-out',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  checkOut
);

/**
 * @route POST /api/activities/:activityId/users/:userId/mark-absence
 * @desc Marcar ausência
 * @access Private
 */
router.post(
  '/:activityId/users/:userId/mark-absence',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres'),
    body('isExcused')
      .optional()
      .isBoolean()
      .withMessage('isExcused deve ser um valor booleano')
  ],
  validateRequest,
  markAbsence
);

/**
 * @route GET /api/activities/:activityId/confirmations
 * @desc Obter confirmações de presença da atividade
 * @access Private
 */
router.get(
  '/:activityId/confirmations',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('status')
      .optional()
      .isIn(['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'])
      .withMessage('Status inválido'),
    query('includeUserDetails')
      .optional()
      .isBoolean()
      .withMessage('includeUserDetails deve ser um valor booleano')
  ],
  validateRequest,
  getActivityConfirmations
);

/**
 * @route GET /api/users/:userId/confirmations
 * @desc Obter confirmações de presença do usuário
 * @access Private
 */
router.get(
  '/users/:userId/confirmations',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('status')
      .optional()
      .isIn(['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'])
      .withMessage('Status inválido'),
    query('activityStatus')
      .optional()
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('includeActivityDetails')
      .optional()
      .isBoolean()
      .withMessage('includeActivityDetails deve ser um valor booleano')
  ],
  validateRequest,
  getUserConfirmations
);

/**
 * @route POST /api/activities/:activityId/send-confirmation-reminders
 * @desc Enviar lembretes de confirmação
 * @access Private
 */
router.post(
  '/:activityId/send-confirmation-reminders',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('userIds')
      .optional()
      .isArray()
      .withMessage('IDs dos usuários devem ser um array'),
    body('userIds.*')
      .optional()
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido')
  ],
  validateRequest,
  sendConfirmationReminders
);

/**
 * @route GET /api/activities/:activityId/attendance-records
 * @desc Obter registros de presença da atividade
 * @access Private
 */
router.get(
  '/:activityId/attendance-records',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('status')
      .optional()
      .isIn(['PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL', 'EXCUSED', 'NO_SHOW'])
      .withMessage('Status inválido'),
    query('includeUserDetails')
      .optional()
      .isBoolean()
      .withMessage('includeUserDetails deve ser um valor booleano')
  ],
  validateRequest,
  getActivityAttendanceRecords
);

/**
 * @route GET /api/users/:userId/attendance-records
 * @desc Obter registros de presença do usuário
 * @access Private
 */
router.get(
  '/users/:userId/attendance-records',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('status')
      .optional()
      .isIn(['PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL', 'EXCUSED', 'NO_SHOW'])
      .withMessage('Status inválido'),
    query('activityStatus')
      .optional()
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('includeActivityDetails')
      .optional()
      .isBoolean()
      .withMessage('includeActivityDetails deve ser um valor booleano')
  ],
  validateRequest,
  getUserAttendanceRecords
);

/**
 * @route GET /api/activities/:activityId/can-check-in
 * @desc Verificar se pode fazer check-in
 * @access Private
 */
router.get(
  '/:activityId/can-check-in',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  canCheckIn
);

/**
 * @route GET /api/users/:userId/attendance-frequency
 * @desc Obter frequência do usuário
 * @access Private
 */
router.get(
  '/users/:userId/attendance-frequency',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('activityStatus')
      .optional()
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido'),
    query('includeActivityDetails')
      .optional()
      .isBoolean()
      .withMessage('includeActivityDetails deve ser um valor booleano')
  ],
  validateRequest,
  getUserAttendanceFrequency
);

/**
 * @route GET /api/activities/:activityId/attendance-frequency
 * @desc Obter frequência da atividade
 * @access Private
 */
router.get(
  '/:activityId/attendance-frequency',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('includeUserDetails')
      .optional()
      .isBoolean()
      .withMessage('includeUserDetails deve ser um valor booleano')
  ],
  validateRequest,
  getActivityAttendanceFrequency
);

/**
 * @route GET /api/attendance/ranking
 * @desc Obter ranking de frequência
 * @access Private
 */
router.get(
  '/attendance/ranking',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser uma data válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser uma data válida'),
    query('activityStatus')
      .optional()
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('includeUserDetails')
      .optional()
      .isBoolean()
      .withMessage('includeUserDetails deve ser um valor booleano')
  ],
  validateRequest,
  getAttendanceRanking
);

/**
 * @route GET /api/users/:userId/attendance-alerts
 * @desc Obter alertas de frequência
 * @access Private
 */
router.get(
  '/users/:userId/attendance-alerts',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Dias deve ser um número entre 1 e 365'),
    query('minAttendanceRate')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Taxa mínima de frequência deve ser um número entre 0 e 100')
  ],
  validateRequest,
  getAttendanceAlerts
);

/**
 * @route POST /api/activities/:activityId/reports
 * @desc Gerar relatório de presença
 * @access Private
 */
router.post(
  '/:activityId/reports',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('reportType')
      .isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'ACTIVITY_SUMMARY', 'PARTICIPANT_SUMMARY', 'CUSTOM'])
      .withMessage('Tipo de relatório inválido'),
    body('filters')
      .optional()
      .isObject()
      .withMessage('Filtros devem ser um objeto'),
    body('includeUserDetails')
      .optional()
      .isBoolean()
      .withMessage('includeUserDetails deve ser um valor booleano'),
    body('includeActivityDetails')
      .optional()
      .isBoolean()
      .withMessage('includeActivityDetails deve ser um valor booleano')
  ],
  validateRequest,
  generateAttendanceReport
);

/**
 * @route GET /api/activities/:activityId/reports
 * @desc Obter relatórios salvos
 * @access Private
 */
router.get(
  '/:activityId/reports',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('reportType')
      .optional()
      .isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'ACTIVITY_SUMMARY', 'PARTICIPANT_SUMMARY', 'CUSTOM'])
      .withMessage('Tipo de relatório inválido'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset deve ser um número não negativo')
  ],
  validateRequest,
  getSavedReports
);

/**
 * @route GET /api/reports/:reportId
 * @desc Obter relatório específico
 * @access Private
 */
router.get(
  '/reports/:reportId',
  [
    param('reportId').isUUID().withMessage('ID do relatório inválido')
  ],
  validateRequest,
  getReport
);

/**
 * @route DELETE /api/reports/:reportId
 * @desc Excluir relatório
 * @access Private
 */
router.delete(
  '/reports/:reportId',
  [
    param('reportId').isUUID().withMessage('ID do relatório inválido')
  ],
  validateRequest,
  deleteReport
);

/**
 * @route GET /api/activities/:activityId/confirmation-stats
 * @desc Obter estatísticas de confirmações
 * @access Private
 */
router.get(
  '/:activityId/confirmation-stats',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getConfirmationStats
);

/**
 * @route GET /api/activities/:activityId/attendance-stats
 * @desc Obter estatísticas de presença
 * @access Private
 */
router.get(
  '/:activityId/attendance-stats',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getAttendanceStats
);

module.exports = router;
