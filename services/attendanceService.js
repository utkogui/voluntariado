const { PrismaClient } = require('@prisma/client');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de confirmação de presença
 */
class AttendanceService {
  
  /**
   * Obter confirmações de uma atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Lista de confirmações
   */
  static async getActivityConfirmations(activityId, userId = null) {
    try {
      const where = { activityId };
      
      // Se userId for fornecido, filtrar apenas suas confirmações
      if (userId) {
        where.userId = userId;
      }

      const confirmations = await prisma.activityConfirmation.findMany({
        where,
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
          },
          activity: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true
            }
          }
        },
        orderBy: { confirmedAt: 'desc' }
      });

      return {
        success: true,
        data: confirmations
      };

    } catch (error) {
      console.error('Erro ao buscar confirmações da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter confirmações de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de confirmações
   */
  static async getUserConfirmations(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        fromDate,
        toDate
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = { userId };
      if (status) where.status = status;
      if (fromDate && toDate) {
        where.activity = {
          startDate: {
            gte: new Date(fromDate),
            lte: new Date(toDate)
          }
        };
      }

      const [confirmations, total] = await Promise.all([
        prisma.activityConfirmation.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { confirmedAt: 'desc' },
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                startDate: true,
                endDate: true,
                address: true,
                city: true,
                isOnline: true,
                meetingUrl: true,
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
            }
          }
        }),
        prisma.activityConfirmation.count({ where })
      ]);

      return {
        success: true,
        data: confirmations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar confirmações do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar status de confirmação
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {string} status - Novo status
   * @param {string} notes - Observações
   * @returns {Object} Resultado da operação
   */
  static async updateConfirmationStatus(activityId, userId, status, notes = null) {
    try {
      const confirmation = await prisma.activityConfirmation.upsert({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        update: {
          status,
          confirmedAt: status === 'CONFIRMED' ? new Date() : null,
          notes
        },
        create: {
          activityId,
          userId,
          status,
          confirmedAt: status === 'CONFIRMED' ? new Date() : null,
          notes
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
          },
          activity: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true
            }
          }
        }
      });

      return {
        success: true,
        data: confirmation
      };

    } catch (error) {
      console.error('Erro ao atualizar status de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar lembretes de confirmação
   * @param {string} activityId - ID da atividade
   * @param {string} organizerId - ID do organizador
   * @returns {Object} Resultado da operação
   */
  static async sendConfirmationReminders(activityId, organizerId) {
    try {
      // Buscar atividade
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

      // Enviar lembretes
      const results = [];
      for (const participant of pendingParticipants) {
        try {
          await scheduledService.scheduleNotificationWithTemplate(
            participant.userId,
            'REMINDER',
            {
              reminder: {
                id: `confirmation_${activityId}_${participant.userId}`,
                title: 'Confirmação de Presença Pendente',
                message: `Por favor, confirme sua presença na atividade "${activity.title}" que acontece em ${activity.startDate.toLocaleDateString()}`,
                actionUrl: `/activities/${activityId}/confirm`
              }
            },
            new Date() // Enviar imediatamente
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
   * Obter estatísticas de confirmação
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getConfirmationStats(activityId) {
    try {
      const [
        totalParticipants,
        confirmedCount,
        declinedCount,
        pendingCount,
        maybeCount
      ] = await Promise.all([
        prisma.activityParticipant.count({
          where: { activityId }
        }),
        prisma.activityConfirmation.count({
          where: { activityId, status: 'CONFIRMED' }
        }),
        prisma.activityConfirmation.count({
          where: { activityId, status: 'DECLINED' }
        }),
        prisma.activityConfirmation.count({
          where: { activityId, status: 'PENDING' }
        }),
        prisma.activityConfirmation.count({
          where: { activityId, status: 'MAYBE' }
        })
      ]);

      const confirmationRate = totalParticipants > 0 
        ? (confirmedCount / totalParticipants) * 100 
        : 0;

      return {
        success: true,
        data: {
          totalParticipants,
          confirmedCount,
          declinedCount,
          pendingCount,
          maybeCount,
          confirmationRate: Math.round(confirmationRate * 100) / 100
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar presença em atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {boolean} attended - Se o usuário compareceu
   * @param {string} notes - Observações
   * @returns {Object} Resultado da operação
   */
  static async markAttendance(activityId, userId, attended, notes = null) {
    try {
      // Verificar se o usuário está inscrito na atividade
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

      // Atualizar status do participante
      await prisma.activityParticipant.update({
        where: { id: participant.id },
        data: {
          status: attended ? 'COMPLETED' : 'NO_SHOW'
        }
      });

      // Atualizar confirmação
      await prisma.activityConfirmation.updateMany({
        where: {
          activityId,
          userId
        },
        data: {
          status: attended ? 'CONFIRMED' : 'DECLINED',
          notes: notes || (attended ? 'Presença confirmada' : 'Não compareceu')
        }
      });

      return {
        success: true,
        message: attended ? 'Presença confirmada' : 'Ausência registrada'
      };

    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter lista de presença
   * @param {string} activityId - ID da atividade
   * @returns {Object} Lista de presença
   */
  static async getAttendanceList(activityId) {
    try {
      const participants = await prisma.activityParticipant.findMany({
        where: { activityId },
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
          },
          activity: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true
            }
          }
        },
        orderBy: { registeredAt: 'asc' }
      });

      const confirmations = await prisma.activityConfirmation.findMany({
        where: { activityId },
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
      });

      // Combinar dados de participantes e confirmações
      const attendanceList = participants.map(participant => {
        const confirmation = confirmations.find(
          conf => conf.userId === participant.userId
        );

        return {
          participant,
          confirmation: confirmation || {
            status: 'PENDING',
            confirmedAt: null,
            notes: null
          }
        };
      });

      return {
        success: true,
        data: attendanceList
      };

    } catch (error) {
      console.error('Erro ao obter lista de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Exportar lista de presença
   * @param {string} activityId - ID da atividade
   * @param {string} format - Formato de exportação (csv, xlsx)
   * @returns {Object} Dados para exportação
   */
  static async exportAttendanceList(activityId, format = 'csv') {
    try {
      const result = await this.getAttendanceList(activityId);
      
      if (!result.success) {
        return result;
      }

      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: {
          title: true,
          startDate: true,
          endDate: true,
          address: true,
          city: true
        }
      });

      const exportData = {
        activity,
        participants: result.data,
        exportedAt: new Date(),
        format
      };

      return {
        success: true,
        data: exportData
      };

    } catch (error) {
      console.error('Erro ao exportar lista de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AttendanceService;
