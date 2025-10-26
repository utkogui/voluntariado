# Guia de Contribuição para Desenvolvedores

Bem-vindo ao projeto Sistema de Voluntariado! Este guia irá ajudá-lo a contribuir de forma eficaz para o projeto.

## Índice

1. [Como Contribuir](#como-contribuir)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Padrões de Código](#padrões-de-código)
4. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
5. [Testes](#testes)
6. [Documentação](#documentação)
7. [Pull Requests](#pull-requests)
8. [Issues e Bugs](#issues-e-bugs)
9. [Comunicação](#comunicação)
10. [Recursos Adicionais](#recursos-adicionais)

## Como Contribuir

### Tipos de Contribuição

1. **Correção de Bugs**: Resolver problemas existentes
2. **Novas Funcionalidades**: Adicionar recursos solicitados
3. **Melhorias**: Otimizar código existente
4. **Documentação**: Melhorar ou adicionar documentação
5. **Testes**: Adicionar ou melhorar testes
6. **Refatoração**: Melhorar estrutura do código

### Antes de Começar

1. Verifique se já existe uma issue para o que você quer fazer
2. Se não existir, crie uma issue descrevendo sua proposta
3. Aguarde aprovação antes de começar a trabalhar
4. Faça fork do repositório
5. Crie uma branch para sua feature

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

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**:
```bash
# Instale o Prisma CLI globalmente
npm install -g prisma

# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

5. **Execute o seed do banco**:
```bash
npm run db:seed
```

6. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

### Configuração do Frontend

1. **Navegue para o diretório frontend**:
```bash
cd frontend
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**:
```bash
npm start
```

### Configuração com Docker

1. **Inicie os serviços**:
```bash
docker-compose up -d
```

2. **Execute as migrações**:
```bash
docker-compose exec app npx prisma migrate dev
```

## Padrões de Código

### JavaScript/Node.js

#### ESLint Configuration

```json
{
  "extends": ["eslint:recommended", "prettier"],
  "env": {
    "node": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Convenções de Nomenclatura

- **Variáveis e funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Arquivos**: kebab-case
- **Diretórios**: kebab-case

#### Estrutura de Arquivos

```
controllers/
├── authController.js
├── userController.js
└── opportunityController.js

services/
├── authService.js
├── userService.js
└── opportunityService.js

routes/
├── auth.js
├── users.js
└── opportunities.js
```

#### Exemplo de Controller

```javascript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
const getUsers = async (req, res, next) => {
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
};

module.exports = {
  getUsers
};
```

#### Exemplo de Service

```javascript
const userService = {
  /**
   * Busca usuários com paginação e filtros
   * @param {Object} options - Opções de busca
   * @param {number} options.page - Página atual
   * @param {number} options.limit - Itens por página
   * @param {string} options.search - Termo de busca
   * @returns {Promise<Object>} Lista paginada de usuários
   */
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
  }
};

module.exports = userService;
```

### React/Frontend

#### Estrutura de Componentes

```jsx
// components/opportunities/OpportunityCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
`;

const Description = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const OpportunityCard = ({ opportunity, onApply }) => {
  const handleApply = () => {
    onApply(opportunity.id);
  };
  
  return (
    <Card>
      <Title>{opportunity.title}</Title>
      <Description>{opportunity.description}</Description>
      <button onClick={handleApply}>
        Candidatar-se
      </button>
    </Card>
  );
};

OpportunityCard.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  onApply: PropTypes.func.isRequired
};

export default OpportunityCard;
```

#### Custom Hooks

```javascript
// hooks/useOpportunities.js
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
      // Atualizar lista de oportunidades
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

### Banco de Dados

#### Schema Prisma

```prisma
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
```

#### Migrações

```bash
# Criar nova migração
npx prisma migrate dev --name add_user_verification

# Aplicar migrações em produção
npx prisma migrate deploy

# Reset do banco (apenas desenvolvimento)
npx prisma migrate reset
```

## Fluxo de Desenvolvimento

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USUARIO/voluntariado.git
cd voluntariado

# Adicione o repositório original como upstream
git remote add upstream https://github.com/utkogui/voluntariado.git
```

### 2. Criar Branch

```bash
# Atualize sua branch main
git checkout main
git pull upstream main

# Crie uma nova branch para sua feature
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
# ou
git checkout -b docs/melhorias-documentacao
```

### 3. Desenvolvimento

```bash
# Faça suas alterações
# Teste localmente
npm test
npm run lint
npm run build

# Commit suas alterações
git add .
git commit -m "feat: adiciona nova funcionalidade de busca avançada"
```

### 4. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nova-funcionalidade

# Crie um Pull Request no GitHub
```

### Convenções de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, espaços em branco
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

#### Exemplos

```bash
git commit -m "feat(auth): adiciona autenticação com Google"
git commit -m "fix(matching): corrige algoritmo de matching"
git commit -m "docs(api): atualiza documentação da API"
git commit -m "test(users): adiciona testes para userService"
```

## Testes

### Estrutura de Testes

```
tests/
├── unit/                 # Testes unitários
│   ├── services/
│   ├── controllers/
│   └── utils/
├── integration/          # Testes de integração
│   ├── api/
│   └── database/
├── e2e/                 # Testes end-to-end
│   ├── auth/
│   ├── opportunities/
│   └── matching/
└── fixtures/            # Dados de teste
    ├── users.json
    └── opportunities.json
```

### Testes Unitários

```javascript
// tests/unit/services/userService.test.js
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const userService = require('../../services/userService');
const prisma = require('../../config/database');

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
});
```

### Testes de Integração

```javascript
// tests/integration/api/users.test.js
const request = require('supertest');
const app = require('../../server');

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
});
```

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes com cobertura
npm run test:coverage
```

## Documentação

### JSDoc

```javascript
/**
 * Busca oportunidades de voluntariado com filtros
 * @param {Object} filters - Filtros de busca
 * @param {string} [filters.category] - Categoria da oportunidade
 * @param {string} [filters.city] - Cidade
 * @param {string} [filters.type] - Tipo (IN_PERSON, ONLINE, HYBRID)
 * @param {number} [filters.page=1] - Página atual
 * @param {number} [filters.limit=10] - Itens por página
 * @returns {Promise<Object>} Lista paginada de oportunidades
 * @throws {Error} Quando há erro na busca
 * @example
 * const opportunities = await opportunityService.getOpportunities({
 *   category: 'EDUCATION',
 *   city: 'São Paulo',
 *   page: 1,
 *   limit: 20
 * });
 */
async getOpportunities(filters = {}) {
  // Implementation
}
```

### README

Cada módulo deve ter um README.md explicando:

- Propósito do módulo
- Como usar
- Exemplos de código
- Dependências
- Configuração

### Changelog

Mantenha o CHANGELOG.md atualizado com:

- Novas funcionalidades
- Correções de bugs
- Mudanças que quebram compatibilidade
- Deprecações

## Pull Requests

### Antes de Enviar

1. **Teste seu código**:
```bash
npm test
npm run lint
npm run build
```

2. **Atualize a documentação** se necessário

3. **Verifique se não há conflitos**:
```bash
git checkout main
git pull upstream main
git checkout sua-branch
git rebase main
```

### Template de Pull Request

```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei uma auto-revisão do código
- [ ] Comentei código complexo
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes que provam que minha correção é eficaz
- [ ] Testes novos e existentes passam localmente
- [ ] Atualizei a documentação

## Screenshots (se aplicável)
Adicione screenshots para ajudar a explicar sua mudança.

## Issues Relacionadas
Fixes #123
```

### Processo de Review

1. **Automated Checks**: CI/CD deve passar
2. **Code Review**: Pelo menos 1 aprovação
3. **Testing**: Testes devem passar
4. **Documentation**: Documentação atualizada
5. **Merge**: Após aprovação

## Issues e Bugs

### Reportando Bugs

Use o template de bug:

```markdown
**Descreva o bug**
Uma descrição clara e concisa do bug.

**Para Reproduzir**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

### Sugerindo Funcionalidades

Use o template de feature:

```markdown
**Sua funcionalidade está relacionada a um problema?**
Descreva o problema. Ex: Sempre fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara e concisa de soluções alternativas.

**Contexto Adicional**
Adicione qualquer outro contexto sobre a funcionalidade aqui.
```

## Comunicação

### Canais de Comunicação

- **GitHub Issues**: Para bugs e funcionalidades
- **GitHub Discussions**: Para discussões gerais
- **Slack**: Para comunicação rápida
- **Email**: Para questões sensíveis

### Código de Conduta

1. **Seja respeitoso** com outros contribuidores
2. **Seja construtivo** em feedbacks
3. **Seja paciente** com iniciantes
4. **Seja colaborativo** em discussões
5. **Seja profissional** em todas as interações

### Getting Help

Se você precisar de ajuda:

1. Verifique a documentação
2. Procure em issues existentes
3. Crie uma nova issue
4. Entre em contato via Slack
5. Envie um email para dev@voluntariado.com

## Recursos Adicionais

### Ferramentas Recomendadas

- **VS Code**: Editor recomendado
- **Postman**: Para testar APIs
- **DBeaver**: Para gerenciar banco de dados
- **GitKraken**: Para gerenciar Git
- **Docker Desktop**: Para containers

### Extensões VS Code

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Scripts Úteis

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node prisma/seed.js"
  }
}
```

### Links Úteis

- [Documentação da API](docs/api-documentation.md)
- [Guia de Arquitetura](docs/architecture-design.md)
- [Padrões de Código](docs/coding-standards.md)
- [Guia de Deploy](docs/deployment-guide.md)
- [Troubleshooting](docs/troubleshooting-guide.md)

---

Obrigado por contribuir para o Sistema de Voluntariado! Sua contribuição faz a diferença na comunidade. 🚀
