# Sistema de Matching Híbrido (Presencial + Online)

## Visão Geral

O sistema de matching híbrido permite encontrar oportunidades de voluntariado que combinam atividades presenciais e online, oferecendo maior flexibilidade para voluntários e instituições.

## Funcionalidades

### Tipos de Voluntariado Suportados

1. **PRESENCIAL** - Atividades presenciais
2. **ONLINE** - Atividades online/remotas
3. **HYBRID** - Combinação de atividades presenciais e online

### Algoritmo de Matching Híbrido

O sistema considera múltiplos fatores para calcular a compatibilidade:

- **Habilidades** (25%) - Compatibilidade de habilidades
- **Localização** (15%) - Proximidade geográfica
- **Disponibilidade** (15%) - Compatibilidade de horários
- **Interesses** (10%) - Alinhamento de interesses
- **Tipo de Voluntariado** (15%) - Compatibilidade de modalidade
- **Requisitos** (20%) - Atendimento aos requisitos específicos

## API Endpoints

### Encontrar Matches Híbridos

```http
GET /api/hybrid-matching/volunteer/:volunteerId
```

**Query Parameters:**
- `volunteerTypes` - Tipos de voluntariado preferidos
- `maxDistance` - Distância máxima em km
- `minScore` - Pontuação mínima (0-100)
- `categories` - Categorias de interesse
- `skills` - Habilidades específicas
- `city` - Cidade
- `state` - Estado
- `isRemote` - Permitir trabalho remoto

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "opportunity": {
        "id": "opp-123",
        "title": "Aulas de reforço híbridas",
        "volunteerType": "HYBRID",
        "description": "Aulas presenciais e online"
      },
      "scores": {
        "total": 85.5,
        "skills": 90.0,
        "location": 75.0,
        "availability": 80.0,
        "interests": 85.0,
        "volunteerType": 95.0,
        "requirements": 85.0
      },
      "matchType": "HYBRID",
      "reasons": [
        "Perfeita compatibilidade de tipo de voluntariado",
        "Excelente compatibilidade de habilidades",
        "Boa compatibilidade de horários"
      ]
    }
  ],
  "summary": {
    "presential": 5,
    "online": 8,
    "hybrid": 3,
    "total": 16
  }
}
```

### Encontrar Voluntários Híbridos para Oportunidade

```http
GET /api/hybrid-matching/opportunity/:opportunityId
```

**Query Parameters:**
- `minScore` - Pontuação mínima
- `maxDistance` - Distância máxima
- `skills` - Habilidades necessárias
- `categories` - Categorias de interesse
- `volunteerTypes` - Tipos de voluntariado

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "volunteer": {
        "id": "vol-123",
        "firstName": "Ana",
        "lastName": "Silva",
        "skills": ["Ensino", "Matemática"]
      },
      "scores": {
        "total": 88.0,
        "skills": 95.0,
        "location": 80.0,
        "availability": 85.0,
        "interests": 90.0,
        "volunteerType": 100.0,
        "requirements": 85.0
      }
    }
  ],
  "hybridAnalysis": {
    "presentialCompatible": 5,
    "onlineCompatible": 8,
    "hybridCompatible": 3,
    "total": 16
  }
}
```

### Estatísticas de Matching por Tipo

```http
GET /api/hybrid-matching/stats
```

**Query Parameters:**
- `startDate` - Data de início
- `endDate` - Data de fim
- `volunteerType` - Tipo de voluntariado
- `category` - Categoria
- `city` - Cidade
- `state` - Estado

**Response:**
```json
{
  "success": true,
  "data": {
    "presential": {
      "type": "PRESENTIAL",
      "totalMatches": 150,
      "averageScore": 78.5,
      "topSkills": ["Ensino", "Comunicação"],
      "topCategories": ["Educação", "Saúde"],
      "geographicDistribution": {
        "São Paulo": 45,
        "Rio de Janeiro": 30,
        "Belo Horizonte": 25
      }
    },
    "online": {
      "type": "ONLINE",
      "totalMatches": 200,
      "averageScore": 82.0,
      "topSkills": ["Tecnologia", "Design"],
      "topCategories": ["Tecnologia", "Educação"],
      "geographicDistribution": {
        "Nacional": 200
      }
    },
    "hybrid": {
      "type": "HYBRID",
      "totalMatches": 75,
      "averageScore": 85.0,
      "topSkills": ["Ensino", "Tecnologia"],
      "topCategories": ["Educação", "Tecnologia"],
      "geographicDistribution": {
        "São Paulo": 30,
        "Rio de Janeiro": 20,
        "Nacional": 25
      }
    }
  }
}
```

### Buscar por Preferência de Localização

```http
POST /api/hybrid-matching/location-preference/:volunteerId
```

**Body:**
```json
{
  "maxDistance": 50,
  "preferredCities": ["São Paulo", "Rio de Janeiro"],
  "preferredStates": ["SP", "RJ"],
  "allowRemote": true,
  "minScore": 70
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "opportunity": {
        "id": "opp-123",
        "title": "Aulas de reforço híbridas",
        "volunteerType": "HYBRID",
        "city": "São Paulo",
        "state": "SP"
      },
      "scores": {
        "total": 85.5,
        "location": 90.0
      }
    }
  ],
  "locationAnalysis": {
    "nearby": 5,
    "remote": 3,
    "preferred": 8,
    "total": 16
  }
}
```

### Relatório de Matching Híbrido

```http
GET /api/hybrid-matching/report
```

**Query Parameters:**
- `startDate` - Data de início
- `endDate` - Data de fim
- `volunteerType` - Tipo de voluntariado
- `category` - Categoria
- `city` - Cidade
- `state` - Estado
- `format` - Formato (json, csv, pdf)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "totalMatches": 500,
      "presentialMatches": 200,
      "onlineMatches": 250,
      "hybridMatches": 50
    },
    "trends": {
      "presentialGrowth": 15.5,
      "onlineGrowth": 25.0,
      "hybridGrowth": 40.0
    },
    "insights": [
      "Aumento significativo em oportunidades híbridas",
      "Maior demanda por voluntários com habilidades tecnológicas",
      "Crescimento em oportunidades de educação online"
    ]
  }
}
```

### Otimizar Matching Híbrido

```http
POST /api/hybrid-matching/optimize/:volunteerId
```

**Body:**
```json
{
  "preferredTypes": ["PRESENTIAL", "ONLINE", "HYBRID"],
  "maxDistance": 50,
  "minScore": 70,
  "categories": ["Educação", "Tecnologia"],
  "skills": ["Ensino", "JavaScript"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "opportunity": {
        "id": "opp-123",
        "title": "Aulas de programação híbridas",
        "volunteerType": "HYBRID"
      },
      "scores": {
        "total": 92.0
      }
    }
  ],
  "optimizations": {
    "applied": 8,
    "original": 15
  }
}
```

### Insights de Matching

```http
GET /api/hybrid-matching/insights
```

**Query Parameters:**
- `volunteerId` - ID do voluntário
- `opportunityId` - ID da oportunidade
- `timeRange` - Período (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": {
    "volunteerId": "vol-123",
    "opportunityId": "opp-456",
    "timeRange": "30d",
    "insights": [
      {
        "type": "PERFORMANCE",
        "title": "Performance de Matching",
        "description": "Análise de performance do matching híbrido",
        "data": {
          "totalMatches": 25,
          "successRate": 85.0,
          "averageScore": 78.5
        }
      },
      {
        "type": "TRENDS",
        "title": "Tendências",
        "description": "Tendências de matching por tipo",
        "data": {
          "presentialTrend": 15.0,
          "onlineTrend": 25.0,
          "hybridTrend": 40.0
        }
      },
      {
        "type": "RECOMMENDATIONS",
        "title": "Recomendações",
        "description": "Recomendações para melhorar o matching",
        "data": {
          "suggestions": [
            "Considere adicionar mais habilidades tecnológicas",
            "Explore oportunidades híbridas",
            "Ajuste preferências de localização"
          ]
        }
      }
    ]
  }
}
```

## Algoritmo de Matching Híbrido

### Cálculo de Pontuação

```javascript
const totalScore = 
  (skillScore * 0.25) +
  (locationScore * 0.15) +
  (availabilityScore * 0.15) +
  (interestScore * 0.10) +
  (volunteerTypeScore * 0.15) +
  (requirementsScore * 0.20);
```

### Compatibilidade de Tipo de Voluntariado

- **100 pontos** - Perfeita compatibilidade
- **75 pontos** - Boa compatibilidade híbrida
- **50 pontos** - Compatibilidade moderada
- **0 pontos** - Incompatível

### Filtros Disponíveis

- **Tipo de Voluntariado** - PRESENTIAL, ONLINE, HYBRID
- **Distância** - Raio em km
- **Pontuação Mínima** - 0-100
- **Categorias** - Lista de categorias
- **Habilidades** - Lista de habilidades
- **Localização** - Cidade, estado
- **Remoto** - Permitir trabalho remoto

## Casos de Uso

### 1. Voluntário Buscando Oportunidades Híbridas

```javascript
// Buscar oportunidades híbridas para um voluntário
const matches = await HybridMatchingService.findHybridMatches(volunteerId, {
  volunteerTypes: ['HYBRID'],
  maxDistance: 50,
  minScore: 70
});
```

### 2. Instituição Buscando Voluntários Híbridos

```javascript
// Buscar voluntários para oportunidade híbrida
const volunteers = await HybridMatchingService.findHybridVolunteersForOpportunity(opportunityId, {
  minScore: 80,
  skills: ['Ensino', 'Tecnologia']
});
```

### 3. Análise de Preferências de Localização

```javascript
// Buscar matches por preferência de localização
const matches = await HybridMatchingService.findMatchesByLocationPreference(volunteerId, {
  maxDistance: 30,
  preferredCities: ['São Paulo', 'Rio de Janeiro'],
  allowRemote: true
});
```

### 4. Otimização de Matching

```javascript
// Otimizar matching para um voluntário
const optimized = await HybridMatchingService.optimizeHybridMatching(volunteerId, {
  preferredTypes: ['PRESENTIAL', 'ONLINE', 'HYBRID'],
  maxDistance: 50,
  minScore: 75
});
```

## Relatórios e Analytics

### Métricas Disponíveis

- **Total de Matches** - Por tipo de voluntariado
- **Pontuação Média** - Por tipo e categoria
- **Habilidades Mais Procuradas** - Por tipo
- **Categorias Mais Populares** - Por tipo
- **Distribuição Geográfica** - Por tipo
- **Tendências** - Crescimento por tipo
- **Taxa de Sucesso** - Por tipo

### Insights Automáticos

- **Recomendações de Habilidades** - Para melhorar matching
- **Sugestões de Categorias** - Baseadas em histórico
- **Otimizações de Localização** - Para aumentar matches
- **Alertas de Tendências** - Mudanças no mercado

## Considerações de Performance

- **Cache de Resultados** - Para consultas frequentes
- **Índices Otimizados** - Para busca por localização
- **Paginação** - Para grandes volumes de dados
- **Agregações Eficientes** - Para relatórios
- **Processamento Assíncrono** - Para otimizações

## Segurança

- **Validação de Permissões** - Acesso aos dados
- **Sanitização de Entrada** - Prevenção de ataques
- **Rate Limiting** - Proteção contra abuso
- **Logs de Auditoria** - Rastreamento de ações
- **Criptografia** - Dados sensíveis

## Monitoramento

- **Métricas de Performance** - Tempo de resposta
- **Taxa de Erro** - Por endpoint
- **Uso de Recursos** - CPU, memória
- **Alertas** - Para problemas críticos
- **Dashboard** - Visão geral do sistema
