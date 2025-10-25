const express = require('express');
const { body, param, query } = require('express-validator');
const engagementTrackingController = require('../controllers/engagementTrackingController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const recordStudentEngagementValidation = [
  body('studentId')
    .isUUID()
    .withMessage('ID do estudante deve ser um UUID válido'),
  body('universityId')
    .isUUID()
    .withMessage('ID da universidade deve ser um UUID válido'),
  body('activityId')
    .isUUID()
    .withMessage('ID da atividade deve ser um UUID válido'),
  body('hoursVolunteered')
    .isFloat({ min: 0 })
    .withMessage('Horas voluntariadas devem ser um número positivo'),
  body('skillsDeveloped')
    .optional()
    .isArray()
    .withMessage('Habilidades desenvolvidas devem ser um array'),
  body('reflections')
    .optional()
    .isArray()
    .withMessage('Reflexões devem ser um array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Desafios devem ser um array'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Conquistas devem ser um array'),
  body('recommendations')
    .optional()
    .isArray()
    .withMessage('Recomendações devem ser um array'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser um número entre 1 e 5'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback deve ter no máximo 1000 caracteres')
];

const updateStudentEngagementValidation = [
  body('hoursVolunteered')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Horas voluntariadas devem ser um número positivo'),
  body('skillsDeveloped')
    .optional()
    .isArray()
    .withMessage('Habilidades desenvolvidas devem ser um array'),
  body('reflections')
    .optional()
    .isArray()
    .withMessage('Reflexões devem ser um array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Desafios devem ser um array'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Conquistas devem ser um array'),
  body('recommendations')
    .optional()
    .isArray()
    .withMessage('Recomendações devem ser um array'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser um número entre 1 e 5'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback deve ter no máximo 1000 caracteres'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'COMPLETED', 'SUSPENDED', 'GRADUATED'])
    .withMessage('Status de engajamento inválido')
];

const engagementIdValidation = [
  param('engagementId')
    .isUUID()
    .withMessage('ID do engajamento deve ser um UUID válido')
];

const studentIdValidation = [
  param('studentId')
    .isUUID()
    .withMessage('ID do estudante deve ser um UUID válido')
];

const universityIdValidation = [
  param('universityId')
    .isUUID()
    .withMessage('ID da universidade deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['ACTIVE', 'COMPLETED', 'SUSPENDED', 'GRADUATED'])
    .withMessage('Status de engajamento inválido')
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
  query('studentId')
    .optional()
    .isUUID()
    .withMessage('ID do estudante deve ser um UUID válido'),
  query('universityId')
    .optional()
    .isUUID()
    .withMessage('ID da universidade deve ser um UUID válido'),
  query('activityId')
    .optional()
    .isUUID()
    .withMessage('ID da atividade deve ser um UUID válido'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'COMPLETED', 'SUSPENDED', 'GRADUATED'])
    .withMessage('Status de engajamento inválido'),
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
    .isIn(['createdAt', 'updatedAt', 'startDate', 'endDate', 'hoursVolunteered', 'rating'])
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
  engagementTrackingController.getEngagementStats
);

// Rotas autenticadas
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  recordStudentEngagementValidation,
  engagementTrackingController.recordStudentEngagement
);

router.put(
  '/:engagementId',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  engagementIdValidation,
  updateStudentEngagementValidation,
  engagementTrackingController.updateStudentEngagement
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  queryValidation,
  engagementTrackingController.getEngagementRecords
);

router.get(
  '/my-engagements',
  authMiddleware,
  authorize(['VOLUNTEER']),
  queryValidation,
  engagementTrackingController.getMyEngagements
);

router.get(
  '/my-university-engagements',
  authMiddleware,
  authorize(['UNIVERSITY']),
  queryValidation,
  engagementTrackingController.getMyUniversityEngagements
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  statusValidation,
  queryValidation,
  engagementTrackingController.getEngagementsByStatus
);

router.get(
  '/student/:studentId',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  studentIdValidation,
  queryValidation,
  engagementTrackingController.getEngagementsByStudent
);

router.get(
  '/university/:universityId',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  universityIdValidation,
  queryValidation,
  engagementTrackingController.getEngagementsByUniversity
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  dateValidation,
  queryValidation,
  engagementTrackingController.getEngagementsByPeriod
);

router.get(
  '/:engagementId',
  authMiddleware,
  authorize(['ADMIN', 'UNIVERSITY']),
  engagementIdValidation,
  engagementTrackingController.getEngagementRecord
);

module.exports = router;
