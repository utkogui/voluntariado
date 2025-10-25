const express = require('express');
const { body, param, query } = require('express-validator');
const contentModerationController = require('../controllers/contentModerationController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const reportContentValidation = [
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
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
];

const moderateContentValidation = [
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
    .withMessage('ID do relatório deve ser um UUID válido')
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'HIDDEN'])
    .withMessage('Status de moderação inválido')
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
  query('contentType')
    .optional()
    .isIn(['EVALUATION', 'OPPORTUNITY', 'USER_PROFILE', 'MESSAGE', 'COMMENT', 'OTHER'])
    .withMessage('Tipo de conteúdo inválido'),
  query('reason')
    .optional()
    .isIn(['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FALSE_INFORMATION', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da denúncia inválido'),
  query('status')
    .optional()
    .isIn(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'HIDDEN'])
    .withMessage('Status de moderação inválido'),
  query('reportedBy')
    .optional()
    .isUUID()
    .withMessage('ID do reportador deve ser um UUID válido'),
  query('moderatedBy')
    .optional()
    .isUUID()
    .withMessage('ID do moderador deve ser um UUID válido'),
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
    .isIn(['createdAt', 'updatedAt', 'moderatedAt'])
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
  contentModerationController.getModerationStats
);

// Rotas autenticadas
router.post(
  '/report',
  authMiddleware,
  authorize(['VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY']),
  reportContentValidation,
  contentModerationController.reportContent
);

router.put(
  '/:reportId/moderate',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reportIdValidation,
  moderateContentValidation,
  contentModerationController.moderateContent
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  queryValidation,
  contentModerationController.getModerationReports
);

router.get(
  '/my-reports',
  authMiddleware,
  authorize(['VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY']),
  queryValidation,
  contentModerationController.getMyReports
);

router.get(
  '/pending',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  queryValidation,
  contentModerationController.getPendingReports
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  statusValidation,
  queryValidation,
  contentModerationController.getReportsByStatus
);

router.get(
  '/content-type/:contentType',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  contentTypeValidation,
  queryValidation,
  contentModerationController.getReportsByContentType
);

router.get(
  '/reason/:reason',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reasonValidation,
  queryValidation,
  contentModerationController.getReportsByReason
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  dateValidation,
  queryValidation,
  contentModerationController.getReportsByPeriod
);

router.get(
  '/user/:userId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  userIdValidation,
  queryValidation,
  contentModerationController.getReportsByUser
);

router.get(
  '/:reportId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reportIdValidation,
  contentModerationController.getModerationReport
);

module.exports = router;
