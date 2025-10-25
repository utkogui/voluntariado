const express = require('express');
const router = express.Router();
const documentValidationController = require('../controllers/documentValidationController');
const { authenticate, requireUserType } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadSingle } = require('../middleware/upload');
const Joi = require('joi');

// Schema de validação para validação de documento
const validateDocumentSchema = Joi.object({
  documentType: Joi.string().required().messages({
    'any.required': 'Tipo de documento é obrigatório'
  }),
  documentData: Joi.object().required().messages({
    'any.required': 'Dados do documento são obrigatórios'
  })
});

// Schema de validação para rejeição de documento
const rejectDocumentSchema = Joi.object({
  rejectionReason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Motivo da rejeição deve ter pelo menos 10 caracteres',
    'string.max': 'Motivo da rejeição deve ter no máximo 500 caracteres',
    'any.required': 'Motivo da rejeição é obrigatório'
  })
});

// Schema de validação para validação de CNPJ
const validateCNPJSchema = Joi.object({
  cnpj: Joi.string().required().messages({
    'any.required': 'CNPJ é obrigatório'
  })
});

// Schema de validação para validação de CPF
const validateCPFSchema = Joi.object({
  cpf: Joi.string().required().messages({
    'any.required': 'CPF é obrigatório'
  })
});

// Schema de validação para query de documentos pendentes
const pendingDocumentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Rotas públicas
router.post('/validate-cnpj', 
  validate(validateCNPJSchema), 
  catchAsync(documentValidationController.validateCNPJ)
);

router.post('/validate-cpf', 
  validate(validateCPFSchema), 
  catchAsync(documentValidationController.validateCPF)
);

// Rotas protegidas
router.use(authenticate);

// Obter tipos de documentos permitidos para o usuário
router.get('/types', catchAsync(documentValidationController.getDocumentTypes));

// Verificar documentos obrigatórios do usuário
router.get('/required', catchAsync(documentValidationController.checkRequiredDocuments));

// Validar documento (com upload de arquivo)
router.post('/validate', 
  uploadSingle('document'),
  validate(validateDocumentSchema),
  catchAsync(documentValidationController.validateDocument)
);

// Obter estatísticas de documentos
router.get('/stats', catchAsync(documentValidationController.getDocumentStats));

// Rotas apenas para admins
router.get('/pending', 
  requireUserType('ADMIN'),
  validateQuery(pendingDocumentsQuerySchema),
  catchAsync(documentValidationController.getPendingDocuments)
);

router.post('/:documentId/approve', 
  requireUserType('ADMIN'),
  catchAsync(documentValidationController.approveDocument)
);

router.post('/:documentId/reject', 
  requireUserType('ADMIN'),
  validate(rejectDocumentSchema),
  catchAsync(documentValidationController.rejectDocument)
);

module.exports = router;
