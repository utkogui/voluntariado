const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');
const { validateQuery, validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para recomendações personalizadas
const personalizedRecommendationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  }),
  includeCollaborative: Joi.boolean().optional().default(true),
  includeContentBased: Joi.boolean().optional().default(true),
  includeTrending: Joi.boolean().optional().default(true),
  includeUrgent: Joi.boolean().optional().default(true)
});

// Schema de validação para recomendações específicas
const specificRecommendationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 50'
  })
});

// Schema de validação para recomendações de tendências/urgentes
const trendingUrgentQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).optional().default(5).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 20'
  })
});

// Schema de validação para histórico de recomendações
const recommendationHistoryQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(50).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  }),
  type: Joi.string().valid('collaborative', 'content-based', 'hybrid', 'trending', 'urgent').optional()
});

// Schema de validação para atualizar preferências
const updatePreferencesSchema = Joi.object({
  maxDistance: Joi.number().min(1).max(500).optional(),
  preferredDays: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).optional(),
  preferredTimeSlots: Joi.array().items(Joi.string().valid('morning', 'afternoon', 'evening', 'night')).optional(),
  minHoursPerWeek: Joi.number().min(1).max(40).optional(),
  maxHoursPerWeek: Joi.number().min(1).max(40).optional(),
  preferredCategories: Joi.array().items(Joi.string()).optional(),
  avoidCategories: Joi.array().items(Joi.string()).optional(),
  skillLevelPreference: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional()
});

// Schema de validação para rejeitar recomendação
const rejectRecommendationSchema = Joi.object({
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Motivo deve ter no máximo 500 caracteres'
  })
});

// Rotas protegidas (exigem autenticação)
router.get('/volunteer/:volunteerId/personalized',
  authenticate,
  validateQuery(personalizedRecommendationsQuerySchema),
  catchAsync(recommendationController.getPersonalizedRecommendations)
);

router.get('/volunteer/:volunteerId/collaborative',
  authenticate,
  validateQuery(specificRecommendationsQuerySchema),
  catchAsync(recommendationController.getCollaborativeRecommendations)
);

router.get('/volunteer/:volunteerId/content-based',
  authenticate,
  validateQuery(specificRecommendationsQuerySchema),
  catchAsync(recommendationController.getContentBasedRecommendations)
);

router.get('/volunteer/:volunteerId/hybrid',
  authenticate,
  validateQuery(specificRecommendationsQuerySchema),
  catchAsync(recommendationController.getHybridRecommendations)
);

router.get('/volunteer/:volunteerId/trending',
  authenticate,
  validateQuery(trendingUrgentQuerySchema),
  catchAsync(recommendationController.getTrendingRecommendations)
);

router.get('/volunteer/:volunteerId/urgent',
  authenticate,
  validateQuery(trendingUrgentQuerySchema),
  catchAsync(recommendationController.getUrgentRecommendations)
);

router.get('/volunteer/:volunteerId/stats',
  authenticate,
  catchAsync(recommendationController.getRecommendationStats)
);

router.get('/volunteer/:volunteerId/history',
  authenticate,
  validateQuery(recommendationHistoryQuerySchema),
  catchAsync(recommendationController.getRecommendationHistory)
);

router.put('/volunteer/:volunteerId/preferences',
  authenticate,
  validate(updatePreferencesSchema),
  catchAsync(recommendationController.updateRecommendationPreferences)
);

router.post('/volunteer/:volunteerId/opportunity/:opportunityId/viewed',
  authenticate,
  catchAsync(recommendationController.markRecommendationAsViewed)
);

router.post('/volunteer/:volunteerId/opportunity/:opportunityId/rejected',
  authenticate,
  validate(rejectRecommendationSchema),
  catchAsync(recommendationController.markRecommendationAsRejected)
);

module.exports = router;
