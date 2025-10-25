const ReminderSchedulerService = require('../services/reminderSchedulerService');
const ReminderPushService = require('../services/reminderPushService');
const ReminderPreferencesService = require('../services/reminderPreferencesService');
const EmailTemplateService = require('../services/emailTemplateService');
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

    const result = await ReminderSchedulerService.scheduleActivityReminders(activityId, userId);

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
 * Enviar lembrete de confirmação
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

    const result = await ReminderSchedulerService.sendConfirmationReminder(activityId, userId);

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
 * Enviar lembrete push
 */
const sendReminderPush = async (req, res) => {
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
    const { reminderType, reminderData = {} } = req.body;
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

    const result = await ReminderPushService.sendActivityReminderPush(
      userId,
      activity,
      reminderType,
      reminderData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembrete push enviado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar lembrete push:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar lembretes em massa
 */
const sendBulkReminders = async (req, res) => {
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
    const { userIds, reminderType, reminderData = {} } = req.body;
    const currentUserId = req.user.id;

    // Verificar se o usuário é o organizador da atividade
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

    const result = await ReminderPushService.sendBulkReminderPush(
      userIds,
      activity,
      reminderType,
      reminderData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Lembretes em massa enviados com sucesso',
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
 * Obter preferências de lembretes do usuário
 */
const getUserReminderPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas preferências'
      });
    }

    const result = await ReminderPreferencesService.getUserReminderPreferences(userId);

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
    console.error('Erro ao obter preferências de lembretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar preferências de lembretes do usuário
 */
const updateUserReminderPreferences = async (req, res) => {
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

    const result = await ReminderPreferencesService.updateUserReminderPreferences(userId, preferences);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Preferências de lembretes atualizadas com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências de lembretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter templates de email
 */
const getEmailTemplates = async (req, res) => {
  try {
    const templates = EmailTemplateService.getDefaultTemplates();

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Erro ao obter templates de email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Processar template de email
 */
const processEmailTemplate = async (req, res) => {
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

    const { templateType, data } = req.body;

    const template = EmailTemplateService.getTemplateByType(templateType);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }

    const processedTemplate = EmailTemplateService.processTemplate(template, data);

    res.json({
      success: true,
      data: processedTemplate
    });

  } catch (error) {
    console.error('Erro ao processar template de email:', error);
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

    const result = await ReminderSchedulerService.getReminderStats(activityId);

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

/**
 * Obter estatísticas de preferências de lembretes
 */
const getReminderPreferencesStats = async (req, res) => {
  try {
    // Apenas admin pode ver estatísticas
    if (req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem acessar estas estatísticas'
      });
    }

    const result = await ReminderPreferencesService.getReminderPreferencesStats();

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
    console.error('Erro ao obter estatísticas de preferências de lembretes:', error);
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
  sendReminderPush,
  sendBulkReminders,
  getUserReminderPreferences,
  updateUserReminderPreferences,
  getEmailTemplates,
  processEmailTemplate,
  getReminderStats,
  getReminderPreferencesStats
};
