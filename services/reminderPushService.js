const { PrismaClient } = require('@prisma/client');
const PushNotificationService = require('./pushNotificationService');
const NotificationPreferencesService = require('./notificationPreferencesService');

const prisma = new PrismaClient();
const pushService = new PushNotificationService();

/**
 * Serviço de notificações push para lembretes
 */
class ReminderPushService {
  
  /**
   * Enviar lembrete de atividade por push
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {string} reminderType - Tipo do lembrete
   * @param {Object} reminderData - Dados do lembrete
   * @returns {Object} Resultado da operação
   */
  static async sendActivityReminderPush(userId, activity, reminderType, reminderData = {}) {
    try {
      // Verificar preferências do usuário
      const shouldSend = await this.shouldSendPushReminder(userId, reminderType, { activity });
      
      if (!shouldSend.shouldSend) {
        return {
          success: false,
          error: shouldSend.reason
        };
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Configurar notificação baseada no tipo
      const notification = this.buildReminderNotification(activity, reminderType, baseUrl, reminderData);

      // Enviar notificação push
      const result = await pushService.sendToUser(userId, notification);

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao enviar lembrete push:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembrete de confirmação por push
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @returns {Object} Resultado da operação
   */
  static async sendConfirmationReminderPush(userId, activity) {
    try {
      // Verificar preferências do usuário
      const shouldSend = await this.shouldSendPushReminder(userId, 'CONFIRMATION_REMINDER', { activity });
      
      if (!shouldSend.shouldSend) {
        return {
          success: false,
          error: shouldSend.reason
        };
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const notification = {
        title: 'Confirmação de Presença Pendente',
        body: `Por favor, confirme sua presença na atividade "${activity.title}"`,
        type: 'CONFIRMATION_REMINDER',
        data: {
          activityId: activity.id,
          startDate: activity.startDate,
          location: activity.address || 'Online',
          reminderType: 'CONFIRMATION_REMINDER'
        },
        clickAction: `${baseUrl}/activities/${activity.id}/confirm`,
        channelId: 'confirmations',
        sound: 'confirmation_reminder.wav',
        icon: 'ic_confirmation',
        color: '#2196F3'
      };

      // Enviar notificação push
      const result = await pushService.sendToUser(userId, notification);

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao enviar lembrete de confirmação push:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembrete de cancelamento por push
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {string} reason - Motivo do cancelamento
   * @returns {Object} Resultado da operação
   */
  static async sendCancellationReminderPush(userId, activity, reason) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const notification = {
        title: 'Atividade Cancelada',
        body: `A atividade "${activity.title}" foi cancelada. Motivo: ${reason}`,
        type: 'ACTIVITY_CANCELLED',
        data: {
          activityId: activity.id,
          cancellationReason: reason,
          reminderType: 'ACTIVITY_CANCELLED'
        },
        clickAction: `${baseUrl}/activities/${activity.id}`,
        channelId: 'cancellations',
        sound: 'cancellation_notification.wav',
        icon: 'ic_cancelled',
        color: '#9E9E9E'
      };

      // Enviar notificação push
      const result = await pushService.sendToUser(userId, notification);

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao enviar lembrete de cancelamento push:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembretes em massa por push
   * @param {Array} userIds - IDs dos usuários
   * @param {Object} activity - Dados da atividade
   * @param {string} reminderType - Tipo do lembrete
   * @param {Object} reminderData - Dados do lembrete
   * @returns {Object} Resultado da operação
   */
  static async sendBulkReminderPush(userIds, activity, reminderType, reminderData = {}) {
    try {
      const results = [];

      for (const userId of userIds) {
        try {
          const result = await this.sendActivityReminderPush(userId, activity, reminderType, reminderData);
          results.push({
            userId,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: {
          totalSent: results.filter(r => r.success).length,
          totalFailed: results.filter(r => !r.success).length,
          results
        }
      };

    } catch (error) {
      console.error('Erro ao enviar lembretes em massa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar se deve enviar lembrete push
   * @param {string} userId - ID do usuário
   * @param {string} reminderType - Tipo do lembrete
   * @param {Object} data - Dados do lembrete
   * @returns {Object} Resultado da verificação
   */
  static async shouldSendPushReminder(userId, reminderType, data) {
    try {
      // Verificar preferências de notificação
      const preferencesResult = await NotificationPreferencesService.getUserPreferences(userId);
      
      if (!preferencesResult.success) {
        return {
          shouldSend: false,
          reason: 'Erro ao obter preferências'
        };
      }

      const preferences = preferencesResult.data;

      // Verificar se push está habilitado
      if (!preferences.channels.push.enabled) {
        return {
          shouldSend: false,
          reason: 'Notificações push desabilitadas'
        };
      }

      // Verificar se o tipo de lembrete está habilitado
      const reminderSettings = preferences.types[reminderType] || preferences.types['REMINDER'];
      
      if (!reminderSettings || !reminderSettings.enabled) {
        return {
          shouldSend: false,
          reason: 'Tipo de lembrete desabilitado'
        };
      }

      // Verificar se push está nos canais permitidos
      if (!reminderSettings.channels.includes('push')) {
        return {
          shouldSend: false,
          reason: 'Push não está nos canais permitidos'
        };
      }

      // Verificar horário silencioso
      if (preferences.filters.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const startTime = preferences.filters.quietHours.start;
        const endTime = preferences.filters.quietHours.end;
        
        if (this.isInQuietHours(currentTime, startTime, endTime)) {
          return {
            shouldSend: false,
            reason: 'Horário silencioso ativo'
          };
        }
      }

      // Verificar limite diário
      if (preferences.advanced.maxNotificationsPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const notificationCount = await prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: today
            }
          }
        });

        if (notificationCount >= preferences.advanced.maxNotificationsPerDay) {
          return {
            shouldSend: false,
            reason: 'Limite diário de notificações atingido'
          };
        }
      }

      return {
        shouldSend: true
      };

    } catch (error) {
      console.error('Erro ao verificar se deve enviar lembrete push:', error);
      return {
        shouldSend: false,
        reason: 'Erro interno'
      };
    }
  }

  /**
   * Construir notificação de lembrete
   * @param {Object} activity - Dados da atividade
   * @param {string} reminderType - Tipo do lembrete
   * @param {string} baseUrl - URL base
   * @param {Object} reminderData - Dados do lembrete
   * @returns {Object} Notificação configurada
   */
  static buildReminderNotification(activity, reminderType, baseUrl, reminderData = {}) {
    const notifications = {
      'ACTIVITY_REMINDER_24H': {
        title: 'Lembrete: Atividade amanhã',
        body: `A atividade "${activity.title}" acontece amanhã às ${this.formatTime(activity.startDate)}`,
        sound: 'reminder_24h.wav',
        icon: 'ic_reminder_24h',
        color: '#4CAF50',
        channelId: 'activity_reminders'
      },
      'ACTIVITY_REMINDER_2H': {
        title: 'Lembrete: Atividade em 2 horas',
        body: `A atividade "${activity.title}" começa em 2 horas`,
        sound: 'reminder_2h.wav',
        icon: 'ic_reminder_2h',
        color: '#FF9800',
        channelId: 'activity_reminders'
      },
      'ACTIVITY_REMINDER_30MIN': {
        title: 'URGENTE: Atividade em 30 minutos',
        body: `A atividade "${activity.title}" começa em 30 minutos`,
        sound: 'reminder_30min.wav',
        icon: 'ic_reminder_30min',
        color: '#f44336',
        channelId: 'activity_reminders'
      }
    };

    const config = notifications[reminderType] || {
      title: 'Lembrete de Atividade',
      body: `Lembrete sobre a atividade "${activity.title}"`,
      sound: 'reminder_default.wav',
      icon: 'ic_reminder',
      color: '#2196F3',
      channelId: 'activity_reminders'
    };

    return {
      title: config.title,
      body: config.body,
      type: 'ACTIVITY_REMINDER',
      data: {
        activityId: activity.id,
        startDate: activity.startDate,
        location: activity.address || 'Online',
        reminderType,
        ...reminderData
      },
      clickAction: `${baseUrl}/activities/${activity.id}`,
      channelId: config.channelId,
      sound: config.sound,
      icon: config.icon,
      color: config.color
    };
  }

  /**
   * Verificar se está em horário silencioso
   * @param {string} currentTime - Hora atual (HH:MM)
   * @param {string} startTime - Hora de início (HH:MM)
   * @param {string} endTime - Hora de fim (HH:MM)
   * @returns {boolean} Se está em horário silencioso
   */
  static isInQuietHours(currentTime, startTime, endTime) {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Horário silencioso cruza a meia-noite
      return current >= start || current <= end;
    }
  }

  /**
   * Converter tempo para minutos
   * @param {string} time - Tempo no formato HH:MM
   * @returns {number} Minutos desde meia-noite
   */
  static timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Formatar horário para exibição
   * @param {Date} date - Data
   * @returns {string} Horário formatado
   */
  static formatTime(date) {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obter estatísticas de lembretes push
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getPushReminderStats(activityId) {
    try {
      const [
        totalPushReminders,
        sentPushReminders,
        failedPushReminders,
        byReminderType
      ] = await Promise.all([
        prisma.scheduledNotification.count({
          where: {
            type: 'PUSH_REMINDER',
            data: {
              path: ['activityId'],
              equals: activityId
            }
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: 'PUSH_REMINDER',
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'SENT'
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: 'PUSH_REMINDER',
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'FAILED'
          }
        }),
        prisma.scheduledNotification.groupBy({
          by: ['data'],
          where: {
            type: 'PUSH_REMINDER',
            data: {
              path: ['activityId'],
              equals: activityId
            }
          },
          _count: { data: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalPushReminders,
          sentPushReminders,
          failedPushReminders,
          successRate: totalPushReminders > 0 
            ? Math.round((sentPushReminders / totalPushReminders) * 100) 
            : 0,
          byReminderType: byReminderType.map(item => ({
            reminderType: item.data?.reminderType || 'UNKNOWN',
            count: item._count.data
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de lembretes push:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ReminderPushService;
