const express = require('express');
const router = express.Router();
const opportunityCategorizationController = require('../controllers/opportunityCategorizationController');
const { authenticate } = require('../middleware/auth');
const { validateQuery, validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para listar categorias
const listCategoriesQuerySchema = Joi.object({
  includeInactive: Joi.boolean().optional().default(false),
  parentId: Joi.string().optional().allow(null),
  level: Joi.number().integer().min(0).max(5).optional().allow(null)
});

// Schema de validação para buscar categorias
const searchCategoriesQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query de busca deve ter pelo menos 2 caracteres',
    'string.max': 'Query de busca deve ter no máximo 100 caracteres',
    'any.required': 'Query de busca é obrigatória'
  }),
  includeInactive: Joi.boolean().optional().default(false),
  parentId: Joi.string().optional().allow(null),
  level: Joi.number().integer().min(0).max(5).optional().allow(null)
});

// Schema de validação para árvore de categorias
const categoryTreeQuerySchema = Joi.object({
  includeInactive: Joi.boolean().optional().default(false)
});

// Schema de validação para categorizar oportunidade
const categorizeOpportunitySchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
    'any.required': 'Título é obrigatório'
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    'string.max': 'Descrição deve ter no máximo 2000 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  requiredSkills: Joi.array().items(Joi.string()).optional().default([]),
  volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional().default('PRESENTIAL')
});

// Schema de validação para oportunidades por categoria
const opportunitiesByCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Página deve ser maior que 0'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  }),
  includeSubcategories: Joi.boolean().optional().default(true)
});

// Schema de validação para criar categoria
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  icon: Joi.string().max(10).optional().default('📁'),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().default('#3498db'),
  parentId: Joi.string().optional().allow(null),
  sortOrder: Joi.number().integer().min(0).optional().default(999)
});

// Schema de validação para atualizar categoria
const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  icon: Joi.string().max(10).optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
});

// Schema de validação para reordenar categorias
const reorderCategoriesSchema = Joi.object({
  categoryOrders: Joi.array().items(
    Joi.object({
      categoryId: Joi.string().required(),
      sortOrder: Joi.number().integer().min(0).required()
    })
  ).min(1).required().messages({
    'array.min': 'Deve haver pelo menos uma categoria para reordenar',
    'any.required': 'categoryOrders é obrigatório'
  })
});

// Rotas públicas
router.get('/categories',
  validateQuery(listCategoriesQuerySchema),
  catchAsync(opportunityCategorizationController.getAllCategories)
);

router.get('/categories/tree',
  validateQuery(categoryTreeQuerySchema),
  catchAsync(opportunityCategorizationController.getCategoryTree)
);

router.get('/categories/stats',
  catchAsync(opportunityCategorizationController.getCategoryStats)
);

router.get('/categories/search',
  validateQuery(searchCategoriesQuerySchema),
  catchAsync(opportunityCategorizationController.searchCategories)
);

router.get('/categories/:categoryId',
  catchAsync(opportunityCategorizationController.getCategoryById)
);

router.get('/categories/:categoryId/opportunities',
  validateQuery(opportunitiesByCategoryQuerySchema),
  catchAsync(opportunityCategorizationController.getOpportunitiesByCategory)
);

router.post('/categorize',
  validate(categorizeOpportunitySchema),
  catchAsync(opportunityCategorizationController.categorizeOpportunity)
);

// Rotas protegidas (exigem autenticação)
router.post('/categories',
  authenticate,
  validate(createCategorySchema),
  catchAsync(opportunityCategorizationController.createCategory)
);

router.put('/categories/:categoryId',
  authenticate,
  validate(updateCategorySchema),
  catchAsync(opportunityCategorizationController.updateCategory)
);

router.delete('/categories/:categoryId',
  authenticate,
  catchAsync(opportunityCategorizationController.deleteCategory)
);

router.put('/categories/reorder',
  authenticate,
  validate(reorderCategoriesSchema),
  catchAsync(opportunityCategorizationController.reorderCategories)
);

module.exports = router;
