const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EvaluationHistoryService {
  /**
   * Obter histórico completo de avaliações de um usuário
   */
  async getUserEvaluationHistory(userId, filters = {}) {
    try {
      const {
        type,
        status,
        isPublic,
        startDate,
        endDate,
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

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
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
                userType: true,
                profilePicture: true
              }
            },
            activity: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true
              }
            },
            opportunity: {
              select: {
                id: true,
                title: true,
                institutionName: true
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
      console.error('Erro ao obter histórico de avaliações:', error);
      return {
        success: false,
        error: 'Erro ao obter histórico de avaliações'
      };
    }
  }

  /**
   * Obter resumo de avaliações de um usuário
   */
  async getUserEvaluationSummary(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate
      } = filters;

      const where = {
        evaluatedId: userId,
        status: 'APPROVED'
      };

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
        recentEvaluations,
        topRatedCategories
      ] = await Promise.all([
        prisma.evaluation.count({ where }),
        prisma.evaluation.aggregate({
          where,
          _avg: { rating: true }
        }),
        prisma.evaluation.groupBy({
          by: ['rating'],
          where,
          _count: { id: true }
        }),
        prisma.evaluation.groupBy({
          by: ['type'],
          where,
          _count: { id: true }
        }),
        prisma.evaluation.findMany({
          where,
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        this.getTopRatedCategories(userId, where)
      ]);

      return {
        success: true,
        data: {
          totalEvaluations,
          averageRating: Math.round((averageRating._avg.rating || 0) * 100) / 100,
          ratingDistribution: ratingDistribution.map(stat => ({
            rating: stat.rating,
            count: stat._count.id,
            percentage: totalEvaluations > 0 ? Math.round((stat._count.id / totalEvaluations) * 100) : 0
          })),
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id,
            percentage: totalEvaluations > 0 ? Math.round((stat._count.id / totalEvaluations) * 100) : 0
          })),
          recentEvaluations,
          topRatedCategories
        }
      };
    } catch (error) {
      console.error('Erro ao obter resumo de avaliações:', error);
      return {
        success: false,
        error: 'Erro ao obter resumo de avaliações'
      };
    }
  }

  /**
   * Obter categorias mais bem avaliadas
   */
  async getTopRatedCategories(userId, whereClause) {
    try {
      const evaluations = await prisma.evaluation.findMany({
        where: whereClause,
        select: {
          categories: true,
          rating: true
        }
      });

      const categoryRatings = {};

      evaluations.forEach(evaluation => {
        if (evaluation.categories && typeof evaluation.categories === 'object') {
          Object.keys(evaluation.categories).forEach(category => {
            if (!categoryRatings[category]) {
              categoryRatings[category] = {
                totalRating: 0,
                count: 0
              };
            }
            categoryRatings[category].totalRating += evaluation.rating;
            categoryRatings[category].count += 1;
          });
        }
      });

      const topCategories = Object.keys(categoryRatings)
        .map(category => ({
          category,
          averageRating: Math.round((categoryRatings[category].totalRating / categoryRatings[category].count) * 100) / 100,
          count: categoryRatings[category].count
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);

      return topCategories;
    } catch (error) {
      console.error('Erro ao obter categorias mais bem avaliadas:', error);
      return [];
    }
  }

  /**
   * Obter histórico de avaliações por período
   */
  async getEvaluationHistoryByPeriod(userId, period = 'month') {
    try {
      let startDate;
      const endDate = new Date();

      switch (period) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const evaluations = await prisma.evaluation.findMany({
        where: {
          evaluatedId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Agrupar por período
      const groupedEvaluations = this.groupEvaluationsByPeriod(evaluations, period);

      return {
        success: true,
        data: {
          period,
          startDate,
          endDate,
          totalEvaluations: evaluations.length,
          averageRating: evaluations.length > 0 
            ? Math.round((evaluations.reduce((sum, eval) => sum + eval.rating, 0) / evaluations.length) * 100) / 100 
            : 0,
          groupedEvaluations
        }
      };
    } catch (error) {
      console.error('Erro ao obter histórico por período:', error);
      return {
        success: false,
        error: 'Erro ao obter histórico por período'
      };
    }
  }

  /**
   * Agrupar avaliações por período
   */
  groupEvaluationsByPeriod(evaluations, period) {
    const grouped = {};

    evaluations.forEach(evaluation => {
      let key;
      const date = new Date(evaluation.createdAt);

      switch (period) {
        case 'week':
          key = date.toISOString().split('T')[0]; // Por dia
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          evaluations: [],
          count: 0,
          averageRating: 0
        };
      }

      grouped[key].evaluations.push(evaluation);
      grouped[key].count += 1;
    });

    // Calcular média de avaliação para cada período
    Object.keys(grouped).forEach(key => {
      const group = grouped[key];
      if (group.count > 0) {
        group.averageRating = Math.round(
          (group.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / group.count) * 100
        ) / 100;
      }
    });

    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Obter avaliações por tipo de usuário
   */
  async getEvaluationsByUserType(userId, userType) {
    try {
      const evaluations = await prisma.evaluation.findMany({
        where: {
          evaluatedId: userId,
          evaluator: {
            userType: userType
          },
          status: 'APPROVED'
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true,
              profilePicture: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              startDate: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              institutionName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const stats = {
        total: evaluations.length,
        averageRating: evaluations.length > 0 
          ? Math.round((evaluations.reduce((sum, eval) => sum + eval.rating, 0) / evaluations.length) * 100) / 100 
          : 0,
        ratingDistribution: this.calculateRatingDistribution(evaluations)
      };

      return {
        success: true,
        data: {
          userType,
          evaluations,
          stats
        }
      };
    } catch (error) {
      console.error('Erro ao obter avaliações por tipo de usuário:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliações por tipo de usuário'
      };
    }
  }

  /**
   * Calcular distribuição de avaliações
   */
  calculateRatingDistribution(evaluations) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    evaluations.forEach(evaluation => {
      distribution[evaluation.rating] += 1;
    });

    return Object.keys(distribution).map(rating => ({
      rating: parseInt(rating),
      count: distribution[rating],
      percentage: evaluations.length > 0 
        ? Math.round((distribution[rating] / evaluations.length) * 100) 
        : 0
    }));
  }

  /**
   * Obter avaliações destacadas
   */
  async getFeaturedEvaluations(userId, limit = 3) {
    try {
      const evaluations = await prisma.evaluation.findMany({
        where: {
          evaluatedId: userId,
          status: 'APPROVED',
          rating: { gte: 4 }, // Apenas avaliações 4+ estrelas
          comment: { not: null } // Apenas com comentários
        },
        include: {
          evaluator: {
            select: {
              id: true,
              name: true,
              userType: true,
              profilePicture: true
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
              title: true,
              institutionName: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      return {
        success: true,
        data: evaluations
      };
    } catch (error) {
      console.error('Erro ao obter avaliações destacadas:', error);
      return {
        success: false,
        error: 'Erro ao obter avaliações destacadas'
      };
    }
  }

  /**
   * Obter estatísticas comparativas
   */
  async getComparativeStats(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true }
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Obter estatísticas do usuário
      const userStats = await this.getUserEvaluationSummary(userId);

      // Obter estatísticas médias do tipo de usuário
      const averageStats = await this.getAverageStatsByUserType(user.userType);

      return {
        success: true,
        data: {
          user: userStats.data,
          average: averageStats.data,
          comparison: this.calculateComparison(userStats.data, averageStats.data)
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas comparativas:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas comparativas'
      };
    }
  }

  /**
   * Obter estatísticas médias por tipo de usuário
   */
  async getAverageStatsByUserType(userType) {
    try {
      const evaluations = await prisma.evaluation.findMany({
        where: {
          evaluated: {
            userType: userType
          },
          status: 'APPROVED'
        },
        select: {
          rating: true,
          type: true
        }
      });

      const totalEvaluations = evaluations.length;
      const averageRating = totalEvaluations > 0 
        ? Math.round((evaluations.reduce((sum, eval) => sum + eval.rating, 0) / totalEvaluations) * 100) / 100 
        : 0;

      const typeStats = evaluations.reduce((acc, eval) => {
        if (!acc[eval.type]) {
          acc[eval.type] = { count: 0, totalRating: 0 };
        }
        acc[eval.type].count += 1;
        acc[eval.type].totalRating += eval.rating;
        return acc;
      }, {});

      const typeStatsArray = Object.keys(typeStats).map(type => ({
        type,
        count: typeStats[type].count,
        averageRating: Math.round((typeStats[type].totalRating / typeStats[type].count) * 100) / 100
      }));

      return {
        success: true,
        data: {
          totalEvaluations,
          averageRating,
          typeStats: typeStatsArray
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas médias:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas médias'
      };
    }
  }

  /**
   * Calcular comparação entre estatísticas
   */
  calculateComparison(userStats, averageStats) {
    const ratingDifference = userStats.averageRating - averageStats.averageRating;
    const ratingPercentage = averageStats.averageRating > 0 
      ? Math.round((ratingDifference / averageStats.averageRating) * 100) 
      : 0;

    return {
      ratingDifference: Math.round(ratingDifference * 100) / 100,
      ratingPercentage,
      isAboveAverage: ratingDifference > 0,
      totalEvaluationsDifference: userStats.totalEvaluations - averageStats.totalEvaluations
    };
  }
}

module.exports = new EvaluationHistoryService();
