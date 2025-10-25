const express = require('express');
const { body, param, query } = require('express-validator');
const {
  notifyOpportunity,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  setNotificationPreferences,
  processBatchNotifications,
  getUnreadNotifications,
  getNotificationsByType
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/notifications/opportunity/:opportunityId
 * @desc Enviar notificações para uma oportunidade
 * @access Private (Institution, Company, University)
 */
router.post(
  '/opportunity/:opportunityId',
  [
    param('opportunityId').isUUID().withMessage('ID da oportunidade inválido')
  ],
  validateRequest,
  notifyOpportunity
);

/**
 * @route GET /api/notifications/user/:userId
 * @desc Obter notificações do usuário
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
    query('type')
      .optional()
      .isIn(['NEW_OPPORTUNITY', 'APPLICATION_UPDATE', 'MESSAGE', 'REMINDER', 'EVALUATION', 'SYSTEM'])
      .withMessage('Tipo de notificação inválido'),
    query('isRead')
      .optional()
      .isBoolean()
      .withMessage('isRead deve ser um valor booleano'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida')
  ],
  validateRequest,
  getUserNotifications
);

/**
 * @route GET /api/notifications/user/:userId/unread
 * @desc Obter notificações não lidas do usuário
 * @access Private
 */
router.get(
  '/user/:userId/unread',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getUnreadNotifications
);

/**
 * @route GET /api/notifications/user/:userId/type
 * @desc Obter notificações por tipo
 * @access Private
 */
router.get(
  '/user/:userId/type',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('type')
      .isIn(['NEW_OPPORTUNITY', 'APPLICATION_UPDATE', 'MESSAGE', 'REMINDER', 'EVALUATION', 'SYSTEM'])
      .withMessage('Tipo de notificação inválido')
  ],
  validateRequest,
  getNotificationsByType
);

/**
 * @route PUT /api/notifications/:notificationId/read
 * @desc Marcar notificação como lida
 * @access Private
 */
router.put(
  '/:notificationId/read',
  [
    param('notificationId').isUUID().withMessage('ID da notificação inválido')
  ],
  validateRequest,
  markAsRead
);

/**
 * @route PUT /api/notifications/read-all
 * @desc Marcar todas as notificações como lidas
 * @access Private
 */
router.put(
  '/read-all',
  markAllAsRead
);

/**
 * @route DELETE /api/notifications/:notificationId
 * @desc Deletar notificação
 * @access Private
 */
router.delete(
  '/:notificationId',
  [
    param('notificationId').isUUID().withMessage('ID da notificação inválido')
  ],
  validateRequest,
  deleteNotification
);

/**
 * @route GET /api/notifications/user/:userId/stats
 * @desc Obter estatísticas de notificações
 * @access Private
 */
router.get(
  '/user/:userId/stats',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getNotificationStats
);

/**
 * @route POST /api/notifications/preferences
 * @desc Configurar preferências de notificação
 * @access Private
 */
router.post(
  '/preferences',
  [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('emailNotifications deve ser um valor booleano'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('pushNotifications deve ser um valor booleano'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('smsNotifications deve ser um valor booleano'),
    body('frequency')
      .optional()
      .isIn(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'])
      .withMessage('Frequência deve ser IMMEDIATE, DAILY, WEEKLY ou NEVER'),
    body('categories')
      .optional()
      .isArray()
      .withMessage('Categorias devem ser um array'),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Habilidades devem ser um array'),
    body('maxDistance')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Distância máxima deve ser entre 1 e 500 km'),
    body('minRelevanceScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Score de relevância mínimo deve ser entre 0 e 100')
  ],
  validateRequest,
  setNotificationPreferences
);

/**
 * @route POST /api/notifications/batch
 * @desc Processar notificações em lote
 * @access Private (Institution, Company, University)
 */
router.post(
  '/batch',
  [
    body('opportunityIds')
      .isArray({ min: 1 })
      .withMessage('Lista de IDs de oportunidades é obrigatória'),
    body('opportunityIds.*')
      .isUUID()
      .withMessage('ID da oportunidade inválido')
  ],
  validateRequest,
  processBatchNotifications
);

module.exports = router;
