const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTemplate,
  getTemplateByType,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  getTemplateStats,
  initializeDefaultTemplates,
  processTemplate,
  getDefaultTemplates
} = require('../controllers/notificationTemplateController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/notification-templates
 * @desc Criar template de notificação
 * @access Private
 */
router.post(
  '/',
  [
    body('name')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ser uma string entre 1 e 255 caracteres'),
    body('type')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Tipo é obrigatório'),
    body('title')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Título deve ser uma string entre 1 e 255 caracteres'),
    body('body')
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Corpo deve ser uma string entre 1 e 1000 caracteres'),
    body('channelId')
      .optional()
      .isString()
      .withMessage('ID do canal deve ser uma string'),
    body('sound')
      .optional()
      .isString()
      .withMessage('Som deve ser uma string'),
    body('icon')
      .optional()
      .isString()
      .withMessage('Ícone deve ser uma string'),
    body('color')
      .optional()
      .isString()
      .withMessage('Cor deve ser uma string'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Dados devem ser um objeto'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive deve ser um valor booleano')
  ],
  validateRequest,
  createTemplate
);

/**
 * @route GET /api/notification-templates/type/:type
 * @desc Obter template por tipo
 * @access Private
 */
router.get(
  '/type/:type',
  [
    param('type').isString().withMessage('Tipo deve ser uma string')
  ],
  validateRequest,
  getTemplateByType
);

/**
 * @route GET /api/notification-templates
 * @desc Obter todos os templates
 * @access Private
 */
router.get(
  '/',
  [
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
      .isString()
      .withMessage('Tipo deve ser uma string'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive deve ser um valor booleano'),
    query('createdBy')
      .optional()
      .isIn(['me', 'admin'])
      .withMessage('createdBy deve ser me ou admin')
  ],
  validateRequest,
  getTemplates
);

/**
 * @route PUT /api/notification-templates/:templateId
 * @desc Atualizar template
 * @access Private
 */
router.put(
  '/:templateId',
  [
    param('templateId').isUUID().withMessage('ID do template inválido'),
    body('name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Nome deve ser uma string entre 1 e 255 caracteres'),
    body('type')
      .optional()
      .isString()
      .withMessage('Tipo deve ser uma string'),
    body('title')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Título deve ser uma string entre 1 e 255 caracteres'),
    body('body')
      .optional()
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Corpo deve ser uma string entre 1 e 1000 caracteres'),
    body('channelId')
      .optional()
      .isString()
      .withMessage('ID do canal deve ser uma string'),
    body('sound')
      .optional()
      .isString()
      .withMessage('Som deve ser uma string'),
    body('icon')
      .optional()
      .isString()
      .withMessage('Ícone deve ser uma string'),
    body('color')
      .optional()
      .isString()
      .withMessage('Cor deve ser uma string'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Dados devem ser um objeto'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive deve ser um valor booleano')
  ],
  validateRequest,
  updateTemplate
);

/**
 * @route DELETE /api/notification-templates/:templateId
 * @desc Deletar template
 * @access Private
 */
router.delete(
  '/:templateId',
  [
    param('templateId').isUUID().withMessage('ID do template inválido')
  ],
  validateRequest,
  deleteTemplate
);

/**
 * @route GET /api/notification-templates/stats
 * @desc Obter estatísticas de templates
 * @access Private
 */
router.get(
  '/stats',
  getTemplateStats
);

/**
 * @route POST /api/notification-templates/initialize-defaults
 * @desc Inicializar templates padrão
 * @access Private (Admin only)
 */
router.post(
  '/initialize-defaults',
  initializeDefaultTemplates
);

/**
 * @route POST /api/notification-templates/process
 * @desc Processar template com dados
 * @access Private
 */
router.post(
  '/process',
  [
    body('templateId')
      .isUUID()
      .withMessage('ID do template deve ser um UUID válido'),
    body('data')
      .isObject()
      .withMessage('Dados são obrigatórios')
  ],
  validateRequest,
  processTemplate
);

/**
 * @route GET /api/notification-templates/defaults
 * @desc Obter templates padrão
 * @access Private
 */
router.get(
  '/defaults',
  getDefaultTemplates
);

module.exports = router;
