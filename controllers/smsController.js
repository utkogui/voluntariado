const smsService = require('../services/smsService');
const { validationResult } = require('express-validator');

// Enviar SMS para um usuário específico
const sendSMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { to, message, from } = req.body;

    const result = await smsService.sendSMS(to, message, from);
    
    res.status(200).json({
      success: true,
      message: 'SMS enviado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Enviar SMS em massa
const sendBulkSMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { recipients, message, from } = req.body;

    const result = await smsService.sendBulkSMS(recipients, message, from);
    
    res.status(200).json({
      success: true,
      message: 'SMS em massa enviado',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar SMS em massa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Enviar SMS de verificação
const sendVerificationSMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber, verificationCode } = req.body;

    const result = await smsService.sendVerificationSMS(phoneNumber, verificationCode);
    
    res.status(200).json({
      success: true,
      message: 'SMS de verificação enviado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar SMS de verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Enviar lembrete de atividade
const sendActivityReminderSMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber, activityName, activityDate, activityTime } = req.body;

    const result = await smsService.sendActivityReminderSMS(
      phoneNumber, 
      activityName, 
      activityDate, 
      activityTime
    );
    
    res.status(200).json({
      success: true,
      message: 'Lembrete de atividade enviado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar lembrete de atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Enviar confirmação de candidatura
const sendApplicationConfirmationSMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber, opportunityName, status } = req.body;

    const result = await smsService.sendApplicationConfirmationSMS(
      phoneNumber, 
      opportunityName, 
      status
    );
    
    res.status(200).json({
      success: true,
      message: 'Confirmação de candidatura enviada com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar confirmação de candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Enviar SMS de emergência
const sendEmergencySMS = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { phoneNumber, message } = req.body;

    const result = await smsService.sendEmergencySMS(phoneNumber, message);
    
    res.status(200).json({
      success: true,
      message: 'SMS de emergência enviado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao enviar SMS de emergência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Verificar status de uma mensagem
const getMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'ID da mensagem é obrigatório'
      });
    }

    const result = await smsService.getMessageStatus(messageId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao verificar status da mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Obter histórico de mensagens
const getMessageHistory = async (req, res) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;

    const result = await smsService.getMessageHistory(
      parseInt(limit), 
      startDate, 
      endDate
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao obter histórico de mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Validar número de telefone
const validatePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone é obrigatório'
      });
    }

    const result = await smsService.validatePhoneNumber(phoneNumber);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao validar número de telefone:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

// Obter estatísticas de SMS
const getSMSStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await smsService.getSMSStats(startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message || error
    });
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendVerificationSMS,
  sendActivityReminderSMS,
  sendApplicationConfirmationSMS,
  sendEmergencySMS,
  getMessageStatus,
  getMessageHistory,
  validatePhoneNumber,
  getSMSStats
};