const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { uploadImages, uploadDocuments, validateUploadedFiles, cleanupFiles } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/security');
const { catchAsync } = require('../middleware/errorHandler');

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rate limiting para uploads
router.use(uploadLimiter);

// Upload de imagem de perfil
router.post('/profile-image', 
  uploadImages, 
  validateUploadedFiles, 
  cleanupFiles,
  catchAsync(uploadController.uploadProfileImage)
);

// Upload de documentos
router.post('/documents', 
  uploadDocuments, 
  validateUploadedFiles, 
  cleanupFiles,
  catchAsync(uploadController.uploadDocuments)
);

// Listar documentos do usuário
router.get('/documents', catchAsync(uploadController.getUserDocuments));

// Deletar documento
router.delete('/documents/:documentId', catchAsync(uploadController.deleteDocument));

// Download de documento
router.get('/documents/:documentId/download', catchAsync(uploadController.downloadDocument));

// Atualizar status do documento (apenas para admins)
router.patch('/documents/:documentId/status', catchAsync(uploadController.updateDocumentStatus));

// Obter estatísticas de uploads
router.get('/stats', catchAsync(uploadController.getUploadStats));

module.exports = router;
