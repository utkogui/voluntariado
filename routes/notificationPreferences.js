const express = require('express');
const { body, param } = require('express-validator');
const {
  getUserPreferences,
  updateUserPreferences,
  getDefaultPreferences,
  checkNotificationEligibility,
  getPreferencesStats,
  resetToDefault,
  updateChannelPreferences,
  updateTypePreferences
} = require('../controllers/notificationPreferencesController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/notification-preferences/user/:userId
 * @desc Obter preferências de notificação do usuário
 * @access Private
 */
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getUserPreferences
);

/**
 * @route PUT /api/notification-preferences/user/:userId
 * @desc Atualizar preferências de notificação do usuário
 * @access Private
 */
router.put(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('channels')
      .optional()
      .isObject()
      .withMessage('Canais devem ser um objeto'),
    body('types')
      .optional()
      .isObject()
      .withMessage('Tipos devem ser um objeto'),
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
  updateUserPreferences
);

/**
 * @route GET /api/notification-preferences/defaults
 * @desc Obter preferências padrão
 * @access Private
 */
router.get(
  '/defaults',
  getDefaultPreferences
);

/**
 * @route POST /api/notification-preferences/user/:userId/check-eligibility
 * @desc Verificar se usuário deve receber notificação
 * @access Private
 */
router.post(
  '/user/:userId/check-eligibility',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    body('type')
      .isString()
      .withMessage('Tipo é obrigatório'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Dados devem ser um objeto')
  ],
  validateRequest,
  checkNotificationEligibility
);

/**
 * @route GET /api/notification-preferences/stats
 * @desc Obter estatísticas de preferências
 * @access Private (Admin only)
 */
router.get(
  '/stats',
  getPreferencesStats
);

/**
 * @route POST /api/notification-preferences/user/:userId/reset
 * @desc Resetar preferências para padrão
 * @access Private
 */
router.post(
  '/user/:userId/reset',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  resetToDefault
);

/**
 * @route PUT /api/notification-preferences/user/:userId/channel/:channel
 * @desc Atualizar preferências de canal específico
 * @access Private
 */
router.put(
  '/user/:userId/channel/:channel',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    param('channel')
      .isIn(['email', 'push', 'sms'])
      .withMessage('Canal deve ser email, push ou sms'),
    body('enabled')
      .optional()
      .isBoolean()
      .withMessage('enabled deve ser um valor booleano'),
    body('frequency')
      .optional()
      .isIn(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'])
      .withMessage('Frequência deve ser IMMEDIATE, DAILY, WEEKLY ou NEVER')
  ],
  validateRequest,
  updateChannelPreferences
);

/**
 * @route PUT /api/notification-preferences/user/:userId/type/:type
 * @desc Atualizar preferências de tipo específico
 * @access Private
 */
router.put(
  '/user/:userId/type/:type',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    param('type')
      .isString()
      .withMessage('Tipo é obrigatório'),
    body('enabled')
      .optional()
      .isBoolean()
      .withMessage('enabled deve ser um valor booleano'),
    body('channels')
      .optional()
      .isArray()
      .withMessage('Canais devem ser um array'),
    body('channels.*')
      .isIn(['email', 'push', 'sms'])
      .withMessage('Canal deve ser email, push ou sms'),
    body('frequency')
      .optional()
      .isIn(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'])
      .withMessage('Frequência deve ser IMMEDIATE, DAILY, WEEKLY ou NEVER'),
    body('minRelevanceScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Score de relevância deve ser entre 0 e 100')
  ],
  validateRequest,
  updateTypePreferences
);

module.exports = router;
