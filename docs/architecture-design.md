# Documentação de Arquitetura e Design - Sistema de Voluntariado

## Visão Geral

O Sistema de Voluntariado é uma plataforma web completa desenvolvida para conectar voluntários com instituições que precisam de ajuda. A arquitetura foi projetada para ser escalável, segura e de fácil manutenção.

## Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Componentes do Sistema](#componentes-do-sistema)
3. [Padrões de Design](#padrões-de-design)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Segurança](#segurança)
6. [Escalabilidade](#escalabilidade)
7. [Monitoramento](#monitoramento)
8. [Deploy e Infraestrutura](#deploy-e-infraestrutura)

## Arquitetura Geral

### Visão de Alto Nível

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Redis         │    │   File Storage  │
│   (AWS S3)      │    │   (Cache)       │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Princípios Arquiteturais

1. **Separação de Responsabilidades**: Cada componente tem uma responsabilidade específica
2. **Escalabilidade Horizontal**: Sistema pode ser escalado adicionando mais instâncias
3. **Resiliência**: Sistema continua funcionando mesmo com falhas parciais
4. **Segurança por Design**: Segurança integrada em todos os níveis
5. **Observabilidade**: Monitoramento e logging em todos os componentes

## Componentes do Sistema

### Frontend (React)

#### Estrutura de Componentes

```
src/
├── components/
│   ├── common/           # Componentes reutilizáveis
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Loading/
│   ├── layout/           # Componentes de layout
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   ├── auth/             # Componentes de autenticação
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── PasswordReset/
│   ├── opportunities/    # Componentes de oportunidades
│   │   ├── OpportunityCard/
│   │   ├── OpportunityList/
│   │   └── OpportunityDetail/
│   ├── matching/         # Componentes de matching
│   │   ├── MatchCard/
│   │   ├── MatchList/
│   │   └── RecommendationEngine/
│   ├── communication/    # Componentes de comunicação
│   │   ├── Chat/
│   │   ├── MessageList/
│   │   └── MessageInput/
│   └── evaluations/      # Componentes de avaliações
│       ├── EvaluationForm/
│       ├── EvaluationList/
│       └── RatingComponent/
├── pages/                # Páginas da aplicação
│   ├── Home/
│   ├── Opportunities/
│   ├── Profile/
│   ├── Chat/
│   └── Admin/
├── hooks/                # Custom hooks
│   ├── useAuth/
│   ├── useOpportunities/
│   ├── useMatching/
│   └── useCommunication/
├── services/             # Serviços de API
│   ├── api/
│   ├── auth/
│   ├── opportunities/
│   └── communication/
├── store/                # Redux store
│   ├── slices/
│   ├── middleware/
│   └── store.js
└── utils/                # Utilitários
    ├── constants/
    ├── helpers/
    └── validators/
```

#### Padrões de Design Frontend

1. **Component-Based Architecture**: Componentes reutilizáveis e modulares
2. **Container/Presentational Pattern**: Separação entre lógica e apresentação
3. **Custom Hooks**: Lógica reutilizável encapsulada em hooks
4. **Redux Toolkit**: Gerenciamento de estado global
5. **Styled Components**: CSS-in-JS para estilização

### Backend (Node.js + Express)

#### Estrutura de Diretórios

```
├── controllers/          # Controladores de API
│   ├── authController.js
│   ├── userController.js
│   ├── opportunityController.js
│   ├── matchingController.js
│   ├── communicationController.js
│   └── evaluationController.js
├── services/             # Lógica de negócio
│   ├── authService.js
│   ├── userService.js
│   ├── opportunityService.js
│   ├── matchingService.js
│   ├── communicationService.js
│   └── evaluationService.js
├── models/               # Modelos de dados
│   ├── User.js
│   ├── Opportunity.js
│   ├── Application.js
│   └── Evaluation.js
├── routes/               # Definição de rotas
│   ├── auth.js
│   ├── users.js
│   ├── opportunities.js
│   ├── matching.js
│   ├── communication.js
│   └── evaluations.js
├── middleware/           # Middleware personalizado
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── config/               # Configurações
│   ├── database.js
│   ├── redis.js
│   ├── email.js
│   └── aws.js
└── utils/                # Utilitários
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

#### Padrões de Design Backend

1. **MVC Pattern**: Model-View-Controller para organização
2. **Service Layer**: Lógica de negócio separada dos controladores
3. **Repository Pattern**: Abstração da camada de dados
4. **Middleware Pattern**: Funcionalidades transversais
5. **Dependency Injection**: Injeção de dependências para testabilidade

### Banco de Dados (PostgreSQL)

#### Schema Design

```sql
-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    type user_type NOT NULL,
    profile JSONB,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Oportunidades
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category opportunity_category NOT NULL,
    type opportunity_type NOT NULL,
    status opportunity_status DEFAULT 'ACTIVE',
    institution_id UUID REFERENCES users(id),
    location JSONB,
    schedule JSONB,
    requirements JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Aplicações
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id),
    volunteer_id UUID REFERENCES users(id),
    message TEXT,
    status application_status DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

-- Avaliações
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id),
    evaluator_id UUID REFERENCES users(id),
    target_user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    type evaluation_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Padrões de Design de Banco

1. **Normalização**: Dados organizados para evitar redundância
2. **Índices Estratégicos**: Índices para consultas frequentes
3. **Constraints**: Validação de dados no nível do banco
4. **JSONB**: Campos flexíveis para dados não estruturados
5. **Auditoria**: Campos de timestamp para rastreamento

## Padrões de Design

### Padrões de Arquitetura

#### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Controllers/Routes)        │
├─────────────────────────────────────┤
│            Business Layer           │
│              (Services)             │
├─────────────────────────────────────┤
│            Data Access Layer        │
│            (Models/Repositories)     │
├─────────────────────────────────────┤
│            Database Layer           │
│            (PostgreSQL)             │
└─────────────────────────────────────┘
```

#### 2. Microservices Pattern

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Matching Service│    │Communication Svc │
│                 │    │                 │    │                 │
│ - Login         │    │ - Recommendations│    │ - Chat          │
│ - Register      │    │ - Matching      │    │ - Notifications │
│ - JWT           │    │ - Scoring       │    │ - Email         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway    │
                    │                 │
                    │ - Routing        │
                    │ - Rate Limiting  │
                    │ - Authentication │
                    └─────────────────┘
```

#### 3. Event-Driven Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │    │   Event Bus      │    │   Event Handlers│
│                 │    │                 │    │                 │
│ - Apply         │───►│ - user.applied  │───►│ - Send Email    │
│ - Accept        │    │ - opp.accepted  │    │ - Update Stats  │
│ - Complete      │    │ - eval.created  │    │ - Notify Users  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Padrões de Design de Software

#### 1. Singleton Pattern

```javascript
// Database connection singleton
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.connection = new PrismaClient();
    DatabaseConnection.instance = this;
  }
  
  getConnection() {
    return this.connection;
  }
}
```

#### 2. Factory Pattern

```javascript
// Service factory
class ServiceFactory {
  static createService(type) {
    switch (type) {
      case 'email':
        return new EmailService();
      case 'sms':
        return new SMSService();
      case 'push':
        return new PushNotificationService();
      default:
        throw new Error('Unknown service type');
    }
  }
}
```

#### 3. Observer Pattern

```javascript
// Event observer
class EventObserver {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(event) {
    this.observers.forEach(observer => observer.update(event));
  }
}
```

#### 4. Strategy Pattern

```javascript
// Matching strategy
class MatchingStrategy {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  execute(volunteer, opportunities) {
    return this.strategy.match(volunteer, opportunities);
  }
}
```

## Fluxo de Dados

### Fluxo de Autenticação

```
1. User Login Request
   ↓
2. Auth Controller
   ↓
3. Auth Service
   ↓
4. Database (User Validation)
   ↓
5. JWT Token Generation
   ↓
6. Response with Token
   ↓
7. Frontend Storage
   ↓
8. Subsequent Requests with Token
```

### Fluxo de Matching

```
1. User Profile Update
   ↓
2. Matching Service Trigger
   ↓
3. Algorithm Execution
   ↓
4. Score Calculation
   ↓
5. Database Update (Matches)
   ↓
6. Notification Service
   ↓
7. User Notification
   ↓
8. Frontend Update
```

### Fluxo de Comunicação

```
1. Message Send
   ↓
2. Communication Controller
   ↓
3. Message Validation
   ↓
4. Database Storage
   ↓
5. WebSocket Broadcast
   ↓
6. Real-time Delivery
   ↓
7. Push Notification (if offline)
   ↓
8. Email Notification (if configured)
```

## Segurança

### Arquitetura de Segurança

#### 1. Autenticação e Autorização

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ - JWT Storage   │◄──►│ - JWT Validation│◄──►│ - User Roles    │
│ - Route Guards  │    │ - Role Check    │    │ - Permissions   │
│ - Token Refresh │    │ - Rate Limiting │    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 2. Camadas de Segurança

1. **Network Level**: Firewall, DDoS protection
2. **Application Level**: Input validation, SQL injection prevention
3. **Data Level**: Encryption at rest and in transit
4. **Access Level**: Role-based access control
5. **Audit Level**: Logging and monitoring

### Implementação de Segurança

#### 1. JWT Authentication

```javascript
// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

#### 2. Input Validation

```javascript
// Joi validation schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  type: Joi.string().valid('VOLUNTEER', 'INSTITUTION').required()
});
```

#### 3. Rate Limiting

```javascript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## Escalabilidade

### Estratégias de Escalabilidade

#### 1. Escalabilidade Horizontal

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   App Server 1  │    │   App Server 2  │
│                 │    │                 │    │                 │
│ - Health Check  │◄──►│ - Node.js App   │    │ - Node.js App   │
│ - SSL Termination│    │ - Express       │    │ - Express       │
│ - Session Affinity│   │ - Redis Client  │    │ - Redis Client  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │                 │
                    │ - PostgreSQL    │
                    │ - Read Replicas │
                    │ - Connection Pool│
                    └─────────────────┘
```

#### 2. Caching Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Redis Cache   │    │   Database      │
│                 │    │                 │    │                 │
│ - Session Data  │◄──►│ - User Sessions │    │ - Persistent    │
│ - API Responses │    │ - API Cache     │    │ - Data          │
│ - Static Data   │    │ - Query Results │    │ - Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 3. Database Scaling

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Master DB     │    │   Read Replica  │    │   Read Replica  │
│                 │    │                 │    │                 │
│ - Write Ops     │───►│ - Read Ops      │    │ - Read Ops      │
│ - Transactions  │    │ - Analytics     │    │ - Reporting     │
│ - Consistency   │    │ - Backup        │    │ - Backup        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Implementação de Escalabilidade

#### 1. Connection Pooling

```javascript
// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // how long to wait for a connection
});
```

#### 2. Redis Caching

```javascript
// Redis cache implementation
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    const key = `cache:${req.method}:${req.url}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        client.setex(key, ttl, JSON.stringify(data));
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

#### 3. CDN Integration

```javascript
// CDN configuration
const cdnConfig = {
  baseURL: process.env.CDN_URL,
  bucket: process.env.S3_BUCKET,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
```

## Monitoramento

### Arquitetura de Monitoramento

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Monitoring    │    │   Alerting      │
│                 │    │                 │    │                 │
│ - Logs          │───►│ - Log Aggregation│───►│ - Email Alerts  │
│ - Metrics       │    │ - Metrics Store │    │ - SMS Alerts    │
│ - Traces        │    │ - Dashboard     │    │ - Slack Alerts  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Implementação de Monitoramento

#### 1. Logging

```javascript
// Winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

#### 2. Metrics

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});
```

#### 3. Health Checks

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      email: await checkEmailService()
    }
  };
  
  res.json(health);
});
```

## Deploy e Infraestrutura

### Arquitetura de Deploy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CI/CD Pipeline│    │   Container     │    │   Production    │
│                 │    │   Registry      │    │   Environment   │
│ - GitHub Actions│───►│ - Docker Hub    │───►│ - Kubernetes    │
│ - Tests         │    │ - Image Tags    │    │ - Load Balancer │
│ - Build         │    │ - Security Scan │    │ - Auto Scaling  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Implementação de Deploy

#### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Kubernetes Configuration

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: volunteer-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: volunteer-app
  template:
    metadata:
      labels:
        app: volunteer-app
    spec:
      containers:
      - name: volunteer-app
        image: volunteer-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

#### 3. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build Docker image
      run: docker build -t volunteer-app:${{ github.sha }} .
      
    - name: Deploy to Kubernetes
      run: kubectl set image deployment/volunteer-app volunteer-app=volunteer-app:${{ github.sha }}
```

## Considerações de Performance

### Otimizações Implementadas

1. **Database Indexing**: Índices estratégicos para consultas frequentes
2. **Query Optimization**: Consultas otimizadas com Prisma
3. **Caching**: Redis para cache de sessões e dados frequentes
4. **CDN**: AWS CloudFront para assets estáticos
5. **Compression**: Gzip para respostas HTTP
6. **Connection Pooling**: Pool de conexões para o banco de dados

### Métricas de Performance

- **Response Time**: < 200ms para 95% das requisições
- **Throughput**: > 1000 requests/second
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1% error rate

## Considerações Futuras

### Melhorias Planejadas

1. **Microservices**: Migração para arquitetura de microserviços
2. **Event Sourcing**: Implementação de event sourcing para auditoria
3. **GraphQL**: Adição de API GraphQL para consultas complexas
4. **Machine Learning**: Algoritmos de ML para matching mais preciso
5. **Real-time Analytics**: Dashboard em tempo real para métricas

### Escalabilidade Futura

1. **Multi-region**: Deploy em múltiplas regiões
2. **Edge Computing**: Processamento na borda para latência reduzida
3. **Serverless**: Migração para funções serverless
4. **Blockchain**: Integração com blockchain para verificações

---

Esta documentação de arquitetura serve como guia para desenvolvedores e arquitetos que trabalham no Sistema de Voluntariado. Ela deve ser atualizada conforme o sistema evolui e novas funcionalidades são adicionadas.
