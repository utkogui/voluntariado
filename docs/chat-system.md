# Sistema de Chat em Tempo Real

## Visão Geral

O sistema de chat em tempo real permite comunicação instantânea entre voluntários, instituições, empresas e universidades. O sistema suporta conversas diretas, em grupo e relacionadas a oportunidades específicas.

## Funcionalidades

### 1. Tipos de Conversa
- **DIRECT**: Conversa entre dois usuários
- **GROUP**: Conversa em grupo com múltiplos participantes
- **OPPORTUNITY**: Conversa relacionada a uma oportunidade específica

### 2. Recursos de Mensagem
- **Texto**: Mensagens de texto simples
- **Imagem**: Envio de imagens
- **Arquivo**: Envio de arquivos
- **Sistema**: Mensagens automáticas do sistema
- **Compartilhamento**: Compartilhar oportunidades

### 3. Recursos Avançados
- **Respostas**: Responder a mensagens específicas
- **Edição**: Editar mensagens enviadas
- **Exclusão**: Deletar mensagens
- **Anexos**: Envio de arquivos e imagens
- **Status**: Mensagens lidas/não lidas
- **Digitação**: Indicador de digitação em tempo real

### 4. Notificações
- **Push**: Notificações push para usuários offline
- **Email**: Notificações por email
- **Tempo Real**: Notificações instantâneas para usuários online

## API Endpoints

### Conversas

#### Criar Conversa
```http
POST /api/chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Conversa sobre voluntariado",
  "type": "GROUP",
  "participants": ["user-id-1", "user-id-2"],
  "opportunityId": "opportunity-id"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conversa criada com sucesso",
  "data": {
    "id": "conversation-id",
    "title": "Conversa sobre voluntariado",
    "type": "GROUP",
    "status": "ACTIVE",
    "participants": [
      {
        "id": "participant-id",
        "userId": "user-id-1",
        "role": "MEMBER",
        "user": {
          "id": "user-id-1",
          "email": "user@example.com",
          "userType": "VOLUNTEER",
          "volunteer": {
            "firstName": "João",
            "lastName": "Silva"
          }
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Obter Conversas do Usuário
```http
GET /api/chat/conversations/user/:userId?page=1&limit=20&type=DIRECT&status=ACTIVE
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `limit`: Limite por página (padrão: 20, máximo: 100)
- `type`: Tipo de conversa (DIRECT, GROUP, OPPORTUNITY)
- `status`: Status da conversa (ACTIVE, ARCHIVED, DELETED)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation-id",
      "title": "Conversa com João Silva",
      "type": "DIRECT",
      "status": "ACTIVE",
      "participants": [...],
      "messages": [
        {
          "id": "message-id",
          "content": "Olá! Como posso ajudar?",
          "type": "TEXT",
          "status": "READ",
          "sender": {...},
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

#### Obter Conversa Específica
```http
GET /api/chat/conversations/:conversationId
Authorization: Bearer <token>
```

#### Criar Conversa Direta
```http
POST /api/chat/conversations/direct
Authorization: Bearer <token>
Content-Type: application/json

{
  "otherUserId": "user-id-2"
}
```

#### Buscar Conversa Direta
```http
GET /api/chat/conversations/direct/:userId1/:userId2
Authorization: Bearer <token>
```

### Mensagens

#### Enviar Mensagem
```http
POST /api/chat/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Olá! Como posso ajudar?",
  "type": "TEXT",
  "parentId": "parent-message-id",
  "attachments": [
    {
      "fileName": "document.pdf",
      "fileUrl": "https://example.com/files/document.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000
    }
  ],
  "metadata": {
    "location": {
      "latitude": -23.5505,
      "longitude": -46.6333
    }
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "id": "message-id",
    "content": "Olá! Como posso ajudar?",
    "type": "TEXT",
    "status": "SENT",
    "conversationId": "conversation-id",
    "senderId": "user-id",
    "sender": {
      "id": "user-id",
      "email": "user@example.com",
      "userType": "VOLUNTEER",
      "volunteer": {
        "firstName": "João",
        "lastName": "Silva"
      }
    },
    "attachments": [...],
    "parent": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Obter Mensagens da Conversa
```http
GET /api/chat/conversations/:conversationId/messages?page=1&limit=50&before=2024-01-15T10:30:00Z&after=2024-01-15T09:00:00Z
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `limit`: Limite por página (padrão: 50, máximo: 100)
- `before`: Buscar mensagens antes desta data
- `after`: Buscar mensagens depois desta data

#### Marcar Mensagens como Lidas
```http
PUT /api/chat/conversations/:conversationId/read
Authorization: Bearer <token>
```

#### Editar Mensagem
```http
PUT /api/chat/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Mensagem editada"
}
```

#### Deletar Mensagem
```http
DELETE /api/chat/messages/:messageId
Authorization: Bearer <token>
```

### Participantes

#### Adicionar Participante
```http
POST /api/chat/conversations/:conversationId/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id-to-add"
}
```

#### Remover Participante
```http
DELETE /api/chat/conversations/:conversationId/participants/:userId
Authorization: Bearer <token>
```

### Estatísticas

#### Obter Estatísticas de Chat
```http
GET /api/chat/stats/:userId
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalConversations": 15,
    "totalMessages": 250,
    "unreadMessages": 5,
    "recentActivity": 12
  }
}
```

## WebSocket Events

### Conexão
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Eventos do Cliente

#### Entrar em Conversa
```javascript
socket.emit('join_conversation', {
  conversationId: 'conversation-id'
});
```

#### Sair de Conversa
```javascript
socket.emit('leave_conversation', {
  conversationId: 'conversation-id'
});
```

#### Enviar Mensagem
```javascript
socket.emit('send_message', {
  conversationId: 'conversation-id',
  content: 'Olá! Como posso ajudar?',
  type: 'TEXT',
  parentId: 'parent-message-id',
  attachments: [],
  metadata: {}
});
```

#### Indicador de Digitação
```javascript
// Iniciar digitação
socket.emit('typing_start', {
  conversationId: 'conversation-id'
});

// Parar digitação
socket.emit('typing_stop', {
  conversationId: 'conversation-id'
});
```

#### Marcar como Lida
```javascript
socket.emit('message_read', {
  conversationId: 'conversation-id'
});
```

#### Editar Mensagem
```javascript
socket.emit('message_edit', {
  messageId: 'message-id',
  content: 'Mensagem editada'
});
```

#### Deletar Mensagem
```javascript
socket.emit('message_delete', {
  messageId: 'message-id',
  conversationId: 'conversation-id'
});
```

#### Status do Usuário
```javascript
// Usuário online
socket.emit('user_online');

// Usuário offline
socket.emit('user_offline');
```

### Eventos do Servidor

#### Nova Mensagem
```javascript
socket.on('new_message', (data) => {
  console.log('Nova mensagem:', data);
  // data = { conversationId, message }
});
```

#### Mensagem Editada
```javascript
socket.on('message_edited', (data) => {
  console.log('Mensagem editada:', data);
  // data = { messageId, message }
});
```

#### Mensagem Deletada
```javascript
socket.on('message_deleted', (data) => {
  console.log('Mensagem deletada:', data);
  // data = { messageId, conversationId }
});
```

#### Usuário Digitando
```javascript
socket.on('user_typing', (data) => {
  console.log('Usuário digitando:', data);
  // data = { conversationId, userId, isTyping }
});
```

#### Mensagens Lidas
```javascript
socket.on('messages_read', (data) => {
  console.log('Mensagens lidas:', data);
  // data = { conversationId, userId }
});
```

#### Usuário Entrou
```javascript
socket.on('user_joined', (data) => {
  console.log('Usuário entrou:', data);
  // data = { conversationId, userId }
});
```

#### Usuário Saiu
```javascript
socket.on('user_left', (data) => {
  console.log('Usuário saiu:', data);
  // data = { conversationId, userId }
});
```

#### Erro
```javascript
socket.on('error', (data) => {
  console.error('Erro:', data);
  // data = { message }
});
```

## Modelos de Dados

### Conversation
```typescript
interface Conversation {
  id: string;
  title?: string;
  type: 'DIRECT' | 'GROUP' | 'OPPORTUNITY';
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  participants: ConversationParticipant[];
  messages: Message[];
  opportunity?: Opportunity;
  createdAt: Date;
  updatedAt: Date;
}
```

### ConversationParticipant
```typescript
interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: Date;
  lastReadAt?: Date;
  user: User;
}
```

### Message
```typescript
interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'OPPORTUNITY_SHARE';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  conversationId: string;
  senderId: string;
  parentId?: string;
  attachments: MessageAttachment[];
  metadata?: any;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### MessageAttachment
```typescript
interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}
```

## Exemplos de Uso

### 1. Criar Conversa Direta
```javascript
// Criar conversa direta entre dois usuários
const response = await fetch('/api/chat/conversations/direct', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    otherUserId: 'user-id-2'
  })
});

const result = await response.json();
console.log('Conversa criada:', result.data);
```

### 2. Enviar Mensagem
```javascript
// Enviar mensagem via API
const response = await fetch('/api/chat/conversations/conversation-id/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Olá! Como posso ajudar?',
    type: 'TEXT'
  })
});

const result = await response.json();
console.log('Mensagem enviada:', result.data);
```

### 3. Chat em Tempo Real
```javascript
// Conectar ao WebSocket
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' }
});

// Entrar em uma conversa
socket.emit('join_conversation', {
  conversationId: 'conversation-id'
});

// Escutar novas mensagens
socket.on('new_message', (data) => {
  console.log('Nova mensagem:', data.message);
  // Atualizar interface do usuário
  addMessageToChat(data.message);
});

// Enviar mensagem
socket.emit('send_message', {
  conversationId: 'conversation-id',
  content: 'Olá! Como posso ajudar?',
  type: 'TEXT'
});
```

### 4. Indicador de Digitação
```javascript
let typingTimeout;

// Iniciar digitação
function startTyping() {
  socket.emit('typing_start', {
    conversationId: 'conversation-id'
  });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', {
      conversationId: 'conversation-id'
    });
  }, 3000);
}

// Escutar indicador de digitação
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.userId);
  } else {
    hideTypingIndicator(data.userId);
  }
});
```

## Considerações de Performance

### Otimizações
- **Paginação**: Mensagens carregadas sob demanda
- **Lazy Loading**: Conversas carregadas conforme necessário
- **Caching**: Cache de conversas ativas
- **Compressão**: Compressão de mensagens WebSocket

### Escalabilidade
- **Redis**: Para sessões WebSocket distribuídas
- **Load Balancing**: Múltiplas instâncias do servidor
- **Database Sharding**: Particionamento por usuário
- **CDN**: Para arquivos e imagens

## Segurança

### Autenticação
- **JWT**: Tokens para autenticação WebSocket
- **Rate Limiting**: Limitação de mensagens por usuário
- **Validation**: Validação de dados de entrada

### Privacidade
- **Encryption**: Criptografia de mensagens sensíveis
- **Access Control**: Controle de acesso por conversa
- **Audit Logs**: Logs de auditoria para mensagens

## Troubleshooting

### Problemas Comuns

#### WebSocket não conecta
- Verificar token de autenticação
- Verificar CORS settings
- Verificar firewall/proxy

#### Mensagens não chegam
- Verificar se usuário está na conversa
- Verificar status da conexão
- Verificar logs do servidor

#### Performance lenta
- Verificar paginação de mensagens
- Verificar índices do banco
- Verificar recursos do servidor

### Logs e Monitoramento
- **Connection Logs**: Logs de conexão WebSocket
- **Message Logs**: Logs de mensagens enviadas
- **Error Tracking**: Rastreamento de erros
- **Performance Metrics**: Métricas de performance
