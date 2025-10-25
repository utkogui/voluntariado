const express = require('express');
const router = express.Router();
const officialDocumentController = require('../controllers/officialDocumentController');
const { authenticate, requireUserType } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { uploadSingle } = require('../middleware/upload');
const Joi = require('joi');

// Schema de validação para upload de documento
const uploadDocumentSchema = Joi.object({
  documentType: Joi.string().required().messages({
    'any.required': 'Tipo de documento é obrigatório'
  }),
  metadata: Joi.string().optional() // JSON string
});

// Schema de validação para aprovação de documento
const approveDocumentSchema = Joi.object({
  notes: Joi.string().max(500).optional()
});

// Schema de validação para rejeição de documento
const rejectDocumentSchema = Joi.object({
  rejectionReason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Motivo da rejeição deve ter pelo menos 10 caracteres',
    'string.max': 'Motivo da rejeição deve ter no máximo 500 caracteres',
    'any.required': 'Motivo da rejeição é obrigatório'
  }),
  notes: Joi.string().max(500).optional()
});

// Schema de validação para query de busca
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Query deve ter pelo menos 2 caracteres',
    'string.max': 'Query deve ter no máximo 100 caracteres',
    'any.required': 'Query é obrigatória'
  }),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Schema de validação para query de listagem
const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  documentType: Joi.string().optional()
});

// Rotas públicas
router.get('/types', catchAsync(officialDocumentController.getOfficialDocumentTypes));

// Rotas protegidas
router.use(authenticate);

// Upload de documento oficial
router.post('/upload', 
  uploadSingle('document'),
  validate(uploadDocumentSchema),
  catchAsync(officialDocumentController.uploadOfficialDocument)
);

// Obter documentos oficiais do usuário
router.get('/my-documents', 
  validateQuery(listQuerySchema),
  catchAsync(officialDocumentController.getUserOfficialDocuments)
);

// Obter documento por ID
router.get('/:documentId', catchAsync(officialDocumentController.getOfficialDocumentById));

// Baixar documento oficial
router.get('/:documentId/download', catchAsync(officialDocumentController.downloadOfficialDocument));

// Rotas apenas para admins
router.get('/admin/pending', 
  requireUserType('ADMIN'),
  validateQuery(listQuerySchema),
  catchAsync(officialDocumentController.getPendingOfficialDocuments)
);

router.get('/admin/stats', 
  requireUserType('ADMIN'),
  catchAsync(officialDocumentController.getOfficialDocumentStats)
);

router.get('/admin/search', 
  requireUserType('ADMIN'),
  validateQuery(searchQuerySchema),
  catchAsync(officialDocumentController.searchOfficialDocuments)
);

router.put('/:documentId/approve', 
  requireUserType('ADMIN'),
  validate(approveDocumentSchema),
  catchAsync(officialDocumentController.approveOfficialDocument)
);

router.put('/:documentId/reject', 
  requireUserType('ADMIN'),
  validate(rejectDocumentSchema),
  catchAsync(officialDocumentController.rejectOfficialDocument)
);

router.put('/:documentId/review', 
  requireUserType('ADMIN'),
  catchAsync(officialDocumentController.markDocumentUnderReview)
);

module.exports = router;
