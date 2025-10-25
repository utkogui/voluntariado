# Sistema de Requisitos Específicos para Oportunidades

## Visão Geral

O sistema de requisitos específicos permite que instituições definam critérios detalhados para suas oportunidades de voluntariado, garantindo que apenas voluntários qualificados sejam selecionados.

## Funcionalidades

### Tipos de Requisitos Suportados

1. **IDADE** - Validação de faixa etária
2. **EXPERIÊNCIA** - Histórico de voluntariado
3. **EDUCAÇÃO** - Nível educacional
4. **SKILL** - Habilidades específicas
5. **LANGUAGE** - Conhecimento de idiomas
6. **AVAILABILITY** - Disponibilidade de horários
7. **LOCATION** - Proximidade geográfica
8. **DOCUMENT** - Documentos obrigatórios
9. **BACKGROUND_CHECK** - Verificação de antecedentes
10. **CUSTOM** - Requisitos personalizados

### Níveis de Prioridade

- **LOW** - Baixa prioridade
- **MEDIUM** - Prioridade média (padrão)
- **HIGH** - Alta prioridade
- **CRITICAL** - Crítica (bloqueia candidatura se não atendido)

## API Endpoints

### Criar Requisito

```http
POST /api/opportunity-requirements/:opportunityId
```

**Body:**
```json
{
  "title": "Idade mínima",
  "description": "Voluntário deve ter pelo menos 18 anos",
  "requirementType": "AGE",
  "isRequired": true,
  "priority": "HIGH",
  "minValue": 18,
  "maxValue": 65
}
```

### Listar Requisitos

```http
GET /api/opportunity-requirements/opportunity/:opportunityId
```

**Query Parameters:**
- `page` - Página (padrão: 1)
- `limit` - Limite por página (padrão: 10)
- `priority` - Filtrar por prioridade
- `requirementType` - Filtrar por tipo

### Obter Requisito Específico

```http
GET /api/opportunity-requirements/:requirementId
```

### Atualizar Requisito

```http
PUT /api/opportunity-requirements/:requirementId
```

### Deletar Requisito

```http
DELETE /api/opportunity-requirements/:requirementId
```

### Validar Voluntário

```http
POST /api/opportunity-requirements/validate/:opportunityId/:volunteerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunityId": "opp-123",
    "volunteerId": "vol-456",
    "meetsAllRequirements": true,
    "validationResults": [
      {
        "requirementId": "req-789",
        "title": "Idade mínima",
        "type": "AGE",
        "priority": "HIGH",
        "isValid": true,
        "message": "Idade 25 anos atende aos requisitos (18-65 anos)",
        "details": {
          "age": 25,
          "minAge": 18,
          "maxAge": 65
        }
      }
    ],
    "summary": {
      "total": 3,
      "valid": 3,
      "invalid": 0,
      "critical": 0,
      "required": 2,
      "requiredValid": 2
    }
  }
}
```

## Integração com Sistema de Matching

O sistema de matching foi atualizado para considerar os requisitos específicos:

### Pontuação de Requisitos

- **100 pontos** - Atende a todos os requisitos
- **0 pontos** - Não atende aos requisitos obrigatórios
- **Pontuação proporcional** - Baseada na porcentagem de requisitos atendidos

### Pesos no Matching

- Habilidades: 30%
- Localização: 20%
- Disponibilidade: 15%
- Interesses: 10%
- **Requisitos: 25%** (novo)

## Exemplos de Uso

### Requisito de Idade

```json
{
  "title": "Idade para trabalho com crianças",
  "description": "Voluntário deve ter entre 21 e 65 anos",
  "requirementType": "AGE",
  "isRequired": true,
  "priority": "CRITICAL",
  "minValue": 21,
  "maxValue": 65
}
```

### Requisito de Habilidades

```json
{
  "title": "Conhecimento em JavaScript",
  "description": "Voluntário deve ter experiência em JavaScript",
  "requirementType": "SKILL",
  "isRequired": true,
  "priority": "HIGH",
  "allowedValues": ["JavaScript", "React", "Node.js"]
}
```

### Requisito de Verificação de Antecedentes

```json
{
  "title": "Verificação de antecedentes",
  "description": "Voluntário deve ter verificação de antecedentes aprovada",
  "requirementType": "BACKGROUND_CHECK",
  "isRequired": true,
  "priority": "CRITICAL"
}
```

### Requisito de Documentos

```json
{
  "title": "Documentos obrigatórios",
  "description": "Voluntário deve ter RG e CPF validados",
  "requirementType": "DOCUMENT",
  "isRequired": true,
  "priority": "HIGH",
  "allowedValues": ["RG", "CPF", "Comprovante de Residência"]
}
```

## Validação Automática

O sistema valida automaticamente:

1. **Idade** - Calculada a partir da data de nascimento
2. **Experiência** - Baseada no histórico de aplicações aprovadas
3. **Habilidades** - Comparação com skills do voluntário
4. **Documentos** - Status de aprovação dos documentos
5. **Verificação de antecedentes** - Status e validade

## Estatísticas e Relatórios

### Estatísticas de Requisitos

```http
GET /api/opportunity-requirements/stats/:opportunityId
```

### Requisitos Mais Comuns por Categoria

```http
GET /api/opportunity-requirements/common/:categoryId
```

## Considerações de Performance

- Validação de requisitos é executada de forma assíncrona
- Cache de resultados de validação para melhor performance
- Índices de banco otimizados para consultas frequentes

## Segurança

- Apenas criadores da oportunidade podem gerenciar requisitos
- Validação de permissões em todas as operações
- Sanitização de dados de entrada
- Rate limiting nas APIs

## Monitoramento

- Logs detalhados de validações
- Métricas de performance
- Alertas para falhas de validação
- Dashboard de estatísticas
