const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EvaluationService {
  /**
   * Criar avaliação
   */
  async createEvaluation(evaluatorId, evaluationData) {
    try {
      const {
        evaluatedId,
        activityId,
        opportunityId,
        type,
        rating,
        title,
        comment,
        categories = {},
        isAnonymous = false,
        isPublic = true
      } = evaluationData;

      // Validar dados
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Avaliação deve ser entre 1 e 5'
        };
      }

      // Verificar se já existe avaliação do mesmo tipo
      const existingEvaluation = await prisma.evaluation.findFirst({
        where: {
          evaluatorId,
          evaluatedId,
          type,
          activityId: activityId || null,
          opportunityId: opportunityId || null
        }
      });

      if (existingEvaluation) {
        return {
          success: false,
          error: 'Já existe uma avaliação deste tipo para este usuário/atividade'
        };
      }

      // Verificar se o avaliador tem permissão para avaliar
      const canEvaluate = await this.canUserEvaluate(evaluatorId, evaluatedId, type, activityId, opportunityId);
      if (!canEvaluate.success) {
        return canEvaluate;
      }

      const evaluation = await prisma.evaluation.create({
        data: {
          evaluatorId,
          evaluatedId,
          activityId,
          opportunityId,
          type,
          rating,
          title,
          comment,
          categories,
          isAnonymous,
          isPublic,
          status: 'PENDING'
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          evaluated: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return {
        success: true,
        data: evaluation
      };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return {
        success: false,
        error: 'Erro ao criar avaliação'
      };
    }
  }

  /**
   * Verificar se usuário pode avaliar
   */
  async canUserEvaluate(evaluatorId, evaluatedId, type, activityId, opportunityId) {
    try {
      // Verificar se não está tentando se auto-avaliar
      if (evaluatorId === evaluatedId) {
        return {
          success: false,
          error: 'Usuário não pode se auto-avaliar'
        };
      }

      // Verificar se a atividade/oportunidade existe e se o usuário participou
      if (activityId) {
        const participation = await prisma.activityParticipant.findFirst({
          where: {
            activityId,
            userId: evaluatorId
          }
        });

        if (!participation) {
          return {
            success: false,
            error: 'Usuário não participou desta atividade'
          };
        }
      }

      if (opportunityId) {
        const application = await prisma.application.findFirst({
          where: {
            opportunityId,
            userId: evaluatorId,
            status: 'APPROVED'
          }
        });

        if (!application) {
          return {
            success: false,
            error: 'Usuário não foi aprovado para esta oportunidade'
          };
        }
      }

      // Verificar tipos de avaliação específicos
      switch (type) {
        case 'VOLUNTEER_TO_INSTITUTION':
          // Voluntário pode avaliar instituição se participou de atividade
          if (!activityId && !opportunityId) {
            return {
              success: false,
              error: 'Avaliação de instituição requer atividade ou oportunidade'
            };
          }
          break;

        case 'INSTITUTION_TO_VOLUNTEER':
          // Instituição pode avaliar voluntário se ele participou
          const evaluator = await prisma.user.findUnique({
            where: { id: evaluatorId }
          });

          if (evaluator.userType !== 'INSTITUTION') {
            return {
              success: false,
              error: 'Apenas instituições podem avaliar voluntários'
            };
          }
          break;

        case 'PEER_TO_PEER':
          // Apenas voluntários podem se avaliar entre si
          const evaluatorUser = await prisma.user.findUnique({
            where: { id: evaluatorId }
          });
          const evaluatedUser = await prisma.user.findUnique({
            where: { id: evaluatedId }
          });

          if (evaluatorUser.userType !== 'VOLUNTEER' || evaluatedUser.userType !== 'VOLUNTEER') {
            return {
              success: false,
              error: 'Avaliação entre pares é apenas para voluntários'
            };
          }
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao verificar permissão de avaliação:', error);
      return {
        success: false,
        error: 'Erro ao verificar permissão de avaliação'
      };
    }
  }

  /**
   * Obter avaliações de um usuário
   */
  async getUserEvaluations(userId, filters = {}) {
    try {
      const {
        type,
        status,
        isPublic,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        evaluatedId: userId
      };

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        prisma.evaluation.findMany({
          where,
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true
              }
            },
            opportunity: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.evaluation.count({ where })
      ]);

      return {
        success: true,
        data: {
          evaluations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter avaliações do usuário:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliações do usuário'
      };
    }
  }

  /**
   * Obter avaliações dadas por um usuário
   */
  async getEvaluationsGiven(userId, filters = {}) {
    try {
      const {
        type,
        status,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        evaluatorId: userId
      };

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        prisma.evaluation.findMany({
          where,
          include: {
            evaluated: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true
              }
            },
            opportunity: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.evaluation.count({ where })
      ]);

      return {
        success: true,
        data: {
          evaluations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter avaliações dadas:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliações dadas'
      };
    }
  }

  /**
   * Obter avaliação específica
   */
  async getEvaluation(evaluationId, userId) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          evaluated: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          },
          reports: {
            include: {
              reporter: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Avaliação não encontrada'
        };
      }

      // Verificar se o usuário tem permissão para ver a avaliação
      if (evaluation.evaluatorId !== userId && evaluation.evaluatedId !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para ver esta avaliação'
        };
      }

      return {
        success: true,
        data: evaluation
      };
    } catch (error) {
      console.error('Erro ao obter avaliação:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliação'
      };
    }
  }

  /**
   * Atualizar avaliação
   */
  async updateEvaluation(evaluationId, userId, updateData) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Avaliação não encontrada'
        };
      }

      // Verificar se o usuário pode editar a avaliação
      if (evaluation.evaluatorId !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para editar esta avaliação'
        };
      }

      // Verificar se a avaliação pode ser editada
      if (evaluation.status !== 'PENDING' && evaluation.status !== 'APPROVED') {
        return {
          success: false,
          error: 'Avaliação não pode ser editada neste status'
        };
      }

      const updatedEvaluation = await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          ...updateData,
          status: 'PENDING', // Volta para pendente após edição
          updatedAt: new Date()
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          evaluated: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        }
      });

      return {
        success: true,
        data: updatedEvaluation
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return {
        success: false,
        error: 'Erro ao atualizar avaliação'
      };
    }
  }

  /**
   * Excluir avaliação
   */
  async deleteEvaluation(evaluationId, userId) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Avaliação não encontrada'
        };
      }

      // Verificar se o usuário pode excluir a avaliação
      if (evaluation.evaluatorId !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para excluir esta avaliação'
        };
      }

      await prisma.evaluation.delete({
        where: { id: evaluationId }
      });

      return {
        success: true,
        message: 'Avaliação excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      return {
        success: false,
        error: 'Erro ao excluir avaliação'
      };
    }
  }

  /**
   * Moderar avaliação
   */
  async moderateEvaluation(evaluationId, moderatorId, moderationData) {
    try {
      const { status, reason } = moderationData;

      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Avaliação não encontrada'
        };
      }

      const updatedEvaluation = await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status,
          moderatedAt: new Date(),
          moderatedBy: moderatorId,
          moderationReason: reason
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          evaluated: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        }
      });

      return {
        success: true,
        data: updatedEvaluation
      };
    } catch (error) {
      console.error('Erro ao moderar avaliação:', error);
      return {
        success: false,
        error: 'Erro ao moderar avaliação'
      };
    }
  }

  /**
   * Obter estatísticas de avaliações
   */
  async getEvaluationStats(userId, filters = {}) {
    try {
      const {
        type,
        startDate,
        endDate
      } = filters;

      const where = {
        evaluatedId: userId
      };

      if (type) {
        where.type = type;
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
        totalEvaluations,
        averageRating,
        ratingDistribution,
        typeStats,
        statusStats
      ] = await Promise.all([
        prisma.evaluation.count({ where }),
        prisma.evaluation.aggregate({
          where: { ...where, status: 'APPROVED' },
          _avg: { rating: true }
        }),
        prisma.evaluation.groupBy({
          by: ['rating'],
          where: { ...where, status: 'APPROVED' },
          _count: { id: true }
        }),
        prisma.evaluation.groupBy({
          by: ['type'],
          where,
          _count: { id: true }
        }),
        prisma.evaluation.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalEvaluations,
          averageRating: averageRating._avg.rating || 0,
          ratingDistribution: ratingDistribution.map(stat => ({
            rating: stat.rating,
            count: stat._count.id
          })),
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.id
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de avaliações:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas de avaliações'
      };
    }
  }

  /**
   * Obter avaliações pendentes de moderação
   */
  async getPendingModerations(filters = {}) {
    try {
      const {
        type,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status: 'PENDING'
      };

      if (type) {
        where.type = type;
      }

      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        prisma.evaluation.findMany({
          where,
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            evaluated: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true
              }
            },
            opportunity: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.evaluation.count({ where })
      ]);

      return {
        success: true,
        data: {
          evaluations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter avaliações pendentes:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliações pendentes'
      };
    }
  }
}

module.exports = new EvaluationService();
