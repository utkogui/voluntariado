const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para query de busca
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  })
});

// Schema de validação para query de habilidades populares
const popularQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional()
});

// Schema de validação para categoria
const categoryParamSchema = Joi.object({
  category: Joi.string().valid(
    'TECHNICAL', 'EDUCATION', 'HEALTH', 'ARTS', 
    'SPORTS', 'COMMUNICATION', 'MANAGEMENT', 'PRACTICAL'
  ).required().messages({
    'any.only': 'Categoria deve ser uma das opções válidas',
    'any.required': 'Categoria é obrigatória'
  })
});

// Rotas públicas
router.get('/', catchAsync(skillController.getAllSkills));
router.get('/categories', catchAsync(skillController.getSkillCategories));
router.get('/levels', catchAsync(skillController.getSkillLevels));
router.get('/popular', validateQuery(popularQuerySchema), catchAsync(skillController.getPopularSkills));
router.get('/search', validateQuery(searchQuerySchema), catchAsync(skillController.searchSkills));
router.get('/stats', catchAsync(skillController.getSkillStats));
router.get('/category/:category', catchAsync(skillController.getSkillsByCategory));

module.exports = router;


