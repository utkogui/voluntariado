const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const PushNotificationService = require('./pushNotificationService');
const NotificationTemplateService = require('./notificationTemplateService');

const prisma = new PrismaClient();

/**
 * Serviço de notificações agendadas
 */
class ScheduledNotificationService {
  constructor() {
    this.pushService = new PushNotificationService();
    this.templateService = NotificationTemplateService;
    this.scheduledJobs = new Map();
    this.initializeScheduler();
  }

  /**
   * Inicializar agendador
   */
  initializeScheduler() {
    // Executar a cada minuto para processar notificações agendadas
    cron.schedule('* * * * *', () => {
      this.processScheduledNotifications();
    });

    // Executar a cada hora para limpeza de notificações antigas
    cron.schedule('0 * * * *', () => {
      this.cleanupOldNotifications();
    });

    console.log('Agendador de notificações inicializado');
  }

  /**
   * Agendar notificação
   * @param {Object} notificationData - Dados da notificação
   * @returns {Object} Resultado da operação
   */
  async scheduleNotification(notificationData) {
    try {
      const {
        userId,
        type,
        title,
        body,
        scheduledFor,
        data = {},
        templateId = null,
        priority = 'NORMAL',
        retryCount = 0,
        maxRetries = 3
      } = notificationData;

      const scheduledNotification = await prisma.scheduledNotification.create({
        data: {
          userId,
          type,
          title,
          body,
          scheduledFor: new Date(scheduledFor),
          data,
          templateId,
          priority,
          retryCount,
          maxRetries,
          status: 'SCHEDULED'
        }
      });

      return {
        success: true,
        data: scheduledNotification
      };

    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar notificação usando template
   * @param {string} userId - ID do usuário
   * @param {string} templateType - Tipo do template
   * @param {Object} templateData - Dados para o template
   * @param {Date} scheduledFor - Data para envio
   * @returns {Object} Resultado da operação
   */
  async scheduleNotificationWithTemplate(userId, templateType, templateData, scheduledFor) {
    try {
      // Obter template
      const templateResult = await this.templateService.getTemplateByType(templateType, userId);
      
      if (!templateResult.success) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      const template = templateResult.data;
      const processedTemplate = this.templateService.processTemplate(template, templateData);

      return await this.scheduleNotification({
        userId,
        type: template.type,
        title: processedTemplate.title,
        body: processedTemplate.body,
        scheduledFor,
        data: processedTemplate.data,
        templateId: template.id,
        priority: 'NORMAL'
      });

    } catch (error) {
      console.error('Erro ao agendar notificação com template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar notificações agendadas
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      // Buscar notificações para processar
      const notifications = await prisma.scheduledNotification.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: {
            lte: now
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { scheduledFor: 'asc' }
        ],
        take: 100 // Processar em lotes
      });

      for (const notification of notifications) {
        await this.processNotification(notification);
      }

    } catch (error) {
      console.error('Erro ao processar notificações agendadas:', error);
    }
  }

  /**
   * Processar notificação individual
   * @param {Object} notification - Notificação agendada
   */
  async processNotification(notification) {
    try {
      // Atualizar status para processando
      await prisma.scheduledNotification.update({
        where: { id: notification.id },
        data: { status: 'PROCESSING' }
      });

      // Enviar notificação push
      const pushResult = await this.pushService.sendToUser(notification.userId, {
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: notification.data
      });

      if (pushResult.success) {
        // Marcar como enviada
        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });

        console.log(`Notificação enviada: ${notification.id}`);
      } else {
        // Tentar novamente ou marcar como falha
        await this.handleNotificationFailure(notification, pushResult.error);
      }

    } catch (error) {
      console.error(`Erro ao processar notificação ${notification.id}:`, error);
      await this.handleNotificationFailure(notification, error.message);
    }
  }

  /**
   * Lidar com falha na notificação
   * @param {Object} notification - Notificação
   * @param {string} error - Erro ocorrido
   */
  async handleNotificationFailure(notification, error) {
    const newRetryCount = notification.retryCount + 1;

    if (newRetryCount < notification.maxRetries) {
      // Tentar novamente em 5 minutos
      const retryTime = new Date(Date.now() + 5 * 60 * 1000);
      
      await prisma.scheduledNotification.update({
        where: { id: notification.id },
        data: {
          status: 'SCHEDULED',
          retryCount: newRetryCount,
          scheduledFor: retryTime,
          lastError: error
        }
      });

      console.log(`Notificação reagendada para retry: ${notification.id}`);
    } else {
      // Marcar como falha
      await prisma.scheduledNotification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          lastError: error,
          failedAt: new Date()
        }
      });

      console.log(`Notificação falhou definitivamente: ${notification.id}`);
    }
  }

  /**
   * Cancelar notificação agendada
   * @param {string} notificationId - ID da notificação
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  async cancelNotification(notificationId, userId) {
    try {
      const notification = await prisma.scheduledNotification.findFirst({
        where: {
          id: notificationId,
          userId,
          status: 'SCHEDULED'
        }
      });

      if (!notification) {
        return {
          success: false,
          error: 'Notificação não encontrada ou já processada'
        };
      }

      await prisma.scheduledNotification.update({
        where: { id: notificationId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Notificação cancelada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter notificações agendadas do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de notificações
   */
  async getUserScheduledNotifications(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        fromDate,
        toDate
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = { userId };
      if (status) where.status = status;
      if (type) where.type = type;
      if (fromDate && toDate) {
        where.scheduledFor = {
          gte: new Date(fromDate),
          lte: new Date(toDate)
        };
      }

      const [notifications, total] = await Promise.all([
        prisma.scheduledNotification.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { scheduledFor: 'desc' }
        }),
        prisma.scheduledNotification.count({ where })
      ]);

      return {
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar notificações agendadas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar lembrete de prazo de oportunidade
   * @param {string} userId - ID do usuário
   * @param {Object} opportunity - Dados da oportunidade
   * @param {number} daysBefore - Dias antes do prazo
   * @returns {Object} Resultado da operação
   */
  async scheduleOpportunityDeadlineReminder(userId, opportunity, daysBefore = 3) {
    try {
      if (!opportunity.applicationDeadline) {
        return {
          success: false,
          error: 'Oportunidade não possui prazo definido'
        };
      }

      const reminderDate = new Date(opportunity.applicationDeadline);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      // Verificar se a data não passou
      if (reminderDate <= new Date()) {
        return {
          success: false,
          error: 'Data do lembrete já passou'
        };
      }

      return await this.scheduleNotificationWithTemplate(
        userId,
        'OPPORTUNITY_DEADLINE',
        {
          opportunity: {
            id: opportunity.id,
            title: opportunity.title,
            applicationDeadline: opportunity.applicationDeadline
          },
          daysLeft: daysBefore
        },
        reminderDate
      );

    } catch (error) {
      console.error('Erro ao agendar lembrete de prazo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar lembrete de atividade
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {number} hoursBefore - Horas antes da atividade
   * @returns {Object} Resultado da operação
   */
  async scheduleActivityReminder(userId, activity, hoursBefore = 24) {
    try {
      if (!activity.date) {
        return {
          success: false,
          error: 'Atividade não possui data definida'
        };
      }

      const reminderDate = new Date(activity.date);
      reminderDate.setHours(reminderDate.getHours() - hoursBefore);

      // Verificar se a data não passou
      if (reminderDate <= new Date()) {
        return {
          success: false,
          error: 'Data do lembrete já passou'
        };
      }

      return await this.scheduleNotificationWithTemplate(
        userId,
        'VOLUNTEER_ACTIVITY',
        {
          activity: {
            id: activity.id,
            title: activity.title,
            date: activity.date,
            location: activity.location
          }
        },
        reminderDate
      );

    } catch (error) {
      console.error('Erro ao agendar lembrete de atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Limpar notificações antigas
   */
  async cleanupOldNotifications() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás

      const result = await prisma.scheduledNotification.deleteMany({
        where: {
          status: { in: ['SENT', 'FAILED', 'CANCELLED'] },
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Notificações antigas removidas: ${result.count}`);

    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
    }
  }

  /**
   * Obter estatísticas de notificações agendadas
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Estatísticas
   */
  async getScheduledNotificationStats(userId = null) {
    try {
      const where = userId ? { userId } : {};

      const [
        total,
        scheduled,
        sent,
        failed,
        cancelled,
        byType,
        byPriority
      ] = await Promise.all([
        prisma.scheduledNotification.count({ where }),
        prisma.scheduledNotification.count({ where: { ...where, status: 'SCHEDULED' } }),
        prisma.scheduledNotification.count({ where: { ...where, status: 'SENT' } }),
        prisma.scheduledNotification.count({ where: { ...where, status: 'FAILED' } }),
        prisma.scheduledNotification.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.scheduledNotification.groupBy({
          by: ['type'],
          where,
          _count: { type: true }
        }),
        prisma.scheduledNotification.groupBy({
          by: ['priority'],
          where,
          _count: { priority: true }
        })
      ]);

      return {
        success: true,
        data: {
          total,
          scheduled,
          sent,
          failed,
          cancelled,
          byType: byType.map(item => ({
            type: item.type,
            count: item._count.type
          })),
          byPriority: byPriority.map(item => ({
            priority: item.priority,
            count: item._count.priority
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de notificações agendadas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ScheduledNotificationService;
