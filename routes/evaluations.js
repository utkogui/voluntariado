const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body, param, query } = require('express-validator');

// Middleware de validação para avaliações
const validateEvaluation = [
  body('evaluatedId')
    .notEmpty()
    .withMessage('ID do usuário avaliado é obrigatório')
    .isUUID()
    .withMessage('ID do usuário avaliado inválido'),
  body('type')
    .isIn(['VOLUNTEER_TO_INSTITUTION', 'INSTITUTION_TO_VOLUNTEER', 'VOLUNTEER_TO_ACTIVITY', 'INSTITUTION_TO_ACTIVITY', 'PEER_TO_PEER'])
    .withMessage('Tipo de avaliação inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser entre 1 e 5'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comentário deve ter no máximo 1000 caracteres'),
  body('categories')
    .optional()
    .isObject()
    .withMessage('Categorias devem ser um objeto'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('Anônimo deve ser um booleano'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Público deve ser um booleano'),
  body('activityId')
    .optional()
    .isUUID()
    .withMessage('ID da atividade inválido'),
  body('opportunityId')
    .optional()
    .isUUID()
    .withMessage('ID da oportunidade inválido')
];

const validateEvaluationUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser entre 1 e 5'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comentário deve ter no máximo 1000 caracteres'),
  body('categories')
    .optional()
    .isObject()
    .withMessage('Categorias devem ser um objeto'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('Anônimo deve ser um booleano'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Público deve ser um booleano')
];

const validateModeration = [
  body('status')
    .isIn(['APPROVED', 'REJECTED', 'MODERATED', 'HIDDEN'])
    .withMessage('Status de moderação inválido'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Motivo deve ter no máximo 500 caracteres')
];

const validateReport = [
  body('reason')
    .isIn(['INAPPROPRIATE_CONTENT', 'FALSE_INFORMATION', 'HARASSMENT', 'SPAM', 'INAPPROPRIATE_RATING', 'OTHER'])
    .withMessage('Motivo da denúncia inválido'),
  body('description')
    .notEmpty()
    .withMessage('Descrição da denúncia é obrigatória')
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres')
];

const validateReview = [
  body('status')
    .isIn(['REVIEWED', 'RESOLVED', 'DISMISSED'])
    .withMessage('Status da revisão inválido'),
  body('reviewNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notas da revisão devem ter no máximo 500 caracteres')
];

// Middleware de validação para parâmetros
const validateEvaluationId = [
  param('evaluationId')
    .isUUID()
    .withMessage('ID da avaliação inválido')
];

const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário inválido')
];

const validateReportId = [
  param('reportId')
    .isUUID()
    .withMessage('ID da denúncia inválido')
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
  query('reason')
    .optional()
    .isIn(['INAPPROPRIATE_CONTENT', 'FALSE_INFORMATION', 'HARASSMENT', 'SPAM', 'INAPPROPRIATE_RATING', 'OTHER'])
    .withMessage('Motivo da denúncia inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser válida')
];

// Rotas para avaliações
router.post('/',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateEvaluation,
  evaluationController.createEvaluation
);

router.get('/user/:userId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationController.getUserEvaluations
);

router.get('/given',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  evaluationController.getEvaluationsGiven
);

router.get('/:evaluationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateEvaluationId,
  evaluationController.getEvaluation
);

router.put('/:evaluationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateEvaluationId,
  validateEvaluationUpdate,
  evaluationController.updateEvaluation
);

router.delete('/:evaluationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateEvaluationId,
  evaluationController.deleteEvaluation
);

router.patch('/:evaluationId/moderate',
  authMiddleware,
  authorize(['ADMIN']),
  validateEvaluationId,
  validateModeration,
  evaluationController.moderateEvaluation
);

router.get('/stats/:userId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  evaluationController.getEvaluationStats
);

router.get('/moderation/pending',
  authMiddleware,
  authorize(['ADMIN']),
  validateQueryParams,
  evaluationController.getPendingModerations
);

// Rotas para denúncias de avaliações
router.post('/:evaluationId/report',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateEvaluationId,
  validateReport,
  evaluationController.reportEvaluation
);

router.get('/reports',
  authMiddleware,
  authorize(['ADMIN']),
  validateQueryParams,
  evaluationController.getEvaluationReports
);

router.get('/reports/:reportId',
  authMiddleware,
  authorize(['ADMIN']),
  validateReportId,
  evaluationController.getEvaluationReport
);

router.patch('/reports/:reportId/review',
  authMiddleware,
  authorize(['ADMIN']),
  validateReportId,
  validateReview,
  evaluationController.reviewReport
);

router.get('/reports/stats',
  authMiddleware,
  authorize(['ADMIN']),
  validateQueryParams,
  evaluationController.getReportStats
);

router.get('/reports/user',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  evaluationController.getUserReports
);

router.patch('/reports/:reportId/cancel',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateReportId,
  evaluationController.cancelReport
);

module.exports = router;