const officialDocumentService = require('../services/officialDocumentService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Upload de documento oficial
const uploadOfficialDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, metadata } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        error: 'Tipo de documento é obrigatório'
      });
    }

    const documentData = {
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      documentType,
      metadata: metadata ? JSON.parse(metadata) : {}
    };

    const result = await officialDocumentService.createOfficialDocument(
      userId,
      documentData,
      req.file.path
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      document: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter documentos oficiais do usuário
const getUserOfficialDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.query;

    const result = await officialDocumentService.getUserOfficialDocuments(userId, documentType);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      documents: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter documento por ID
const getOfficialDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await officialDocumentService.getOfficialDocumentById(documentId);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      document: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter documentos pendentes (apenas para admins)
const getPendingOfficialDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await officialDocumentService.getPendingOfficialDocuments(
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

// Aprovar documento oficial (apenas para admins)
const approveOfficialDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const result = await officialDocumentService.approveOfficialDocument(
      documentId,
      adminId,
      notes
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

// Rejeitar documento oficial (apenas para admins)
const rejectOfficialDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { rejectionReason, notes } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({
        error: 'Motivo da rejeição é obrigatório'
      });
    }

    const result = await officialDocumentService.rejectOfficialDocument(
      documentId,
      adminId,
      rejectionReason,
      notes
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

// Marcar documento como em revisão (apenas para admins)
const markDocumentUnderReview = async (req, res) => {
  try {
    const { documentId } = req.params;
    const adminId = req.user.id;

    const result = await officialDocumentService.markDocumentUnderReview(
      documentId,
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

// Obter estatísticas de documentos oficiais
const getOfficialDocumentStats = async (req, res) => {
  try {
    const result = await officialDocumentService.getOfficialDocumentStats();

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Buscar documentos oficiais
const searchOfficialDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await officialDocumentService.searchOfficialDocuments(
      q.trim(),
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

// Obter tipos de documentos oficiais
const getOfficialDocumentTypes = async (req, res) => {
  try {
    res.json({
      documentTypes: officialDocumentService.OFFICIAL_DOCUMENT_TYPES,
      statuses: officialDocumentService.DOCUMENT_STATUS
    });
  } catch (error) {
    throw error;
  }
};

// Baixar documento oficial
const downloadOfficialDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { prisma } = require('../config/database');

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({
        error: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Verificar se é um documento oficial
    if (!Object.values(officialDocumentService.OFFICIAL_DOCUMENT_TYPES).includes(document.documentType)) {
      return res.status(400).json({
        error: 'Documento não é um documento oficial'
      });
    }

    // Verificar permissões: apenas o dono do documento ou um admin pode baixar
    if (req.user.id !== document.userId && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        error: 'Você não tem permissão para baixar este documento'
      });
    }

    const filePath = document.filePath;
    res.download(filePath, document.fileName, (err) => {
      if (err) {
        console.error(`Erro ao baixar documento ${documentId}: ${err.message}`);
        return res.status(500).json({
          error: 'Erro ao baixar o documento'
        });
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadOfficialDocument,
  getUserOfficialDocuments,
  getOfficialDocumentById,
  getPendingOfficialDocuments,
  approveOfficialDocument,
  rejectOfficialDocument,
  markDocumentUnderReview,
  getOfficialDocumentStats,
  searchOfficialDocuments,
  getOfficialDocumentTypes,
  downloadOfficialDocument
};
