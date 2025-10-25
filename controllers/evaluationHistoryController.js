const EvaluationHistoryService = require('../services/evaluationHistoryService');
const { validationResult } = require('express-validator');

/**
 * Obter histórico completo de avaliações de um usuário
 */
const getUserEvaluationHistory = async (req, res) => {
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
    const filters = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationHistory(userId, filters);

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
    console.error('Erro ao obter histórico de avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter resumo de avaliações de um usuário
 */
const getUserEvaluationSummary = async (req, res) => {
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
    const filters = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationSummary(userId, filters);

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
    console.error('Erro ao obter resumo de avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de avaliações por período
 */
const getEvaluationHistoryByPeriod = async (req, res) => {
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
    const { period = 'month' } = req.query;

    const result = await EvaluationHistoryService.getEvaluationHistoryByPeriod(userId, period);

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
    console.error('Erro ao obter histórico por período:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter avaliações por tipo de usuário
 */
const getEvaluationsByUserType = async (req, res) => {
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
    const { userType } = req.query;

    if (!userType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário é obrigatório'
      });
    }

    const result = await EvaluationHistoryService.getEvaluationsByUserType(userId, userType);

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
    console.error('Erro ao obter avaliações por tipo de usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter avaliações destacadas
 */
const getFeaturedEvaluations = async (req, res) => {
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
    const { limit = 3 } = req.query;

    const result = await EvaluationHistoryService.getFeaturedEvaluations(userId, parseInt(limit));

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
    console.error('Erro ao obter avaliações destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas comparativas
 */
const getComparativeStats = async (req, res) => {
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

    const result = await EvaluationHistoryService.getComparativeStats(userId);

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
    console.error('Erro ao obter estatísticas comparativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter distribuição de avaliações
 */
const getRatingDistribution = async (req, res) => {
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
    const filters = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationSummary(userId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Extrair apenas a distribuição de avaliações
    const ratingDistribution = result.data.ratingDistribution;

    res.json({
      success: true,
      data: ratingDistribution
    });

  } catch (error) {
    console.error('Erro ao obter distribuição de avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas por tipo de avaliação
 */
const getStatsByEvaluationType = async (req, res) => {
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
    const filters = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationSummary(userId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Extrair apenas as estatísticas por tipo
    const typeStats = result.data.typeStats;

    res.json({
      success: true,
      data: typeStats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter avaliações recentes
 */
const getRecentEvaluations = async (req, res) => {
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
    const { limit = 10 } = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationHistory(userId, {
      limit: parseInt(limit),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data.evaluations
    });

  } catch (error) {
    console.error('Erro ao obter avaliações recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter avaliações por atividade
 */
const getEvaluationsByActivity = async (req, res) => {
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

    const { activityId } = req.params;
    const filters = req.query;

    const result = await EvaluationHistoryService.getUserEvaluationHistory(null, {
      ...filters,
      activityId
    });

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
    console.error('Erro ao obter avaliações por atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserEvaluationHistory,
  getUserEvaluationSummary,
  getEvaluationHistoryByPeriod,
  getEvaluationsByUserType,
  getFeaturedEvaluations,
  getComparativeStats,
  getRatingDistribution,
  getStatsByEvaluationType,
  getRecentEvaluations,
  getEvaluationsByActivity
};
