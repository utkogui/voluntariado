const { PrismaClient } = require('@prisma/client');
const ReminderSchedulerService = require('./reminderSchedulerService');
const EmailTemplateService = require('./emailTemplateService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de confirmação de presença
 */
class AttendanceConfirmationService {
  
  /**
   * Confirmar presença na atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} confirmationData - Dados da confirmação
   * @returns {Object} Resultado da operação
   */
  static async confirmAttendance(activityId, userId, confirmationData = {}) {
    try {
      const { notes } = confirmationData;

      // Verificar se a atividade existe e está ativa
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade já foi concluída'
        };
      }

      // Verificar se o usuário é participante da atividade
      if (activity.participants.length === 0) {
        return {
          success: false,
          error: 'Você não é participante desta atividade'
        };
      }

      // Verificar se a data da atividade ainda é futura
      if (new Date(activity.startDate) < new Date()) {
        return {
          success: false,
          error: 'Não é possível confirmar presença em atividade que já passou'
        };
      }

      // Criar ou atualizar confirmação
      const confirmation = await prisma.attendanceConfirmation.upsert({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        update: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          notes
        },
        create: {
          activityId,
          userId,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          notes
        }
      });

      // Atualizar contador de participantes confirmados
      await this.updateConfirmedParticipantsCount(activityId);

      return {
        success: true,
        data: confirmation
      };

    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Declinar presença na atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} declineData - Dados da declinação
   * @returns {Object} Resultado da operação
   */
  static async declineAttendance(activityId, userId, declineData = {}) {
    try {
      const { notes } = declineData;

      // Verificar se a atividade existe e está ativa
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade já foi concluída'
        };
      }

      // Verificar se o usuário é participante da atividade
      if (activity.participants.length === 0) {
        return {
          success: false,
          error: 'Você não é participante desta atividade'
        };
      }

      // Criar ou atualizar confirmação
      const confirmation = await prisma.attendanceConfirmation.upsert({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        update: {
          status: 'DECLINED',
          declinedAt: new Date(),
          notes
        },
        create: {
          activityId,
          userId,
          status: 'DECLINED',
          declinedAt: new Date(),
          notes
        }
      });

      // Atualizar contador de participantes confirmados
      await this.updateConfirmedParticipantsCount(activityId);

      return {
        success: true,
        data: confirmation
      };

    } catch (error) {
      console.error('Erro ao declinar presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar como "talvez" na atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} maybeData - Dados do "talvez"
   * @returns {Object} Resultado da operação
   */
  static async maybeAttendance(activityId, userId, maybeData = {}) {
    try {
      const { notes } = maybeData;

      // Verificar se a atividade existe e está ativa
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade já foi concluída'
        };
      }

      // Verificar se o usuário é participante da atividade
      if (activity.participants.length === 0) {
        return {
          success: false,
          error: 'Você não é participante desta atividade'
        };
      }

      // Criar ou atualizar confirmação
      const confirmation = await prisma.attendanceConfirmation.upsert({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        update: {
          status: 'MAYBE',
          notes
        },
        create: {
          activityId,
          userId,
          status: 'MAYBE',
          notes
        }
      });

      return {
        success: true,
        data: confirmation
      };

    } catch (error) {
      console.error('Erro ao marcar como talvez:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter confirmações de presença da atividade
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @returns {Object} Confirmações
   */
  static async getActivityConfirmations(activityId, filters = {}) {
    try {
      const {
        status,
        includeUserDetails = true
      } = filters;

      const whereClause = { activityId };
      if (status) {
        whereClause.status = status;
      }

      const confirmations = await prisma.attendanceConfirmation.findMany({
        where: whereClause,
        include: {
          user: includeUserDetails ? {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: confirmations
      };

    } catch (error) {
      console.error('Erro ao obter confirmações de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter confirmações de presença do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Confirmações
   */
  static async getUserConfirmations(userId, filters = {}) {
    try {
      const {
        status,
        activityStatus,
        startDate,
        endDate,
        includeActivityDetails = true
      } = filters;

      const whereClause = { userId };
      if (status) {
        whereClause.status = status;
      }

      if (startDate || endDate || activityStatus) {
        whereClause.activity = {};
        if (startDate) whereClause.activity.startDate = { gte: new Date(startDate) };
        if (endDate) whereClause.activity.startDate = { lte: new Date(endDate) };
        if (activityStatus) whereClause.activity.status = activityStatus;
      }

      const confirmations = await prisma.attendanceConfirmation.findMany({
        where: whereClause,
        include: {
          activity: includeActivityDetails ? {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              status: true,
              address: true,
              city: true,
              state: true,
              isOnline: true,
              meetingUrl: true
            }
          } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: confirmations
      };

    } catch (error) {
      console.error('Erro ao obter confirmações do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembretes de confirmação
   * @param {string} activityId - ID da atividade
   * @param {Array} userIds - IDs dos usuários (opcional)
   * @returns {Object} Resultado da operação
   */
  static async sendConfirmationReminders(activityId, userIds = []) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: userIds.length > 0 ? { userId: { in: userIds } } : {},
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

      const results = [];

      for (const participant of activity.participants) {
        try {
          // Verificar se já tem confirmação
          const existingConfirmation = await prisma.attendanceConfirmation.findUnique({
            where: {
              activityId_userId: {
                activityId,
                userId: participant.userId
              }
            }
          });

          if (existingConfirmation && existingConfirmation.status !== 'PENDING') {
            results.push({
              userId: participant.userId,
              success: false,
              reason: 'Já confirmado'
            });
            continue;
          }

          // Enviar lembrete de confirmação
          const reminderResult = await ReminderSchedulerService.sendConfirmationReminder(
            activityId,
            participant.userId
          );

          if (reminderResult.success) {
            // Marcar que o lembrete foi enviado
            await prisma.attendanceConfirmation.upsert({
              where: {
                activityId_userId: {
                  activityId,
                  userId: participant.userId
                }
              },
              update: {
                reminderSent: true,
                reminderSentAt: new Date()
              },
              create: {
                activityId,
                userId,
                status: 'PENDING',
                reminderSent: true,
                reminderSentAt: new Date()
              }
            });

            results.push({
              userId: participant.userId,
              success: true
            });
          } else {
            results.push({
              userId: participant.userId,
              success: false,
              error: reminderResult.error
            });
          }

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
      console.error('Erro ao enviar lembretes de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar contador de participantes confirmados
   * @param {string} activityId - ID da atividade
   */
  static async updateConfirmedParticipantsCount(activityId) {
    try {
      const confirmedCount = await prisma.attendanceConfirmation.count({
        where: {
          activityId,
          status: 'CONFIRMED'
        }
      });

      await prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: confirmedCount
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar contador de participantes confirmados:', error);
    }
  }

  /**
   * Obter estatísticas de confirmações
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getConfirmationStats(activityId) {
    try {
      const [
        totalConfirmations,
        byStatus,
        confirmedCount,
        pendingCount,
        declinedCount,
        maybeCount
      ] = await Promise.all([
        prisma.attendanceConfirmation.count({
          where: { activityId }
        }),
        prisma.attendanceConfirmation.groupBy({
          by: ['status'],
          where: { activityId },
          _count: { status: true }
        }),
        prisma.attendanceConfirmation.count({
          where: { activityId, status: 'CONFIRMED' }
        }),
        prisma.attendanceConfirmation.count({
          where: { activityId, status: 'PENDING' }
        }),
        prisma.attendanceConfirmation.count({
          where: { activityId, status: 'DECLINED' }
        }),
        prisma.attendanceConfirmation.count({
          where: { activityId, status: 'MAYBE' }
        })
      ]);

      return {
        success: true,
        data: {
          totalConfirmations,
          confirmedCount,
          pendingCount,
          declinedCount,
          maybeCount,
          confirmationRate: totalConfirmations > 0 
            ? Math.round((confirmedCount / totalConfirmations) * 100) 
            : 0,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de confirmações:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AttendanceConfirmationService;
