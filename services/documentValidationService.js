const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');
const fs = require('fs').promises;
const path = require('path');

// Tipos de documentos aceitos para cada tipo de usuário
const DOCUMENT_TYPES = {
  INSTITUTION: {
    REQUIRED: ['CNPJ', 'STATUTE', 'REGISTRATION'],
    OPTIONAL: ['LOGO', 'CERTIFICATE', 'OTHER']
  },
  COMPANY: {
    REQUIRED: ['CNPJ', 'REGISTRATION'],
    OPTIONAL: ['LOGO', 'CERTIFICATE', 'OTHER']
  },
  UNIVERSITY: {
    REQUIRED: ['REGISTRATION', 'ACCREDITATION'],
    OPTIONAL: ['LOGO', 'CERTIFICATE', 'OTHER']
  },
  VOLUNTEER: {
    REQUIRED: ['ID_DOCUMENT'],
    OPTIONAL: ['CERTIFICATE', 'BACKGROUND_CHECK', 'OTHER']
  }
};

// Validar tipo de documento
const validateDocumentType = (documentType, userType) => {
  const allowedTypes = [
    ...DOCUMENT_TYPES[userType].REQUIRED,
    ...DOCUMENT_TYPES[userType].OPTIONAL
  ];
  
  return allowedTypes.includes(documentType);
};

// Validar arquivo de documento
const validateDocumentFile = async (filePath, documentType) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Verificar se arquivo existe
    if (!stats.isFile()) {
      return {
        valid: false,
        error: 'Arquivo não encontrado'
      };
    }

    // Verificar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 10MB'
      };
    }

    // Verificar extensão do arquivo
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não suportado. Use: PDF, JPG, PNG, DOC ou DOCX'
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

// Validar CNPJ
const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return { valid: false, error: 'CNPJ inválido' };
  }

  // Algoritmo de validação do CNPJ
  let sum = 0;
  let weight = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleanCNPJ[12]) !== firstDigit) {
    return { valid: false, error: 'CNPJ inválido' };
  }

  // Segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleanCNPJ[13]) !== secondDigit) {
    return { valid: false, error: 'CNPJ inválido' };
  }

  return { valid: true };
};

// Validar CPF
const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return { valid: false, error: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return { valid: false, error: 'CPF inválido' };
  }

  // Algoritmo de validação do CPF
  let sum = 0;
  
  // Primeiro dígito verificador
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleanCPF[9]) !== firstDigit) {
    return { valid: false, error: 'CPF inválido' };
  }

  // Segundo dígito verificador
  sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleanCPF[10]) !== secondDigit) {
    return { valid: false, error: 'CPF inválido' };
  }

  return { valid: true };
};

// Validar documento de identidade
const validateIDDocument = (documentNumber) => {
  // Remove caracteres não alfanuméricos
  const cleanDocument = documentNumber.replace(/[^\w]/g, '');
  
  // Verifica se tem pelo menos 5 caracteres
  if (cleanDocument.length < 5) {
    return { valid: false, error: 'Documento de identidade deve ter pelo menos 5 caracteres' };
  }

  // Verifica se tem no máximo 20 caracteres
  if (cleanDocument.length > 20) {
    return { valid: false, error: 'Documento de identidade deve ter no máximo 20 caracteres' };
  }

  return { valid: true };
};

// Validar documento baseado no tipo
const validateDocument = async (documentType, documentData, filePath = null) => {
  try {
    // Validar tipo de documento
    if (!validateDocumentType(documentType, documentData.userType)) {
      return {
        valid: false,
        error: `Tipo de documento '${documentType}' não é válido para usuários do tipo '${documentData.userType}'`
      };
    }

    // Validar arquivo se fornecido
    if (filePath) {
      const fileValidation = await validateDocumentFile(filePath, documentType);
      if (!fileValidation.valid) {
        return fileValidation;
      }
    }

    // Validar dados específicos baseado no tipo
    switch (documentType) {
      case 'CNPJ':
        if (!documentData.cnpj) {
          return { valid: false, error: 'CNPJ é obrigatório' };
        }
        return validateCNPJ(documentData.cnpj);

      case 'ID_DOCUMENT':
        if (!documentData.documentNumber) {
          return { valid: false, error: 'Número do documento é obrigatório' };
        }
        return validateIDDocument(documentData.documentNumber);

      case 'STATUTE':
      case 'REGISTRATION':
      case 'ACCREDITATION':
      case 'CERTIFICATE':
      case 'BACKGROUND_CHECK':
      case 'LOGO':
      case 'OTHER':
        // Para estes tipos, apenas validamos o arquivo
        return { valid: true };

      default:
        return { valid: false, error: 'Tipo de documento não reconhecido' };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Erro na validação: ' + error.message
    };
  }
};

// Verificar se usuário tem todos os documentos obrigatórios
const checkRequiredDocuments = async (userId, userType) => {
  try {
    const requiredTypes = DOCUMENT_TYPES[userType].REQUIRED;
    
    const documents = await prisma.document.findMany({
      where: {
        userId,
        documentType: { in: requiredTypes },
        status: 'APPROVED'
      }
    });

    const submittedTypes = documents.map(doc => doc.documentType);
    const missingTypes = requiredTypes.filter(type => !submittedTypes.includes(type));

    return {
      hasAllRequired: missingTypes.length === 0,
      missingTypes,
      submittedTypes,
      requiredTypes
    };
  } catch (error) {
    return {
      hasAllRequired: false,
      error: error.message
    };
  }
};

// Aprovar documento
const approveDocument = async (documentId, adminId) => {
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
        status: 'APPROVED',
        reviewedAt: new Date(),
        rejectionReason: null
      }
    });

    return {
      success: true,
      data: updatedDocument,
      message: SUCCESS_MESSAGES.USER_UPDATED
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Rejeitar documento
const rejectDocument = async (documentId, rejectionReason, adminId) => {
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
        status: 'REJECTED',
        rejectionReason,
        reviewedAt: new Date()
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

// Obter documentos pendentes de aprovação
const getPendingDocuments = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const documents = await prisma.document.findMany({
      where: { status: 'PENDING' },
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
      where: { status: 'PENDING' }
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

module.exports = {
  validateDocument,
  validateDocumentFile,
  validateCNPJ,
  validateCPF,
  validateIDDocument,
  checkRequiredDocuments,
  approveDocument,
  rejectDocument,
  getPendingDocuments,
  DOCUMENT_TYPES
};
