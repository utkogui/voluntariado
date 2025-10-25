const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EngagementTrackingService {
  /**
   * Registrar engajamento de estudante
   */
  async recordStudentEngagement(studentId, universityId, activityId, engagementData) {
    try {
      const {
        hoursVolunteered,
        skillsDeveloped,
        reflections,
        challenges,
        achievements,
        recommendations,
        rating,
        feedback
      } = engagementData;

      // Verificar se o estudante existe
      const student = await prisma.user.findUnique({
        where: { id: studentId }
      });

      if (!student || student.userType !== 'VOLUNTEER') {
        return {
          success: false,
          error: 'Estudante não encontrado'
        };
      }

      // Verificar se a universidade existe
      const university = await prisma.user.findUnique({
        where: { id: universityId }
      });

      if (!university || university.userType !== 'UNIVERSITY') {
        return {
          success: false,
          error: 'Universidade não encontrada'
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

      // Verificar se já existe um registro de engajamento para esta atividade
      const existingEngagement = await prisma.engagementTracking.findFirst({
        where: {
          studentId,
          activityId,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        }
      });

      if (existingEngagement) {
        return {
          success: false,
          error: 'Já existe um registro de engajamento para esta atividade'
        };
      }

      // Criar registro de engajamento
      const engagement = await prisma.engagementTracking.create({
        data: {
          studentId,
          universityId,
          activityId,
          hoursVolunteered,
          skillsDeveloped: JSON.stringify(skillsDeveloped || []),
          reflections: JSON.stringify(reflections || []),
          challenges: JSON.stringify(challenges || []),
          achievements: JSON.stringify(achievements || []),
          recommendations: JSON.stringify(recommendations || []),
          rating,
          feedback,
          status: 'ACTIVE',
          startDate: new Date()
        },
        include: {
          student: {
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
          university: {
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
        }
      });

      return {
        success: true,
        data: engagement
      };

    } catch (error) {
      console.error('Erro ao registrar engajamento de estudante:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualizar engajamento de estudante
   */
  async updateStudentEngagement(engagementId, updateData) {
    try {
      const engagement = await prisma.engagementTracking.findUnique({
        where: { id: engagementId }
      });

      if (!engagement) {
        return {
          success: false,
          error: 'Registro de engajamento não encontrado'
        };
      }

      // Preparar dados para atualização
      const updateFields = { ...updateData };
      if (updateFields.skillsDeveloped) {
        updateFields.skillsDeveloped = JSON.stringify(updateFields.skillsDeveloped);
      }
      if (updateFields.reflections) {
        updateFields.reflections = JSON.stringify(updateFields.reflections);
      }
      if (updateFields.challenges) {
        updateFields.challenges = JSON.stringify(updateFields.challenges);
      }
      if (updateFields.achievements) {
        updateFields.achievements = JSON.stringify(updateFields.achievements);
      }
      if (updateFields.recommendations) {
        updateFields.recommendations = JSON.stringify(updateFields.recommendations);
      }

      // Definir data de conclusão se o status for COMPLETED
      if (updateFields.status === 'COMPLETED') {
        updateFields.endDate = new Date();
      }

      const updatedEngagement = await prisma.engagementTracking.update({
        where: { id: engagementId },
        data: {
          ...updateFields,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          university: {
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
          }
        }
      });

      return {
        success: true,
        data: updatedEngagement
      };

    } catch (error) {
      console.error('Erro ao atualizar engajamento de estudante:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter registros de engajamento
   */
  async getEngagementRecords(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        studentId,
        universityId,
        activityId,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (studentId) {
        where.studentId = studentId;
      }

      if (universityId) {
        where.universityId = universityId;
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

      const [engagements, total] = await Promise.all([
        prisma.engagementTracking.findMany({
          where,
          include: {
            student: {
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
            university: {
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
        prisma.engagementTracking.count({ where })
      ]);

      // Parse JSON fields
      const parsedEngagements = engagements.map(engagement => ({
        ...engagement,
        skillsDeveloped: JSON.parse(engagement.skillsDeveloped || '[]'),
        reflections: JSON.parse(engagement.reflections || '[]'),
        challenges: JSON.parse(engagement.challenges || '[]'),
        achievements: JSON.parse(engagement.achievements || '[]'),
        recommendations: JSON.parse(engagement.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          engagements: parsedEngagements,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter registros de engajamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter registro específico de engajamento
   */
  async getEngagementRecord(engagementId) {
    try {
      const engagement = await prisma.engagementTracking.findUnique({
        where: { id: engagementId },
        include: {
          student: {
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
          university: {
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
        }
      });

      if (!engagement) {
        return {
          success: false,
          error: 'Registro de engajamento não encontrado'
        };
      }

      // Parse JSON fields
      const parsedEngagement = {
        ...engagement,
        skillsDeveloped: JSON.parse(engagement.skillsDeveloped || '[]'),
        reflections: JSON.parse(engagement.reflections || '[]'),
        challenges: JSON.parse(engagement.challenges || '[]'),
        achievements: JSON.parse(engagement.achievements || '[]'),
        recommendations: JSON.parse(engagement.recommendations || '[]')
      };

      return {
        success: true,
        data: parsedEngagement
      };

    } catch (error) {
      console.error('Erro ao obter registro de engajamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de engajamento
   */
  async getEngagementStats(filters = {}) {
    try {
      const { studentId, universityId, startDate, endDate } = filters;

      const where = {};

      if (studentId) {
        where.studentId = studentId;
      }

      if (universityId) {
        where.universityId = universityId;
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
        totalEngagements,
        activeEngagements,
        completedEngagements,
        suspendedEngagements,
        graduatedEngagements
      ] = await Promise.all([
        prisma.engagementTracking.count({ where }),
        prisma.engagementTracking.count({ where: { ...where, status: 'ACTIVE' } }),
        prisma.engagementTracking.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.engagementTracking.count({ where: { ...where, status: 'SUSPENDED' } }),
        prisma.engagementTracking.count({ where: { ...where, status: 'GRADUATED' } })
      ]);

      // Calcular total de horas voluntariadas
      const totalHoursResult = await prisma.engagementTracking.aggregate({
        _sum: {
          hoursVolunteered: true
        },
        where
      });

      // Calcular média de avaliações
      const avgRatingResult = await prisma.engagementTracking.aggregate({
        _avg: {
          rating: true
        },
        where: {
          ...where,
          rating: { not: null }
        }
      });

      return {
        success: true,
        data: {
          total: totalEngagements,
          active: activeEngagements,
          completed: completedEngagements,
          suspended: suspendedEngagements,
          graduated: graduatedEngagements,
          totalHours: totalHoursResult._sum.hoursVolunteered || 0,
          averageRating: avgRatingResult._avg.rating || 0
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de engajamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter engajamentos por status
   */
  async getEngagementsByStatus(status, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        studentId,
        universityId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status
      };

      if (studentId) {
        where.studentId = studentId;
      }

      if (universityId) {
        where.universityId = universityId;
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

      const [engagements, total] = await Promise.all([
        prisma.engagementTracking.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            university: {
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
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.engagementTracking.count({ where })
      ]);

      // Parse JSON fields
      const parsedEngagements = engagements.map(engagement => ({
        ...engagement,
        skillsDeveloped: JSON.parse(engagement.skillsDeveloped || '[]'),
        reflections: JSON.parse(engagement.reflections || '[]'),
        challenges: JSON.parse(engagement.challenges || '[]'),
        achievements: JSON.parse(engagement.achievements || '[]'),
        recommendations: JSON.parse(engagement.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          engagements: parsedEngagements,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter engajamentos por status:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter engajamentos por estudante
   */
  async getEngagementsByStudent(studentId, filters = {}) {
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
        studentId
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

      const [engagements, total] = await Promise.all([
        prisma.engagementTracking.findMany({
          where,
          include: {
            university: {
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
        prisma.engagementTracking.count({ where })
      ]);

      // Parse JSON fields
      const parsedEngagements = engagements.map(engagement => ({
        ...engagement,
        skillsDeveloped: JSON.parse(engagement.skillsDeveloped || '[]'),
        reflections: JSON.parse(engagement.reflections || '[]'),
        challenges: JSON.parse(engagement.challenges || '[]'),
        achievements: JSON.parse(engagement.achievements || '[]'),
        recommendations: JSON.parse(engagement.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          engagements: parsedEngagements,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter engajamentos por estudante:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter engajamentos por universidade
   */
  async getEngagementsByUniversity(universityId, filters = {}) {
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
        universityId
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

      const [engagements, total] = await Promise.all([
        prisma.engagementTracking.findMany({
          where,
          include: {
            student: {
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
        prisma.engagementTracking.count({ where })
      ]);

      // Parse JSON fields
      const parsedEngagements = engagements.map(engagement => ({
        ...engagement,
        skillsDeveloped: JSON.parse(engagement.skillsDeveloped || '[]'),
        reflections: JSON.parse(engagement.reflections || '[]'),
        challenges: JSON.parse(engagement.challenges || '[]'),
        achievements: JSON.parse(engagement.achievements || '[]'),
        recommendations: JSON.parse(engagement.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          engagements: parsedEngagements,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter engajamentos por universidade:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new EngagementTrackingService();
