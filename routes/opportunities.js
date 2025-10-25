const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { authenticate, requireUserType } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para query de busca de oportunidades
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  }),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED').optional(),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
  city: Joi.string().max(100).optional()
});

// Schema de validação para query de oportunidades próximas
const nearbyQuerySchema = Joi.object({
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
  radius: Joi.number().integer().min(1).max(500).optional().messages({
    'number.min': 'Raio deve ser pelo menos 1 km',
    'number.max': 'Raio deve ser no máximo 500 km'
  })
});

// Schema de validação para query de filtros
const filterQuerySchema = Joi.object({
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED').optional(),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
  city: Joi.string().max(100).optional(),
  category: Joi.string().max(100).optional(),
  skill: Joi.string().max(100).optional(),
  isRemote: Joi.boolean().optional()
});

// Schema de validação para criação de oportunidade
const createOpportunitySchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Título deve ter pelo menos 5 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
    'any.required': 'Título é obrigatório'
  }),
  description: Joi.string().min(20).max(2000).required().messages({
    'string.min': 'Descrição deve ter pelo menos 20 caracteres',
    'string.max': 'Descrição deve ter no máximo 2000 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  requirements: Joi.string().max(1000).optional(),
  benefits: Joi.string().max(1000).optional(),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').required().messages({
    'any.required': 'Tipo de voluntariado é obrigatório'
  }),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED').optional(),
  maxVolunteers: Joi.number().integer().min(1).max(1000).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(2).optional(),
  zipCode: Joi.string().max(20).optional(),
  country: Joi.string().max(100).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  isRemote: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  applicationDeadline: Joi.date().optional(),
  requiredSkills: Joi.array().items(Joi.string().max(100)).max(20).optional(),
  skillLevels: Joi.object().optional(),
  needsDonations: Joi.boolean().optional(),
  donationItems: Joi.array().items(Joi.string().max(200)).max(50).optional(),
  categoryIds: Joi.array().items(Joi.string()).max(10).optional()
});

// Schema de validação para atualização de oportunidade
const updateOpportunitySchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(20).max(2000).optional(),
  requirements: Joi.string().max(1000).optional(),
  benefits: Joi.string().max(1000).optional(),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED').optional(),
  maxVolunteers: Joi.number().integer().min(1).max(1000).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(2).optional(),
  zipCode: Joi.string().max(20).optional(),
  country: Joi.string().max(100).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  isRemote: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  applicationDeadline: Joi.date().optional(),
  requiredSkills: Joi.array().items(Joi.string().max(100)).max(20).optional(),
  skillLevels: Joi.object().optional(),
  needsDonations: Joi.boolean().optional(),
  donationItems: Joi.array().items(Joi.string().max(200)).max(50).optional(),
  categoryIds: Joi.array().items(Joi.string()).max(10).optional()
});

// Rotas públicas
router.get('/', validateQuery(filterQuerySchema), catchAsync(opportunityController.getAllOpportunities));
router.get('/search', validateQuery(searchQuerySchema), catchAsync(opportunityController.searchOpportunities));
router.get('/category/:categoryId', catchAsync(opportunityController.getOpportunitiesByCategory));
router.get('/nearby', validateQuery(nearbyQuerySchema), catchAsync(opportunityController.getNearbyOpportunities));
router.get('/stats', catchAsync(opportunityController.getOpportunityStats));
router.get('/:id', catchAsync(opportunityController.getOpportunityById));

// Rotas protegidas
router.post('/', 
  authenticate, 
  requireUserType(['INSTITUTION', 'COMPANY', 'UNIVERSITY']),
  validate(createOpportunitySchema), 
  catchAsync(opportunityController.createOpportunity)
);

router.put('/:id', 
  authenticate, 
  validate(updateOpportunitySchema), 
  catchAsync(opportunityController.updateOpportunity)
);

router.delete('/:id', 
  authenticate, 
  catchAsync(opportunityController.deleteOpportunity)
);

// Rotas para doações nas oportunidades
router.get('/:opportunityId/donations', 
  authenticate, 
  catchAsync(opportunityController.getOpportunityDonations)
);

router.get('/:opportunityId/donations/stats', 
  authenticate, 
  catchAsync(opportunityController.getOpportunityDonationStats)
);

router.post('/:opportunityId/donations', 
  authenticate, 
  catchAsync(opportunityController.addDonationToOpportunity)
);

router.delete('/:opportunityId/donations/:donationId', 
  authenticate, 
  catchAsync(opportunityController.removeDonationFromOpportunity)
);

module.exports = router;