const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getActivityConfirmations,
  getUserConfirmations,
  updateConfirmationStatus,
  sendConfirmationReminders,
  getConfirmationStats,
  markAttendance,
  getAttendanceList,
  exportAttendanceList
} = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/attendance/activity/:activityId
 * @desc Obter confirmações de uma atividade
 * @access Private
 */
router.get(
  '/activity/:activityId',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getActivityConfirmations
);

/**
 * @route GET /api/attendance/user/:userId
 * @desc Obter confirmações de um usuário
 * @access Private
 */
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('status')
      .optional()
      .isIn(['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'])
      .withMessage('Status deve ser PENDING, CONFIRMED, DECLINED ou MAYBE'),
    query('fromDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida')
  ],
  validateRequest,
  getUserConfirmations
);

/**
 * @route PUT /api/attendance/activity/:activityId/confirm
 * @desc Atualizar status de confirmação
 * @access Private
 */
router.put(
  '/activity/:activityId/confirm',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('status')
      .isIn(['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'])
      .withMessage('Status deve ser PENDING, CONFIRMED, DECLINED ou MAYBE'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  updateConfirmationStatus
);

/**
 * @route POST /api/attendance/activity/:activityId/reminders
 * @desc Enviar lembretes de confirmação
 * @access Private
 */
router.post(
  '/activity/:activityId/reminders',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  sendConfirmationReminders
);

/**
 * @route GET /api/attendance/activity/:activityId/stats
 * @desc Obter estatísticas de confirmação
 * @access Private
 */
router.get(
  '/activity/:activityId/stats',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getConfirmationStats
);

/**
 * @route POST /api/attendance/activity/:activityId/mark
 * @desc Marcar presença em atividade
 * @access Private
 */
router.post(
  '/activity/:activityId/mark',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('userId')
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido'),
    body('attended')
      .isBoolean()
      .withMessage('attended deve ser um valor booleano'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  markAttendance
);

/**
 * @route GET /api/attendance/activity/:activityId/list
 * @desc Obter lista de presença
 * @access Private
 */
router.get(
  '/activity/:activityId/list',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getAttendanceList
);

/**
 * @route GET /api/attendance/activity/:activityId/export
 * @desc Exportar lista de presença
 * @access Private
 */
router.get(
  '/activity/:activityId/export',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    query('format')
      .optional()
      .isIn(['csv', 'xlsx'])
      .withMessage('Formato deve ser csv ou xlsx')
  ],
  validateRequest,
  exportAttendanceList
);

module.exports = router;
