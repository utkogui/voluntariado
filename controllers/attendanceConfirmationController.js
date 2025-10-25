const AttendanceConfirmationService = require('../services/attendanceConfirmationService');
const AttendanceCheckInService = require('../services/attendanceCheckInService');
const AttendanceControlService = require('../services/attendanceControlService');
const AttendanceReportService = require('../services/attendanceReportService');
const { validationResult } = require('express-validator');

/**
 * Confirmar presença na atividade
 */
const confirmAttendance = async (req, res) => {
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
    const userId = req.user.id;
    const confirmationData = req.body;

    const result = await AttendanceConfirmationService.confirmAttendance(activityId, userId, confirmationData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Presença confirmada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Declinar presença na atividade
 */
const declineAttendance = async (req, res) => {
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
    const userId = req.user.id;
    const declineData = req.body;

    const result = await AttendanceConfirmationService.declineAttendance(activityId, userId, declineData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Presença declinada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao declinar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar como "talvez" na atividade
 */
const maybeAttendance = async (req, res) => {
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
    const userId = req.user.id;
    const maybeData = req.body;

    const result = await AttendanceConfirmationService.maybeAttendance(activityId, userId, maybeData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Marcado como "talvez" com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar como talvez:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Fazer check-in na atividade
 */
const checkIn = async (req, res) => {
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
    const userId = req.user.id;
    const checkInData = req.body;

    const result = await AttendanceCheckInService.checkIn(activityId, userId, checkInData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Check-in realizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao fazer check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Fazer check-out na atividade
 */
const checkOut = async (req, res) => {
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
    const userId = req.user.id;
    const checkOutData = req.body;

    const result = await AttendanceCheckInService.checkOut(activityId, userId, checkOutData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Check-out realizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao fazer check-out:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar ausência
 */
const markAbsence = async (req, res) => {
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

    const { activityId, userId } = req.params;
    const absenceData = req.body;

    const result = await AttendanceCheckInService.markAbsence(activityId, userId, absenceData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Ausência marcada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao marcar ausência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter confirmações de presença da atividade
 */
const getActivityConfirmations = async (req, res) => {
  try {
    const { activityId } = req.params;
    const filters = req.query;

    const result = await AttendanceConfirmationService.getActivityConfirmations(activityId, filters);

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
    console.error('Erro ao obter confirmações da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter confirmações de presença do usuário
 */
const getUserConfirmations = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas confirmações'
      });
    }

    const result = await AttendanceConfirmationService.getUserConfirmations(userId, filters);

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
    console.error('Erro ao obter confirmações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar lembretes de confirmação
 */
const sendConfirmationReminders = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { userIds = [] } = req.body;

    const result = await AttendanceConfirmationService.sendConfirmationReminders(activityId, userIds);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembretes de confirmação enviados com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar lembretes de confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter registros de presença da atividade
 */
const getActivityAttendanceRecords = async (req, res) => {
  try {
    const { activityId } = req.params;
    const filters = req.query;

    const result = await AttendanceCheckInService.getActivityAttendanceRecords(activityId, filters);

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
    console.error('Erro ao obter registros de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter registros de presença do usuário
 */
const getUserAttendanceRecords = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estes registros'
      });
    }

    const result = await AttendanceCheckInService.getUserAttendanceRecords(userId, filters);

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
    console.error('Erro ao obter registros do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verificar se pode fazer check-in
 */
const canCheckIn = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const result = await AttendanceCheckInService.canCheckIn(activityId, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao verificar se pode fazer check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter frequência do usuário
 */
const getUserAttendanceFrequency = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar esta frequência'
      });
    }

    const result = await AttendanceControlService.getUserAttendanceFrequency(userId, filters);

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
    console.error('Erro ao obter frequência do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter frequência da atividade
 */
const getActivityAttendanceFrequency = async (req, res) => {
  try {
    const { activityId } = req.params;
    const filters = req.query;

    const result = await AttendanceControlService.getActivityAttendanceFrequency(activityId, filters);

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
    console.error('Erro ao obter frequência da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter ranking de frequência
 */
const getAttendanceRanking = async (req, res) => {
  try {
    const filters = req.query;

    const result = await AttendanceControlService.getAttendanceRanking(filters);

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
    console.error('Erro ao obter ranking de frequência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter alertas de frequência
 */
const getAttendanceAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estes alertas'
      });
    }

    const result = await AttendanceControlService.getAttendanceAlerts(userId, filters);

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
    console.error('Erro ao obter alertas de frequência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Gerar relatório de presença
 */
const generateAttendanceReport = async (req, res) => {
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
    const userId = req.user.id;
    const reportData = req.body;

    const result = await AttendanceReportService.generateAttendanceReport(activityId, userId, reportData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Relatório de presença gerado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter relatórios salvos
 */
const getSavedReports = async (req, res) => {
  try {
    const { activityId } = req.params;
    const filters = req.query;

    const result = await AttendanceReportService.getSavedReports(activityId, filters);

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
    console.error('Erro ao obter relatórios salvos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter relatório específico
 */
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const result = await AttendanceReportService.getReport(reportId);

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
    console.error('Erro ao obter relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Excluir relatório
 */
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const result = await AttendanceReportService.deleteReport(reportId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Relatório excluído com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de confirmações
 */
const getConfirmationStats = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await AttendanceConfirmationService.getConfirmationStats(activityId);

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
    console.error('Erro ao obter estatísticas de confirmações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de presença
 */
const getAttendanceStats = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await AttendanceCheckInService.getAttendanceStats(activityId);

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
    console.error('Erro ao obter estatísticas de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  confirmAttendance,
  declineAttendance,
  maybeAttendance,
  checkIn,
  checkOut,
  markAbsence,
  getActivityConfirmations,
  getUserConfirmations,
  sendConfirmationReminders,
  getActivityAttendanceRecords,
  getUserAttendanceRecords,
  canCheckIn,
  getUserAttendanceFrequency,
  getActivityAttendanceFrequency,
  getAttendanceRanking,
  getAttendanceAlerts,
  generateAttendanceReport,
  getSavedReports,
  getReport,
  deleteReport,
  getConfirmationStats,
  getAttendanceStats
};
