const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireUserType } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para criação de categoria
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  description: Joi.string().max(500).optional(),
  icon: Joi.string().max(50).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  })
});

// Schema de validação para atualização de categoria
const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  icon: Joi.string().max(50).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  }),
  isActive: Joi.boolean().optional()
});

// Schema de validação para query de busca
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  })
});

// Schema de validação para query de categorias populares
const popularQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional()
});

// Rotas públicas
router.get('/', catchAsync(categoryController.getAllCategories));
router.get('/popular', validateQuery(popularQuerySchema), catchAsync(categoryController.getPopularCategories));
router.get('/search', validateQuery(searchQuerySchema), catchAsync(categoryController.searchCategories));
router.get('/stats', catchAsync(categoryController.getCategoryStats));
router.get('/:categoryId', catchAsync(categoryController.getCategoryById));

// Rotas protegidas (apenas para admins)
router.post('/', 
  authenticate, 
  requireUserType('ADMIN'), // Assumindo que existe tipo ADMIN
  validate(createCategorySchema), 
  catchAsync(categoryController.createCategory)
);

router.put('/:categoryId', 
  authenticate, 
  requireUserType('ADMIN'),
  validate(updateCategorySchema), 
  catchAsync(categoryController.updateCategory)
);

router.delete('/:categoryId', 
  authenticate, 
  requireUserType('ADMIN'),
  catchAsync(categoryController.deleteCategory)
);

module.exports = router;
