const Joi = require('joi');
const { ERROR_MESSAGES } = require('../utils/constants');

// Middleware para validar dados de entrada
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      allowUnknown: false, // Não permite campos não definidos no schema
      stripUnknown: true // Remove campos não definidos no schema
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: errorDetails
      });
    }

    // Substituir os dados validados
    req[property] = value;
    next();
  };
};

// Schemas de validação para autenticação
const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.max': 'Senha deve ter no máximo 128 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    userType: Joi.string().valid('VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY').required().messages({
      'any.only': 'Tipo de usuário deve ser VOLUNTEER, INSTITUTION, COMPANY ou UNIVERSITY',
      'any.required': 'Tipo de usuário é obrigatório'
    }),
    // Campos específicos para voluntário
    firstName: Joi.when('userType', {
      is: 'VOLUNTEER',
      then: Joi.string().min(2).max(50).required(),
      otherwise: Joi.forbidden()
    }),
    lastName: Joi.when('userType', {
      is: 'VOLUNTEER',
      then: Joi.string().min(2).max(50).required(),
      otherwise: Joi.forbidden()
    }),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional().messages({
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(2).optional(),
    skills: Joi.when('userType', {
      is: 'VOLUNTEER',
      then: Joi.array().items(Joi.string().min(2).max(50)).optional(),
      otherwise: Joi.forbidden()
    }),
    volunteerTypes: Joi.when('userType', {
      is: 'VOLUNTEER',
      then: Joi.array().items(Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID')).optional(),
      otherwise: Joi.forbidden()
    }),
    // Campos específicos para instituição/empresa/universidade
    name: Joi.when('userType', {
      is: Joi.string().valid('INSTITUTION', 'COMPANY', 'UNIVERSITY'),
      then: Joi.string().min(2).max(200).required(),
      otherwise: Joi.forbidden()
    }),
    description: Joi.string().max(1000).optional(),
    address: Joi.when('userType', {
      is: Joi.string().valid('INSTITUTION', 'COMPANY', 'UNIVERSITY'),
      then: Joi.string().min(10).max(200).required(),
      otherwise: Joi.forbidden()
    }),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional().messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional().messages({
      'string.pattern.base': 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Senha é obrigatória'
    })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token é obrigatório'
    })
  })
};

// Schemas de validação para usuários
const userSchemas = {
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional().messages({
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
    bio: Joi.string().max(1000).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(2).optional(),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional().messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    skills: Joi.array().items(Joi.string().min(2).max(50)).optional(),
    skillLevels: Joi.object().pattern(Joi.string(), Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')).optional(),
    volunteerTypes: Joi.array().items(Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID')).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Senha atual é obrigatória'
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'string.max': 'Nova senha deve ter no máximo 128 caracteres',
      'any.required': 'Nova senha é obrigatória'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Confirmação de senha deve ser igual à nova senha',
      'any.required': 'Confirmação de senha é obrigatória'
    })
  })
};

// Schemas de validação para oportunidades
const opportunitySchemas = {
  create: Joi.object({
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
      'any.only': 'Tipo de voluntariado deve ser PRESENTIAL, ONLINE ou HYBRID',
      'any.required': 'Tipo de voluntariado é obrigatório'
    }),
    maxVolunteers: Joi.number().integer().min(1).max(1000).optional(),
    address: Joi.string().min(10).max(200).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(2).optional(),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional().messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    startDate: Joi.date().greater('now').optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    applicationDeadline: Joi.date().greater('now').optional(),
    requiredSkills: Joi.array().items(Joi.string().min(2).max(50)).optional(),
    skillLevels: Joi.object().pattern(Joi.string(), Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')).optional(),
    needsDonations: Joi.boolean().optional(),
    donationItems: Joi.array().items(Joi.string().min(2).max(100)).optional(),
    categoryIds: Joi.array().items(Joi.string().uuid()).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(20).max(2000).optional(),
    requirements: Joi.string().max(1000).optional(),
    benefits: Joi.string().max(1000).optional(),
    volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
    maxVolunteers: Joi.number().integer().min(1).max(1000).optional(),
    address: Joi.string().min(10).max(200).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(2).optional(),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional().messages({
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    applicationDeadline: Joi.date().optional(),
    requiredSkills: Joi.array().items(Joi.string().min(2).max(50)).optional(),
    skillLevels: Joi.object().pattern(Joi.string(), Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')).optional(),
    needsDonations: Joi.boolean().optional(),
    donationItems: Joi.array().items(Joi.string().min(2).max(100)).optional(),
    categoryIds: Joi.array().items(Joi.string().uuid()).optional()
  }),

  search: Joi.object({
    q: Joi.string().min(2).max(100).optional(),
    category: Joi.string().optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(2).optional(),
    volunteerType: Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID').optional(),
    skills: Joi.array().items(Joi.string().min(2).max(50)).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'title', 'startDate', 'endDate').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  })
};

// Schemas de validação para avaliações
const evaluationSchemas = {
  create: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Avaliação deve ser entre 1 e 5',
      'number.max': 'Avaliação deve ser entre 1 e 5',
      'any.required': 'Avaliação é obrigatória'
    }),
    comment: Joi.string().max(1000).optional(),
    opportunityId: Joi.string().uuid().optional(),
    evaluatedId: Joi.string().uuid().required().messages({
      'any.required': 'ID do usuário avaliado é obrigatório'
    })
  })
};

// Schemas de validação para mensagens
const messageSchemas = {
  send: Joi.object({
    content: Joi.string().min(1).max(2000).required().messages({
      'string.min': 'Mensagem não pode estar vazia',
      'string.max': 'Mensagem deve ter no máximo 2000 caracteres',
      'any.required': 'Conteúdo da mensagem é obrigatório'
    }),
    receiverId: Joi.string().uuid().required().messages({
      'any.required': 'ID do destinatário é obrigatório'
    })
  })
};

// Middleware para validação de parâmetros de rota
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: errorDetails
      });
    }

    req.params = value;
    next();
  };
};

// Schema para validação de UUIDs
const uuidSchema = Joi.string().uuid().required().messages({
  'string.guid': 'ID deve ser um UUID válido',
  'any.required': 'ID é obrigatório'
});

// Middleware para validação de query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: errorDetails
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  authSchemas,
  userSchemas,
  opportunitySchemas,
  evaluationSchemas,
  messageSchemas,
  uuidSchema
};
