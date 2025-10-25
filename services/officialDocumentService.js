const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');
const fs = require('fs').promises;
const path = require('path');

// Tipos de documentos oficiais aceitos
const OFFICIAL_DOCUMENT_TYPES = {
  ID_CARD: 'ID_CARD',           // RG, CNH, etc.
  CPF: 'CPF',                   // CPF
  CNPJ: 'CNPJ',                 // CNPJ
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE', // Certidão de nascimento
  MARRIAGE_CERTIFICATE: 'MARRIAGE_CERTIFICATE', // Certidão de casamento
  PROFESSIONAL_LICENSE: 'PROFESSIONAL_LICENSE', // Carteira profissional
  ACADEMIC_DIPLOMA: 'ACADEMIC_DIPLOMA', // Diploma acadêmico
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE', // Atestado médico
  BACKGROUND_CHECK: 'BACKGROUND_CHECK', // Verificação de antecedentes
  BANK_STATEMENT: 'BANK_STATEMENT', // Extrato bancário
  PROOF_OF_INCOME: 'PROOF_OF_INCOME', // Comprovante de renda
  ADDRESS_PROOF: 'ADDRESS_PROOF', // Comprovante de endereço
  OTHER: 'OTHER'                // Outros documentos
};

// Status dos documentos
const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

// Validar tipo de documento oficial
const validateOfficialDocumentType = (documentType) => {
  return Object.values(OFFICIAL_DOCUMENT_TYPES).includes(documentType);
};

// Validar arquivo de documento oficial
const validateOfficialDocumentFile = async (filePath, documentType) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Verificar se arquivo existe
    if (!stats.isFile()) {
      return {
        valid: false,
        error: 'Arquivo não encontrado'
      };
    }

    // Verificar tamanho do arquivo (máximo 20MB para documentos oficiais)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 20MB'
      };
    }

    // Verificar extensão do arquivo
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não suportado. Use: PDF, JPG, PNG, TIFF ou BMP'
      };
    }

    // Verificar se o arquivo não está corrompido (básico)
    if (stats.size < 1024) { // Menos de 1KB
      return {
        valid: false,
        error: 'Arquivo muito pequeno ou corrompido'
      };
    }

    return {
      valid: true,
      size: stats.size,
      extension: ext
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Erro ao validar arquivo: ' + error.message
    };
  }
};

// Criar documento oficial
const createOfficialDocument = async (userId, documentData, filePath) => {
  try {
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Validar tipo de documento
    if (!validateOfficialDocumentType(documentData.documentType)) {
      return {
        success: false,
        error: 'Tipo de documento inválido'
      };
    }

    // Validar arquivo
    const fileValidation = await validateOfficialDocumentFile(filePath, documentData.documentType);
    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.error
      };
    }

    // Criar documento
    const document = await prisma.document.create({
      data: {
        fileName: documentData.fileName,
        filePath: filePath,
        fileSize: fileValidation.size,
        mimeType: documentData.mimeType,
        documentType: documentData.documentType,
        status: DOCUMENT_STATUS.PENDING,
        userId: userId,
        metadata: documentData.metadata || {}
      }
    });

    return {
      success: true,
      data: document,
      message: 'Documento oficial enviado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter documentos oficiais de um usuário
const getUserOfficialDocuments = async (userId, documentType = null) => {
  try {
    const whereClause = {
      userId,
      documentType: {
        in: Object.values(OFFICIAL_DOCUMENT_TYPES)
      }
    };

    if (documentType) {
      whereClause.documentType = documentType;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: documents
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter documentos pendentes de revisão (para administradores)
const getPendingOfficialDocuments = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const documents = await prisma.document.findMany({
      where: { 
        status: DOCUMENT_STATUS.PENDING,
        documentType: {
          in: Object.values(OFFICIAL_DOCUMENT_TYPES)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    });

    const total = await prisma.document.count({
      where: { 
        status: DOCUMENT_STATUS.PENDING,
        documentType: {
          in: Object.values(OFFICIAL_DOCUMENT_TYPES)
        }
      }
    });

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Aprovar documento oficial
const approveOfficialDocument = async (documentId, adminId, notes = '') => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DOCUMENT_STATUS.APPROVED,
        reviewedAt: new Date(),
        rejectionReason: null,
        metadata: {
          ...document.metadata,
          approvedBy: adminId,
          approvedAt: new Date(),
          notes: notes
        }
      }
    });

    return {
      success: true,
      data: updatedDocument,
      message: 'Documento aprovado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Rejeitar documento oficial
const rejectOfficialDocument = async (documentId, adminId, rejectionReason, notes = '') => {
  try {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return {
        success: false,
        error: 'Motivo da rejeição deve ter pelo menos 10 caracteres'
      };
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DOCUMENT_STATUS.REJECTED,
        reviewedAt: new Date(),
        rejectionReason,
        metadata: {
          ...document.metadata,
          rejectedBy: adminId,
          rejectedAt: new Date(),
          notes: notes
        }
      }
    });

    return {
      success: true,
      data: updatedDocument,
      message: 'Documento rejeitado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Marcar documento como em revisão
const markDocumentUnderReview = async (documentId, adminId) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DOCUMENT_STATUS.UNDER_REVIEW,
        metadata: {
          ...document.metadata,
          underReviewBy: adminId,
          underReviewAt: new Date()
        }
      }
    });

    return {
      success: true,
      data: updatedDocument,
      message: 'Documento marcado como em revisão'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter estatísticas de documentos oficiais
const getOfficialDocumentStats = async () => {
  try {
    const stats = await prisma.document.groupBy({
      by: ['status'],
      where: {
        documentType: {
          in: Object.values(OFFICIAL_DOCUMENT_TYPES)
        }
      },
      _count: {
        id: true
      }
    });

    const totalDocuments = await prisma.document.count({
      where: {
        documentType: {
          in: Object.values(OFFICIAL_DOCUMENT_TYPES)
        }
      }
    });

    const pendingCount = stats.find(s => s.status === DOCUMENT_STATUS.PENDING)?._count.id || 0;
    const approvedCount = stats.find(s => s.status === DOCUMENT_STATUS.APPROVED)?._count.id || 0;
    const rejectedCount = stats.find(s => s.status === DOCUMENT_STATUS.REJECTED)?._count.id || 0;
    const underReviewCount = stats.find(s => s.status === DOCUMENT_STATUS.UNDER_REVIEW)?._count.id || 0;

    return {
      success: true,
      data: {
        total: totalDocuments,
        pending: pendingCount,
        underReview: underReviewCount,
        approved: approvedCount,
        rejected: rejectedCount,
        approvalRate: totalDocuments > 0 ? (approvedCount / totalDocuments) * 100 : 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Buscar documentos oficiais
const searchOfficialDocuments = async (query, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const documents = await prisma.document.findMany({
      where: {
        AND: [
          {
            documentType: {
              in: Object.values(OFFICIAL_DOCUMENT_TYPES)
            }
          },
          {
            OR: [
              {
                fileName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                user: {
                  email: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.document.count({
      where: {
        AND: [
          {
            documentType: {
              in: Object.values(OFFICIAL_DOCUMENT_TYPES)
            }
          },
          {
            OR: [
              {
                fileName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                user: {
                  email: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      }
    });

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter documento por ID
const getOfficialDocumentById = async (documentId) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    if (!document) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar se é um documento oficial
    if (!Object.values(OFFICIAL_DOCUMENT_TYPES).includes(document.documentType)) {
      return {
        success: false,
        error: 'Documento não é um documento oficial'
      };
    }

    return {
      success: true,
      data: document
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createOfficialDocument,
  getUserOfficialDocuments,
  getPendingOfficialDocuments,
  approveOfficialDocument,
  rejectOfficialDocument,
  markDocumentUnderReview,
  getOfficialDocumentStats,
  searchOfficialDocuments,
  getOfficialDocumentById,
  validateOfficialDocumentFile,
  OFFICIAL_DOCUMENT_TYPES,
  DOCUMENT_STATUS
};
