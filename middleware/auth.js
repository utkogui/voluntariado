const { verifyAccessToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verificar token
    const decoded = verifyAccessToken(token);
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        volunteer: true,
        institution: true,
        company: true,
        university: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    // Verificar status da conta
    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: user.status === 'BLOCKED' 
          ? ERROR_MESSAGES.ACCOUNT_BLOCKED 
          : ERROR_MESSAGES.ACCOUNT_SUSPENDED
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
};

// Middleware para verificar se o usuário está verificado
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      error: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED
    });
  }
  next();
};

// Middleware para verificar tipo de usuário
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        error: ERROR_MESSAGES.FORBIDDEN
      });
    }
    next();
  };
};

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  const isOwner = req.user.id === userId;
  const isAdmin = req.user.userType === 'ADMIN'; // Assumindo que existe tipo ADMIN

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: ERROR_MESSAGES.FORBIDDEN
    });
  }
  next();
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem usuário autenticado
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        volunteer: true,
        institution: true,
        company: true,
        university: true
      }
    });

    if (user && user.status !== 'BLOCKED' && user.status !== 'SUSPENDED') {
      req.user = user;
    }

    next();

  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    next();
  }
};

module.exports = {
  authenticate,
  requireVerification,
  requireUserType,
  requireOwnershipOrAdmin,
  optionalAuth
};
