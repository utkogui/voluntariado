const express = require('express');
const { body, param, query } = require('express-validator');
const volunteerApprovalController = require('../controllers/volunteerApprovalController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const approveVolunteerValidation = [
  body('volunteerId')
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido'),
  body('institutionId')
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const rejectVolunteerValidation = [
  body('volunteerId')
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido'),
  body('institutionId')
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido'),
  body('reason')
    .isIn(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'FRAUD', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da rejeição inválido'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const revokeApprovalValidation = [
  body('reason')
    .isIn(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'FRAUD', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo da revogação inválido'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const approvalIdValidation = [
  param('approvalId')
    .isUUID()
    .withMessage('ID da aprovação deve ser um UUID válido')
];

const institutionIdValidation = [
  param('institutionId')
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED'])
    .withMessage('Status inválido')
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
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED'])
    .withMessage('Status inválido'),
  query('institutionId')
    .optional()
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido'),
  query('volunteerId')
    .optional()
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido'),
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
    .isIn(['createdAt', 'updatedAt', 'approvedAt', 'rejectedAt', 'revokedAt'])
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
  volunteerApprovalController.getApprovalStats
);

// Rotas autenticadas
router.post(
  '/approve',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  approveVolunteerValidation,
  volunteerApprovalController.approveVolunteer
);

router.post(
  '/reject',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  rejectVolunteerValidation,
  volunteerApprovalController.rejectVolunteer
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  queryValidation,
  volunteerApprovalController.getVolunteerApprovals
);

router.get(
  '/pending',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  queryValidation,
  volunteerApprovalController.getPendingApprovals
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  statusValidation,
  queryValidation,
  volunteerApprovalController.getApprovalsByStatus
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  dateValidation,
  queryValidation,
  volunteerApprovalController.getApprovalsByPeriod
);

router.get(
  '/institution/:institutionId/approved',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  institutionIdValidation,
  queryValidation,
  volunteerApprovalController.getApprovedVolunteersByInstitution
);

router.get(
  '/:approvalId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  approvalIdValidation,
  volunteerApprovalController.getVolunteerApproval
);

router.put(
  '/:approvalId/revoke',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  approvalIdValidation,
  revokeApprovalValidation,
  volunteerApprovalController.revokeApproval
);

module.exports = router;
