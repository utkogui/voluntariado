const backgroundCheckService = require('../services/backgroundCheckService');
const { validationResult } = require('express-validator');

// Iniciar verificação de antecedentes
const initiateBackgroundCheck = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const personalData = req.body;

    const result = await backgroundCheckService.initiateBackgroundCheck(userId, personalData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Verificação de antecedentes iniciada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao iniciar verificação de antecedentes',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error initiating background check:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Verificar status da verificação
const getCheckStatus = async (req, res) => {
  try {
    const { checkId } = req.params;

    if (!checkId) {
      return res.status(400).json({
        success: false,
        message: 'ID da verificação é obrigatório'
      });
    }

    const result = await backgroundCheckService.getCheckStatus(checkId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Verificação não encontrada',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting check status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter relatório completo
const getCheckReport = async (req, res) => {
  try {
    const { checkId } = req.params;

    if (!checkId) {
      return res.status(400).json({
        success: false,
        message: 'ID da verificação é obrigatório'
      });
    }

    const result = await backgroundCheckService.getCheckReport(checkId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Relatório não encontrado',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting check report:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Listar verificações de um usuário
const getUserChecks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await backgroundCheckService.getUserChecks(userId, parseInt(limit), parseInt(offset));
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting user checks:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Cancelar verificação
const cancelCheck = async (req, res) => {
  try {
    const { checkId } = req.params;

    if (!checkId) {
      return res.status(400).json({
        success: false,
        message: 'ID da verificação é obrigatório'
      });
    }

    const result = await backgroundCheckService.cancelCheck(checkId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Verificação cancelada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao cancelar verificação',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error canceling check:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Verificar elegibilidade para voluntariado
const checkVolunteerEligibility = async (req, res) => {
  try {
    const { checkId } = req.params;

    if (!checkId) {
      return res.status(400).json({
        success: false,
        message: 'ID da verificação é obrigatório'
      });
    }

    const result = await backgroundCheckService.checkVolunteerEligibility(checkId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao verificar elegibilidade',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error checking volunteer eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter estatísticas de verificações
const getCheckStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await backgroundCheckService.getCheckStats(startDate, endDate);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter estatísticas',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting check stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Processar webhook de atualização de status
const processStatusUpdate = async (req, res) => {
  try {
    const webhookData = req.body;

    const result = await backgroundCheckService.processStatusUpdate(webhookData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao processar webhook',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error processing status update:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  initiateBackgroundCheck,
  getCheckStatus,
  getCheckReport,
  getUserChecks,
  cancelCheck,
  checkVolunteerEligibility,
  getCheckStats,
  processStatusUpdate
};