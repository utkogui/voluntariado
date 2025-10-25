const { PrismaClient } = require('@prisma/client');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de atividades de voluntariado
 */
class ActivityService {
  
  /**
   * Criar nova atividade
   * @param {Object} activityData - Dados da atividade
   * @returns {Object} Resultado da operação
   */
  static async createActivity(activityData) {
    try {
      const {
        title,
        description,
        type,
        maxParticipants,
        isRecurring,
        recurrenceRule,
        address,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        isOnline,
        meetingUrl,
        startDate,
        endDate,
        timezone,
        opportunityId,
        createdById,
        materials = [],
        requirements = []
      } = activityData;

      // Validar datas
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return {
          success: false,
          error: 'Data de início deve ser anterior à data de fim'
        };
      }

      // Criar atividade
      const activity = await prisma.activity.create({
        data: {
          title,
          description,
          type,
          maxParticipants,
          isRecurring,
          recurrenceRule,
          address,
          city,
          state,
          zipCode,
          country,
          latitude,
          longitude,
          isOnline,
          meetingUrl,
          startDate: start,
          endDate: end,
          timezone,
          opportunityId,
          createdById,
          materials: {
            create: materials.map(material => ({
              name: material.name,
              description: material.description,
              quantity: material.quantity,
              unit: material.unit,
              isRequired: material.isRequired || true,
              providedBy: material.providedBy
            }))
          },
          requirements: {
            create: requirements.map(requirement => ({
              title: requirement.title,
              description: requirement.description,
              requirementType: requirement.requirementType,
              isRequired: requirement.isRequired || true,
              priority: requirement.priority || 'MEDIUM',
              validationRules: requirement.validationRules,
              minValue: requirement.minValue,
              maxValue: requirement.maxValue,
              allowedValues: requirement.allowedValues || []
            }))
          }
        },
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
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
          materials: true,
          requirements: true
        }
      });

      // Agendar lembretes automáticos
      await this.scheduleActivityReminders(activity);

      return {
        success: true,
        data: activity
      };

    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter atividade por ID
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} Atividade
   */
  static async getActivity(activityId, userId) {
    try {
      const activity = await prisma.activity.findFirst({
        where: {
          id: activityId,
          OR: [
            { createdById: userId },
            { participants: { some: { userId } } }
          ]
        },
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
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
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
          materials: true,
          requirements: true,
          evaluations: {
            include: {
              evaluator: {
                select: {
                  id: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              },
              evaluated: {
                select: {
                  id: true,
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

      return {
        success: true,
        data: activity
      };

    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter atividades do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de atividades
   */
  static async getUserActivities(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        fromDate,
        toDate,
        role = 'all' // all, created, participating
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {};
      
      if (role === 'created') {
        where.createdById = userId;
      } else if (role === 'participating') {
        where.participants = {
          some: { userId }
        };
      } else {
        where.OR = [
          { createdById: userId },
          { participants: { some: { userId } } }
        ];
      }

      if (type) where.type = type;
      if (status) where.status = status;
      if (fromDate && toDate) {
        where.startDate = {
          gte: new Date(fromDate),
          lte: new Date(toDate)
        };
      }

      const [activities, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { startDate: 'asc' },
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
            },
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
            materials: true,
            requirements: true
          }
        }),
        prisma.activity.count({ where })
      ]);

      return {
        success: true,
        data: activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Inscrever usuário em atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {string} role - Papel do usuário
   * @returns {Object} Resultado da operação
   */
  static async registerUser(activityId, userId, role = 'PARTICIPANT') {
    try {
      // Verificar se a atividade existe e está aberta
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { participants: true }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status !== 'SCHEDULED' && activity.status !== 'CONFIRMED') {
        return {
          success: false,
          error: 'Atividade não está aberta para inscrições'
        };
      }

      // Verificar se já está inscrito
      const existingParticipant = await prisma.activityParticipant.findFirst({
        where: {
          activityId,
          userId
        }
      });

      if (existingParticipant) {
        return {
          success: false,
          error: 'Usuário já está inscrito nesta atividade'
        };
      }

      // Verificar limite de participantes
      if (activity.maxParticipants && activity.participants.length >= activity.maxParticipants) {
        return {
          success: false,
          error: 'Atividade já atingiu o limite de participantes'
        };
      }

      // Inscrever usuário
      const participant = await prisma.activityParticipant.create({
        data: {
          activityId,
          userId,
          role
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
        }
      });

      // Atualizar contador de participantes
      await prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            increment: 1
          }
        }
      });

      return {
        success: true,
        data: participant
      };

    } catch (error) {
      console.error('Erro ao inscrever usuário na atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar inscrição em atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async unregisterUser(activityId, userId) {
    try {
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

      // Verificar se pode cancelar (não pode cancelar se a atividade já começou)
      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (activity.startDate <= new Date()) {
        return {
          success: false,
          error: 'Não é possível cancelar inscrição em atividade que já começou'
        };
      }

      // Remover participante
      await prisma.activityParticipant.delete({
        where: { id: participant.id }
      });

      // Atualizar contador de participantes
      await prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            decrement: 1
          }
        }
      });

      return {
        success: true,
        message: 'Inscrição cancelada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirmar presença em atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {string} status - Status da confirmação
   * @param {string} notes - Observações
   * @returns {Object} Resultado da operação
   */
  static async confirmAttendance(activityId, userId, status, notes = null) {
    try {
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

      // Criar ou atualizar confirmação
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
          }
        }
      });

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
   * Atualizar status da atividade
   * @param {string} activityId - ID da atividade
   * @param {string} status - Novo status
   * @param {string} userId - ID do usuário que está atualizando
   * @returns {Object} Resultado da operação
   */
  static async updateActivityStatus(activityId, status, userId) {
    try {
      // Verificar se o usuário tem permissão
      const activity = await prisma.activity.findFirst({
        where: {
          id: activityId,
          createdById: userId
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada ou usuário sem permissão'
        };
      }

      // Atualizar status
      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: { status },
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
          },
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

      // Notificar participantes sobre mudança de status
      await this.notifyParticipantsStatusChange(updatedActivity, status);

      return {
        success: true,
        data: updatedActivity
      };

    } catch (error) {
      console.error('Erro ao atualizar status da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar lembretes automáticos para atividade
   * @param {Object} activity - Dados da atividade
   */
  static async scheduleActivityReminders(activity) {
    try {
      const reminders = [
        { hours: 24, message: `Lembrete: ${activity.title} acontece amanhã` },
        { hours: 2, message: `Lembrete: ${activity.title} acontece em 2 horas` },
        { hours: 0.5, message: `Lembrete: ${activity.title} começa em 30 minutos` }
      ];

      for (const reminder of reminders) {
        const reminderDate = new Date(activity.startDate);
        reminderDate.setHours(reminderDate.getHours() - reminder.hours);

        if (reminderDate > new Date()) {
          await scheduledService.scheduleActivityReminder(
            activity.createdById,
            {
              id: activity.id,
              title: activity.title,
              date: activity.startDate,
              location: activity.address || 'Online'
            },
            reminder.hours
          );
        }
      }

    } catch (error) {
      console.error('Erro ao agendar lembretes da atividade:', error);
    }
  }

  /**
   * Notificar participantes sobre mudança de status
   * @param {Object} activity - Dados da atividade
   * @param {string} status - Novo status
   */
  static async notifyParticipantsStatusChange(activity, status) {
    try {
      const statusMessages = {
        'CANCELLED': 'A atividade foi cancelada',
        'POSTPONED': 'A atividade foi adiada',
        'CONFIRMED': 'A atividade foi confirmada',
        'IN_PROGRESS': 'A atividade está em andamento',
        'COMPLETED': 'A atividade foi concluída'
      };

      const message = statusMessages[status];
      if (!message) return;

      // Notificar cada participante
      for (const participant of activity.participants) {
        await scheduledService.scheduleNotificationWithTemplate(
          participant.userId,
          'VOLUNTEER_ACTIVITY',
          {
            activity: {
              id: activity.id,
              title: activity.title,
              date: activity.startDate,
              location: activity.address || 'Online'
            }
          },
          new Date() // Enviar imediatamente
        );
      }

    } catch (error) {
      console.error('Erro ao notificar participantes:', error);
    }
  }

  /**
   * Obter estatísticas de atividades
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Estatísticas
   */
  static async getActivityStats(userId = null) {
    try {
      const where = userId ? { createdById: userId } : {};

      const [
        totalActivities,
        byStatus,
        byType,
        upcomingActivities,
        completedActivities
      ] = await Promise.all([
        prisma.activity.count({ where }),
        prisma.activity.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.activity.groupBy({
          by: ['type'],
          where,
          _count: { type: true }
        }),
        prisma.activity.count({
          where: {
            ...where,
            startDate: { gte: new Date() }
          }
        }),
        prisma.activity.count({
          where: {
            ...where,
            status: 'COMPLETED'
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalActivities,
          upcomingActivities,
          completedActivities,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          byType: byType.map(item => ({
            type: item.type,
            count: item._count.type
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de atividades:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ActivityService;
