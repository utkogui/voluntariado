const express = require('express');
const router = express.Router();
const evaluationHistoryController = require('../controllers/evaluationHistoryController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { param, query } = require('express-validator');

// Middleware de validação para parâmetros
const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário inválido')
];

const validateActivityId = [
  param('activityId')
    .isUUID()
    .withMessage('ID da atividade inválido')
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
    .isIn(['createdAt', 'rating', 'type', 'status'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação inválida'),
  query('type')
    .optional()
    .isIn(['VOLUNTEER_TO_INSTITUTION', 'INSTITUTION_TO_VOLUNTEER', 'VOLUNTEER_TO_ACTIVITY', 'INSTITUTION_TO_ACTIVITY', 'PEER_TO_PEER'])
    .withMessage('Tipo de avaliação inválido'),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'MODERATED', 'HIDDEN'])
    .withMessage('Status de avaliação inválido'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Público deve ser um booleano'),
  query('userType')
    .optional()
    .isIn(['VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY'])
    .withMessage('Tipo de usuário inválido'),
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Período inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser válida')
];

// Rotas para histórico de avaliações
router.get('/user/:userId/history',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getUserEvaluationHistory
);

router.get('/user/:userId/summary',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getUserEvaluationSummary
);

router.get('/user/:userId/period',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getEvaluationHistoryByPeriod
);

router.get('/user/:userId/by-user-type',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getEvaluationsByUserType
);

router.get('/user/:userId/featured',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getFeaturedEvaluations
);

router.get('/user/:userId/comparative-stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  evaluationHistoryController.getComparativeStats
);

router.get('/user/:userId/rating-distribution',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getRatingDistribution
);

router.get('/user/:userId/stats-by-type',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getStatsByEvaluationType
);

router.get('/user/:userId/recent',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationHistoryController.getRecentEvaluations
);

router.get('/activity/:activityId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateActivityId,
  validateQueryParams,
  evaluationHistoryController.getEvaluationsByActivity
);

module.exports = router;
