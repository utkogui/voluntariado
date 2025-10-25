const express = require('express');
const { body, param, query } = require('express-validator');
const behaviorReportController = require('../controllers/behaviorReportController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const reportBehaviorValidation = [
  body('contentType')
    .isIn(['EVALUATION', 'OPPORTUNITY', 'USER_PROFILE', 'MESSAGE', 'COMMENT', 'OTHER'])
    .withMessage('Tipo de conteúdo inválido'),
  body('contentId')
    .isUUID()
    .withMessage('ID do conteúdo deve ser um UUID válido'),
  body('reason')
    .isIn(['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FALSE_INFORMATION', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da denúncia inválido'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  body('severity')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Severidade inválida'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidências devem ser um array'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous deve ser um booleano')
];

const moderateReportValidation = [
  body('status')
    .isIn(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'HIDDEN'])
    .withMessage('Status de moderação inválido'),
  body('action')
    .optional()
    .isIn(['APPROVE', 'REJECT', 'HIDE', 'DELETE', 'WARN', 'SUSPEND'])
    .withMessage('Ação de moderação inválida'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const reportIdValidation = [
  param('reportId')
    .isUUID()
    .withMessage('ID da denúncia deve ser um UUID válido')
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido')
];

const severityValidation = [
  param('severity')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Severidade inválida')
];

const contentTypeValidation = [
  param('contentType')
    .isIn(['EVALUATION', 'OPPORTUNITY', 'USER_PROFILE', 'MESSAGE', 'COMMENT', 'OTHER'])
    .withMessage('Tipo de conteúdo inválido')
];

const reasonValidation = [
  param('reason')
    .isIn(['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FALSE_INFORMATION', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da denúncia inválido')
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
  query('status')
    .optional()
    .isIn(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'HIDDEN'])
    .withMessage('Status inválido'),
  query('severity')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Severidade inválida'),
  query('contentType')
    .optional()
    .isIn(['EVALUATION', 'OPPORTUNITY', 'USER_PROFILE', 'MESSAGE', 'COMMENT', 'OTHER'])
    .withMessage('Tipo de conteúdo inválido'),
  query('reason')
    .optional()
    .isIn(['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FALSE_INFORMATION', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da denúncia inválido'),
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
    .isIn(['createdAt', 'updatedAt', 'severity', 'status'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação deve ser asc ou desc')
];

// Rotas públicas
router.get(
  '/stats',
  queryValidation,
  behaviorReportController.getReportStats
);

// Rotas autenticadas
router.post(
  '/',
  authMiddleware,
  authorize(['VOLUNTEER', 'INSTITUTION']),
  reportBehaviorValidation,
  behaviorReportController.reportBehavior
);

router.get(
  '/my-reports',
  authMiddleware,
  authorize(['VOLUNTEER', 'INSTITUTION']),
  queryValidation,
  behaviorReportController.getUserReports
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  queryValidation,
  behaviorReportController.getBehaviorReports
);

router.get(
  '/pending',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  queryValidation,
  behaviorReportController.getPendingReports
);

router.get(
  '/severity/:severity',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  severityValidation,
  queryValidation,
  behaviorReportController.getReportsBySeverity
);

router.get(
  '/content-type/:contentType',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  contentTypeValidation,
  queryValidation,
  behaviorReportController.getReportsByContentType
);

router.get(
  '/reason/:reason',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reasonValidation,
  queryValidation,
  behaviorReportController.getReportsByReason
);

router.get(
  '/:reportId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reportIdValidation,
  behaviorReportController.getBehaviorReport
);

router.put(
  '/:reportId/moderate',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reportIdValidation,
  moderateReportValidation,
  behaviorReportController.moderateReport
);

router.delete(
  '/:reportId',
  authMiddleware,
  authorize(['VOLUNTEER', 'INSTITUTION']),
  reportIdValidation,
  behaviorReportController.cancelReport
);

module.exports = router;
