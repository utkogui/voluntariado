const express = require('express');
const { body, param, query } = require('express-validator');
const participationHistoryController = require('../controllers/participationHistoryController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const recordParticipationValidation = [
  body('volunteerId')
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido'),
  body('activityId')
    .isUUID()
    .withMessage('ID da atividade deve ser um UUID válido'),
  body('institutionId')
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido'),
  body('status')
    .isIn(['REGISTERED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Status de participação inválido'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const updateParticipationStatusValidation = [
  body('status')
    .isIn(['REGISTERED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Status de participação inválido'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notas devem ter no máximo 1000 caracteres')
];

const participationIdValidation = [
  param('participationId')
    .isUUID()
    .withMessage('ID da participação deve ser um UUID válido')
];

const volunteerIdValidation = [
  param('volunteerId')
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido')
];

const institutionIdValidation = [
  param('institutionId')
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['REGISTERED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Status de participação inválido')
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
  query('volunteerId')
    .optional()
    .isUUID()
    .withMessage('ID do voluntário deve ser um UUID válido'),
  query('institutionId')
    .optional()
    .isUUID()
    .withMessage('ID da instituição deve ser um UUID válido'),
  query('activityId')
    .optional()
    .isUUID()
    .withMessage('ID da atividade deve ser um UUID válido'),
  query('status')
    .optional()
    .isIn(['REGISTERED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Status de participação inválido'),
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
    .isIn(['createdAt', 'updatedAt', 'startDate', 'endDate'])
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
  participationHistoryController.getParticipationStats
);

// Rotas autenticadas
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  recordParticipationValidation,
  participationHistoryController.recordParticipation
);

router.put(
  '/:participationId/status',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  participationIdValidation,
  updateParticipationStatusValidation,
  participationHistoryController.updateParticipationStatus
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  queryValidation,
  participationHistoryController.getParticipationHistory
);

router.get(
  '/my-participations',
  authMiddleware,
  authorize(['VOLUNTEER']),
  queryValidation,
  participationHistoryController.getMyParticipations
);

router.get(
  '/my-institution-participations',
  authMiddleware,
  authorize(['INSTITUTION']),
  queryValidation,
  participationHistoryController.getMyInstitutionParticipations
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  statusValidation,
  queryValidation,
  participationHistoryController.getParticipationsByStatus
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  dateValidation,
  queryValidation,
  participationHistoryController.getParticipationsByPeriod
);

router.get(
  '/volunteer/:volunteerId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  volunteerIdValidation,
  queryValidation,
  participationHistoryController.getParticipationsByVolunteer
);

router.get(
  '/institution/:institutionId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  institutionIdValidation,
  queryValidation,
  participationHistoryController.getParticipationsByInstitution
);

router.get(
  '/:participationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  participationIdValidation,
  participationHistoryController.getParticipation
);

module.exports = router;
