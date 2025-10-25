const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para query de busca de cidades
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  })
});

// Schema de validação para query de cidades próximas
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

// Schema de validação para query de cálculo de distância
const distanceQuerySchema = Joi.object({
  lat1: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude 1 deve estar entre -90 e 90',
    'number.max': 'Latitude 1 deve estar entre -90 e 90',
    'any.required': 'Latitude 1 é obrigatória'
  }),
  lng1: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude 1 deve estar entre -180 e 180',
    'number.max': 'Longitude 1 deve estar entre -180 e 180',
    'any.required': 'Longitude 1 é obrigatória'
  }),
  lat2: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude 2 deve estar entre -90 e 90',
    'number.max': 'Latitude 2 deve estar entre -90 e 90',
    'any.required': 'Latitude 2 é obrigatória'
  }),
  lng2: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude 2 deve estar entre -180 e 180',
    'number.max': 'Longitude 2 deve estar entre -180 e 180',
    'any.required': 'Longitude 2 é obrigatória'
  })
});

// Rotas públicas
router.get('/states', catchAsync(locationController.getAllStates));
router.get('/cities/state/:stateId', catchAsync(locationController.getCitiesByState));
router.get('/cities/search', validateQuery(searchQuerySchema), catchAsync(locationController.searchCities));
router.get('/cities/nearby', validateQuery(nearbyQuerySchema), catchAsync(locationController.getNearbyCities));
router.get('/stats', catchAsync(locationController.getLocationStats));
router.get('/cep/:cep', catchAsync(locationController.validateCEP));
router.get('/distance', validateQuery(distanceQuerySchema), catchAsync(locationController.calculateDistance));

module.exports = router;


