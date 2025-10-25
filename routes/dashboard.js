const express = require('express');
const { param, query } = require('express-validator');
const {
  getNotificationDashboard,
  getAdminNotificationDashboard,
  getNotificationReport
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/dashboard/notifications/:userId
 * @desc Obter dashboard de notificações do usuário
 * @access Private
 */
router.get(
  '/notifications/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getNotificationDashboard
);

/**
 * @route GET /api/dashboard/admin/notifications
 * @desc Obter dashboard de notificações para administradores
 * @access Private (Admin only)
 */
router.get(
  '/admin/notifications',
  getAdminNotificationDashboard
);

/**
 * @route GET /api/dashboard/notifications/report
 * @desc Obter relatório de notificações
 * @access Private (Admin only)
 */
router.get(
  '/notifications/report',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida'),
    query('type')
      .optional()
      .isIn(['NEW_OPPORTUNITY', 'APPLICATION_UPDATE', 'MESSAGE', 'REMINDER', 'EVALUATION', 'SYSTEM'])
      .withMessage('Tipo de notificação inválido'),
    query('userId')
      .optional()
      .isUUID()
      .withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getNotificationReport
);

module.exports = router;
