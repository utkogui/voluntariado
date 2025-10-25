const express = require('express');
const router = express.Router();
const messageTemplateController = require('../controllers/messageTemplateController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body, param, query } = require('express-validator');

// Middleware de validação para templates
const validateTemplate = [
  body('name')
    .notEmpty()
    .withMessage('Nome do template é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('type')
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'UNIVERSAL'])
    .withMessage('Tipo de template inválido'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Assunto deve ter no máximo 200 caracteres'),
  body('content')
    .notEmpty()
    .withMessage('Conteúdo do template é obrigatório')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Conteúdo deve ter entre 10 e 10000 caracteres'),
  body('contentType')
    .isIn(['TEXT', 'HTML', 'MARKDOWN'])
    .withMessage('Tipo de conteúdo inválido'),
  body('variables')
    .optional()
    .isArray()
    .withMessage('Variáveis devem ser um array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Status público deve ser um booleano'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),
  body('category')
    .optional()
    .isString()
    .withMessage('Categoria deve ser uma string')
];

const validateTemplateUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('type')
    .optional()
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'UNIVERSAL'])
    .withMessage('Tipo de template inválido'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Assunto deve ter no máximo 200 caracteres'),
  body('content')
    .optional()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Conteúdo deve ter entre 10 e 10000 caracteres'),
  body('contentType')
    .optional()
    .isIn(['TEXT', 'HTML', 'MARKDOWN'])
    .withMessage('Tipo de conteúdo inválido'),
  body('variables')
    .optional()
    .isArray()
    .withMessage('Variáveis devem ser um array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Status público deve ser um booleano'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),
  body('category')
    .optional()
    .isString()
    .withMessage('Categoria deve ser uma string')
];

const validateTemplateStatus = [
  body('isActive')
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano')
];

const validateTemplateDuplicate = [
  body('newName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
];

const validateTemplateRender = [
  body('variables')
    .optional()
    .isObject()
    .withMessage('Variáveis devem ser um objeto')
];

// Middleware de validação para parâmetros
const validateTemplateId = [
  param('templateId')
    .isUUID()
    .withMessage('ID do template inválido')
];

const validateTemplateName = [
  param('templateName')
    .notEmpty()
    .withMessage('Nome do template é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
];

const validateCategory = [
  param('category')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .isString()
    .withMessage('Categoria deve ser uma string')
];

const validateType = [
  param('type')
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'UNIVERSAL'])
    .withMessage('Tipo de template inválido')
];

// Middleware de validação para query parameters
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'type', 'category'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação inválida'),
  query('type')
    .optional()
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'UNIVERSAL'])
    .withMessage('Tipo de template inválido'),
  query('category')
    .optional()
    .isString()
    .withMessage('Categoria deve ser uma string'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Status público deve ser um booleano'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags devem ser uma string separada por vírgulas'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
];

// Rotas para templates de mensagem
router.post('/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplate,
  messageTemplateController.createTemplate
);

router.put('/:templateId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplateId,
  validateTemplateUpdate,
  messageTemplateController.updateTemplate
);

router.get('/:templateId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateTemplateId,
  messageTemplateController.getTemplate
);

router.get('/name/:templateName',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateTemplateName,
  messageTemplateController.getTemplateByName
);

router.get('/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  messageTemplateController.getUserTemplates
);

router.get('/public',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  messageTemplateController.getPublicTemplates
);

router.get('/category/:category',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateCategory,
  validateQueryParams,
  messageTemplateController.getTemplatesByCategory
);

router.get('/type/:type',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateType,
  validateQueryParams,
  messageTemplateController.getTemplatesByType
);

router.post('/:templateId/duplicate',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplateId,
  validateTemplateDuplicate,
  messageTemplateController.duplicateTemplate
);

router.delete('/:templateId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplateId,
  messageTemplateController.deleteTemplate
);

router.patch('/:templateId/status',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplateId,
  validateTemplateStatus,
  messageTemplateController.toggleTemplateStatus
);

router.post('/:templateId/render',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateTemplateId,
  validateTemplateRender,
  messageTemplateController.renderTemplate
);

router.get('/categories',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  messageTemplateController.getTemplateCategories
);

router.get('/tags',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  messageTemplateController.getTemplateTags
);

router.get('/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  messageTemplateController.getTemplateStats
);

router.post('/validate',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateTemplate,
  messageTemplateController.validateTemplate
);

module.exports = router;
