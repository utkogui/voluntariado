# Sistema de Notificações Inteligentes

## Visão Geral

O sistema de notificações inteligentes é responsável por enviar notificações relevantes para voluntários sobre novas oportunidades, atualizações de candidaturas, mensagens e outros eventos importantes. O sistema utiliza algoritmos de relevância para garantir que apenas notificações pertinentes sejam enviadas.

## Funcionalidades

### 1. Notificações de Oportunidades
- **Algoritmo de Relevância**: Calcula a compatibilidade entre voluntários e oportunidades
- **Notificações Inteligentes**: Envia apenas para voluntários com alta compatibilidade
- **Múltiplos Canais**: Email, push notifications e SMS

### 2. Tipos de Notificação
- **NEW_OPPORTUNITY**: Nova oportunidade relevante
- **APPLICATION_UPDATE**: Atualização de candidatura
- **MESSAGE**: Nova mensagem
- **REMINDER**: Lembrete
- **EVALUATION**: Nova avaliação
- **SYSTEM**: Notificação do sistema

### 3. Sistema de Preferências
- **Canais de Notificação**: Email, push, SMS
- **Frequência**: Imediata, diária, semanal, nunca
- **Filtros**: Categorias, habilidades, distância
- **Score de Relevância**: Configuração mínima

## API Endpoints

### Notificações

#### Enviar Notificações para Oportunidade
```http
POST /api/notifications/opportunity/:opportunityId
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "message": "Notificações enviadas com sucesso",
  "data": {
    "opportunityId": "uuid",
    "volunteersNotified": 15,
    "notificationsSent": 15
  }
}
```

#### Obter Notificações do Usuário
```http
GET /api/notifications/user/:userId?page=1&limit=10&type=NEW_OPPORTUNITY&isRead=false
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `limit`: Limite por página (padrão: 10, máximo: 100)
- `type`: Tipo de notificação
- `isRead`: Status de leitura (true/false)
- `startDate`: Data de início (ISO 8601)
- `endDate`: Data de fim (ISO 8601)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Nova oportunidade relevante!",
      "message": "Encontramos uma oportunidade que pode ser perfeita para você: Ajuda com crianças",
      "type": "NEW_OPPORTUNITY",
      "isRead": false,
      "data": {
        "opportunityId": "uuid",
        "relevanceScore": 85,
        "reasons": ["Excelente compatibilidade de habilidades", "Localização próxima"]
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Marcar Notificação como Lida
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Marcar Todas como Lidas
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

#### Deletar Notificação
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <token>
```

#### Obter Estatísticas
```http
GET /api/notifications/user/:userId/stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "unread": 12,
    "recent": 8,
    "byType": [
      { "type": "NEW_OPPORTUNITY", "count": 30 },
      { "type": "APPLICATION_UPDATE", "count": 15 },
      { "type": "MESSAGE", "count": 5 }
    ]
  }
}
```

#### Configurar Preferências
```http
POST /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "frequency": "IMMEDIATE",
  "categories": ["EDUCATION", "HEALTH"],
  "skills": ["TEACHING", "NURSING"],
  "maxDistance": 50,
  "minRelevanceScore": 70
}
```

### Dashboard

#### Dashboard do Usuário
```http
GET /api/dashboard/notifications/:userId
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 50,
      "unread": 12,
      "recent": 8,
      "byType": [...],
      "byStatus": [...]
    },
    "recentNotifications": [...],
    "relevantOpportunities": [
      {
        "id": "uuid",
        "title": "Ajuda com crianças",
        "relevanceScore": 85,
        "relevanceReasons": ["Excelente compatibilidade de habilidades"]
      }
    ],
    "notificationPreferences": {...},
    "recentActivities": [...],
    "engagementStats": {
      "readRate": 75.5,
      "clickRate": 45.2,
      "conversionRate": 12.8
    }
  }
}
```

#### Dashboard do Admin
```http
GET /api/dashboard/admin/notifications
Authorization: Bearer <token>
```

#### Relatório de Notificações
```http
GET /api/dashboard/notifications/report?startDate=2024-01-01&endDate=2024-01-31&type=NEW_OPPORTUNITY
Authorization: Bearer <token>
```

## Algoritmo de Relevância

### Cálculo de Score

O sistema calcula a relevância de uma oportunidade para um voluntário usando múltiplos fatores:

```javascript
const weights = {
  skills: 0.3,           // Compatibilidade de habilidades
  location: 0.2,          // Proximidade geográfica
  availability: 0.15,    // Compatibilidade de horários
  interests: 0.1,         // Alinhamento de interesses
  volunteerType: 0.15,    // Tipo de voluntariado
  requirements: 0.1       // Requisitos específicos
};

const relevanceScore = 
  (skills * 0.3) +
  (location * 0.2) +
  (availability * 0.15) +
  (interests * 0.1) +
  (volunteerType * 0.15) +
  (requirements * 0.1);
```

### Thresholds

- **Alta Relevância**: Score ≥ 80
- **Média Relevância**: Score 60-79
- **Baixa Relevância**: Score < 60
- **Notificação**: Apenas scores ≥ 70

## Tipos de Notificação

### NEW_OPPORTUNITY
- **Trigger**: Nova oportunidade criada
- **Algoritmo**: Calcula relevância para todos os voluntários
- **Canais**: Email, push, SMS
- **Dados**: ID da oportunidade, score de relevância, razões

### APPLICATION_UPDATE
- **Trigger**: Status da candidatura alterado
- **Algoritmo**: Notificação direta para o candidato
- **Canais**: Email, push
- **Dados**: ID da aplicação, novo status

### MESSAGE
- **Trigger**: Nova mensagem recebida
- **Algoritmo**: Notificação direta para o destinatário
- **Canais**: Push, email
- **Dados**: ID do remetente, preview da mensagem

### REMINDER
- **Trigger**: Lembrete agendado
- **Algoritmo**: Notificação baseada em data/hora
- **Canais**: Email, push, SMS
- **Dados**: Título, mensagem, ação

### EVALUATION
- **Trigger**: Nova avaliação recebida
- **Algoritmo**: Notificação direta para o avaliado
- **Canais**: Email, push
- **Dados**: ID da avaliação, rating, comentário

### SYSTEM
- **Trigger**: Evento do sistema
- **Algoritmo**: Notificação para usuários específicos
- **Canais**: Email, push
- **Dados**: Dados específicos do evento

## Configuração de Preferências

### Canais de Notificação
- **Email**: Notificações por email
- **Push**: Notificações push no dispositivo
- **SMS**: Notificações por SMS

### Frequência
- **IMMEDIATE**: Notificação imediata
- **DAILY**: Resumo diário
- **WEEKLY**: Resumo semanal
- **NEVER**: Sem notificações

### Filtros
- **Categorias**: Filtrar por categorias de interesse
- **Habilidades**: Filtrar por habilidades específicas
- **Distância**: Distância máxima em km
- **Score**: Score mínimo de relevância

## Integração com Serviços Externos

### Email
- **SendGrid**: Envio de emails transacionais
- **Templates**: Templates personalizados
- **Tracking**: Abertura e cliques

### Push Notifications
- **Firebase**: Notificações push
- **OneSignal**: Gerenciamento de dispositivos
- **Badges**: Contadores de notificação

### SMS
- **Twilio**: Envio de SMS
- **Rate Limiting**: Limitação de envios
- **Opt-out**: Desinscrição automática

## Monitoramento e Analytics

### Métricas de Engajamento
- **Taxa de Abertura**: % de notificações abertas
- **Taxa de Clique**: % de notificações clicadas
- **Taxa de Conversão**: % que resultam em aplicações

### Métricas de Performance
- **Tempo de Envio**: Latência das notificações
- **Taxa de Entrega**: % de notificações entregues
- **Taxa de Erro**: % de falhas no envio

### Relatórios
- **Por Usuário**: Estatísticas individuais
- **Por Oportunidade**: Performance das notificações
- **Por Período**: Análise temporal
- **Por Canal**: Performance por tipo de notificação

## Exemplos de Uso

### 1. Enviar Notificações para Nova Oportunidade
```javascript
// Quando uma nova oportunidade é criada
const result = await NotificationService.notifyRelevantVolunteers(opportunityId);

if (result.success) {
  console.log(`Notificações enviadas para ${result.data.volunteersNotified} voluntários`);
}
```

### 2. Configurar Preferências do Usuário
```javascript
const preferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  frequency: 'IMMEDIATE',
  categories: ['EDUCATION', 'HEALTH'],
  skills: ['TEACHING', 'NURSING'],
  maxDistance: 50,
  minRelevanceScore: 70
};

await NotificationService.setNotificationPreferences(userId, preferences);
```

### 3. Obter Dashboard do Usuário
```javascript
const dashboard = await NotificationService.getNotificationStats(userId);

console.log(`Total: ${dashboard.data.total}`);
console.log(`Não lidas: ${dashboard.data.unread}`);
console.log(`Taxa de abertura: ${dashboard.data.readRate}%`);
```

## Considerações de Performance

### Otimizações
- **Batch Processing**: Processamento em lote
- **Caching**: Cache de resultados de relevância
- **Rate Limiting**: Limitação de envios
- **Queue System**: Sistema de filas para processamento

### Escalabilidade
- **Horizontal Scaling**: Múltiplas instâncias
- **Database Sharding**: Particionamento de dados
- **CDN**: Distribuição de conteúdo
- **Load Balancing**: Balanceamento de carga

## Segurança

### Proteções
- **Autenticação**: Verificação de usuário
- **Autorização**: Controle de acesso
- **Rate Limiting**: Prevenção de spam
- **Data Encryption**: Criptografia de dados

### Privacidade
- **Opt-out**: Desinscrição fácil
- **Data Retention**: Retenção de dados
- **GDPR Compliance**: Conformidade com GDPR
- **Audit Logs**: Logs de auditoria

## Troubleshooting

### Problemas Comuns

#### Notificações não enviadas
- Verificar configuração de preferências
- Verificar status do usuário
- Verificar logs de erro

#### Score de relevância baixo
- Verificar perfil do voluntário
- Verificar requisitos da oportunidade
- Ajustar pesos do algoritmo

#### Performance lenta
- Verificar índices do banco
- Verificar cache
- Verificar recursos do servidor

### Logs e Monitoramento
- **Application Logs**: Logs da aplicação
- **Error Tracking**: Rastreamento de erros
- **Performance Metrics**: Métricas de performance
- **User Analytics**: Analytics de usuário
