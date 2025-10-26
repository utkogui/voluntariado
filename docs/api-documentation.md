# Documentação Técnica da API - Sistema de Voluntariado

## Visão Geral

A API do Sistema de Voluntariado é uma API RESTful desenvolvida em Node.js com Express, que permite a gestão completa de oportunidades de voluntariado, usuários, instituições e sistema de matching.

**Versão da API**: v1  
**Base URL**: `https://api.voluntariado.com/v1`  
**Formato**: JSON  
**Autenticação**: JWT Bearer Token

## Índice

1. [Autenticação](#autenticação)
2. [Endpoints de Usuários](#endpoints-de-usuários)
3. [Endpoints de Instituições](#endpoints-de-instituições)
4. [Endpoints de Oportunidades](#endpoints-de-oportunidades)
5. [Endpoints de Matching](#endpoints-de-matching)
6. [Endpoints de Comunicação](#endpoints-de-comunicação)
7. [Endpoints de Avaliações](#endpoints-de-avaliações)
8. [Endpoints de Sistema](#endpoints-de-sistema)
9. [Códigos de Status](#códigos-de-status)
10. [Tratamento de Erros](#tratamento-de-erros)

## Autenticação

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "usuario@exemplo.com",
      "type": "VOLUNTEER",
      "profile": {
        "bio": "Descrição do usuário",
        "skills": ["JavaScript", "React"],
        "availability": "WEEKENDS"
      }
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": "24h"
    }
  }
}
```

### Registro
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "type": "VOLUNTEER",
  "profile": {
    "bio": "Descrição do usuário",
    "skills": ["JavaScript", "React"],
    "availability": "WEEKENDS"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer jwt_token
```

## Endpoints de Usuários

### Listar Usuários
```http
GET /users
```

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `type` (string): Tipo de usuário (VOLUNTEER, INSTITUTION)
- `search` (string): Busca por nome ou email

**Resposta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "João Silva",
        "email": "usuario@exemplo.com",
        "type": "VOLUNTEER",
        "profile": {
          "bio": "Descrição",
          "skills": ["JavaScript"],
          "availability": "WEEKENDS"
        },
        "createdAt": "2023-12-01T10:00:00Z",
        "updatedAt": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Obter Usuário por ID
```http
GET /users/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "type": "VOLUNTEER",
    "profile": {
      "bio": "Descrição completa",
      "skills": ["JavaScript", "React", "Node.js"],
      "availability": "WEEKENDS",
      "location": {
        "city": "São Paulo",
        "state": "SP",
        "coordinates": {
          "lat": -23.5505,
          "lng": -46.6333
        }
      }
    },
    "stats": {
      "opportunitiesApplied": 5,
      "opportunitiesCompleted": 3,
      "averageRating": 4.5
    },
    "createdAt": "2023-12-01T10:00:00Z",
    "updatedAt": "2023-12-01T10:00:00Z"
  }
}
```

### Atualizar Usuário
```http
PUT /users/:id
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "name": "João Silva Santos",
  "profile": {
    "bio": "Nova descrição",
    "skills": ["JavaScript", "React", "Vue.js"],
    "availability": "WEEKDAYS"
  }
}
```

### Deletar Usuário
```http
DELETE /users/:id
```

**Headers:**
```
Authorization: Bearer jwt_token
```

## Endpoints de Instituições

### Listar Instituições
```http
GET /institutions
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `category` (string): Categoria da instituição
- `city` (string): Cidade
- `verified` (boolean): Apenas instituições verificadas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "institutions": [
      {
        "id": "uuid",
        "name": "ONG Exemplo",
        "description": "Descrição da ONG",
        "category": "EDUCATION",
        "location": {
          "city": "São Paulo",
          "state": "SP",
          "address": "Rua Exemplo, 123"
        },
        "contact": {
          "email": "contato@ong.com",
          "phone": "+55 11 99999-9999",
          "website": "https://ong.com"
        },
        "verified": true,
        "stats": {
          "opportunitiesCreated": 15,
          "volunteersActive": 50,
          "averageRating": 4.8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Obter Instituição por ID
```http
GET /institutions/:id
```

### Criar Instituição
```http
POST /institutions
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "name": "Nova ONG",
  "description": "Descrição da nova ONG",
  "category": "HEALTH",
  "location": {
    "city": "Rio de Janeiro",
    "state": "RJ",
    "address": "Rua Nova, 456"
  },
  "contact": {
    "email": "contato@novaong.com",
    "phone": "+55 21 88888-8888",
    "website": "https://novaong.com"
  }
}
```

## Endpoints de Oportunidades

### Listar Oportunidades
```http
GET /opportunities
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `category` (string): Categoria
- `city` (string): Cidade
- `type` (string): Tipo (IN_PERSON, ONLINE, HYBRID)
- `status` (string): Status (ACTIVE, INACTIVE, COMPLETED)
- `date` (string): Data (YYYY-MM-DD)
- `skills` (string): Habilidades necessárias (separadas por vírgula)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "id": "uuid",
        "title": "Aulas de Programação",
        "description": "Ensinar programação para crianças",
        "category": "EDUCATION",
        "type": "IN_PERSON",
        "status": "ACTIVE",
        "institution": {
          "id": "uuid",
          "name": "ONG Exemplo"
        },
        "location": {
          "city": "São Paulo",
          "state": "SP",
          "address": "Rua Exemplo, 123"
        },
        "schedule": {
          "startDate": "2023-12-15T09:00:00Z",
          "endDate": "2023-12-15T17:00:00Z",
          "recurrence": "WEEKLY"
        },
        "requirements": {
          "skills": ["JavaScript", "Teaching"],
          "minAge": 18,
          "maxVolunteers": 5
        },
        "stats": {
          "applicationsCount": 12,
          "acceptedCount": 3,
          "completedCount": 0
        },
        "createdAt": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### Obter Oportunidade por ID
```http
GET /opportunities/:id
```

### Criar Oportunidade
```http
POST /opportunities
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "title": "Nova Oportunidade",
  "description": "Descrição da nova oportunidade",
  "category": "ENVIRONMENT",
  "type": "ONLINE",
  "institutionId": "uuid",
  "location": {
    "city": "São Paulo",
    "state": "SP",
    "address": "Rua Nova, 789"
  },
  "schedule": {
    "startDate": "2023-12-20T14:00:00Z",
    "endDate": "2023-12-20T18:00:00Z",
    "recurrence": "ONCE"
  },
  "requirements": {
    "skills": ["Communication", "Organization"],
    "minAge": 16,
    "maxVolunteers": 10
  }
}
```

### Aplicar para Oportunidade
```http
POST /opportunities/:id/apply
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "message": "Gostaria de participar desta oportunidade",
  "availability": "WEEKENDS"
}
```

### Aceitar/Rejeitar Aplicação
```http
POST /opportunities/:id/applications/:applicationId/respond
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "status": "ACCEPTED",
  "message": "Parabéns! Sua aplicação foi aceita."
}
```

## Endpoints de Matching

### Obter Matches
```http
GET /matching/matches
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `type` (string): Tipo de match (OPPORTUNITY, VOLUNTEER)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "type": "OPPORTUNITY",
        "opportunity": {
          "id": "uuid",
          "title": "Aulas de Programação",
          "institution": {
            "name": "ONG Exemplo"
          }
        },
        "score": 95,
        "reasons": [
          "Habilidades compatíveis",
          "Localização próxima",
          "Disponibilidade adequada"
        ],
        "createdAt": "2023-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Obter Recomendações
```http
GET /matching/recommendations
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `limit` (number): Número de recomendações (padrão: 10)
- `category` (string): Filtrar por categoria

## Endpoints de Comunicação

### Listar Conversas
```http
GET /communication/conversations
```

**Headers:**
```
Authorization: Bearer jwt_token
```

### Criar Conversa
```http
POST /communication/conversations
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "participants": ["uuid1", "uuid2"],
  "type": "DIRECT",
  "subject": "Assunto da conversa"
}
```

### Enviar Mensagem
```http
POST /communication/conversations/:id/messages
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "content": "Conteúdo da mensagem",
  "type": "TEXT"
}
```

### Listar Mensagens
```http
GET /communication/conversations/:id/messages
```

**Headers:**
```
Authorization: Bearer jwt_token
```

## Endpoints de Avaliações

### Criar Avaliação
```http
POST /evaluations
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "opportunityId": "uuid",
  "targetUserId": "uuid",
  "rating": 5,
  "comment": "Excelente experiência!",
  "type": "VOLUNTEER_TO_INSTITUTION"
}
```

### Listar Avaliações
```http
GET /evaluations
```

**Query Parameters:**
- `targetUserId` (string): ID do usuário avaliado
- `opportunityId` (string): ID da oportunidade
- `type` (string): Tipo de avaliação

## Endpoints de Sistema

### Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy"
  }
}
```

### Métricas
```http
GET /metrics
```

**Headers:**
```
Authorization: Bearer jwt_token
```

### Logs
```http
GET /logs
```

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `level` (string): Nível do log (ERROR, WARN, INFO, DEBUG)
- `startDate` (string): Data inicial (ISO 8601)
- `endDate` (string): Data final (ISO 8601)

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito com estado atual |
| 422 | Unprocessable Entity - Dados válidos mas não processáveis |
| 429 | Too Many Requests - Limite de taxa excedido |
| 500 | Internal Server Error - Erro interno do servidor |

## Tratamento de Erros

### Formato de Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ],
    "timestamp": "2023-12-01T10:00:00Z",
    "requestId": "req_123456"
  }
}
```

### Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| `VALIDATION_ERROR` | Erro de validação de dados |
| `AUTHENTICATION_ERROR` | Erro de autenticação |
| `AUTHORIZATION_ERROR` | Erro de autorização |
| `NOT_FOUND` | Recurso não encontrado |
| `DUPLICATE_ENTRY` | Entrada duplicada |
| `RATE_LIMIT_EXCEEDED` | Limite de taxa excedido |
| `INTERNAL_ERROR` | Erro interno do servidor |

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Endpoints públicos**: 100 requests/minuto por IP
- **Endpoints autenticados**: 1000 requests/minuto por usuário
- **Endpoints de autenticação**: 5 requests/minuto por IP

Headers de resposta incluem informações sobre limites:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Paginação

Todos os endpoints que retornam listas implementam paginação:

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

**Resposta:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtros e Busca

### Filtros Comuns
- `search`: Busca textual
- `category`: Filtro por categoria
- `city`: Filtro por cidade
- `date`: Filtro por data
- `status`: Filtro por status

### Ordenação
- `sort`: Campo para ordenação
- `order`: Direção da ordenação (asc, desc)

Exemplo:
```
GET /opportunities?search=programação&category=EDUCATION&sort=createdAt&order=desc
```

## Webhooks

A API suporta webhooks para notificações em tempo real:

### Eventos Disponíveis
- `user.created`
- `user.updated`
- `opportunity.created`
- `opportunity.updated`
- `application.created`
- `application.status_changed`
- `message.sent`

### Configuração de Webhook
```http
POST /webhooks
```

**Body:**
```json
{
  "url": "https://seu-site.com/webhook",
  "events": ["user.created", "opportunity.created"],
  "secret": "seu_secret_aqui"
}
```

## SDKs e Bibliotecas

### JavaScript/Node.js
```bash
npm install voluntariado-api-client
```

```javascript
import { VoluntariadoAPI } from 'voluntariado-api-client';

const api = new VoluntariadoAPI({
  baseURL: 'https://api.voluntariado.com/v1',
  apiKey: 'sua_api_key'
});

const opportunities = await api.opportunities.list();
```

### Python
```bash
pip install voluntariado-api
```

```python
from voluntariado_api import VoluntariadoAPI

api = VoluntariadoAPI(
    base_url='https://api.voluntariado.com/v1',
    api_key='sua_api_key'
)

opportunities = api.opportunities.list()
```

## Changelog

### v1.2.0 (2023-12-01)
- Adicionado suporte a webhooks
- Implementado sistema de notificações push
- Melhorado sistema de matching

### v1.1.0 (2023-11-15)
- Adicionado sistema de avaliações
- Implementado chat em tempo real
- Melhorado sistema de busca

### v1.0.0 (2023-11-01)
- Versão inicial da API
- Endpoints básicos de usuários, oportunidades e matching
