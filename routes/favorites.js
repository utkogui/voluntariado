const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');
const { validateQuery, validate } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para adicionar favorito
const addFavoriteSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres'
  })
});

// Schema de validação para atualizar notas
const updateNotesSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres'
  })
});

// Schema de validação para alternar favorito
const toggleFavoriteSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres'
  })
});

// Schema de validação para listar favoritos
const listFavoritesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Página deve ser maior que 0'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  }),
  sortBy: Joi.string().valid('createdAt', 'title', 'volunteerType').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

// Schema de validação para buscar favoritos
const searchFavoritesQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query de busca deve ter pelo menos 2 caracteres',
    'string.max': 'Query de busca deve ter no máximo 100 caracteres',
    'any.required': 'Query de busca é obrigatória'
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Página deve ser maior que 0'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  })
});

// Schema de validação para favoritos por categoria
const favoritesByCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Página deve ser maior que 0'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100'
  })
});

// Rotas protegidas (exigem autenticação)
router.post('/volunteer/:volunteerId/opportunity/:opportunityId',
  authenticate,
  validate(addFavoriteSchema),
  catchAsync(favoriteController.addToFavorites)
);

router.delete('/volunteer/:volunteerId/opportunity/:opportunityId',
  authenticate,
  catchAsync(favoriteController.removeFromFavorites)
);

router.get('/volunteer/:volunteerId',
  authenticate,
  validateQuery(listFavoritesQuerySchema),
  catchAsync(favoriteController.getVolunteerFavorites)
);

router.get('/volunteer/:volunteerId/opportunity/:opportunityId/status',
  authenticate,
  catchAsync(favoriteController.isFavorite)
);

router.put('/volunteer/:volunteerId/opportunity/:opportunityId/notes',
  authenticate,
  validate(updateNotesSchema),
  catchAsync(favoriteController.updateFavoriteNotes)
);

router.get('/volunteer/:volunteerId/stats',
  authenticate,
  catchAsync(favoriteController.getFavoriteStats)
);

router.get('/volunteer/:volunteerId/search',
  authenticate,
  validateQuery(searchFavoritesQuerySchema),
  catchAsync(favoriteController.searchFavorites)
);

router.get('/volunteer/:volunteerId/category/:categoryName',
  authenticate,
  validateQuery(favoritesByCategoryQuerySchema),
  catchAsync(favoriteController.getFavoritesByCategory)
);

router.post('/volunteer/:volunteerId/opportunity/:opportunityId/toggle',
  authenticate,
  validate(toggleFavoriteSchema),
  catchAsync(favoriteController.toggleFavorite)
);

module.exports = router;
