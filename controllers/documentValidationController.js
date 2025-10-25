const documentValidationService = require('../services/documentValidationService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Validar documento
const validateDocument = async (req, res) => {
  try {
    const { documentType, documentData } = req.body;
    const filePath = req.file ? req.file.path : null;

    const validation = await documentValidationService.validateDocument(
      documentType,
      documentData,
      filePath
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error
      });
    }

    res.json({
      message: 'Documento válido',
      validation
    });
  } catch (error) {
    throw error;
  }
};

// Verificar documentos obrigatórios do usuário
const checkRequiredDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const result = await documentValidationService.checkRequiredDocuments(userId, userType);

    if (result.error) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      hasAllRequired: result.hasAllRequired,
      missingTypes: result.missingTypes,
      submittedTypes: result.submittedTypes,
      requiredTypes: result.requiredTypes
    });
  } catch (error) {
    throw error;
  }
};

// Aprovar documento (apenas para admins)
const approveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const adminId = req.user.id;

    const result = await documentValidationService.approveDocument(documentId, adminId);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message,
      document: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Rejeitar documento (apenas para admins)
const rejectDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        error: 'Motivo da rejeição deve ter pelo menos 10 caracteres'
      });
    }

    const result = await documentValidationService.rejectDocument(
      documentId,
      rejectionReason,
      adminId
    );

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message,
      document: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter documentos pendentes (apenas para admins)
const getPendingDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await documentValidationService.getPendingDocuments(
      parseInt(page),
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      documents: result.data.documents,
      pagination: result.data.pagination
    });
  } catch (error) {
    throw error;
  }
};

// Obter tipos de documentos permitidos
const getDocumentTypes = async (req, res) => {
  try {
    const userType = req.user.userType;
    const documentTypes = documentValidationService.DOCUMENT_TYPES[userType];

    res.json({
      documentTypes: {
        required: documentTypes.REQUIRED,
        optional: documentTypes.OPTIONAL
      }
    });
  } catch (error) {
    throw error;
  }
};

// Validar CNPJ
const validateCNPJ = async (req, res) => {
  try {
    const { cnpj } = req.body;

    if (!cnpj) {
      return res.status(400).json({
        error: 'CNPJ é obrigatório'
      });
    }

    const validation = documentValidationService.validateCNPJ(cnpj);

    res.json({
      valid: validation.valid,
      error: validation.error
    });
  } catch (error) {
    throw error;
  }
};

// Validar CPF
const validateCPF = async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({
        error: 'CPF é obrigatório'
      });
    }

    const validation = documentValidationService.validateCPF(cpf);

    res.json({
      valid: validation.valid,
      error: validation.error
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de documentos
const getDocumentStats = async (req, res) => {
  try {
    const { prisma } = require('../config/database');

    const stats = await prisma.document.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const totalDocuments = await prisma.document.count();
    const pendingCount = stats.find(s => s.status === 'PENDING')?._count.id || 0;
    const approvedCount = stats.find(s => s.status === 'APPROVED')?._count.id || 0;
    const rejectedCount = stats.find(s => s.status === 'REJECTED')?._count.id || 0;

    res.json({
      stats: {
        total: totalDocuments,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        approvalRate: totalDocuments > 0 ? (approvedCount / totalDocuments) * 100 : 0
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  validateDocument,
  checkRequiredDocuments,
  approveDocument,
  rejectDocument,
  getPendingDocuments,
  getDocumentTypes,
  validateCNPJ,
  validateCPF,
  getDocumentStats
};
