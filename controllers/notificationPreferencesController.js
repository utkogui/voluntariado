const NotificationPreferencesService = require('../services/notificationPreferencesService');
const { validationResult } = require('express-validator');

/**
 * Obter preferências de notificação do usuário
 */
const getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas preferências'
      });
    }

    const result = await NotificationPreferencesService.getUserPreferences(userId);

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
    console.error('Erro ao obter preferências de notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar preferências de notificação do usuário
 */
const updateUserPreferences = async (req, res) => {
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
    const preferences = req.body;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar estas preferências'
      });
    }

    const result = await NotificationPreferencesService.updateUserPreferences(userId, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências de notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter preferências padrão
 */
const getDefaultPreferences = async (req, res) => {
  try {
    const defaultPreferences = NotificationPreferencesService.getDefaultPreferences();

    res.json({
      success: true,
      data: defaultPreferences
    });

  } catch (error) {
    console.error('Erro ao obter preferências padrão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verificar se usuário deve receber notificação
 */
const checkNotificationEligibility = async (req, res) => {
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
    const { type, data = {} } = req.body;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para verificar elegibilidade para este usuário'
      });
    }

    const result = await NotificationPreferencesService.shouldSendNotification(userId, type, data);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao verificar elegibilidade de notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de preferências
 */
const getPreferencesStats = async (req, res) => {
  try {
    // Apenas admin pode ver estatísticas
    if (req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem acessar estas estatísticas'
      });
    }

    const result = await NotificationPreferencesService.getPreferencesStats();

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
    console.error('Erro ao obter estatísticas de preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Resetar preferências para padrão
 */
const resetToDefault = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para resetar as preferências deste usuário'
      });
    }

    const defaultPreferences = NotificationPreferencesService.getDefaultPreferences();
    const result = await NotificationPreferencesService.updateUserPreferences(userId, defaultPreferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências resetadas para o padrão com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao resetar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar preferências de canal específico
 */
const updateChannelPreferences = async (req, res) => {
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

    const { userId, channel } = req.params;
    const { enabled, frequency } = req.body;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar estas preferências'
      });
    }

    // Obter preferências atuais
    const currentResult = await NotificationPreferencesService.getUserPreferences(userId);
    if (!currentResult.success) {
      return res.status(404).json({
        success: false,
        message: currentResult.error
      });
    }

    const preferences = currentResult.data;

    // Atualizar canal específico
    if (preferences.channels[channel]) {
      if (enabled !== undefined) {
        preferences.channels[channel].enabled = enabled;
      }
      if (frequency) {
        preferences.channels[channel].frequency = frequency;
      }
    }

    // Salvar preferências atualizadas
    const result = await NotificationPreferencesService.updateUserPreferences(userId, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências do canal atualizadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências do canal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar preferências de tipo específico
 */
const updateTypePreferences = async (req, res) => {
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

    const { userId, type } = req.params;
    const { enabled, channels, frequency, minRelevanceScore } = req.body;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar estas preferências'
      });
    }

    // Obter preferências atuais
    const currentResult = await NotificationPreferencesService.getUserPreferences(userId);
    if (!currentResult.success) {
      return res.status(404).json({
        success: false,
        message: currentResult.error
      });
    }

    const preferences = currentResult.data;

    // Atualizar tipo específico
    if (preferences.types[type]) {
      if (enabled !== undefined) {
        preferences.types[type].enabled = enabled;
      }
      if (channels) {
        preferences.types[type].channels = channels;
      }
      if (frequency) {
        preferences.types[type].frequency = frequency;
      }
      if (minRelevanceScore !== undefined) {
        preferences.types[type].minRelevanceScore = minRelevanceScore;
      }
    }

    // Salvar preferências atualizadas
    const result = await NotificationPreferencesService.updateUserPreferences(userId, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências do tipo atualizadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências do tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  getDefaultPreferences,
  checkNotificationEligibility,
  getPreferencesStats,
  resetToDefault,
  updateChannelPreferences,
  updateTypePreferences
};
