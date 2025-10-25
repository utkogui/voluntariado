const { PrismaClient } = require('@prisma/client');
const ScheduledNotificationService = require('./scheduledNotificationService');
const PushNotificationService = require('./pushNotificationService');
const NotificationPreferencesService = require('./notificationPreferencesService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();
const pushService = new PushNotificationService();

/**
 * Serviço de lembretes de atividades
 */
class ActivityReminderService {
  
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
          title: 'Lembrete: Atividade amanhã',
          message: `A atividade "${activity.title}" acontece amanhã às ${activity.startDate.toLocaleTimeString()}`,
          type: 'ACTIVITY_REMINDER_24H'
        },
        {
          hours: 2,
          title: 'Lembrete: Atividade em 2 horas',
          message: `A atividade "${activity.title}" começa em 2 horas`,
          type: 'ACTIVITY_REMINDER_2H'
        },
        {
          hours: 0.5,
          title: 'Lembrete: Atividade em 30 minutos',
          message: `A atividade "${activity.title}" começa em 30 minutos`,
          type: 'ACTIVITY_REMINDER_30MIN'
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
              const result = await scheduledService.scheduleNotificationWithTemplate(
                participant.userId,
                'VOLUNTEER_ACTIVITY',
                {
                  activity: {
                    id: activity.id,
                    title: activity.title,
                    date: activity.startDate,
                    location: activity.address || 'Online',
                    meetingUrl: activity.meetingUrl
                  },
                  reminder: {
                    title: reminder.title,
                    message: reminder.message,
                    hoursBefore: reminder.hours
                  }
                },
                reminderDate
              );

              results.push({
                userId: participant.userId,
                reminderType: reminder.type,
                success: result.success,
                error: result.error
              });
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
   * Enviar lembrete de confirmação de presença
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async sendConfirmationReminder(activityId, userId) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          createdBy: {
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
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Verificar se o usuário está inscrito
      const participant = await prisma.activityParticipant.findFirst({
        where: {
          activityId,
          userId
        }
      });

      if (!participant) {
        return {
          success: false,
          error: 'Usuário não está inscrito nesta atividade'
        };
      }

      // Verificar se já confirmou
      const confirmation = await prisma.activityConfirmation.findFirst({
        where: {
          activityId,
          userId,
          status: { in: ['CONFIRMED', 'DECLINED'] }
        }
      });

      if (confirmation) {
        return {
          success: false,
          error: 'Usuário já confirmou presença'
        };
      }

      // Enviar lembrete
      const result = await scheduledService.scheduleNotificationWithTemplate(
        userId,
        'REMINDER',
        {
          reminder: {
            id: `confirmation_${activityId}_${userId}`,
            title: 'Confirmação de Presença Pendente',
            message: `Por favor, confirme sua presença na atividade "${activity.title}" que acontece em ${activity.startDate.toLocaleDateString()}`,
            actionUrl: `/activities/${activityId}/confirm`
          }
        },
        new Date() // Enviar imediatamente
      );

      return result;

    } catch (error) {
      console.error('Erro ao enviar lembrete de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembretes em massa para confirmação
   * @param {string} activityId - ID da atividade
   * @param {string} organizerId - ID do organizador
   * @returns {Object} Resultado da operação
   */
  static async sendBulkConfirmationReminders(activityId, organizerId) {
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
          },
          confirmations: {
            where: {
              status: { in: ['PENDING', 'MAYBE'] }
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

      // Buscar participantes que ainda não confirmaram
      const pendingParticipants = activity.participants.filter(participant => {
        const hasConfirmation = activity.confirmations.some(
          conf => conf.userId === participant.userId
        );
        return !hasConfirmation;
      });

      const results = [];

      for (const participant of pendingParticipants) {
        try {
          const result = await this.sendConfirmationReminder(activityId, participant.userId);
          results.push({
            userId: participant.userId,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            userId: participant.userId,
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
   * Agendar lembrete personalizado
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Date} reminderDate - Data do lembrete
   * @param {string} title - Título do lembrete
   * @param {string} message - Mensagem do lembrete
   * @returns {Object} Resultado da operação
   */
  static async scheduleCustomReminder(activityId, userId, reminderDate, title, message) {
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

      // Verificar se o usuário está inscrito
      const participant = await prisma.activityParticipant.findFirst({
        where: {
          activityId,
          userId
        }
      });

      if (!participant) {
        return {
          success: false,
          error: 'Usuário não está inscrito nesta atividade'
        };
      }

      // Agendar lembrete
      const result = await scheduledService.scheduleNotificationWithTemplate(
        userId,
        'REMINDER',
        {
          reminder: {
            id: `custom_${activityId}_${userId}_${Date.now()}`,
            title,
            message,
            actionUrl: `/activities/${activityId}`
          }
        },
        reminderDate
      );

      return result;

    } catch (error) {
      console.error('Erro ao agendar lembrete personalizado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar lembretes de uma atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Resultado da operação
   */
  static async cancelActivityReminders(activityId, userId = null) {
    try {
      const where = {
        type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
        data: {
          path: ['activity', 'id'],
          equals: activityId
        }
      };

      if (userId) {
        where.userId = userId;
      }

      // Buscar notificações agendadas
      const scheduledNotifications = await prisma.scheduledNotification.findMany({
        where
      });

      // Cancelar notificações
      const results = [];
      for (const notification of scheduledNotifications) {
        try {
          await prisma.scheduledNotification.update({
            where: { id: notification.id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date()
            }
          });

          results.push({
            notificationId: notification.id,
            success: true
          });
        } catch (error) {
          results.push({
            notificationId: notification.id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: {
          totalCancelled: results.filter(r => r.success).length,
          totalFailed: results.filter(r => !r.success).length,
          results
        }
      };

    } catch (error) {
      console.error('Erro ao cancelar lembretes da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter lembretes agendados de uma atividade
   * @param {string} activityId - ID da atividade
   * @returns {Object} Lista de lembretes
   */
  static async getActivityReminders(activityId) {
    try {
      const reminders = await prisma.scheduledNotification.findMany({
        where: {
          type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
          data: {
            path: ['activity', 'id'],
            equals: activityId
          },
          status: { in: ['SCHEDULED', 'PROCESSING'] }
        },
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
        },
        orderBy: { scheduledFor: 'asc' }
      });

      return {
        success: true,
        data: reminders
      };

    } catch (error) {
      console.error('Erro ao buscar lembretes da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
        cancelledReminders,
        byType
      ] = await Promise.all([
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
            data: {
              path: ['activity', 'id'],
              equals: activityId
            }
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
            data: {
              path: ['activity', 'id'],
              equals: activityId
            },
            status: 'SENT'
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
            data: {
              path: ['activity', 'id'],
              equals: activityId
            },
            status: 'SCHEDULED'
          }
        }),
        prisma.scheduledNotification.count({
          where: {
            type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
            data: {
              path: ['activity', 'id'],
              equals: activityId
            },
            status: 'CANCELLED'
          }
        }),
        prisma.scheduledNotification.groupBy({
          by: ['type'],
          where: {
            type: { in: ['VOLUNTEER_ACTIVITY', 'REMINDER'] },
            data: {
              path: ['activity', 'id'],
              equals: activityId
            }
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
          cancelledReminders,
          byType: byType.map(item => ({
            type: item.type,
            count: item._count.type
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

module.exports = ActivityReminderService;
