# Padrões de Qualidade

Este documento define os padrões de qualidade para o projeto de voluntariado.

## Índice

1. [Visão Geral](#visão-geral)
2. [Padrões de Código](#padrões-de-código)
3. [Padrões de Testes](#padrões-de-testes)
4. [Padrões de Segurança](#padrões-de-segurança)
5. [Padrões de Performance](#padrões-de-performance)
6. [Padrões de Acessibilidade](#padrões-de-acessibilidade)
7. [Padrões de Documentação](#padrões-de-documentação)
8. [Métricas de Qualidade](#métricas-de-qualidade)
9. [Processo de Revisão](#processo-de-revisão)
10. [Ferramentas de Qualidade](#ferramentas-de-qualidade)

## Visão Geral

### Objetivos
- **Consistência**: Manter consistência em todo o código
- **Legibilidade**: Código fácil de ler e entender
- **Manutenibilidade**: Código fácil de manter e modificar
- **Confiabilidade**: Código confiável e livre de bugs
- **Segurança**: Código seguro contra vulnerabilidades
- **Performance**: Código otimizado para performance
- **Acessibilidade**: Código acessível para todos os usuários

### Princípios
- **Clean Code**: Código limpo e bem estruturado
- **SOLID**: Princípios SOLID de design
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It

## Padrões de Código

### JavaScript/Node.js

#### Nomenclatura
```javascript
// ✅ Bom - camelCase para variáveis e funções
const userName = 'john_doe';
const isAuthenticated = true;
const getUserById = (id) => {};

// ✅ Bom - PascalCase para classes e construtores
class UserService {}
class DatabaseConnection {}

// ✅ Bom - UPPER_SNAKE_CASE para constantes
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Ruim - Inconsistente
const user_name = 'john_doe';
const IsAuthenticated = true;
const getUserByID = (id) => {};
```

#### Estrutura de Arquivos
```javascript
// ✅ Bom - Estrutura clara
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurações
const config = require('../config/database');

// Serviços
const userService = require('../services/userService');
const emailService = require('../services/emailService');

// Middleware
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Utilitários
const { validateEmail, hashPassword } = require('../utils/helpers');

// Constantes
const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials'
};

// Funções principais
const createUser = async (req, res) => {
  try {
    // Implementação
  } catch (error) {
    // Tratamento de erro
  }
};

// Exportações
module.exports = {
  createUser,
  updateUser,
  deleteUser
};
```

#### Tratamento de Erros
```javascript
// ✅ Bom - Tratamento consistente
const createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validação
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          name: !name ? 'Name is required' : null
        }
      });
    }
    
    // Lógica de negócio
    const user = await userService.createUser({ email, password, name });
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating user:', error);
    
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ❌ Ruim - Tratamento inconsistente
const createUser = async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email) {
    res.status(400).send('Email required');
    return;
  }
  
  try {
    const user = await userService.createUser({ email, password, name });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error');
  }
};
```

#### Validação de Dados
```javascript
// ✅ Bom - Validação robusta
const validateUserData = (data) => {
  const errors = {};
  
  // Email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }
  
  // Name
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ❌ Ruim - Validação básica
const validateUserData = (data) => {
  if (!data.email || !data.password || !data.name) {
    return false;
  }
  return true;
};
```

### React/Frontend

#### Componentes
```jsx
// ✅ Bom - Componente bem estruturado
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const UserCard = ({ user, onEdit, onDelete, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(user);
    }
  }, [user, onEdit]);
  
  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        await onDelete(user.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user.id, onDelete]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <Avatar src={user.avatar} alt={user.name} />
        <UserInfo>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>
      </CardHeader>
      
      <CardActions>
        <Button onClick={handleEdit} variant="primary">
          Edit
        </Button>
        <Button onClick={handleDelete} variant="danger">
          Delete
        </Button>
      </CardActions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Card>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string
};

UserCard.defaultProps = {
  onEdit: null,
  onDelete: null,
  className: ''
};

// Styled Components
const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const UserEmail = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.variant === 'primary' && `
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  `}
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
`;

export default UserCard;
```

#### Hooks
```javascript
// ✅ Bom - Hook customizado bem estruturado
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/userSlice';

export const useUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.users);
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  
  // Fetch users
  const loadUsers = useCallback(async () => {
    try {
      await dispatch(fetchUsers({ ...filters, ...pagination }));
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, [dispatch, filters, pagination]);
  
  // Create user
  const handleCreateUser = useCallback(async (userData) => {
    try {
      await dispatch(createUser(userData));
      await loadUsers(); // Reload users
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }, [dispatch, loadUsers]);
  
  // Update user
  const handleUpdateUser = useCallback(async (userId, userData) => {
    try {
      await dispatch(updateUser({ userId, userData }));
      await loadUsers(); // Reload users
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, [dispatch, loadUsers]);
  
  // Delete user
  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await dispatch(deleteUser(userId));
      await loadUsers(); // Reload users
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, [dispatch, loadUsers]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);
  
  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);
  
  // Load users when filters or pagination change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  return {
    users,
    loading,
    error,
    filters,
    pagination,
    loadUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    updateFilters,
    updatePagination
  };
};
```

### Banco de Dados

#### Schema Prisma
```prisma
// ✅ Bom - Schema bem estruturado
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      UserRole @default(VOLUNTEER)
  status    UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  profile     UserProfile?
  opportunities Opportunity[]
  evaluations  Evaluation[]
  messages     Message[]
  
  // Índices
  @@index([email])
  @@index([role])
  @@index([status])
  @@index([createdAt])
  
  // Validações
  @@map("users")
}

model UserProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bio         String?
  avatar      String?
  phone       String?
  address     String?
  city        String?
  state       String?
  country     String?
  zipCode     String?
  
  // Skills
  skills      String[]
  
  // Preferences
  interests   String[]
  availability String[]
  
  // Social
  website     String?
  linkedin    String?
  twitter     String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("user_profiles")
}

enum UserRole {
  VOLUNTEER
  INSTITUTION
  COMPANY
  UNIVERSITY
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_APPROVAL
}
```

#### Queries
```javascript
// ✅ Bom - Queries otimizadas
const userService = {
  // Buscar usuário por ID com relacionamentos
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        opportunities: {
          include: {
            institution: true,
            category: true
          }
        },
        evaluations: {
          include: {
            opportunity: true
          }
        }
      }
    });
  },
  
  // Buscar usuários com filtros e paginação
  async findMany(filters = {}, pagination = {}) {
    const {
      search,
      role,
      status,
      city,
      skills
    } = filters;
    
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;
    
    const where = {};
    
    // Filtro de busca
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtro de role
    if (role) {
      where.role = role;
    }
    
    // Filtro de status
    if (status) {
      where.status = status;
    }
    
    // Filtro de cidade
    if (city) {
      where.profile = {
        city: { contains: city, mode: 'insensitive' }
      };
    }
    
    // Filtro de skills
    if (skills && skills.length > 0) {
      where.profile = {
        ...where.profile,
        skills: {
          hasSome: skills
        }
      };
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
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
  
  // Criar usuário com validações
  async create(userData) {
    const { email, password, name, role = 'VOLUNTEER' } = userData;
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        status: 'ACTIVE'
      }
    });
    
    // Criar perfil
    await prisma.userProfile.create({
      data: {
        userId: user.id
      }
    });
    
    return user;
  }
};
```

## Padrões de Testes

### Estrutura de Testes
```javascript
// ✅ Bom - Estrutura clara e organizada
describe('UserService', () => {
  let userService;
  let mockPrisma;
  
  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      }
    };
    
    userService = new UserService(mockPrisma);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('findById', () => {
    it('should return user when valid id is provided', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User'
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.findById(userId);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          profile: true,
          opportunities: {
            include: {
              institution: true,
              category: true
            }
          }
        }
      });
    });
    
    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Act
      const result = await userService.findById(userId);
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('should throw error when database error occurs', async () => {
      // Arrange
      const userId = 'user-123';
      const error = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(error);
      
      // Act & Assert
      await expect(userService.findById(userId)).rejects.toThrow('Database connection failed');
    });
  });
  
  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      const mockUser = {
        id: 'user-123',
        ...userData,
        password: 'hashed-password'
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.userProfile.create.mockResolvedValue({});
      
      // Act
      const result = await userService.create(userData);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: userData.email,
          name: userData.name,
          password: expect.any(String)
        })
      });
    });
    
    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      const existingUser = {
        id: 'existing-user',
        email: userData.email
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('Email already exists');
    });
  });
});
```

### Testes de Integração
```javascript
// ✅ Bom - Teste de integração completo
describe('Auth API Integration', () => {
  let app;
  let server;
  
  beforeAll(async () => {
    app = require('../server');
    server = app.listen(0);
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          email: userData.email,
          name: userData.name,
          role: 'VOLUNTEER',
          status: 'ACTIVE'
        },
        message: 'User created successfully'
      });
      
      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    });
    
    it('should return error for duplicate email', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashed-password',
          name: 'Existing User'
        }
      });
      
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
      
      expect(response.body).toMatchObject({
        success: false,
        error: 'Email already exists'
      });
    });
    
    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: ''
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
        details: {
          email: 'Invalid email format',
          password: 'Password must be at least 8 characters',
          name: 'Name is required'
        }
      });
    });
  });
});
```

## Padrões de Segurança

### Autenticação
```javascript
// ✅ Bom - Autenticação robusta
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });
    
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};
```

### Autorização
```javascript
// ✅ Bom - Autorização baseada em roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Uso
app.get('/api/admin/users', 
  authMiddleware, 
  requireRole(['ADMIN']), 
  getUsers
);
```

### Validação de Entrada
```javascript
// ✅ Bom - Validação robusta
const validateUserInput = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = {};
  
  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  } else if (email.length > 255) {
    errors.email = 'Email too long';
  }
  
  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character';
  } else if (password.length > 128) {
    errors.password = 'Password too long';
  }
  
  // Name validation
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 100) {
    errors.name = 'Name too long';
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.name = 'Name can only contain letters and spaces';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};
```

### Sanitização
```javascript
// ✅ Bom - Sanitização de dados
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags
        obj[key] = obj[key].replace(/<[^>]*>/g, '');
        
        // Trim whitespace
        obj[key] = obj[key].trim();
        
        // Escape special characters
        obj[key] = obj[key]
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitize(req.body);
  }
  
  if (req.query) {
    sanitize(req.query);
  }
  
  next();
};
```

## Padrões de Performance

### Otimização de Queries
```javascript
// ✅ Bom - Query otimizada
const getOpportunitiesWithDetails = async (filters = {}) => {
  const {
    category,
    location,
    dateRange,
    page = 1,
    limit = 10
  } = filters;
  
  const where = {
    status: 'ACTIVE',
    startDate: {
      gte: new Date()
    }
  };
  
  if (category) {
    where.categoryId = category;
  }
  
  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive'
    };
  }
  
  if (dateRange) {
    where.startDate = {
      gte: dateRange.start,
      lte: dateRange.end
    };
  }
  
  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
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

### Caching
```javascript
// ✅ Bom - Cache com Redis
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cacheMiddleware = (key, ttl = 300) => {
  return async (req, res, next) => {
    const cacheKey = `${key}:${JSON.stringify(req.query)}`;
    
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        client.setex(cacheKey, ttl, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next();
    }
  };
};

// Uso
app.get('/api/opportunities', 
  cacheMiddleware('opportunities', 300),
  getOpportunities
);
```

### Rate Limiting
```javascript
// ✅ Bom - Rate limiting
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limits específicos
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts'
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests'
);

// Aplicar rate limits
app.use('/api/auth', authRateLimit);
app.use('/api', apiRateLimit);
```

## Padrões de Acessibilidade

### HTML Semântico
```jsx
// ✅ Bom - HTML semântico
const OpportunityCard = ({ opportunity }) => {
  return (
    <article className="opportunity-card" role="article">
      <header className="card-header">
        <h2 className="opportunity-title">
          <a 
            href={`/opportunities/${opportunity.id}`}
            aria-label={`View details for ${opportunity.title}`}
          >
            {opportunity.title}
          </a>
        </h2>
        <div className="opportunity-meta">
          <span className="institution" aria-label="Institution">
            {opportunity.institution.name}
          </span>
          <time 
            dateTime={opportunity.startDate}
            aria-label={`Starts on ${new Date(opportunity.startDate).toLocaleDateString()}`}
          >
            {formatDate(opportunity.startDate)}
          </time>
        </div>
      </header>
      
      <div className="card-content">
        <p className="opportunity-description">
          {opportunity.description}
        </p>
        
        <div className="opportunity-details">
          <div className="detail-item">
            <span className="detail-label" id="location-label">Location:</span>
            <span 
              className="detail-value" 
              aria-labelledby="location-label"
            >
              {opportunity.location}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label" id="duration-label">Duration:</span>
            <span 
              className="detail-value" 
              aria-labelledby="duration-label"
            >
              {opportunity.duration} hours
            </span>
          </div>
        </div>
      </div>
      
      <footer className="card-footer">
        <button 
          className="btn btn-primary"
          aria-label={`Apply for ${opportunity.title}`}
        >
          Apply Now
        </button>
        
        <button 
          className="btn btn-secondary"
          aria-label={`Save ${opportunity.title} to favorites`}
        >
          <span className="sr-only">Save to favorites</span>
          <HeartIcon aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
};
```

### Navegação por Teclado
```jsx
// ✅ Bom - Navegação por teclado
const Navigation = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuItems = [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Opportunities', href: '/opportunities', icon: SearchIcon },
    { label: 'Profile', href: '/profile', icon: UserIcon },
    { label: 'Messages', href: '/messages', icon: MessageIcon }
  ];
  
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        setActiveIndex(prev => 
          prev < menuItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : menuItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const activeItem = menuItems[activeIndex];
        window.location.href = activeItem.href;
        break;
    }
  };
  
  return (
    <nav 
      className="navigation"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul 
        className="nav-list"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {menuItems.map((item, index) => (
          <li key={item.href} className="nav-item">
            <a
              href={item.href}
              className={`nav-link ${index === activeIndex ? 'active' : ''}`}
              aria-current={index === activeIndex ? 'page' : undefined}
              tabIndex={index === activeIndex ? 0 : -1}
            >
              <item.icon aria-hidden="true" />
              <span className="nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Contraste e Cores
```css
/* ✅ Bom - Contraste adequado */
.opportunity-card {
  /* Contraste 4.5:1 ou superior */
  color: #333333; /* #333 on white = 12.63:1 */
  background-color: #ffffff;
  border: 1px solid #cccccc; /* #ccc on white = 2.14:1 */
}

.btn-primary {
  /* Contraste 4.5:1 ou superior */
  background-color: #007bff; /* #007bff on white = 4.5:1 */
  color: #ffffff;
  border: 2px solid #007bff;
}

.btn-primary:hover {
  background-color: #0056b3; /* #0056b3 on white = 7.0:1 */
  border-color: #0056b3;
}

.btn-primary:focus {
  /* Indicador de foco visível */
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
}

/* Estados de erro com contraste adequado */
.error-message {
  color: #721c24; /* #721c24 on #f8d7da = 4.5:1 */
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

/* Estados de sucesso com contraste adequado */
.success-message {
  color: #155724; /* #155724 on #d4edda = 4.5:1 */
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}
```

## Padrões de Documentação

### README
```markdown
# Volunteer App

## Descrição
Sistema de voluntariado que conecta voluntários com oportunidades de voluntariado.

## Tecnologias
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Redux Toolkit, Styled Components
- **Testes**: Jest, Playwright, Artillery
- **CI/CD**: GitHub Actions

## Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
npm run db:migrate

# Executar seeds
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## Scripts
- `npm start` - Iniciar produção
- `npm run dev` - Iniciar desenvolvimento
- `npm test` - Executar testes
- `npm run test:coverage` - Executar testes com cobertura
- `npm run lint` - Executar linting
- `npm run format` - Formatar código

## Estrutura
```
src/
├── controllers/     # Controladores da API
├── services/        # Lógica de negócio
├── middleware/      # Middleware personalizado
├── routes/          # Definição de rotas
├── models/          # Modelos de dados
├── utils/           # Utilitários
└── tests/           # Testes
```

## Contribuição
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença
MIT
```

### Comentários de Código
```javascript
/**
 * Serviço para gerenciar usuários
 * 
 * @class UserService
 * @description Fornece operações CRUD para usuários
 * @author Volunteer App Team
 * @version 1.0.0
 */
class UserService {
  /**
   * Busca usuário por ID
   * 
   * @param {string} id - ID do usuário
   * @param {Object} options - Opções de busca
   * @param {boolean} options.includeProfile - Incluir perfil do usuário
   * @param {boolean} options.includeOpportunities - Incluir oportunidades
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   * @throws {Error} Quando ocorre erro na busca
   * 
   * @example
   * const user = await userService.findById('user-123', {
   *   includeProfile: true,
   *   includeOpportunities: true
   * });
   */
  async findById(id, options = {}) {
    // Implementação
  }
  
  /**
   * Cria novo usuário
   * 
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.email - Email do usuário
   * @param {string} userData.password - Senha do usuário
   * @param {string} userData.name - Nome do usuário
   * @param {string} [userData.role='VOLUNTEER'] - Role do usuário
   * @returns {Promise<Object>} Usuário criado
   * @throws {Error} Quando email já existe
   * @throws {Error} Quando dados são inválidos
   * 
   * @example
   * const user = await userService.create({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   name: 'John Doe',
   *   role: 'VOLUNTEER'
   * });
   */
  async create(userData) {
    // Implementação
  }
}
```

## Métricas de Qualidade

### Cobertura de Código
- **Mínimo**: 80% de cobertura
- **Ideal**: 90%+ de cobertura
- **Crítico**: 95%+ para código crítico

### Complexidade Ciclomática
- **Máximo**: 10 por função
- **Ideal**: 5 ou menos
- **Crítico**: 15+ requer refatoração

### Duplicação
- **Máximo**: 3% de código duplicado
- **Ideal**: 1% ou menos
- **Crítico**: 5%+ requer refatoração

### Manutenibilidade
- **Índice**: A (90-100)
- **Aceitável**: B (80-89)
- **Crítico**: C ou inferior

## Processo de Revisão

### Checklist de Revisão
- [ ] Código segue padrões estabelecidos
- [ ] Testes cobrem funcionalidade
- [ ] Documentação está atualizada
- [ ] Performance está otimizada
- [ ] Segurança está implementada
- [ ] Acessibilidade está garantida
- [ ] Linting passa sem erros
- [ ] Testes passam 100%

### Critérios de Aprovação
- **Aprovação**: 2+ revisores
- **Crítico**: 3+ revisores
- **Segurança**: Aprovação de especialista
- **Performance**: Aprovação de especialista

## Ferramentas de Qualidade

### Linting
- **ESLint**: Linting JavaScript
- **Prettier**: Formatação de código
- **Stylelint**: Linting CSS

### Testes
- **Jest**: Testes unitários
- **Playwright**: Testes E2E
- **Artillery**: Testes de carga

### Análise
- **SonarQube**: Análise de qualidade
- **CodeClimate**: Análise de qualidade
- **Snyk**: Análise de segurança

### Monitoramento
- **New Relic**: APM
- **Sentry**: Error tracking
- **LogRocket**: Session replay
