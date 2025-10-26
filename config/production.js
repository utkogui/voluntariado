const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const loadEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  
  let envFile;
  switch (env) {
    case 'production':
      envFile = path.join(__dirname, 'production.env');
      break;
    case 'staging':
      envFile = path.join(__dirname, 'staging.env');
      break;
    case 'test':
      envFile = path.join(__dirname, 'test.env');
      break;
    default:
      envFile = path.join(__dirname, 'development.env');
  }
  
  // Load environment file
  dotenv.config({ path: envFile });
  
  // Also load .env file if it exists (for local overrides)
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  
  return env;
};

// Validate required environment variables
const validateEnvironment = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
    'PORT'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate database URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
};

// Environment configuration object
const config = {
  // Environment
  env: loadEnvironment(),
  
  // Server
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    name: process.env.DATABASE_NAME || 'volunteer_app',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000
    }
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    pool: {
      min: parseInt(process.env.REDIS_POOL_MIN) || 5,
      max: parseInt(process.env.REDIS_POOL_MAX) || 20,
      idleTimeoutMillis: parseInt(process.env.REDIS_POOL_IDLE_TIMEOUT) || 30000
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Email
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@volunteer-app.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Volunteer App'
  },
  
  // SMS
  sms: {
    service: process.env.SMS_SERVICE || 'twilio',
    accountSid: process.env.SMS_ACCOUNT_SID,
    authToken: process.env.SMS_AUTH_TOKEN,
    fromNumber: process.env.SMS_FROM_NUMBER
  },
  
  // Push Notifications
  pushNotifications: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }
  },
  
  // Payment
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    }
  },
  
  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  
  // External APIs
  apis: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY,
    googleAnalytics: process.env.GOOGLE_ANALYTICS_ID,
    mixpanel: process.env.MIXPANEL_TOKEN
  },
  
  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN
    },
    newRelic: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY
    }
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
    helmetCspEnabled: process.env.HELMET_CSP_ENABLED === 'true'
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // Backup
  backup: {
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    s3Bucket: process.env.BACKUP_S3_BUCKET
  },
  
  // CDN
  cdn: {
    url: process.env.CDN_URL,
    cacheTtl: parseInt(process.env.CDN_CACHE_TTL) || 31536000
  },
  
  // Health Check
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000
  },
  
  // Performance
  performance: {
    compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
    cacheTtl: parseInt(process.env.CACHE_TTL) || 3600,
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb'
  },
  
  // SSL/TLS
  ssl: {
    certPath: process.env.SSL_CERT_PATH,
    keyPath: process.env.SSL_KEY_PATH,
    enabled: process.env.SSL_ENABLED === 'true'
  },
  
  // Docker
  docker: {
    registry: process.env.DOCKER_REGISTRY,
    imageTag: process.env.DOCKER_IMAGE_TAG || 'latest'
  },
  
  // Kubernetes
  kubernetes: {
    namespace: process.env.K8S_NAMESPACE || 'volunteer-app',
    replicas: parseInt(process.env.K8S_REPLICAS) || 3,
    resources: {
      limits: {
        cpu: process.env.K8S_RESOURCE_LIMITS_CPU || '1000m',
        memory: process.env.K8S_RESOURCE_LIMITS_MEMORY || '2Gi'
      },
      requests: {
        cpu: process.env.K8S_RESOURCE_REQUESTS_CPU || '500m',
        memory: process.env.K8S_RESOURCE_REQUESTS_MEMORY || '1Gi'
      }
    }
  },
  
  // Load Balancer
  loadBalancer: {
    healthCheckPath: process.env.LB_HEALTH_CHECK_PATH || '/health',
    healthCheckInterval: parseInt(process.env.LB_HEALTH_CHECK_INTERVAL) || 30,
    healthCheckTimeout: parseInt(process.env.LB_HEALTH_CHECK_TIMEOUT) || 5,
    healthCheckThreshold: parseInt(process.env.LB_HEALTH_CHECK_THRESHOLD) || 2
  },
  
  // Auto Scaling
  autoScaling: {
    minReplicas: parseInt(process.env.AS_MIN_REPLICAS) || 2,
    maxReplicas: parseInt(process.env.AS_MAX_REPLICAS) || 10,
    targetCpuUtilization: parseInt(process.env.AS_TARGET_CPU_UTILIZATION) || 70,
    targetMemoryUtilization: parseInt(process.env.AS_TARGET_MEMORY_UTILIZATION) || 80
  },
  
  // File Upload
  fileUpload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
    uploadPath: process.env.UPLOAD_PATH || '/uploads'
  },
  
  // API
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api'
  },
  
  // Feature Flags
  features: {
    chat: process.env.FEATURE_CHAT_ENABLED === 'true',
    payments: process.env.FEATURE_PAYMENTS_ENABLED === 'true',
    notifications: process.env.FEATURE_NOTIFICATIONS_ENABLED === 'true',
    analytics: process.env.FEATURE_ANALYTICS_ENABLED === 'true'
  },
  
  // Maintenance
  maintenance: {
    mode: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'Sistema em manutenção. Volte em breve.'
  },
  
  // Error Handling
  errorHandling: {
    stackTrace: process.env.ERROR_STACK_TRACE === 'true',
    details: process.env.ERROR_DETAILS === 'true'
  },
  
  // Localization
  localization: {
    timezone: process.env.TZ || 'America/Sao_Paulo',
    locale: process.env.LOCALE || 'pt-BR',
    currency: process.env.CURRENCY || 'BRL'
  },
  
  // Business Hours
  businessHours: {
    startHour: parseInt(process.env.BUSINESS_START_HOUR) || 8,
    endHour: parseInt(process.env.BUSINESS_END_HOUR) || 18,
    timezone: process.env.BUSINESS_TIMEZONE || 'America/Sao_Paulo'
  }
};

// Validate environment after loading
validateEnvironment();

module.exports = config;
