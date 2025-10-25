const recommendationService = require('../services/recommendationService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter recomendações personalizadas para um voluntário
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      includeCollaborative: req.query.includeCollaborative !== 'false',
      includeContentBased: req.query.includeContentBased !== 'false',
      includeTrending: req.query.includeTrending !== 'false',
      includeUrgent: req.query.includeUrgent !== 'false'
    };

    // Validar limite
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 100'
      });
    }

    const result = await recommendationService.getPersonalizedRecommendations(volunteerId, options);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      options: options,
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter recomendações colaborativas
const getCollaborativeRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 50'
      });
    }

    const result = await recommendationService.getCollaborativeRecommendations(volunteerId, limit);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      type: 'collaborative',
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter recomendações baseadas em conteúdo
const getContentBasedRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 50'
      });
    }

    const result = await recommendationService.getContentBasedRecommendations(volunteerId, limit);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      type: 'content-based',
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter recomendações híbridas
const getHybridRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 15;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 50'
      });
    }

    const result = await recommendationService.getHybridRecommendations(volunteerId, limit);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      type: 'hybrid',
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter recomendações de tendências
const getTrendingRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 20'
      });
    }

    const result = await recommendationService.getTrendingRecommendations(volunteerId, limit);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      type: 'trending',
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter recomendações urgentes
const getUrgentRecommendations = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        error: 'Limite deve estar entre 1 e 20'
      });
    }

    const result = await recommendationService.getUrgentRecommendations(volunteerId, limit);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      recommendations: result.data,
      volunteerId: volunteerId,
      type: 'urgent',
      total: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de recomendações
const getRecommendationStats = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const result = await recommendationService.getRecommendationStats(volunteerId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data,
      volunteerId: volunteerId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Atualizar preferências de recomendação
const updateRecommendationPreferences = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const preferences = req.body;

    // Em modo demonstração, simular atualização
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Atualizando preferências de recomendação para voluntário ${volunteerId}:`, preferences);
      
      return res.json({
        message: 'Preferências de recomendação atualizadas com sucesso (modo demonstração)',
        volunteerId: volunteerId,
        preferences: preferences,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Marcar recomendação como visualizada
const markRecommendationAsViewed = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;

    // Em modo demonstração, simular marcação
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Marcando recomendação ${opportunityId} como visualizada para voluntário ${volunteerId}`);
      
      return res.json({
        message: 'Recomendação marcada como visualizada (modo demonstração)',
        volunteerId: volunteerId,
        opportunityId: opportunityId,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Marcar recomendação como rejeitada
const markRecommendationAsRejected = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;
    const { reason } = req.body;

    // Em modo demonstração, simular rejeição
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Marcando recomendação ${opportunityId} como rejeitada para voluntário ${volunteerId}. Motivo: ${reason || 'Não especificado'}`);
      
      return res.json({
        message: 'Recomendação marcada como rejeitada (modo demonstração)',
        volunteerId: volunteerId,
        opportunityId: opportunityId,
        reason: reason,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Obter histórico de recomendações
const getRecommendationHistory = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { limit = 50, type } = req.query;

    // Em modo demonstração, simular histórico
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      const history = [
        {
          id: 'rec-1',
          opportunityId: '1',
          opportunityTitle: 'Aulas de reforço para crianças carentes',
          type: 'content-based',
          score: 0.85,
          status: 'viewed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'rec-2',
          opportunityId: '3',
          opportunityTitle: 'Campanha de arrecadação de alimentos',
          type: 'collaborative',
          score: 0.72,
          status: 'applied',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'rec-3',
          opportunityId: '5',
          opportunityTitle: 'Suporte técnico remoto para idosos',
          type: 'trending',
          score: 0.68,
          status: 'rejected',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          rejectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          rejectionReason: 'Não tenho interesse em tecnologia'
        }
      ];

      let filteredHistory = history;
      if (type) {
        filteredHistory = history.filter(h => h.type === type);
      }

      return res.json({
        history: filteredHistory.slice(0, parseInt(limit)),
        volunteerId: volunteerId,
        total: filteredHistory.length,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      history: [],
      volunteerId: volunteerId,
      total: 0,
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getHybridRecommendations,
  getTrendingRecommendations,
  getUrgentRecommendations,
  getRecommendationStats,
  updateRecommendationPreferences,
  markRecommendationAsViewed,
  markRecommendationAsRejected,
  getRecommendationHistory
};
