# Guia de Desenvolvimento

Este guia fornece informações detalhadas sobre como desenvolver no Sistema de Voluntariado.

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
6. [APIs e Endpoints](#apis-e-endpoints)
7. [Banco de Dados](#banco-de-dados)
8. [Autenticação e Autorização](#autenticação-e-autorização)
9. [Testes](#testes)
10. [Deploy](#deploy)

## Visão Geral

O Sistema de Voluntariado é uma aplicação web full-stack que conecta voluntários com instituições que precisam de ajuda. A aplicação é construída com:

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React + Redux Toolkit + Styled Components
- **Infraestrutura**: Docker + Kubernetes + AWS

## Arquitetura do Sistema

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│           Frontend (React)          │
├─────────────────────────────────────┤
│           API Gateway               │
├─────────────────────────────────────┤
│         Controllers Layer           │
├─────────────────────────────────────┤
│          Services Layer             │
├─────────────────────────────────────┤
│         Data Access Layer           │
├─────────────────────────────────────┤
│         Database Layer              │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Frontend** faz requisição para API
2. **API Gateway** roteia requisição para controller
3. **Controller** valida dados e chama service
4. **Service** implementa lógica de negócio
5. **Data Access** interage com banco de dados
6. **Response** retorna para frontend

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Git
- Docker (opcional)

### Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/utkogui/voluntariado.git
cd voluntariado
```

2. **Instale dependências**:
```bash
npm install
```

3. **Configure variáveis de ambiente**:
```bash
cp env.example .env
# Edite .env com suas configurações
```

4. **Configure banco de dados**:
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

5. **Inicie servidor de desenvolvimento**:
```bash
npm run dev
```

### Configuração do Frontend

```bash
cd frontend
npm install
npm start
```

## Estrutura do Projeto

### Backend

```
├── controllers/          # Controladores de API
│   ├── authController.js
│   ├── userController.js
│   └── opportunityController.js
├── services/             # Lógica de negócio
│   ├── authService.js
│   ├── userService.js
│   └── opportunityService.js
├── routes/               # Definição de rotas
│   ├── auth.js
│   ├── users.js
│   └── opportunities.js
├── middleware/           # Middleware personalizado
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── models/               # Modelos de dados
│   ├── User.js
│   └── Opportunity.js
├── config/               # Configurações
│   ├── database.js
│   ├── redis.js
│   └── email.js
├── utils/                # Utilitários
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── tests/                # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                 # Documentação
    ├── api/
    ├── architecture/
    └── guides/
```

### Frontend

```
├── src/
│   ├── components/       # Componentes React
│   │   ├── common/
│   │   ├── auth/
│   │   └── opportunities/
│   ├── pages/            # Páginas da aplicação
│   │   ├── Home/
│   │   ├── Login/
│   │   └── Opportunities/
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.js
│   │   └── useOpportunities.js
│   ├── services/         # Serviços de API
│   │   ├── api.js
│   │   └── auth.js
│   ├── store/            # Redux store
│   │   ├── slices/
│   │   └── store.js
│   ├── utils/            # Utilitários
│   │   ├── constants.js
│   │   └── helpers.js
│   └── styles/           # Estilos globais
│       ├── globals.css
│       └── theme.js
├── public/                # Arquivos estáticos
└── tests/                # Testes
    ├── components/
    └── pages/
```

## Padrões de Desenvolvimento

### Backend

#### Estrutura de Controller

```javascript
const controller = {
  // GET /api/v1/users
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      const users = await userService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },
  
  // POST /api/v1/users
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = controller;
```

#### Estrutura de Service

```javascript
const userService = {
  async getUsers({ page, limit, search }) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
  
  async createUser(userData) {
    const { name, email, password, type } = userData;
    
    // Validações
    if (!name || !email || !password || !type) {
      throw new Error('Dados obrigatórios não fornecidos');
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true
      }
    });
    
    return user;
  }
};

module.exports = userService;
```

### Frontend

#### Estrutura de Componente

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useOpportunities } from '../hooks/useOpportunities';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #333;
`;

const OpportunityCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const OpportunityList = ({ filters }) => {
  const { opportunities, loading, error, applyToOpportunity } = useOpportunities(filters);
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <Container>
      <Title>Oportunidades de Voluntariado</Title>
      
      {opportunities.map(opportunity => (
        <OpportunityCard key={opportunity.id}>
          <h3>{opportunity.title}</h3>
          <p>{opportunity.description}</p>
          <button onClick={() => applyToOpportunity(opportunity.id)}>
            Candidatar-se
          </button>
        </OpportunityCard>
      ))}
    </Container>
  );
};

OpportunityList.propTypes = {
  filters: PropTypes.object
};

export default OpportunityList;
```

#### Custom Hook

```javascript
import { useState, useEffect } from 'react';
import { opportunityService } from '../services/opportunityService';

export const useOpportunities = (filters = {}) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await opportunityService.getOpportunities(filters);
        
        setOpportunities(response.data.opportunities);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, [filters]);
  
  const applyToOpportunity = async (opportunityId) => {
    try {
      await opportunityService.applyToOpportunity(opportunityId);
      
      // Atualizar estado local
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId 
            ? { ...opp, applied: true }
            : opp
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };
  
  return {
    opportunities,
    loading,
    error,
    pagination,
    applyToOpportunity
  };
};
```

## APIs e Endpoints

### Estrutura de Endpoint

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// GET /api/v1/users
router.get('/', authMiddleware, userController.getUsers);

// GET /api/v1/users/:id
router.get('/:id', authMiddleware, userController.getUserById);

// POST /api/v1/users
router.post('/', validateUser, userController.createUser);

// PUT /api/v1/users/:id
router.put('/:id', authMiddleware, validateUser, userController.updateUser);

// DELETE /api/v1/users/:id
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
```

### Middleware de Validação

```javascript
const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    type: Joi.string().valid('VOLUNTEER', 'INSTITUTION').required()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

module.exports = { validateUser };
```

### Middleware de Autenticação

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
```

## Banco de Dados

### Schema Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  type      UserType
  profile   Json?
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  opportunitiesCreated Opportunity[]
  applications         Application[]
  evaluationsGiven     Evaluation[]
  evaluationsReceived  Evaluation[]
  
  @@map("users")
}

model Opportunity {
  id           String            @id @default(uuid())
  title        String
  description  String
  category     OpportunityCategory
  type         OpportunityType
  status       OpportunityStatus @default(ACTIVE)
  institutionId String
  location     Json?
  schedule     Json?
  requirements Json?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  
  // Relacionamentos
  institution  User          @relation(fields: [institutionId], references: [id])
  applications Application[]
  evaluations  Evaluation[]
  
  @@map("opportunities")
}

model Application {
  id           String            @id @default(uuid())
  opportunityId String
  volunteerId  String
  message      String?
  status       ApplicationStatus @default(PENDING)
  appliedAt    DateTime          @default(now())
  respondedAt  DateTime?
  
  // Relacionamentos
  opportunity  Opportunity @relation(fields: [opportunityId], references: [id])
  volunteer    User        @relation(fields: [volunteerId], references: [id])
  
  @@map("applications")
}

enum UserType {
  VOLUNTEER
  INSTITUTION
}

enum OpportunityCategory {
  EDUCATION
  HEALTH
  ENVIRONMENT
  SOCIAL
  TECHNOLOGY
}

enum OpportunityType {
  IN_PERSON
  ONLINE
  HYBRID
}

enum OpportunityStatus {
  ACTIVE
  INACTIVE
  COMPLETED
  CANCELLED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}
```

### Queries Prisma

```javascript
// Exemplos de queries
const prisma = require('../config/database');

// Buscar usuários com paginação
const getUsers = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;
  
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  } : {};
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true
      }
    }),
    prisma.user.count({ where })
  ]);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Buscar oportunidades com relacionamentos
const getOpportunities = async ({ page, limit, category, city }) => {
  const skip = (page - 1) * limit;
  
  const where = {};
  if (category) where.category = category;
  if (city) where.location = { path: ['city'], equals: city };
  
  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      skip,
      take: limit,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            verified: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true
          }
        }
      }
    }),
    prisma.opportunity.count({ where })
  ]);
  
  return {
    opportunities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
```

## Autenticação e Autorização

### JWT Authentication

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authService = {
  // Gerar token JWT
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  },
  
  // Verificar token JWT
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
  
  // Hash de senha
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
  
  // Verificar senha
  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  },
  
  // Login
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    const isValidPassword = await this.verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }
    
    const token = this.generateToken(user.id);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      },
      token
    };
  }
};

module.exports = authService;
```

### Role-based Authorization

```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Uso nos routes
router.get('/admin/users', authMiddleware, requireRole(['ADMIN']), userController.getUsers);
router.post('/opportunities', authMiddleware, requireRole(['INSTITUTION']), opportunityController.createOpportunity);
```

## Testes

### Testes Unitários

```javascript
// tests/unit/services/userService.test.js
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const userService = require('../../../services/userService');
const prisma = require('../../../config/database');

describe('UserService', () => {
  beforeEach(async () => {
    // Setup antes de cada teste
  });
  
  afterEach(async () => {
    // Cleanup após cada teste
    await prisma.user.deleteMany();
  });
  
  describe('getUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com' }
      ];
      
      // Act
      const result = await userService.getUsers({ page: 1, limit: 10 });
      
      // Assert
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('pagination');
      expect(result.users).toHaveLength(2);
    });
    
    it('should filter users by search term', async () => {
      // Test implementation
    });
  });
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      // Test implementation
    });
    
    it('should throw error for duplicate email', async () => {
      // Test implementation
    });
  });
});
```

### Testes de Integração

```javascript
// tests/integration/api/users.test.js
const request = require('supertest');
const app = require('../../../server');

describe('Users API', () => {
  describe('GET /api/v1/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
    
    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/users')
        .expect(401);
    });
  });
  
  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        type: 'VOLUNTEER'
      };
      
      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### Testes E2E

```javascript
// tests/e2e/auth.test.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

## Deploy

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/voluntariado
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=voluntariado
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes

```yaml
# k8s/deployment.yaml
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
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

Este guia fornece uma base sólida para desenvolvimento no Sistema de Voluntariado. Para mais informações específicas, consulte a documentação de cada módulo.
