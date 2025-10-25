const { Prisma } = require('@prisma/client');
const { ERROR_MESSAGES } = require('../utils/constants');
const config = require('../config/env');

// Classe de erro personalizada
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Função para criar erros operacionais
const createError = (message, statusCode) => {
  return new AppError(message, statusCode);
};

// Função para tratar erros do Prisma
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Violação de constraint única
        const field = error.meta?.target?.[0] || 'campo';
        return createError(`${field} já está em uso`, 400);
      
      case 'P2025':
        // Registro não encontrado
        return createError('Registro não encontrado', 404);
      
      case 'P2003':
        // Violação de chave estrangeira
        return createError('Referência inválida', 400);
      
      case 'P2014':
        // Violação de relacionamento
        return createError('Operação inválida devido a relacionamentos existentes', 400);
      
      default:
        return createError('Erro no banco de dados', 500);
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return createError('Erro desconhecido no banco de dados', 500);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return createError('Erro interno do banco de dados', 500);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return createError('Erro de inicialização do banco de dados', 500);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createError('Dados inválidos fornecidos', 400);
  }

  return null;
};

// Função para tratar erros de JWT
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return createError('Token inválido', 401);
  }
  if (error.name === 'TokenExpiredError') {
    return createError('Token expirado', 401);
  }
  return null;
};

// Função para tratar erros de validação
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return createError(`Dados inválidos: ${errors.join(', ')}`, 400);
  }
  return null;
};

// Função para enviar erro em desenvolvimento
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Função para enviar erro em produção
const sendErrorProd = (err, res) => {
  // Erro operacional: enviar mensagem para o cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Erro de programação: não vazar detalhes
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Algo deu errado!'
    });
  }
};

// Middleware principal de tratamento de erros
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Tratar erros específicos
  if (err instanceof Prisma.PrismaClientKnownRequestError || 
      err instanceof Prisma.PrismaClientUnknownRequestError ||
      err instanceof Prisma.PrismaClientRustPanicError ||
      err instanceof Prisma.PrismaClientInitializationError ||
      err instanceof Prisma.PrismaClientValidationError) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Se não foi tratado, usar erro original
  if (!error) {
    error = err;
  }

  // Enviar resposta baseada no ambiente
  if (config.server.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Middleware para capturar erros 404
const notFound = (req, res, next) => {
  const error = createError(`Rota ${req.originalUrl} não encontrada`, 404);
  next(error);
};

// Middleware para capturar erros de async/await
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware para validação de tipos de arquivo
const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(createError('Tipo de arquivo não permitido', 400));
    }

    next();
  };
};

// Middleware para validação de tamanho de arquivo
const validateFileSize = (maxSize) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    if (req.file.size > maxSize) {
      return next(createError('Arquivo muito grande', 400));
    }

    next();
  };
};

// Middleware para rate limiting personalizado
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpar requisições antigas
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= max) {
      return res.status(429).json({
        error: message || 'Muitas requisições, tente novamente mais tarde',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    next();
  };
};

module.exports = {
  AppError,
  createError,
  errorHandler,
  notFound,
  catchAsync,
  validateFileType,
  validateFileSize,
  createRateLimit
};
