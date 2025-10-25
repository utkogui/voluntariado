const express = require('express');
const { body, param, query } = require('express-validator');
const impactReportController = require('../controllers/impactReportController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const createImpactReportValidation = [
  body('companyId')
    .isUUID()
    .withMessage('ID da empresa deve ser um UUID válido'),
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  body('period')
    .isLength({ min: 1, max: 100 })
    .withMessage('Período deve ter entre 1 e 100 caracteres'),
  body('startDate')
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  body('endDate')
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601'),
  body('metrics')
    .isObject()
    .withMessage('Métricas devem ser um objeto'),
  body('achievements')
    .isArray()
    .withMessage('Conquistas devem ser um array'),
  body('challenges')
    .isArray()
    .withMessage('Desafios devem ser um array'),
  body('recommendations')
    .isArray()
    .withMessage('Recomendações devem ser um array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser um booleano')
];

const updateImpactReportValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  body('period')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Período deve ter entre 1 e 100 caracteres'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601'),
  body('metrics')
    .optional()
    .isObject()
    .withMessage('Métricas devem ser um objeto'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Conquistas devem ser um array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Desafios devem ser um array'),
  body('recommendations')
    .optional()
    .isArray()
    .withMessage('Recomendações devem ser um array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser um booleano')
];

const reportIdValidation = [
  param('reportId')
    .isUUID()
    .withMessage('ID do relatório deve ser um UUID válido')
];

const companyIdValidation = [
  param('companyId')
    .isUUID()
    .withMessage('ID da empresa deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status do relatório inválido')
];

const dateValidation = [
  param('startDate')
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  param('endDate')
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
  query('companyId')
    .optional()
    .isUUID()
    .withMessage('ID da empresa deve ser um UUID válido'),
  query('generatedBy')
    .optional()
    .isUUID()
    .withMessage('ID do gerador deve ser um UUID válido'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status do relatório inválido'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser um booleano'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'publishedAt', 'title'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação deve ser asc ou desc')
];

// Rotas públicas
router.get(
  '/public',
  queryValidation,
  impactReportController.getPublicImpactReports
);

router.get(
  '/stats',
  queryValidation,
  impactReportController.getImpactReportStats
);

// Rotas autenticadas
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  createImpactReportValidation,
  impactReportController.createImpactReport
);

router.put(
  '/:reportId',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  reportIdValidation,
  updateImpactReportValidation,
  impactReportController.updateImpactReport
);

router.post(
  '/:reportId/publish',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  reportIdValidation,
  impactReportController.publishImpactReport
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  queryValidation,
  impactReportController.getImpactReports
);

router.get(
  '/my-company',
  authMiddleware,
  authorize(['COMPANY']),
  queryValidation,
  impactReportController.getMyCompanyImpactReports
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  statusValidation,
  queryValidation,
  impactReportController.getImpactReportsByStatus
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  dateValidation,
  queryValidation,
  impactReportController.getImpactReportsByPeriod
);

router.get(
  '/company/:companyId',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  companyIdValidation,
  queryValidation,
  impactReportController.getImpactReportsByCompany
);

router.get(
  '/:reportId',
  authMiddleware,
  authorize(['ADMIN', 'COMPANY']),
  reportIdValidation,
  impactReportController.getImpactReport
);

module.exports = router;
