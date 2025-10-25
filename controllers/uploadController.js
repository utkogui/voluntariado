const { prisma } = require('../config/database');
const { getFileInfo, deleteFile } = require('../middleware/upload');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const { createError } = require('../middleware/errorHandler');

// Upload de imagem de perfil
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado'
      });
    }

    const fileInfo = getFileInfo(req.file);
    const userId = req.user.id;

    // Atualizar perfil do usuário com a nova imagem
    let updatedProfile = null;
    
    switch (req.user.userType) {
      case 'VOLUNTEER':
        updatedProfile = await prisma.volunteer.update({
          where: { userId },
          data: { profileImage: fileInfo.path }
        });
        break;
      case 'INSTITUTION':
        updatedProfile = await prisma.institution.update({
          where: { userId },
          data: { logo: fileInfo.path }
        });
        break;
      case 'COMPANY':
        updatedProfile = await prisma.company.update({
          where: { userId },
          data: { logo: fileInfo.path }
        });
        break;
      case 'UNIVERSITY':
        updatedProfile = await prisma.university.update({
          where: { userId },
          data: { logo: fileInfo.path }
        });
        break;
    }

    res.json({
      message: 'Imagem de perfil atualizada com sucesso',
      file: fileInfo,
      profile: updatedProfile
    });

  } catch (error) {
    // Limpar arquivo em caso de erro
    if (req.file && req.file.path) {
      await deleteFile(req.file.path);
    }
    
    throw error;
  }
};

// Upload de documentos
const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        error: 'Nenhum documento enviado'
      });
    }

    const uploadedFiles = [];
    const userId = req.user.id;

    // Processar cada tipo de documento
    for (const [fieldName, files] of Object.entries(req.files)) {
      for (const file of files) {
        const fileInfo = getFileInfo(file);
        
        // Salvar informações do documento no banco
        const document = await prisma.document.create({
          data: {
            userId,
            fileName: fileInfo.originalName,
            filePath: fileInfo.path,
            fileSize: fileInfo.size,
            mimeType: fileInfo.mimetype,
            documentType: fieldName,
            status: 'PENDING'
          }
        });

        uploadedFiles.push({
          id: document.id,
          ...fileInfo,
          documentType: fieldName
        });
      }
    }

    res.json({
      message: 'Documentos enviados com sucesso',
      files: uploadedFiles
    });

  } catch (error) {
    // Limpar arquivos em caso de erro
    if (req.files) {
      for (const files of Object.values(req.files)) {
        for (const file of files) {
          await deleteFile(file.path);
        }
      }
    }
    
    throw error;
  }
};

// Listar documentos do usuário
const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, status } = req.query;

    const where = { userId };
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }))
    });

  } catch (error) {
    throw error;
  }
};

// Deletar documento
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado'
      });
    }

    // Deletar arquivo físico
    await deleteFile(document.filePath);

    // Deletar registro do banco
    await prisma.document.delete({
      where: { id: documentId }
    });

    res.json({
      message: 'Documento deletado com sucesso'
    });

  } catch (error) {
    throw error;
  }
};

// Download de documento
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado'
      });
    }

    // Verificar se o arquivo existe
    const fs = require('fs');
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        error: 'Arquivo não encontrado no servidor'
      });
    }

    res.download(document.filePath, document.fileName);

  } catch (error) {
    throw error;
  }
};

// Aprovar/rejeitar documento (apenas para admins)
const updateDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, reason } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido'
      });
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? reason : null,
        reviewedAt: new Date()
      }
    });

    res.json({
      message: 'Status do documento atualizado com sucesso',
      document: {
        id: document.id,
        fileName: document.fileName,
        status: document.status,
        rejectionReason: document.rejectionReason,
        reviewedAt: document.reviewedAt
      }
    });

  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de uploads
const getUploadStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await prisma.document.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    });

    const totalSize = await prisma.document.aggregate({
      where: { userId },
      _sum: { fileSize: true }
    });

    res.json({
      stats: stats.map(stat => ({
        status: stat.status,
        count: stat._count.status
      })),
      totalFiles: stats.reduce((sum, stat) => sum + stat._count.status, 0),
      totalSize: totalSize._sum.fileSize || 0
    });

  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadProfileImage,
  uploadDocuments,
  getUserDocuments,
  deleteDocument,
  downloadDocument,
  updateDocumentStatus,
  getUploadStats
};
