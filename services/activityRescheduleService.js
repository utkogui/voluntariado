const { PrismaClient } = require('@prisma/client');
const ReminderPushService = require('./reminderPushService');
const EmailTemplateService = require('./emailTemplateService');
const ScheduledNotificationService = require('./scheduledNotificationService');
const ReminderSchedulerService = require('./reminderSchedulerService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de reagendamento de atividades
 */
class ActivityRescheduleService {
  
  /**
   * Solicitar reagendamento de atividade
   * @param {string} activityId - ID da atividade
   * @param {string} rescheduledBy - ID do usuário que está solicitando
   * @param {Object} rescheduleData - Dados do reagendamento
   * @returns {Object} Resultado da operação
   */
  static async requestReschedule(activityId, rescheduledBy, rescheduleData) {
    try {
      const {
        reason,
        reasonCode,
        details,
        newStartDate,
        newEndDate
      } = rescheduleData;

      // Verificar se a atividade existe e pode ser reagendada
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

      // Verificar se a atividade pode ser reagendada
      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade cancelada não pode ser reagendada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade concluída não pode ser reagendada'
        };
      }

      if (activity.status === 'IN_PROGRESS') {
        return {
          success: false,
          error: 'Atividade em andamento não pode ser reagendada'
        };
      }

      // Verificar se o usuário tem permissão para reagendar
      if (activity.createdById !== rescheduledBy) {
        return {
          success: false,
          error: 'Você não tem permissão para reagendar esta atividade'
        };
      }

      // Verificar se já existe uma solicitação de reagendamento pendente
      const existingReschedule = await prisma.activityReschedule.findFirst({
        where: {
          activityId,
          status: 'PENDING'
        }
      });

      if (existingReschedule) {
        return {
          success: false,
          error: 'Já existe uma solicitação de reagendamento pendente para esta atividade'
        };
      }

      // Validar novas datas
      const validationResult = await this.validateRescheduleDates(activity, newStartDate, newEndDate);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Criar backup da atividade antes do reagendamento
      await this.createActivityBackup(activityId, 'BEFORE_RESCHEDULE', {
        activity: activity,
        rescheduleReason: reason,
        rescheduledBy: rescheduledBy,
        newDates: { newStartDate, newEndDate }
      });

      // Criar solicitação de reagendamento
      const reschedule = await prisma.activityReschedule.create({
        data: {
          activityId,
          rescheduledBy,
          reason,
          reasonCode,
          details,
          originalStartDate: activity.startDate,
          originalEndDate: activity.endDate,
          newStartDate: new Date(newStartDate),
          newEndDate: new Date(newEndDate)
        }
      });

      // Se o reagendamento for automático (sem aprovação necessária)
      if (this.isAutoApprovedReschedule(reasonCode)) {
        return await this.approveReschedule(reschedule.id, rescheduledBy);
      }

      // Enviar notificações de solicitação de reagendamento
      await this.sendRescheduleRequestNotifications(activity, reschedule);

      return {
        success: true,
        data: {
          reschedule,
          requiresApproval: !this.isAutoApprovedReschedule(reasonCode)
        }
      };

    } catch (error) {
      console.error('Erro ao solicitar reagendamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aprovar reagendamento
   * @param {string} rescheduleId - ID do reagendamento
   * @param {string} approvedBy - ID do usuário que está aprovando
   * @returns {Object} Resultado da operação
   */
  static async approveReschedule(rescheduleId, approvedBy) {
    try {
      const reschedule = await prisma.activityReschedule.findUnique({
        where: { id: rescheduleId },
        include: {
          activity: {
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
          }
        }
      });

      if (!reschedule) {
        return {
          success: false,
          error: 'Reagendamento não encontrado'
        };
      }

      if (reschedule.status !== 'PENDING') {
        return {
          success: false,
          error: 'Reagendamento já foi processado'
        };
      }

      // Atualizar atividade com novas datas
      const updatedActivity = await prisma.activity.update({
        where: { id: reschedule.activityId },
        data: {
          startDate: reschedule.newStartDate,
          endDate: reschedule.newEndDate,
          status: 'SCHEDULED',
          updatedAt: new Date()
        }
      });

      // Atualizar status do reagendamento
      const updatedReschedule = await prisma.activityReschedule.update({
        where: { id: rescheduleId },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date()
        }
      });

      // Cancelar lembretes antigos
      await this.cancelScheduledReminders(reschedule.activityId);

      // Agendar novos lembretes
      await ReminderSchedulerService.scheduleActivityReminders(
        reschedule.activityId,
        reschedule.rescheduledBy
      );

      // Enviar notificações de reagendamento aprovado
      await this.sendRescheduleApprovalNotifications(reschedule.activity, updatedReschedule);

      return {
        success: true,
        data: {
          reschedule: updatedReschedule,
          activity: updatedActivity
        }
      };

    } catch (error) {
      console.error('Erro ao aprovar reagendamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Rejeitar reagendamento
   * @param {string} rescheduleId - ID do reagendamento
   * @param {string} rejectedBy - ID do usuário que está rejeitando
   * @param {string} rejectionReason - Motivo da rejeição
   * @returns {Object} Resultado da operação
   */
  static async rejectReschedule(rescheduleId, rejectedBy, rejectionReason) {
    try {
      const reschedule = await prisma.activityReschedule.findUnique({
        where: { id: rescheduleId },
        include: {
          activity: {
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
          }
        }
      });

      if (!reschedule) {
        return {
          success: false,
          error: 'Reagendamento não encontrado'
        };
      }

      if (reschedule.status !== 'PENDING') {
        return {
          success: false,
          error: 'Reagendamento já foi processado'
        };
      }

      // Atualizar status do reagendamento
      const updatedReschedule = await prisma.activityReschedule.update({
        where: { id: rescheduleId },
        data: {
          status: 'REJECTED',
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason
        }
      });

      // Enviar notificações de reagendamento rejeitado
      await this.sendRescheduleRejectionNotifications(reschedule.activity, updatedReschedule);

      return {
        success: true,
        data: updatedReschedule
      };

    } catch (error) {
      console.error('Erro ao rejeitar reagendamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validar datas de reagendamento
   * @param {Object} activity - Dados da atividade
   * @param {string} newStartDate - Nova data de início
   * @param {string} newEndDate - Nova data de fim
   * @returns {Object} Resultado da validação
   */
  static async validateRescheduleDates(activity, newStartDate, newEndDate) {
    try {
      const startDate = new Date(newStartDate);
      const endDate = new Date(newEndDate);
      const now = new Date();

      // Verificar se as datas são futuras
      if (startDate <= now) {
        return {
          valid: false,
          error: 'A nova data de início deve ser futura'
        };
      }

      if (endDate <= startDate) {
        return {
          valid: false,
          error: 'A data de fim deve ser posterior à data de início'
        };
      }

      // Verificar se não há conflitos com outras atividades do organizador
      const conflictingActivity = await prisma.activity.findFirst({
        where: {
          createdById: activity.createdById,
          id: { not: activity.id },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } }
              ]
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } }
              ]
            }
          ]
        }
      });

      if (conflictingActivity) {
        return {
          valid: false,
          error: 'Já existe uma atividade agendada neste horário'
        };
      }

      return { valid: true };

    } catch (error) {
      console.error('Erro ao validar datas de reagendamento:', error);
      return {
        valid: false,
        error: 'Erro ao validar datas'
      };
    }
  }

  /**
   * Verificar se reagendamento é aprovado automaticamente
   * @param {string} reasonCode - Código do motivo
   * @returns {boolean} Se é aprovado automaticamente
   */
  static isAutoApprovedReschedule(reasonCode) {
    const autoApprovedReasons = [
      'WEATHER',
      'TECHNICAL_ISSUES',
      'COVID_RESTRICTIONS'
    ];
    return autoApprovedReasons.includes(reasonCode);
  }

  /**
   * Enviar notificações de solicitação de reagendamento
   * @param {Object} activity - Dados da atividade
   * @param {Object} reschedule - Dados do reagendamento
   */
  static async sendRescheduleRequestNotifications(activity, reschedule) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const results = [];

      for (const participant of activity.participants) {
        try {
          // Enviar notificação push
          const pushResult = await ReminderPushService.sendActivityReminderPush(
            participant.userId,
            activity,
            'RESCHEDULE_REQUEST',
            {
              rescheduleId: reschedule.id,
              newStartDate: reschedule.newStartDate,
              newEndDate: reschedule.newEndDate,
              reason: reschedule.reason
            }
          );

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
          changeType: 'RESCHEDULED',
          changeData: {
            rescheduleId: reschedule.id,
            reason: reschedule.reason,
            reasonCode: reschedule.reasonCode,
            originalStartDate: reschedule.originalStartDate,
            originalEndDate: reschedule.originalEndDate,
            newStartDate: reschedule.newStartDate,
            newEndDate: reschedule.newEndDate,
            status: 'PENDING'
          },
          sentTo: results.filter(r => r.success).map(r => r.userId)
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificações de solicitação de reagendamento:', error);
    }
  }

  /**
   * Enviar notificações de reagendamento aprovado
   * @param {Object} activity - Dados da atividade
   * @param {Object} reschedule - Dados do reagendamento
   */
  static async sendRescheduleApprovalNotifications(activity, reschedule) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const results = [];

      for (const participant of activity.participants) {
        try {
          // Enviar notificação push
          const pushResult = await ReminderPushService.sendActivityReminderPush(
            participant.userId,
            activity,
            'RESCHEDULE_APPROVED',
            {
              rescheduleId: reschedule.id,
              newStartDate: reschedule.newStartDate,
              newEndDate: reschedule.newEndDate,
              reason: reschedule.reason
            }
          );

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
          changeType: 'RESCHEDULED',
          changeData: {
            rescheduleId: reschedule.id,
            reason: reschedule.reason,
            reasonCode: reschedule.reasonCode,
            originalStartDate: reschedule.originalStartDate,
            originalEndDate: reschedule.originalEndDate,
            newStartDate: reschedule.newStartDate,
            newEndDate: reschedule.newEndDate,
            status: 'APPROVED',
            approvedAt: reschedule.approvedAt
          },
          sentTo: results.filter(r => r.success).map(r => r.userId)
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificações de reagendamento aprovado:', error);
    }
  }

  /**
   * Enviar notificações de reagendamento rejeitado
   * @param {Object} activity - Dados da atividade
   * @param {Object} reschedule - Dados do reagendamento
   */
  static async sendRescheduleRejectionNotifications(activity, reschedule) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const results = [];

      for (const participant of activity.participants) {
        try {
          // Enviar notificação push
          const pushResult = await ReminderPushService.sendActivityReminderPush(
            participant.userId,
            activity,
            'RESCHEDULE_REJECTED',
            {
              rescheduleId: reschedule.id,
              rejectionReason: reschedule.rejectionReason,
              reason: reschedule.reason
            }
          );

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
          changeType: 'RESCHEDULED',
          changeData: {
            rescheduleId: reschedule.id,
            reason: reschedule.reason,
            reasonCode: reschedule.reasonCode,
            originalStartDate: reschedule.originalStartDate,
            originalEndDate: reschedule.originalEndDate,
            newStartDate: reschedule.newStartDate,
            newEndDate: reschedule.newEndDate,
            status: 'REJECTED',
            rejectionReason: reschedule.rejectionReason,
            rejectedAt: reschedule.rejectedAt
          },
          sentTo: results.filter(r => r.success).map(r => r.userId)
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificações de reagendamento rejeitado:', error);
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
   * Obter histórico de reagendamentos
   * @param {string} activityId - ID da atividade
   * @returns {Object} Histórico de reagendamentos
   */
  static async getRescheduleHistory(activityId) {
    try {
      const reschedules = await prisma.activityReschedule.findMany({
        where: { activityId },
        include: {
          rescheduledByUser: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          },
          approvedByUser: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          },
          rejectedByUser: {
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
        data: reschedules
      };

    } catch (error) {
      console.error('Erro ao obter histórico de reagendamentos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de reagendamentos
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Estatísticas
   */
  static async getRescheduleStats(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        reasonCode,
        status
      } = filters;

      const whereClause = {
        rescheduledBy: userId
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      if (reasonCode) {
        whereClause.reasonCode = reasonCode;
      }

      if (status) {
        whereClause.status = status;
      }

      const [
        totalReschedules,
        byReason,
        byStatus,
        recentReschedules
      ] = await Promise.all([
        prisma.activityReschedule.count({ where: whereClause }),
        prisma.activityReschedule.groupBy({
          by: ['reasonCode'],
          where: whereClause,
          _count: { reasonCode: true }
        }),
        prisma.activityReschedule.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true }
        }),
        prisma.activityReschedule.findMany({
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
          totalReschedules,
          byReason: byReason.map(item => ({
            reason: item.reasonCode,
            count: item._count.reasonCode
          })),
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          recentReschedules
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de reagendamentos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ActivityRescheduleService;
