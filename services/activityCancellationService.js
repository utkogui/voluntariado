const { PrismaClient } = require('@prisma/client');
const ReminderPushService = require('./reminderPushService');
const EmailTemplateService = require('./emailTemplateService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de cancelamento de atividades
 */
class ActivityCancellationService {
  
  /**
   * Cancelar atividade
   * @param {string} activityId - ID da atividade
   * @param {string} cancelledBy - ID do usuário que está cancelando
   * @param {Object} cancellationData - Dados do cancelamento
   * @returns {Object} Resultado da operação
   */
  static async cancelActivity(activityId, cancelledBy, cancellationData) {
    try {
      const {
        reason,
        reasonCode,
        details,
        refundRequired = false,
        refundAmount = 0
      } = cancellationData;

      // Verificar se a atividade existe e pode ser cancelada
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

      // Verificar se a atividade pode ser cancelada
      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade já foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade já foi concluída e não pode ser cancelada'
        };
      }

      // Verificar se o usuário tem permissão para cancelar
      if (activity.createdById !== cancelledBy) {
        return {
          success: false,
          error: 'Você não tem permissão para cancelar esta atividade'
        };
      }

      // Criar backup da atividade antes do cancelamento
      await this.createActivityBackup(activityId, 'BEFORE_CANCELLATION', {
        activity: activity,
        cancellationReason: reason,
        cancelledBy: cancelledBy
      });

      // Cancelar a atividade
      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      // Criar registro de cancelamento
      const cancellation = await prisma.activityCancellation.create({
        data: {
          activityId,
          cancelledBy,
          reason,
          reasonCode,
          details,
          refundRequired,
          refundAmount: refundRequired ? refundAmount : null,
          refundStatus: refundRequired ? 'PENDING' : null
        }
      });

      // Enviar notificações de cancelamento
      await this.sendCancellationNotifications(activity, cancellation);

      // Cancelar lembretes agendados
      await this.cancelScheduledReminders(activityId);

      return {
        success: true,
        data: {
          activity: updatedActivity,
          cancellation,
          participantsNotified: activity.participants.length
        }
      };

    } catch (error) {
      console.error('Erro ao cancelar atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificações de cancelamento
   * @param {Object} activity - Dados da atividade
   * @param {Object} cancellation - Dados do cancelamento
   */
  static async sendCancellationNotifications(activity, cancellation) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const results = [];

      for (const participant of activity.participants) {
        try {
          // Enviar notificação push
          const pushResult = await ReminderPushService.sendCancellationReminderPush(
            participant.userId,
            activity,
            cancellation.reason
          );

          // Enviar email
          const templateData = EmailTemplateService.prepareTemplateData(
            activity,
            participant.user,
            baseUrl
          );
          
          templateData.activity.cancellationReason = cancellation.reason;
          templateData.activity.cancellationDetails = cancellation.details;

          const template = EmailTemplateService.getTemplateByType('ACTIVITY_CANCELLED');
          if (template) {
            const processedTemplate = EmailTemplateService.processTemplate(template, templateData);
            
            await scheduledService.scheduleNotification({
              userId: participant.userId,
              type: 'EMAIL_CANCELLATION',
              title: processedTemplate.subject,
              body: processedTemplate.text,
              scheduledFor: new Date(),
              data: {
                template: processedTemplate,
                activityId: activity.id,
                cancellationId: cancellation.id
              },
              priority: 'HIGH'
            });
          }

          results.push({
            userId: participant.userId,
            success: true
          });

        } catch (error) {
          results.push({
            userId: participant.userId,
            success: false,
            error: error.message
          });
        }
      }

      // Registrar notificação de mudança
      await prisma.activityChangeNotification.create({
        data: {
          activityId: activity.id,
          changeType: 'CANCELLED',
          changeData: {
            cancellationId: cancellation.id,
            reason: cancellation.reason,
            reasonCode: cancellation.reasonCode,
            details: cancellation.details,
            cancelledAt: cancellation.createdAt
          },
          sentTo: results.filter(r => r.success).map(r => r.userId)
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificações de cancelamento:', error);
    }
  }

  /**
   * Cancelar lembretes agendados
   * @param {string} activityId - ID da atividade
   */
  static async cancelScheduledReminders(activityId) {
    try {
      await prisma.scheduledNotification.updateMany({
        where: {
          type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
          data: {
            path: ['activityId'],
            equals: activityId
          },
          status: 'SCHEDULED'
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao cancelar lembretes agendados:', error);
    }
  }

  /**
   * Criar backup da atividade
   * @param {string} activityId - ID da atividade
   * @param {string} backupType - Tipo do backup
   * @param {Object} backupData - Dados do backup
   */
  static async createActivityBackup(activityId, backupType, backupData) {
    try {
      await prisma.activityBackup.create({
        data: {
          activityId,
          backupType,
          backupData,
          reason: `Backup antes de ${backupType.toLowerCase().replace('_', ' ')}`
        }
      });
    } catch (error) {
      console.error('Erro ao criar backup da atividade:', error);
    }
  }

  /**
   * Obter histórico de cancelamentos
   * @param {string} activityId - ID da atividade
   * @returns {Object} Histórico de cancelamentos
   */
  static async getCancellationHistory(activityId) {
    try {
      const cancellations = await prisma.activityCancellation.findMany({
        where: { activityId },
        include: {
          cancelledByUser: {
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
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: cancellations
      };

    } catch (error) {
      console.error('Erro ao obter histórico de cancelamentos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de cancelamentos
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Estatísticas
   */
  static async getCancellationStats(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        reasonCode,
        refundRequired
      } = filters;

      const whereClause = {
        cancelledBy: userId
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      if (reasonCode) {
        whereClause.reasonCode = reasonCode;
      }

      if (refundRequired !== undefined) {
        whereClause.refundRequired = refundRequired;
      }

      const [
        totalCancellations,
        byReason,
        byRefundStatus,
        recentCancellations
      ] = await Promise.all([
        prisma.activityCancellation.count({ where: whereClause }),
        prisma.activityCancellation.groupBy({
          by: ['reasonCode'],
          where: whereClause,
          _count: { reasonCode: true }
        }),
        prisma.activityCancellation.groupBy({
          by: ['refundStatus'],
          where: whereClause,
          _count: { refundStatus: true }
        }),
        prisma.activityCancellation.findMany({
          where: whereClause,
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return {
        success: true,
        data: {
          totalCancellations,
          byReason: byReason.map(item => ({
            reason: item.reasonCode,
            count: item._count.reasonCode
          })),
          byRefundStatus: byRefundStatus.map(item => ({
            status: item.refundStatus,
            count: item._count.refundStatus
          })),
          recentCancellations
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de cancelamentos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar reembolso
   * @param {string} cancellationId - ID do cancelamento
   * @param {string} processedBy - ID do usuário que está processando
   * @param {Object} refundData - Dados do reembolso
   * @returns {Object} Resultado da operação
   */
  static async processRefund(cancellationId, processedBy, refundData) {
    try {
      const { status, amount, notes } = refundData;

      const cancellation = await prisma.activityCancellation.findUnique({
        where: { id: cancellationId },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              createdById: true
            }
          }
        }
      });

      if (!cancellation) {
        return {
          success: false,
          error: 'Cancelamento não encontrado'
        };
      }

      if (!cancellation.refundRequired) {
        return {
          success: false,
          error: 'Este cancelamento não requer reembolso'
        };
      }

      // Verificar permissão
      if (cancellation.activity.createdById !== processedBy) {
        return {
          success: false,
          error: 'Você não tem permissão para processar este reembolso'
        };
      }

      const updatedCancellation = await prisma.activityCancellation.update({
        where: { id: cancellationId },
        data: {
          refundStatus: status,
          refundAmount: amount || cancellation.refundAmount,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedCancellation
      };

    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restaurar atividade cancelada
   * @param {string} activityId - ID da atividade
   * @param {string} restoredBy - ID do usuário que está restaurando
   * @param {string} reason - Motivo da restauração
   * @returns {Object} Resultado da operação
   */
  static async restoreCancelledActivity(activityId, restoredBy, reason) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          cancellations: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status !== 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade não está cancelada'
        };
      }

      // Verificar se a data da atividade ainda é futura
      if (new Date(activity.startDate) < new Date()) {
        return {
          success: false,
          error: 'Não é possível restaurar atividade que já passou'
        };
      }

      // Restaurar atividade
      const restoredActivity = await prisma.activity.update({
        where: { id: activityId },
        data: {
          status: 'SCHEDULED',
          updatedAt: new Date()
        }
      });

      // Registrar restauração
      await prisma.activityChangeNotification.create({
        data: {
          activityId,
          changeType: 'RESCHEDULED',
          changeData: {
            restoredBy,
            reason,
            restoredAt: new Date(),
            previousStatus: 'CANCELLED'
          },
          sentTo: []
        }
      });

      return {
        success: true,
        data: restoredActivity
      };

    } catch (error) {
      console.error('Erro ao restaurar atividade cancelada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ActivityCancellationService;
