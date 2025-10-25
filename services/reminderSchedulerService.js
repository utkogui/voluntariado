const { PrismaClient } = require('@prisma/client');
const EmailTemplateService = require('./emailTemplateService');
const PushNotificationService = require('./pushNotificationService');
const NotificationPreferencesService = require('./notificationPreferencesService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const pushService = new PushNotificationService();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de agendamento de lembretes
 */
class ReminderSchedulerService {
  
  /**
   * Agendar lembretes automáticos para atividade
   * @param {string} activityId - ID da atividade
   * @param {string} organizerId - ID do organizador
   * @returns {Object} Resultado da operação
   */
  static async scheduleActivityReminders(activityId, organizerId) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      const reminders = [
        {
          hours: 24,
          type: 'ACTIVITY_REMINDER_24H',
          title: 'Lembrete: Atividade amanhã',
          message: `A atividade "${activity.title}" acontece amanhã`
        },
        {
          hours: 2,
          type: 'ACTIVITY_REMINDER_2H',
          title: 'Lembrete: Atividade em 2 horas',
          message: `A atividade "${activity.title}" começa em 2 horas`
        },
        {
          hours: 0.5,
          type: 'ACTIVITY_REMINDER_30MIN',
          title: 'Lembrete: Atividade em 30 minutos',
          message: `A atividade "${activity.title}" começa em 30 minutos`
        }
      ];

      const results = [];

      for (const reminder of reminders) {
        const reminderDate = new Date(activity.startDate);
        reminderDate.setHours(reminderDate.getHours() - reminder.hours);

        if (reminderDate > new Date()) {
          // Agendar para cada participante
          for (const participant of activity.participants) {
            try {
              // Verificar preferências do usuário
              const shouldSend = await this.shouldSendReminder(
                participant.userId,
                reminder.type,
                { activity, user: participant.user }
              );

              if (shouldSend.shouldSend) {
                // Agendar email
                if (shouldSend.channels.includes('email')) {
                  await this.scheduleEmailReminder(
                    participant.userId,
                    activity,
                    reminder,
                    reminderDate
                  );
                }

                // Agendar push notification
                if (shouldSend.channels.includes('push')) {
                  await this.schedulePushReminder(
                    participant.userId,
                    activity,
                    reminder,
                    reminderDate
                  );
                }

                results.push({
                  userId: participant.userId,
                  reminderType: reminder.type,
                  success: true
                });
              } else {
                results.push({
                  userId: participant.userId,
                  reminderType: reminder.type,
                  success: false,
                  reason: shouldSend.reason
                });
              }
            } catch (error) {
              results.push({
                userId: participant.userId,
                reminderType: reminder.type,
                success: false,
                error: error.message
              });
            }
          }
        }
      }

      return {
        success: true,
        data: {
          totalScheduled: results.filter(r => r.success).length,
          totalFailed: results.filter(r => !r.success).length,
          results
        }
      };

    } catch (error) {
      console.error('Erro ao agendar lembretes da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar se deve enviar lembrete
   * @param {string} userId - ID do usuário
   * @param {string} reminderType - Tipo do lembrete
   * @param {Object} data - Dados do lembrete
   * @returns {Object} Resultado da verificação
   */
  static async shouldSendReminder(userId, reminderType, data) {
    try {
      // Verificar preferências de notificação
      const preferencesResult = await NotificationPreferencesService.getUserPreferences(userId);
      
      if (!preferencesResult.success) {
        return {
          shouldSend: false,
          reason: 'Erro ao obter preferências',
          channels: []
        };
      }

      const preferences = preferencesResult.data;

      // Verificar se o tipo de lembrete está habilitado
      const reminderSettings = preferences.types[reminderType] || preferences.types['REMINDER'];
      
      if (!reminderSettings || !reminderSettings.enabled) {
        return {
          shouldSend: false,
          reason: 'Tipo de lembrete desabilitado',
          channels: []
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
            reason: 'Horário silencioso ativo',
            channels: []
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
            reason: 'Limite diário de notificações atingido',
            channels: []
          };
        }
      }

      return {
        shouldSend: true,
        channels: reminderSettings.channels || ['email', 'push'],
        frequency: reminderSettings.frequency || 'IMMEDIATE'
      };

    } catch (error) {
      console.error('Erro ao verificar se deve enviar lembrete:', error);
      return {
        shouldSend: false,
        reason: 'Erro interno',
        channels: []
      };
    }
  }

  /**
   * Agendar lembrete por email
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {Object} reminder - Dados do lembrete
   * @param {Date} reminderDate - Data do lembrete
   */
  static async scheduleEmailReminder(userId, activity, reminder, reminderDate) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          volunteer: { select: { firstName: true, lastName: true } },
          institution: { select: { name: true } },
          company: { select: { name: true } },
          university: { select: { name: true } }
        }
      });

      if (!user) return;

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const templateData = EmailTemplateService.prepareTemplateData(activity, user, baseUrl);
      const template = EmailTemplateService.getTemplateByType(reminder.type);
      
      if (!template) return;

      const processedTemplate = EmailTemplateService.processTemplate(template, templateData);

      // Agendar email
      await scheduledService.scheduleNotification({
        userId,
        type: 'EMAIL_REMINDER',
        title: processedTemplate.subject,
        body: processedTemplate.text,
        scheduledFor: reminderDate,
        data: {
          template: processedTemplate,
          activityId: activity.id,
          reminderType: reminder.type
        },
        priority: 'NORMAL'
      });

    } catch (error) {
      console.error('Erro ao agendar lembrete por email:', error);
    }
  }

  /**
   * Agendar lembrete por push notification
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {Object} reminder - Dados do lembrete
   * @param {Date} reminderDate - Data do lembrete
   */
  static async schedulePushReminder(userId, activity, reminder, reminderDate) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const notification = {
        title: reminder.title,
        body: reminder.message,
        type: 'ACTIVITY_REMINDER',
        data: {
          activityId: activity.id,
          reminderType: reminder.type,
          startDate: activity.startDate,
          location: activity.address || 'Online'
        },
        clickAction: `${baseUrl}/activities/${activity.id}`,
        channelId: 'activity_reminders',
        sound: 'reminder_notification.wav'
      };

      // Agendar push notification
      await scheduledService.scheduleNotification({
        userId,
        type: 'PUSH_REMINDER',
        title: notification.title,
        body: notification.body,
        scheduledFor: reminderDate,
        data: notification.data,
        priority: 'NORMAL'
      });

    } catch (error) {
      console.error('Erro ao agendar lembrete por push:', error);
    }
  }

  /**
   * Enviar lembrete de confirmação
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async sendConfirmationReminder(activityId, userId) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          volunteer: { select: { firstName: true, lastName: true } },
          institution: { select: { name: true } },
          company: { select: { name: true } },
          university: { select: { name: true } }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Verificar se deve enviar
      const shouldSend = await this.shouldSendReminder(userId, 'CONFIRMATION_REMINDER', { activity, user });
      
      if (!shouldSend.shouldSend) {
        return {
          success: false,
          error: shouldSend.reason
        };
      }

      const results = [];

      // Enviar email
      if (shouldSend.channels.includes('email')) {
        try {
          const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const templateData = EmailTemplateService.prepareTemplateData(activity, user, baseUrl);
          const template = EmailTemplateService.getTemplateByType('CONFIRMATION_REMINDER');
          
          if (template) {
            const processedTemplate = EmailTemplateService.processTemplate(template, templateData);
            
            // Enviar email imediatamente
            await scheduledService.scheduleNotification({
              userId,
              type: 'EMAIL_REMINDER',
              title: processedTemplate.subject,
              body: processedTemplate.text,
              scheduledFor: new Date(),
              data: {
                template: processedTemplate,
                activityId: activity.id,
                reminderType: 'CONFIRMATION_REMINDER'
              },
              priority: 'NORMAL'
            });

            results.push({ channel: 'email', success: true });
          }
        } catch (error) {
          results.push({ channel: 'email', success: false, error: error.message });
        }
      }

      // Enviar push notification
      if (shouldSend.channels.includes('push')) {
        try {
          const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          
          const notification = {
            title: 'Confirmação de Presença Pendente',
            body: `Por favor, confirme sua presença na atividade "${activity.title}"`,
            type: 'CONFIRMATION_REMINDER',
            data: {
              activityId: activity.id,
              startDate: activity.startDate,
              location: activity.address || 'Online'
            },
            clickAction: `${baseUrl}/activities/${activity.id}/confirm`,
            channelId: 'confirmations',
            sound: 'confirmation_reminder.wav'
          };

          await pushService.sendToUser(userId, notification);
          results.push({ channel: 'push', success: true });
        } catch (error) {
          results.push({ channel: 'push', success: false, error: error.message });
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
      console.error('Erro ao enviar lembrete de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
   * Obter estatísticas de lembretes
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getReminderStats(activityId) {
    try {
      const [
        totalReminders,
        sentReminders,
        pendingReminders,
        failedReminders,
        byType,
        byChannel
      ] = await Promise.all([
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            }
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'SENT'
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'SCHEDULED'
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'FAILED'
          }
        }),
        prisma.scheduledNotification.groupBy({
          by: ['type'],
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            }
          },
          _count: { type: true }
        }),
        prisma.scheduledNotification.groupBy({
          by: ['type'],
          where: {
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            data: {
              path: ['activityId'],
              equals: activityId
            },
            status: 'SENT'
          },
          _count: { type: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalReminders,
          sentReminders,
          pendingReminders,
          failedReminders,
          byType: byType.map(item => ({
            type: item.type,
            count: item._count.type
          })),
          byChannel: byChannel.map(item => ({
            channel: item.type,
            sentCount: item._count.type
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de lembretes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ReminderSchedulerService;
