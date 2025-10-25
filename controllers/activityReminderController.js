const ActivityReminderService = require('../services/activityReminderService');
const { validationResult } = require('express-validator');

/**
 * Agendar lembretes automáticos para atividade
 */
const scheduleActivityReminders = async (req, res) => {
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

    const result = await ActivityReminderService.scheduleActivityReminders(activityId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembretes agendados com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao agendar lembretes da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar lembrete de confirmação de presença
 */
const sendConfirmationReminder = async (req, res) => {
  try {
    const { activityId, userId } = req.params;
    const currentUserId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: currentUserId },
          { participants: { some: { userId: currentUserId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão'
      });
    }

    const result = await ActivityReminderService.sendConfirmationReminder(activityId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembrete de confirmação enviado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar lembrete de confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar lembretes em massa para confirmação
 */
const sendBulkConfirmationReminders = async (req, res) => {
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

    const result = await ActivityReminderService.sendBulkConfirmationReminders(activityId, userId);

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
    console.error('Erro ao enviar lembretes em massa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Agendar lembrete personalizado
 */
const scheduleCustomReminder = async (req, res) => {
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
    const { reminderDate, title, message } = req.body;
    const currentUserId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: currentUserId },
          { participants: { some: { userId: currentUserId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão'
      });
    }

    const result = await ActivityReminderService.scheduleCustomReminder(
      activityId,
      userId,
      new Date(reminderDate),
      title,
      message
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembrete personalizado agendado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao agendar lembrete personalizado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar lembretes de uma atividade
 */
const cancelActivityReminders = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { userId } = req.query;
    const currentUserId = req.user.id;

    // Verificar se o usuário tem permissão
    const { prisma } = require('../config/database');
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        OR: [
          { createdById: currentUserId },
          { participants: { some: { userId: currentUserId } } }
        ]
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada ou você não tem permissão'
      });
    }

    const result = await ActivityReminderService.cancelActivityReminders(activityId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembretes cancelados com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao cancelar lembretes da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter lembretes agendados de uma atividade
 */
const getActivityReminders = async (req, res) => {
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
        message: 'Atividade não encontrada ou você não tem permissão'
      });
    }

    const result = await ActivityReminderService.getActivityReminders(activityId);

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
    console.error('Erro ao buscar lembretes da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de lembretes
 */
const getReminderStats = async (req, res) => {
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
        message: 'Atividade não encontrada ou você não tem permissão'
      });
    }

    const result = await ActivityReminderService.getReminderStats(activityId);

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
    console.error('Erro ao obter estatísticas de lembretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  scheduleActivityReminders,
  sendConfirmationReminder,
  sendBulkConfirmationReminders,
  scheduleCustomReminder,
  cancelActivityReminders,
  getActivityReminders,
  getReminderStats
};
