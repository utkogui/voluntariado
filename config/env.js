require('dotenv').config();

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET'
];

// Verificar se todas as variáveis obrigatórias estão definidas
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n📝 Copie o arquivo env.example para .env e configure as variáveis necessárias.');
  process.exit(1);
}

// Configurações validadas
const config = {
  // Servidor
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
  },

  // Banco de dados
  database: {
    url: process.env.DATABASE_URL
  },

  // Autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@volunteerapp.com',
      name: process.env.FROM_NAME || 'Volunteer App'
    }
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // APIs Externas
  apis: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    },
    firebase: {
      serverKey: process.env.FIREBASE_SERVER_KEY
    }
  },

  // Pagamentos
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    }
  },

  // SMS
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Analytics
  analytics: {
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_ID
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN
    }
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

// Validações específicas por ambiente
if (config.server.nodeEnv === 'production') {
  // Em produção, validar variáveis críticas
  const productionRequiredVars = [
    'SMTP_USER',
    'SMTP_PASS',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingProductionVars = productionRequiredVars.filter(envVar => !process.env[envVar]);
  
  if (missingProductionVars.length > 0) {
    console.warn('⚠️  Variáveis recomendadas para produção não encontradas:');
    missingProductionVars.forEach(envVar => {
      console.warn(`   - ${envVar}`);
    });
  }
}

// Função para verificar se uma configuração está disponível
config.isAvailable = (path) => {
  const keys = path.split('.');
  let current = config;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return false;
    }
    current = current[key];
  }
  
  return true;
};

// Função para obter configuração com valor padrão
config.get = (path, defaultValue = null) => {
  const keys = path.split('.');
  let current = config;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
};

module.exports = config;
