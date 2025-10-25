const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireUserType } = require('../middleware/auth');
const { validate, userSchemas, validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const Joi = require('joi');

// Schema de validação para atualização de email
const updateEmailSchema = Joi.object({
  newEmail: Joi.string().email().required().messages({
    'string.email': 'Novo email deve ter um formato válido',
    'any.required': 'Novo email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória'
  })
});

// Schema de validação para deleção de conta
const deleteAccountSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória para deletar a conta'
  })
});

// Schema de validação para busca de usuários
const searchUsersQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  }),
  userType: Joi.string().valid('VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Obter perfil do usuário logado
router.get('/profile', catchAsync(userController.getProfile));

// Atualizar perfil do usuário
router.put('/profile',
  validate(userSchemas.updateProfile),
  catchAsync(userController.updateProfile)
);

// Alterar senha
router.put('/change-password',
  validate(userSchemas.changePassword),
  catchAsync(userController.changePassword)
);

// Atualizar email
router.put('/email',
  validate(updateEmailSchema),
  catchAsync(userController.updateEmail)
);

// Obter estatísticas do usuário
router.get('/stats', catchAsync(userController.getUserStats));

// Verificar email
router.get('/verify-email/:token', catchAsync(userController.verifyEmail));

// Deletar conta
router.delete('/account',
  validate(deleteAccountSchema),
  catchAsync(userController.deleteAccount)
);

// Buscar usuários (apenas para administradores)
router.get('/search',
  requireUserType('ADMIN'),
  validateQuery(searchUsersQuerySchema),
  catchAsync(userController.searchUsers)
);

module.exports = router;
