# Sistema de Doações de Materiais/Recursos

## Visão Geral

O sistema de doações permite que usuários doem materiais e recursos para oportunidades de voluntariado, facilitando a arrecadação de itens necessários para projetos sociais.

## Funcionalidades

### Tipos de Doações Suportados

1. **ALIMENTOS** - Comida e bebidas
2. **ROUPAS** - Vestuário e calçados
3. **LIVROS** - Material de leitura
4. **BRINQUEDOS** - Brinquedos e jogos
5. **MEDICAMENTOS** - Medicamentos e produtos de saúde
6. **EQUIPAMENTOS** - Equipamentos diversos
7. **MÓVEIS** - Mobiliário
8. **ELETRÔNICOS** - Aparelhos eletrônicos
9. **HIGIENE** - Produtos de higiene pessoal
10. **MATERIAL ESCOLAR** - Material didático
11. **OUTROS** - Outros tipos de doação

### Status das Doações

- **PENDING** - Aguardando aprovação
- **AVAILABLE** - Disponível para coleta
- **RESERVED** - Reservada por alguém
- **COLLECTED** - Coletada
- **CANCELLED** - Cancelada
- **EXPIRED** - Expirada

### Prioridades

- **LOW** - Baixa prioridade
- **MEDIUM** - Prioridade média (padrão)
- **HIGH** - Alta prioridade
- **URGENT** - Urgente

### Condições dos Itens

- **NEW** - Novo
- **LIKE_NEW** - Como novo
- **GOOD** - Bom estado
- **FAIR** - Estado regular
- **POOR** - Estado ruim

## API Endpoints

### Criar Doação

```http
POST /api/donations
```

**Body:**
```json
{
  "title": "Roupas de inverno",
  "description": "Roupas de inverno em bom estado para crianças",
  "category": "CLOTHING",
  "priority": "HIGH",
  "quantity": 10,
  "unit": "peças",
  "condition": "GOOD",
  "estimatedValue": 150.00,
  "images": ["url1", "url2"],
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "isPickup": true,
  "availableFrom": "2024-01-01T00:00:00Z",
  "availableUntil": "2024-01-31T23:59:59Z",
  "opportunityId": "opp-123"
}
```

### Listar Doações

```http
GET /api/donations
```

**Query Parameters:**
- `page` - Página (padrão: 1)
- `limit` - Limite por página (padrão: 10)
- `category` - Filtrar por categoria
- `status` - Filtrar por status
- `priority` - Filtrar por prioridade
- `city` - Filtrar por cidade
- `state` - Filtrar por estado
- `isPickup` - Filtrar por coleta disponível
- `minValue` - Valor mínimo
- `maxValue` - Valor máximo
- `search` - Busca por texto

### Obter Doação Específica

```http
GET /api/donations/:donationId
```

### Atualizar Doação

```http
PUT /api/donations/:donationId
```

### Deletar Doação

```http
DELETE /api/donations/:donationId
```

### Reservar Doação

```http
POST /api/donations/:donationId/reserve
```

### Confirmar Coleta

```http
POST /api/donations/:donationId/confirm-collection
```

### Cancelar Reserva

```http
POST /api/donations/:donationId/cancel-reservation
```

### Doações do Usuário

```http
GET /api/donations/user/:userId
```

## Integração com Oportunidades

### Doações de uma Oportunidade

```http
GET /api/opportunities/:opportunityId/donations
```

### Estatísticas de Doações

```http
GET /api/opportunities/:opportunityId/donations/stats
```

### Adicionar Doação à Oportunidade

```http
POST /api/opportunities/:opportunityId/donations
```

### Remover Doação da Oportunidade

```http
DELETE /api/opportunities/:opportunityId/donations/:donationId
```

## Funcionalidades Avançadas

### Busca por Localização

```javascript
// Buscar doações próximas
const nearbyDonations = await DonationService.findNearbyDonations(
  latitude, 
  longitude, 
  radius // em km
);
```

### Busca por Texto

```javascript
// Buscar doações por termo
const donations = await DonationService.searchDonations(
  searchTerm,
  filters
);
```

### Estatísticas

```javascript
// Obter estatísticas de doações
const stats = await DonationService.getDonationStats(userId);
```

## Exemplos de Uso

### Doação de Alimentos

```json
{
  "title": "Alimentos não perecíveis",
  "description": "Arroz, feijão, macarrão e óleo para famílias carentes",
  "category": "FOOD",
  "priority": "HIGH",
  "quantity": 50,
  "unit": "kg",
  "condition": "NEW",
  "estimatedValue": 200.00,
  "isPickup": false,
  "availableUntil": "2024-02-15T23:59:59Z"
}
```

### Doação de Livros

```json
{
  "title": "Livros infantis",
  "description": "Livros de literatura infantil para biblioteca comunitária",
  "category": "BOOKS",
  "priority": "MEDIUM",
  "quantity": 30,
  "unit": "unidades",
  "condition": "GOOD",
  "estimatedValue": 300.00,
  "isPickup": true,
  "availableFrom": "2024-01-15T00:00:00Z",
  "availableUntil": "2024-03-15T23:59:59Z"
}
```

### Doação de Equipamentos

```json
{
  "title": "Computadores usados",
  "description": "Computadores para laboratório de informática",
  "category": "EQUIPMENT",
  "priority": "URGENT",
  "quantity": 5,
  "unit": "unidades",
  "condition": "FAIR",
  "estimatedValue": 1000.00,
  "isPickup": true,
  "availableUntil": "2024-01-31T23:59:59Z"
}
```

## Workflow de Doações

1. **Criação** - Usuário cria doação
2. **Disponibilização** - Doação fica disponível
3. **Reserva** - Alguém reserva a doação
4. **Coleta** - Doação é coletada
5. **Confirmação** - Coleta é confirmada

## Notificações

- Notificação quando doação é reservada
- Notificação quando doação está próxima do vencimento
- Notificação quando doação expira
- Notificação de confirmação de coleta

## Relatórios

### Relatório de Doações

```javascript
const report = await DonationService.getDonationReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  category: 'FOOD',
  status: 'COLLECTED'
});
```

### Métricas Disponíveis

- Total de doações
- Doações por categoria
- Doações por status
- Doações por prioridade
- Valor total arrecadado
- Valor médio por doação
- Doações mais procuradas
- Doações próximas ao vencimento

## Segurança

- Apenas o doador pode editar/deletar suas doações
- Validação de permissões para reservas
- Sanitização de dados de entrada
- Rate limiting nas APIs
- Validação de localização

## Monitoramento

- Logs de criação de doações
- Logs de reservas e coletas
- Métricas de performance
- Alertas para doações expiradas
- Dashboard de estatísticas

## Considerações de Performance

- Índices otimizados para consultas por localização
- Cache de estatísticas
- Paginação em todas as listagens
- Busca otimizada por texto
- Agregações eficientes para relatórios
