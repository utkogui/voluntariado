import api from './api';

const chatService = {
  // Buscar conversas do usuário
  getConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar conversas');
    }
  },

  // Buscar mensagens de uma conversa
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar mensagens');
    }
  },

  // Enviar mensagem
  sendMessage: async (conversationId, content, messageType = 'TEXT') => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        messageType
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao enviar mensagem');
    }
  },

  // Criar nova conversa
  createConversation: async (participantIds, conversationType = 'DIRECT') => {
    try {
      const response = await api.post('/chat/conversations', {
        participantIds,
        conversationType
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conversa');
    }
  },

  // Marcar mensagens como lidas
  markAsRead: async (conversationId, messageIds) => {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/read`, {
        messageIds
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar mensagens como lidas');
    }
  },

  // Buscar usuários para iniciar conversa
  searchUsers: async (query) => {
    try {
      const response = await api.get('/chat/users/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuários');
    }
  },

  // Deletar conversa
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar conversa');
    }
  },

  // Deletar mensagem
  deleteMessage: async (conversationId, messageId) => {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar mensagem');
    }
  },

  // Editar mensagem
  editMessage: async (conversationId, messageId, content) => {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/messages/${messageId}`, {
        content
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao editar mensagem');
    }
  },

  // Buscar conversas arquivadas
  getArchivedConversations: async () => {
    try {
      const response = await api.get('/chat/conversations/archived');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar conversas arquivadas');
    }
  },

  // Arquivar conversa
  archiveConversation: async (conversationId) => {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/archive`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao arquivar conversa');
    }
  },

  // Desarquivar conversa
  unarchiveConversation: async (conversationId) => {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/unarchive`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao desarquivar conversa');
    }
  },

  // Buscar conversas por tipo
  getConversationsByType: async (conversationType) => {
    try {
      const response = await api.get('/chat/conversations', {
        params: { type: conversationType }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar conversas por tipo');
    }
  },

  // Adicionar participante à conversa
  addParticipant: async (conversationId, userId) => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/participants`, {
        userId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao adicionar participante');
    }
  },

  // Remover participante da conversa
  removeParticipant: async (conversationId, userId) => {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao remover participante');
    }
  },

  // Atualizar configurações da conversa
  updateConversationSettings: async (conversationId, settings) => {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar configurações');
    }
  },

  // Buscar estatísticas de mensagens
  getMessageStats: async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar estatísticas');
    }
  },

  // Buscar mensagens não lidas
  getUnreadMessages: async () => {
    try {
      const response = await api.get('/chat/messages/unread');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar mensagens não lidas');
    }
  },

  // Marcar todas as mensagens como lidas
  markAllAsRead: async () => {
    try {
      const response = await api.put('/chat/messages/read-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar todas as mensagens como lidas');
    }
  }
};

export default chatService;
