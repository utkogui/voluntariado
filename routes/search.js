const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para busca avançada
const advancedSearchQuerySchema = Joi.object({
  q: Joi.string().max(200).optional().messages({
    'string.max': 'Query deve ter no máximo 200 caracteres'
  }),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED').optional(),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(2).optional(),
  category: Joi.string().max(100).optional(),
  skill: Joi.string().max(100).optional(),
  isRemote: Joi.boolean().optional(),
  needsDonations: Joi.boolean().optional(),
  startDateFrom: Joi.date().iso().optional(),
  startDateTo: Joi.date().iso().optional(),
  applicationDeadlineFrom: Joi.date().iso().optional(),
  applicationDeadlineTo: Joi.date().iso().optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(500).optional(),
  hasAvailableSlots: Joi.boolean().optional(),
  sortBy: Joi.string().valid('createdAt', 'title', 'startDate', 'applicationDeadline', 'volunteersNeeded', 'distance').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Schema de validação para sugestões
const suggestionsQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  }),
  type: Joi.string().valid('all', 'opportunities', 'categories', 'skills', 'cities').optional().default('all')
});

// Schema de validação para busca rápida
const quickSearchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 200 caracteres',
    'any.required': 'Query é obrigatória'
  })
});

// Schema de validação para busca por localização
const locationSearchQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude deve estar entre -90 e 90',
    'number.max': 'Latitude deve estar entre -90 e 90',
    'any.required': 'Latitude é obrigatória'
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude deve estar entre -180 e 180',
    'number.max': 'Longitude deve estar entre -180 e 180',
    'any.required': 'Longitude é obrigatória'
  }),
  radius: Joi.number().min(1).max(500).optional().default(50)
});

// Schema de validação para busca por categoria
const categorySearchQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20)
});

// Schema de validação para busca por habilidade
const skillSearchQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20)
});

// Schema de validação para busca por cidade
const citySearchQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20)
});

// Schema de validação para tags populares
const popularTagsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20)
});

// Rotas públicas
router.get('/advanced', 
  validateQuery(advancedSearchQuerySchema),
  catchAsync(searchController.advancedSearch)
);

router.get('/suggestions', 
  validateQuery(suggestionsQuerySchema),
  catchAsync(searchController.getSearchSuggestions)
);

router.get('/filters', 
  catchAsync(searchController.getAvailableFilters)
);

router.get('/tags/popular', 
  validateQuery(popularTagsQuerySchema),
  catchAsync(searchController.getPopularTags)
);

router.get('/quick', 
  validateQuery(quickSearchQuerySchema),
  catchAsync(searchController.quickSearch)
);

router.get('/location', 
  validateQuery(locationSearchQuerySchema),
  catchAsync(searchController.searchByLocation)
);

router.get('/category/:categoryId', 
  validateQuery(categorySearchQuerySchema),
  catchAsync(searchController.searchByCategory)
);

router.get('/skill/:skill', 
  validateQuery(skillSearchQuerySchema),
  catchAsync(searchController.searchBySkill)
);

router.get('/city/:city', 
  validateQuery(citySearchQuerySchema),
  catchAsync(searchController.searchByCity)
);

module.exports = router;


