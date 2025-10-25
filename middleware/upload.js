const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { UPLOAD, ERROR_MESSAGES } = require('../utils/constants');
const { createError } = require('./errorHandler');

// Configuração do multer para armazenamento em disco
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/';
    
    try {
      // Criar diretório se não existir
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = UPLOAD.ALLOWED_IMAGE_TYPES;
  const allowedDocumentTypes = UPLOAD.ALLOWED_DOCUMENT_TYPES;
  const allAllowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Tipo de arquivo não permitido', 400), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 5 // máximo 5 arquivos por requisição
  }
});

// Middleware para upload de imagens
const uploadImages = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

// Middleware para upload de documentos
const uploadDocuments = upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'certificates', maxCount: 5 },
  { name: 'backgroundCheck', maxCount: 1 }
]);

// Middleware para upload único
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware para upload múltiplo
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Middleware para validar arquivos após upload
const validateUploadedFiles = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];
  const errors = [];

  for (const file of files) {
    // Verificar se o arquivo foi enviado
    if (!file) continue;

    // Verificar tamanho do arquivo
    if (file.size > UPLOAD.MAX_FILE_SIZE) {
      errors.push(`Arquivo ${file.originalname} excede o tamanho máximo de ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Verificar tipo de arquivo
    const allowedTypes = [...UPLOAD.ALLOWED_IMAGE_TYPES, ...UPLOAD.ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Tipo de arquivo ${file.mimetype} não é permitido para ${file.originalname}`);
    }

    // Verificar extensão do arquivo
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`Extensão ${fileExtension} não é permitida para ${file.originalname}`);
    }
  }

  if (errors.length > 0) {
    // Limpar arquivos inválidos
    const filesToDelete = req.files || [req.file];
    filesToDelete.forEach(file => {
      if (file && file.path) {
        fs.unlink(file.path).catch(console.error);
      }
    });

    return res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: errors
    });
  }

  next();
};

// Middleware para limpar arquivos em caso de erro
const cleanupFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Se a resposta não foi bem-sucedida, limpar arquivos
    if (res.statusCode >= 400) {
      const files = req.files || (req.file ? [req.file] : []);
      files.forEach(file => {
        if (file && file.path) {
          fs.unlink(file.path).catch(console.error);
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Função para deletar arquivo
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

// Função para mover arquivo
const moveFile = async (oldPath, newPath) => {
  try {
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error('Erro ao mover arquivo:', error);
    return false;
  }
};

// Função para obter informações do arquivo
const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase()
  };
};

// Middleware para compressão de imagens (opcional)
const compressImages = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    if (file && UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      // Aqui você pode implementar compressão de imagem usando sharp ou similar
      // Por enquanto, apenas passamos para o próximo middleware
    }
  }
  
  next();
};

// Middleware para gerar thumbnails (opcional)
const generateThumbnails = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    if (file && UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      // Aqui você pode implementar geração de thumbnails
      // Por enquanto, apenas passamos para o próximo middleware
    }
  }
  
  next();
};

module.exports = {
  uploadImages,
  uploadDocuments,
  uploadSingle,
  uploadMultiple,
  validateUploadedFiles,
  cleanupFiles,
  deleteFile,
  moveFile,
  getFileInfo,
  compressImages,
  generateThumbnails
};
