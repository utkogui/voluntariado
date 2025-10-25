const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatService = require('./chatService');
const CommunicationService = require('./communicationService');

/**
 * Serviço WebSocket para chat em tempo real
 */
class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Configurar middleware de autenticação
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token de autenticação não fornecido'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userType = decoded.userType;
        
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  /**
   * Configurar handlers de eventos
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Usuário conectado: ${socket.userId} (${socket.id})`);
      
      // Registrar usuário como conectado
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Entrar nas salas das conversas do usuário
      this.joinUserConversations(socket);

      // Eventos de chat
      socket.on('join_conversation', (data) => this.handleJoinConversation(socket, data));
      socket.on('leave_conversation', (data) => this.handleLeaveConversation(socket, data));
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      socket.on('message_read', (data) => this.handleMessageRead(socket, data));
      socket.on('message_edit', (data) => this.handleMessageEdit(socket, data));
      socket.on('message_delete', (data) => this.handleMessageDelete(socket, data));

      // Eventos de status
      socket.on('user_online', () => this.handleUserOnline(socket));
      socket.on('user_offline', () => this.handleUserOffline(socket));

      // Desconexão
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * Entrar nas salas das conversas do usuário
   */
  async joinUserConversations(socket) {
    try {
      const conversations = await ChatService.getUserConversations(socket.userId, { limit: 100 });
      
      if (conversations.success) {
        conversations.data.forEach(conversation => {
          socket.join(`conversation_${conversation.id}`);
        });
      }
    } catch (error) {
      console.error('Erro ao entrar nas conversas do usuário:', error);
    }
  }

  /**
   * Handler para entrar em uma conversa
   */
  async handleJoinConversation(socket, data) {
    try {
      const { conversationId } = data;
      
      // Verificar se o usuário é participante da conversa
      const conversation = await ChatService.getConversation(conversationId, socket.userId);
      
      if (conversation.success) {
        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
        
        // Notificar outros participantes
        socket.to(`conversation_${conversationId}`).emit('user_joined', {
          conversationId,
          userId: socket.userId
        });
      } else {
        socket.emit('error', { message: 'Não é possível entrar nesta conversa' });
      }
    } catch (error) {
      console.error('Erro ao entrar na conversa:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para sair de uma conversa
   */
  async handleLeaveConversation(socket, data) {
    try {
      const { conversationId } = data;
      
      socket.leave(`conversation_${conversationId}`);
      socket.emit('left_conversation', { conversationId });
      
      // Notificar outros participantes
      socket.to(`conversation_${conversationId}`).emit('user_left', {
        conversationId,
        userId: socket.userId
      });
    } catch (error) {
      console.error('Erro ao sair da conversa:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para enviar mensagem
   */
  async handleSendMessage(socket, data) {
    try {
      const { conversationId, content, type, parentId, attachments, metadata } = data;
      
      // Enviar mensagem usando o ChatService
      const result = await ChatService.sendMessage({
        conversationId,
        senderId: socket.userId,
        content,
        type,
        parentId,
        attachments,
        metadata
      });

      if (result.success) {
        // Emitir mensagem para todos os participantes da conversa
        this.io.to(`conversation_${conversationId}`).emit('new_message', {
          conversationId,
          message: result.data
        });

        // Enviar notificações para usuários offline
        await this.notifyOfflineUsers(conversationId, result.data);
      } else {
        socket.emit('message_error', {
          conversationId,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para início de digitação
   */
  handleTypingStart(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId,
      isTyping: true
    });
  }

  /**
   * Handler para fim de digitação
   */
  handleTypingStop(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId,
      isTyping: false
    });
  }

  /**
   * Handler para mensagem lida
   */
  async handleMessageRead(socket, data) {
    try {
      const { conversationId } = data;
      
      // Marcar mensagens como lidas
      await ChatService.markMessagesAsRead(conversationId, socket.userId);
      
      // Notificar outros participantes
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        userId: socket.userId
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para editar mensagem
   */
  async handleMessageEdit(socket, data) {
    try {
      const { messageId, content } = data;
      
      const result = await ChatService.editMessage(messageId, socket.userId, content);
      
      if (result.success) {
        // Emitir mensagem editada para todos os participantes
        this.io.to(`conversation_${result.data.conversationId}`).emit('message_edited', {
          messageId,
          message: result.data
        });
      } else {
        socket.emit('edit_error', {
          messageId,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para deletar mensagem
   */
  async handleMessageDelete(socket, data) {
    try {
      const { messageId } = data;
      
      const result = await ChatService.deleteMessage(messageId, socket.userId);
      
      if (result.success) {
        // Emitir mensagem deletada para todos os participantes
        this.io.to(`conversation_${data.conversationId}`).emit('message_deleted', {
          messageId,
          conversationId: data.conversationId
        });
      } else {
        socket.emit('delete_error', {
          messageId,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  }

  /**
   * Handler para usuário online
   */
  handleUserOnline(socket) {
    // Notificar contatos que o usuário está online
    this.broadcastUserStatus(socket.userId, 'online');
  }

  /**
   * Handler para usuário offline
   */
  handleUserOffline(socket) {
    // Notificar contatos que o usuário está offline
    this.broadcastUserStatus(socket.userId, 'offline');
  }

  /**
   * Handler para desconexão
   */
  handleDisconnect(socket) {
    console.log(`Usuário desconectado: ${socket.userId} (${socket.id})`);
    
    // Remover usuário das listas
    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);
    
    // Notificar contatos que o usuário está offline
    this.broadcastUserStatus(socket.userId, 'offline');
  }

  /**
   * Notificar usuários offline sobre nova mensagem
   */
  async notifyOfflineUsers(conversationId, message) {
    try {
      // Buscar participantes da conversa
      const conversation = await ChatService.getConversation(conversationId, message.senderId);
      
      if (conversation.success) {
        const participants = conversation.data.participants;
        
        for (const participant of participants) {
          const userId = participant.userId;
          
          // Verificar se o usuário está offline
          if (!this.connectedUsers.has(userId)) {
            // Enviar notificação
            await CommunicationService.sendMessageNotification(
              message.sender,
              participant.user,
              message
            );
          }
        }
      }
    } catch (error) {
      console.error('Erro ao notificar usuários offline:', error);
    }
  }

  /**
   * Broadcast status do usuário
   */
  broadcastUserStatus(userId, status) {
    // Implementar lógica para notificar contatos sobre status
    // Por enquanto, apenas log
    console.log(`Usuário ${userId} está ${status}`);
  }

  /**
   * Enviar mensagem para usuário específico
   */
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Enviar mensagem para conversa específica
   */
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  /**
   * Obter usuários conectados
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Verificar se usuário está online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obter socket de um usuário
   */
  getUserSocket(userId) {
    const socketId = this.connectedUsers.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }
}

module.exports = WebSocketService;
