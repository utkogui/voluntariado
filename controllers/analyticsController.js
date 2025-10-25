const analyticsService = require('../services/analyticsService');
const { validationResult } = require('express-validator');

// Obter relatório do Google Analytics
const getGAReport = async (req, res) => {
  try {
    const { startDate, endDate, metrics, dimensions } = req.query;

    const result = await analyticsService.getGAReport(startDate, endDate, metrics, dimensions);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter relatório do Google Analytics',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting GA report:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter dados em tempo real do Google Analytics
const getGARealtime = async (req, res) => {
  try {
    const result = await analyticsService.getGARealtime();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter dados em tempo real',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting GA realtime data:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear evento no Mixpanel
const trackMixpanelEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { eventName, properties, userId } = req.body;

    const result = await analyticsService.trackMixpanelEvent(eventName, properties, userId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Evento rastreado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear evento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking Mixpanel event:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Definir propriedades do usuário no Mixpanel
const setMixpanelUserProperties = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, properties } = req.body;

    const result = await analyticsService.setMixpanelUserProperties(userId, properties);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Propriedades do usuário definidas com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir propriedades do usuário',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error setting Mixpanel user properties:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter insights do Mixpanel
const getMixpanelInsights = async (req, res) => {
  try {
    const { event, fromDate, toDate, unit } = req.query;

    const result = await analyticsService.getMixpanelInsights(event, fromDate, toDate, unit);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter insights',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting Mixpanel insights:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear registro de usuário
const trackUserRegistration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, userType, registrationMethod } = req.body;

    const result = await analyticsService.trackUserRegistration(userId, userType, registrationMethod);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Registro de usuário rastreado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear registro de usuário',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear visualização de oportunidade
const trackOpportunityView = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, opportunityId, opportunityType } = req.body;

    const result = await analyticsService.trackOpportunityView(userId, opportunityId, opportunityType);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Visualização de oportunidade rastreada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear visualização de oportunidade',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking opportunity view:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear submissão de candidatura
const trackApplicationSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, opportunityId, applicationId } = req.body;

    const result = await analyticsService.trackApplicationSubmission(userId, opportunityId, applicationId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Submissão de candidatura rastreada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear submissão de candidatura',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking application submission:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear atividade de voluntário
const trackVolunteerActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, activityId, activityType, duration } = req.body;

    const result = await analyticsService.trackVolunteerActivity(userId, activityId, activityType, duration);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Atividade de voluntário rastreada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear atividade de voluntário',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking volunteer activity:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Rastrear doação
const trackDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId, amount, donationType, organizationId } = req.body;

    const result = await analyticsService.trackDonation(userId, amount, donationType, organizationId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Doação rastreada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao rastrear doação',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error tracking donation:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter métricas consolidadas
const getConsolidatedMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await analyticsService.getConsolidatedMetrics(startDate, endDate);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter métricas consolidadas',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting consolidated metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter funil de conversão
const getConversionFunnel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await analyticsService.getConversionFunnel(startDate, endDate);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter funil de conversão',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter segmentação de usuários
const getUserSegmentation = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await analyticsService.getUserSegmentation(startDate, endDate);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter segmentação de usuários',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting user segmentation:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getGAReport,
  getGARealtime,
  trackMixpanelEvent,
  setMixpanelUserProperties,
  getMixpanelInsights,
  trackUserRegistration,
  trackOpportunityView,
  trackApplicationSubmission,
  trackVolunteerActivity,
  trackDonation,
  getConsolidatedMetrics,
  getConversionFunnel,
  getUserSegmentation
};