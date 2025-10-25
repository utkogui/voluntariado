const NotificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

/**
 * Enviar notificações para uma oportunidade
 */
const notifyOpportunity = async (req, res) => {
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

    const { opportunityId } = req.params;

    const result = await NotificationService.notifyRelevantVolunteers(opportunityId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notificações enviadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter notificações do usuário
 */
const getUserNotifications = async (req, res) => {
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
      limit = 10,
      type,
      isRead,
      startDate,
      endDate
    } = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas notificações'
      });
    }

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      startDate,
      endDate
    };

    const result = await NotificationService.getUserNotifications(userId, filters);

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
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar notificação como lida
 */
const markAsRead = async (req, res) => {
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

    const { notificationId } = req.params;

    const result = await NotificationService.markAsRead(notificationId, req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notificação marcada como lida',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar todas as notificações como lidas
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deletar notificação
 */
const deleteNotification = async (req, res) => {
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

    const { notificationId } = req.params;

    const result = await NotificationService.deleteNotification(notificationId, req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de notificações
 */
const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas estatísticas'
      });
    }

    const result = await NotificationService.getNotificationStats(userId);

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
    console.error('Erro ao obter estatísticas de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Configurar preferências de notificação
 */
const setNotificationPreferences = async (req, res) => {
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

    const {
      emailNotifications = true,
      pushNotifications = true,
      smsNotifications = false,
      frequency = 'IMMEDIATE',
      categories = [],
      skills = [],
      maxDistance = 50,
      minRelevanceScore = 70
    } = req.body;

    const preferences = {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      frequency,
      categories,
      skills,
      maxDistance,
      minRelevanceScore
    };

    const result = await NotificationService.setNotificationPreferences(req.user.id, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências de notificação configuradas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao configurar preferências de notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Processar notificações em lote
 */
const processBatchNotifications = async (req, res) => {
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

    const { opportunityIds } = req.body;

    if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de IDs de oportunidades é obrigatória'
      });
    }

    const result = await NotificationService.processBatchNotifications(opportunityIds);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notificações em lote processadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao processar notificações em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter notificações não lidas
 */
const getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas notificações'
      });
    }

    const result = await NotificationService.getUserNotifications(userId, {
      isRead: false,
      page: 1,
      limit: 50
    });

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
    console.error('Erro ao buscar notificações não lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter notificações por tipo
 */
const getNotificationsByType = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas notificações'
      });
    }

    const result = await NotificationService.getUserNotifications(userId, {
      type,
      page: 1,
      limit: 100
    });

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
    console.error('Erro ao buscar notificações por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  notifyOpportunity,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  setNotificationPreferences,
  processBatchNotifications,
  getUnreadNotifications,
  getNotificationsByType
};
