const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ParticipationHistoryService {
  /**
   * Registrar participação em atividade
   */
  async recordParticipation(volunteerId, activityId, institutionId, status, notes = null) {
    try {
      // Verificar se o voluntário existe
      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId }
      });

      if (!volunteer || volunteer.userType !== 'VOLUNTEER') {
        return {
          success: false,
          error: 'Voluntário não encontrado'
        };
      }

      // Verificar se a atividade existe
      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Verificar se a instituição existe
      const institution = await prisma.user.findUnique({
        where: { id: institutionId }
      });

      if (!institution || institution.userType !== 'INSTITUTION') {
        return {
          success: false,
          error: 'Instituição não encontrada'
        };
      }

      // Verificar se já existe uma participação ativa
      const existingParticipation = await prisma.participationHistory.findFirst({
        where: {
          volunteerId,
          activityId,
          status: { in: ['REGISTERED', 'CONFIRMED', 'ACTIVE'] }
        }
      });

      if (existingParticipation) {
        return {
          success: false,
          error: 'Já existe uma participação ativa para este voluntário nesta atividade'
        };
      }

      // Criar registro de participação
      const participation = await prisma.participationHistory.create({
        data: {
          volunteerId,
          activityId,
          institutionId,
          status,
          notes,
          startDate: new Date()
        },
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              profile: {
                select: {
                  bio: true,
                  skills: true,
                  interests: true,
                  availability: true
                }
              }
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true,
              maxParticipants: true,
              currentParticipants: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              profile: {
                select: {
                  organizationName: true,
                  organizationType: true,
                  description: true
                }
              }
            }
          }
        }
      });

      return {
        success: true,
        data: participation
      };

    } catch (error) {
      console.error('Erro ao registrar participação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualizar status de participação
   */
  async updateParticipationStatus(participationId, status, notes = null) {
    try {
      const participation = await prisma.participationHistory.findUnique({
        where: { id: participationId }
      });

      if (!participation) {
        return {
          success: false,
          error: 'Participação não encontrada'
        };
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.notes = notes;
      }

      // Definir data de conclusão se o status for COMPLETED
      if (status === 'COMPLETED') {
        updateData.endDate = new Date();
      }

      const updatedParticipation = await prisma.participationHistory.update({
        where: { id: participationId },
        data: updateData,
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      return {
        success: true,
        data: updatedParticipation
      };

    } catch (error) {
      console.error('Erro ao atualizar status de participação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter histórico de participação
   */
  async getParticipationHistory(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        volunteerId,
        institutionId,
        activityId,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (volunteerId) {
        where.volunteerId = volunteerId;
      }

      if (institutionId) {
        where.institutionId = institutionId;
      }

      if (activityId) {
        where.activityId = activityId;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [participations, total] = await Promise.all([
        prisma.participationHistory.findMany({
          where,
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                profile: {
                  select: {
                    bio: true,
                    skills: true,
                    interests: true,
                    availability: true
                  }
                }
              }
            },
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
                maxParticipants: true,
                currentParticipants: true
              }
            },
            institution: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                profile: {
                  select: {
                    organizationName: true,
                    organizationType: true,
                    description: true
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.participationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          participations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter histórico de participação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter participação específica
   */
  async getParticipation(participationId) {
    try {
      const participation = await prisma.participationHistory.findUnique({
        where: { id: participationId },
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              profile: {
                select: {
                  bio: true,
                  skills: true,
                  interests: true,
                  availability: true
                }
              }
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true,
              maxParticipants: true,
              currentParticipants: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              profile: {
                select: {
                  organizationName: true,
                  organizationType: true,
                  description: true
                }
              }
            }
          }
        }
      });

      if (!participation) {
        return {
          success: false,
          error: 'Participação não encontrada'
        };
      }

      return {
        success: true,
        data: participation
      };

    } catch (error) {
      console.error('Erro ao obter participação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de participação
   */
  async getParticipationStats(filters = {}) {
    try {
      const { volunteerId, institutionId, startDate, endDate } = filters;

      const where = {};

      if (volunteerId) {
        where.volunteerId = volunteerId;
      }

      if (institutionId) {
        where.institutionId = institutionId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [
        totalParticipations,
        completedParticipations,
        activeParticipations,
        cancelledParticipations,
        noShowParticipations
      ] = await Promise.all([
        prisma.participationHistory.count({ where }),
        prisma.participationHistory.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.participationHistory.count({ where: { ...where, status: 'ACTIVE' } }),
        prisma.participationHistory.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.participationHistory.count({ where: { ...where, status: 'NO_SHOW' } })
      ]);

      return {
        success: true,
        data: {
          total: totalParticipations,
          completed: completedParticipations,
          active: activeParticipations,
          cancelled: cancelledParticipations,
          noShow: noShowParticipations,
          completionRate: totalParticipations > 0 ? (completedParticipations / totalParticipations) * 100 : 0
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de participação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter participações por status
   */
  async getParticipationsByStatus(status, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        volunteerId,
        institutionId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status
      };

      if (volunteerId) {
        where.volunteerId = volunteerId;
      }

      if (institutionId) {
        where.institutionId = institutionId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [participations, total] = await Promise.all([
        prisma.participationHistory.findMany({
          where,
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true
              }
            },
            institution: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.participationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          participations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter participações por status:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter participações por período
   */
  async getParticipationsByPeriod(startDate, endDate, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        volunteerId,
        institutionId,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };

      if (volunteerId) {
        where.volunteerId = volunteerId;
      }

      if (institutionId) {
        where.institutionId = institutionId;
      }

      if (status) {
        where.status = status;
      }

      const [participations, total] = await Promise.all([
        prisma.participationHistory.findMany({
          where,
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true
              }
            },
            institution: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.participationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          participations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter participações por período:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter participações por voluntário
   */
  async getParticipationsByVolunteer(volunteerId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        volunteerId
      };

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [participations, total] = await Promise.all([
        prisma.participationHistory.findMany({
          where,
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
                maxParticipants: true,
                currentParticipants: true
              }
            },
            institution: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                profile: {
                  select: {
                    organizationName: true,
                    organizationType: true,
                    description: true
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.participationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          participations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter participações por voluntário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter participações por instituição
   */
  async getParticipationsByInstitution(institutionId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        institutionId
      };

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const [participations, total] = await Promise.all([
        prisma.participationHistory.findMany({
          where,
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
                profile: {
                  select: {
                    bio: true,
                    skills: true,
                    interests: true,
                    availability: true
                  }
                }
              }
            },
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
                maxParticipants: true,
                currentParticipants: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.participationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          participations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter participações por instituição:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new ParticipationHistoryService();
