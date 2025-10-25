const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Configuração do CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.server.frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://volunteerapp.com',
      'https://www.volunteerapp.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Em desenvolvimento, permitir qualquer origin
      if (config.server.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Configuração do Helmet para segurança
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

// Rate limiting para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para IPs confiáveis (opcional)
    return false;
  }
});

// Rate limiting para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    error: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para API geral
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para upload de arquivos
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 uploads por IP por hora
  message: {
    error: 'Muitos uploads. Tente novamente em 1 hora.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para validar headers de segurança
const securityHeaders = (req, res, next) => {
  // Adicionar headers de segurança customizados
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remover header X-Powered-By
  res.removeHeader('X-Powered-By');
  
  next();
};

// Middleware para validar tamanho do body
const bodySizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength && contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Payload muito grande',
        maxSize: maxSize
      });
    }
    
    next();
  };
};

// Função auxiliar para converter tamanho em bytes
const parseSize = (size) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) return 10 * 1024 * 1024; // 10MB padrão
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
};

// Middleware para validar IPs suspeitos (básico)
const suspiciousIPFilter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Lista básica de IPs suspeitos (em produção, usar um serviço mais robusto)
  const suspiciousIPs = [
    '127.0.0.1', // localhost (apenas para teste)
    // Adicionar outros IPs suspeitos conforme necessário
  ];
  
  if (suspiciousIPs.includes(ip)) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }
  
  next();
};

// Middleware para validar User-Agent
const userAgentFilter = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  
  // Bloquear user agents suspeitos
  const suspiciousUserAgents = [
    'curl', // Pode ser usado para ataques automatizados
    'wget',
    'python-requests',
    'bot',
    'crawler',
    'spider'
  ];
  
  if (userAgent) {
    const isSuspicious = suspiciousUserAgents.some(ua => 
      userAgent.toLowerCase().includes(ua.toLowerCase())
    );
    
    if (isSuspicious && config.server.nodeEnv === 'production') {
      return res.status(403).json({
        error: 'User-Agent não permitido'
      });
    }
  }
  
  next();
};

// Middleware para validar referer (opcional)
const refererFilter = (req, res, next) => {
  const referer = req.headers.referer;
  const allowedReferers = [
    config.server.frontendUrl,
    'https://volunteerapp.com',
    'https://www.volunteerapp.com'
  ];
  
  // Permitir requisições sem referer (mobile apps, Postman, etc.)
  if (!referer) return next();
  
  // Em desenvolvimento, permitir qualquer referer
  if (config.server.nodeEnv === 'development') return next();
  
  const isAllowed = allowedReferers.some(allowed => 
    referer.startsWith(allowed)
  );
  
  if (!isAllowed) {
    return res.status(403).json({
      error: 'Referer não permitido'
    });
  }
  
  next();
};

// Middleware para logging de segurança
const securityLogger = (req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Log apenas requisições suspeitas ou com erro
    if (status >= 400 || duration > 5000) {
      console.warn(`🚨 Security Alert: ${req.method} ${req.originalUrl} - ${status} - ${ip} - ${duration}ms - ${userAgent}`);
    }
  });
  
  next();
};

module.exports = {
  corsOptions,
  helmetOptions,
  authLimiter,
  registerLimiter,
  apiLimiter,
  uploadLimiter,
  securityHeaders,
  bodySizeLimiter,
  suspiciousIPFilter,
  userAgentFilter,
  refererFilter,
  securityLogger
};
