const AttendanceService = require('../services/attendanceService');
const { validationResult } = require('express-validator');

/**
 * Obter confirmações de uma atividade
 */
const getActivityConfirmations = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    // Verificar se o usuário tem permissão para ver as confirmações
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão para acessá-la'
      });
    }

    const result = await AttendanceService.getActivityConfirmations(activityId);

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
    console.error('Erro ao buscar confirmações da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter confirmações de um usuário
 */
const getUserConfirmations = async (req, res) => {
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

    const { userId } = req.user.id } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      fromDate,
      toDate
    } = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas confirmações'
      });
    }

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      fromDate,
      toDate
    };

    const result = await AttendanceService.getUserConfirmations(userId, filters);

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
    console.error('Erro ao buscar confirmações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar status de confirmação
 */
const updateConfirmationStatus = async (req, res) => {
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
    const { status, notes } = req.body;
    const userId = req.user.id;

    const result = await AttendanceService.updateConfirmationStatus(
      activityId,
      userId,
      status,
      notes
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Status de confirmação atualizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar status de confirmação:', error);
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
    const userId = req.user.id;

    // Verificar se o usuário é o organizador da atividade
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        createdById: userId
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não é o organizador'
      });
    }

    const result = await AttendanceService.sendConfirmationReminders(activityId, userId);

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
 * Obter estatísticas de confirmação
 */
const getConfirmationStats = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão para acessá-la'
      });
    }

    const result = await AttendanceService.getConfirmationStats(activityId);

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
    console.error('Erro ao obter estatísticas de confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar presença em atividade
 */
const markAttendance = async (req, res) => {
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
    const { userId, attended, notes } = req.body;
    const currentUserId = req.user.id;

    // Verificar se o usuário tem permissão para marcar presença
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        createdById: currentUserId
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não é o organizador'
      });
    }

    const result = await AttendanceService.markAttendance(activityId, userId, attended, notes);

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
    console.error('Erro ao marcar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter lista de presença
 */
const getAttendanceList = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão para acessá-la'
      });
    }

    const result = await AttendanceService.getAttendanceList(activityId);

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
    console.error('Erro ao obter lista de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Exportar lista de presença
 */
const exportAttendanceList = async (req, res) => {
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
    const { format = 'csv' } = req.query;
    const userId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        createdById: userId
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não é o organizador'
      });
    }

    const result = await AttendanceService.exportAttendanceList(activityId, format);

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
    console.error('Erro ao exportar lista de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getActivityConfirmations,
  getUserConfirmations,
  updateConfirmationStatus,
  sendConfirmationReminders,
  getConfirmationStats,
  markAttendance,
  getAttendanceList,
  exportAttendanceList
};
