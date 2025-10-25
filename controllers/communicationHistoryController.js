const CommunicationHistoryService = require('../services/communicationHistoryService');
const { validationResult } = require('express-validator');

/**
 * Obter histórico de comunicações do usuário
 */
const getUserCommunicationHistory = async (req, res) => {
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

    const userId = req.user.id;
    const filters = req.query;

    const result = await CommunicationHistoryService.getUserCommunicationHistory(userId, filters);

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
    console.error('Erro ao obter histórico de comunicações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de comunicações de uma campanha
 */
const getCampaignCommunicationHistory = async (req, res) => {
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

    const { campaignId } = req.params;
    const filters = req.query;

    const result = await CommunicationHistoryService.getCampaignCommunicationHistory(campaignId, filters);

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
    console.error('Erro ao obter histórico de comunicações da campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de comunicação
 */
const getCommunicationStats = async (req, res) => {
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

    const filters = req.query;

    const result = await CommunicationHistoryService.getCommunicationStats(filters);

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
    console.error('Erro ao obter estatísticas de comunicação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de conversa entre dois usuários
 */
const getConversationHistory = async (req, res) => {
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

    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;
    const filters = req.query;

    const result = await CommunicationHistoryService.getConversationHistory(
      currentUserId,
      otherUserId,
      filters
    );

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
    console.error('Erro ao obter histórico de conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar comunicação como entregue
 */
const markAsDelivered = async (req, res) => {
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

    const { communicationId } = req.params;

    const result = await CommunicationHistoryService.markAsDelivered(communicationId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Comunicação marcada como entregue',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar comunicação como entregue:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar comunicação como aberta
 */
const markAsOpened = async (req, res) => {
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

    const { communicationId } = req.params;

    const result = await CommunicationHistoryService.markAsOpened(communicationId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Comunicação marcada como aberta',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar comunicação como aberta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar comunicação como clicada
 */
const markAsClicked = async (req, res) => {
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

    const { communicationId } = req.params;

    const result = await CommunicationHistoryService.markAsClicked(communicationId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Comunicação marcada como clicada',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar comunicação como clicada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar comunicação como falhada
 */
const markAsFailed = async (req, res) => {
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

    const { communicationId } = req.params;
    const { errorMessage } = req.body;

    const result = await CommunicationHistoryService.markAsFailed(communicationId, errorMessage);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Comunicação marcada como falhada',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar comunicação como falhada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter comunicação específica
 */
const getCommunication = async (req, res) => {
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

    const { communicationId } = req.params;

    const result = await CommunicationHistoryService.getCommunication(communicationId);

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
    console.error('Erro ao obter comunicação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Excluir comunicação do histórico
 */
const deleteCommunication = async (req, res) => {
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

    const { communicationId } = req.params;
    const deletedBy = req.user.id;

    const result = await CommunicationHistoryService.deleteCommunication(communicationId, deletedBy);

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
    console.error('Erro ao excluir comunicação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter resumo de comunicações recentes
 */
const getRecentCommunicationsSummary = async (req, res) => {
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

    const userId = req.user.id;
    const { days = 7 } = req.query;

    const result = await CommunicationHistoryService.getRecentCommunicationsSummary(userId, parseInt(days));

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
    console.error('Erro ao obter resumo de comunicações recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de engajamento
 */
const getEngagementStats = async (req, res) => {
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

    const filters = req.query;

    const result = await CommunicationHistoryService.getCommunicationStats(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Extrair apenas as estatísticas de engajamento
    const engagementStats = {
      deliveryRate: result.data.overview.deliveryRate,
      openRate: result.data.overview.openRate,
      clickRate: result.data.overview.clickRate,
      failureRate: result.data.overview.failureRate,
      totalCommunications: result.data.overview.totalCommunications,
      sentCount: result.data.overview.sentCount,
      deliveredCount: result.data.overview.deliveredCount,
      openedCount: result.data.overview.openedCount,
      clickedCount: result.data.overview.clickedCount,
      failedCount: result.data.overview.failedCount
    };

    res.json({
      success: true,
      data: engagementStats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de engajamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas por canal
 */
const getChannelStats = async (req, res) => {
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

    const filters = req.query;

    const result = await CommunicationHistoryService.getCommunicationStats(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Extrair apenas as estatísticas por canal
    const channelStats = result.data.channelStats;

    res.json({
      success: true,
      data: channelStats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas por canal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas temporais
 */
const getTemporalStats = async (req, res) => {
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

    const filters = req.query;

    const result = await CommunicationHistoryService.getCommunicationStats(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Extrair apenas as estatísticas temporais
    const temporalStats = result.data.temporalStats;

    res.json({
      success: true,
      data: temporalStats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas temporais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserCommunicationHistory,
  getCampaignCommunicationHistory,
  getCommunicationStats,
  getConversationHistory,
  markAsDelivered,
  markAsOpened,
  markAsClicked,
  markAsFailed,
  getCommunication,
  deleteCommunication,
  getRecentCommunicationsSummary,
  getEngagementStats,
  getChannelStats,
  getTemporalStats
};
