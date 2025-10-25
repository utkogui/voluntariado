const ChatService = require('../services/chatService');
const { validationResult } = require('express-validator');

/**
 * Criar uma nova conversa
 */
const createConversation = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { title, type, participants, opportunityId } = req.body;
    const userId = req.user.id;

    // Adicionar o usuário atual aos participantes se não estiver incluído
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    const result = await ChatService.createConversation({
      title,
      type,
      participants,
      opportunityId
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Conversa criada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter conversas do usuário
 */
const getUserConversations = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      status = 'ACTIVE'
    } = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas conversas'
      });
    }

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status
    };

    const result = await ChatService.getUserConversations(userId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter uma conversa específica
 */
const getConversation = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const userId = req.user.id;

    const result = await ChatService.getConversation(conversationId, userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar mensagem
 */
const sendMessage = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const {
      content,
      type = 'TEXT',
      parentId,
      attachments = [],
      metadata
    } = req.body;
    const senderId = req.user.id;

    const result = await ChatService.sendMessage({
      conversationId,
      senderId,
      content,
      type,
      parentId,
      attachments,
      metadata
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter mensagens de uma conversa
 */
const getConversationMessages = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const {
      page = 1,
      limit = 50,
      before,
      after
    } = req.query;
    const userId = req.user.id;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
      after
    };

    const result = await ChatService.getConversationMessages(conversationId, userId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar mensagens como lidas
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const result = await ChatService.markMessagesAsRead(conversationId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Editar mensagem
 */
const editMessage = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const result = await ChatService.editMessage(messageId, userId, content);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Mensagem editada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deletar mensagem
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const result = await ChatService.deleteMessage(messageId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adicionar participante à conversa
 */
const addParticipant = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { userId } = req.body;
    const addedBy = req.user.id;

    const result = await ChatService.addParticipant(conversationId, userId, addedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Participante adicionado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remover participante da conversa
 */
const removeParticipant = async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    const removedBy = req.user.id;

    const result = await ChatService.removeParticipant(conversationId, userId, removedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erro ao remover participante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de chat
 */
const getChatStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas estatísticas'
      });
    }

    const result = await ChatService.getChatStats(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar conversa direta entre dois usuários
 */
const findDirectConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const currentUserId = req.user.id;

    // Verificar se o usuário atual é um dos participantes
    if (currentUserId !== userId1 && currentUserId !== userId2) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar esta conversa'
      });
    }

    const conversation = await ChatService.findDirectConversation(userId1, userId2);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Erro ao buscar conversa direta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Criar conversa direta entre dois usuários
 */
const createDirectConversation = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { otherUserId } = req.body;
    const currentUserId = req.user.id;

    // Verificar se não está tentando criar conversa consigo mesmo
    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível criar conversa consigo mesmo'
      });
    }

    const result = await ChatService.createConversation({
      type: 'DIRECT',
      participants: [currentUserId, otherUserId]
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Conversa direta criada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar conversa direta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversation,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  addParticipant,
  removeParticipant,
  getChatStats,
  findDirectConversation,
  createDirectConversation
};
