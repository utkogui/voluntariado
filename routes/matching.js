const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticate } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para filtros de matching
const matchingFiltersSchema = Joi.object({
  minScore: Joi.number().min(0).max(100).optional().messages({
    'number.min': 'Pontuação mínima deve ser entre 0 e 100',
    'number.max': 'Pontuação mínima deve ser entre 0 e 100'
  }),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
  city: Joi.string().max(100).optional(),
  category: Joi.string().max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  })
});

// Schema de validação para sugestões personalizadas
const suggestionsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 50'
  }),
  minScore: Joi.number().min(0).max(100).optional().default(70).messages({
    'number.min': 'Pontuação mínima deve ser entre 0 e 100',
    'number.max': 'Pontuação mínima deve ser entre 0 e 100'
  })
});

// Schema de validação para itens similares
const similarItemsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).optional().default(5).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 20'
  })
});

// Rotas públicas
router.get('/stats', catchAsync(matchingController.getMatchingStats));

// Rotas protegidas
router.get('/volunteer/:volunteerId/matches', 
  authenticate,
  validateQuery(matchingFiltersSchema),
  catchAsync(matchingController.findMatchesForVolunteer)
);

router.get('/opportunity/:opportunityId/volunteers',
  authenticate,
  validateQuery(matchingFiltersSchema),
  catchAsync(matchingController.findVolunteersForOpportunity)
);

router.get('/volunteer/:volunteerId/suggestions',
  authenticate,
  validateQuery(suggestionsQuerySchema),
  catchAsync(matchingController.getPersonalizedSuggestions)
);

router.get('/compatibility/:volunteerId/:opportunityId',
  authenticate,
  catchAsync(matchingController.calculateCompatibility)
);

router.get('/opportunity/:opportunityId/similar',
  authenticate,
  validateQuery(similarItemsQuerySchema),
  catchAsync(matchingController.getSimilarOpportunities)
);

router.get('/volunteer/:volunteerId/similar',
  authenticate,
  validateQuery(similarItemsQuerySchema),
  catchAsync(matchingController.getSimilarVolunteers)
);

module.exports = router;