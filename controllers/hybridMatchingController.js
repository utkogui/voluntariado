const HybridMatchingService = require('../services/hybridMatchingService');
const { validationResult } = require('express-validator');

/**
 * Encontrar matches híbridos para um voluntário
 */
const findHybridMatches = async (req, res) => {
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

    const { volunteerId } = req.params;
    const {
      volunteerTypes = ['PRESENTIAL', 'ONLINE', 'HYBRID'],
      maxDistance = 50,
      minScore = 70,
      categories = [],
      skills = [],
      city,
      state,
      isRemote
    } = req.query;

    const filters = {
      volunteerTypes,
      maxDistance: parseInt(maxDistance),
      minScore: parseInt(minScore),
      categories,
      skills,
      city,
      state,
      isRemote: isRemote === 'true'
    };

    const result = await HybridMatchingService.findHybridMatches(volunteerId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      summary: result.summary
    });

  } catch (error) {
    console.error('Erro ao buscar matches híbridos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Encontrar voluntários híbridos para uma oportunidade
 */
const findHybridVolunteersForOpportunity = async (req, res) => {
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
    const {
      minScore = 70,
      maxDistance = 50,
      skills = [],
      categories = [],
      volunteerTypes = ['PRESENTIAL', 'ONLINE', 'HYBRID']
    } = req.query;

    const filters = {
      minScore: parseInt(minScore),
      maxDistance: parseInt(maxDistance),
      skills,
      categories,
      volunteerTypes
    };

    const result = await HybridMatchingService.findHybridVolunteersForOpportunity(opportunityId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      hybridAnalysis: result.hybridAnalysis,
      summary: result.summary
    });

  } catch (error) {
    console.error('Erro ao buscar voluntários híbridos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de matching por tipo
 */
const getMatchingStatsByType = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      volunteerType,
      category,
      city,
      state
    } = req.query;

    const filters = {
      startDate,
      endDate,
      volunteerType,
      category,
      city,
      state
    };

    const result = await HybridMatchingService.getMatchingStatsByType(filters);

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
    console.error('Erro ao obter estatísticas de matching:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Encontrar matches por preferência de localização
 */
const findMatchesByLocationPreference = async (req, res) => {
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

    const { volunteerId } = req.params;
    const {
      maxDistance = 50,
      preferredCities = [],
      preferredStates = [],
      allowRemote = true,
      minScore = 70
    } = req.body;

    const locationPreferences = {
      maxDistance: parseInt(maxDistance),
      preferredCities,
      preferredStates,
      allowRemote
    };

    const filters = {
      minScore: parseInt(minScore)
    };

    const result = await HybridMatchingService.findMatchesByLocationPreference(
      volunteerId,
      locationPreferences,
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
      data: result.data,
      locationAnalysis: result.locationAnalysis,
      summary: result.summary
    });

  } catch (error) {
    console.error('Erro ao buscar matches por localização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter relatório de matching híbrido
 */
const getHybridMatchingReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      volunteerType,
      category,
      city,
      state,
      format = 'json'
    } = req.query;

    const filters = {
      startDate,
      endDate,
      volunteerType,
      category,
      city,
      state,
      format
    };

    const result = await HybridMatchingService.getHybridMatchingReport(filters);

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
    console.error('Erro ao gerar relatório de matching:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Otimizar matching híbrido
 */
const optimizeHybridMatching = async (req, res) => {
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

    const { volunteerId } = req.params;
    const {
      preferredTypes = ['PRESENTIAL', 'ONLINE', 'HYBRID'],
      maxDistance = 50,
      minScore = 70,
      categories = [],
      skills = []
    } = req.body;

    const preferences = {
      preferredTypes,
      maxDistance: parseInt(maxDistance),
      minScore: parseInt(minScore),
      categories,
      skills
    };

    const result = await HybridMatchingService.optimizeHybridMatching(volunteerId, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      optimizations: result.optimizations
    });

  } catch (error) {
    console.error('Erro ao otimizar matching híbrido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter insights de matching híbrido
 */
const getHybridMatchingInsights = async (req, res) => {
  try {
    const {
      volunteerId,
      opportunityId,
      timeRange = '30d'
    } = req.query;

    // Implementar lógica de insights
    const insights = {
      volunteerId,
      opportunityId,
      timeRange,
      insights: [
        {
          type: 'PERFORMANCE',
          title: 'Performance de Matching',
          description: 'Análise de performance do matching híbrido',
          data: {
            totalMatches: 0,
            successRate: 0,
            averageScore: 0
          }
        },
        {
          type: 'TRENDS',
          title: 'Tendências',
          description: 'Tendências de matching por tipo',
          data: {
            presentialTrend: 0,
            onlineTrend: 0,
            hybridTrend: 0
          }
        },
        {
          type: 'RECOMMENDATIONS',
          title: 'Recomendações',
          description: 'Recomendações para melhorar o matching',
          data: {
            suggestions: []
          }
        }
      ]
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Erro ao obter insights de matching:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  findHybridMatches,
  findHybridVolunteersForOpportunity,
  getMatchingStatsByType,
  findMatchesByLocationPreference,
  getHybridMatchingReport,
  optimizeHybridMatching,
  getHybridMatchingInsights
};
