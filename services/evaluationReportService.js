const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EvaluationReportService {
  /**
   * Reportar avaliação
   */
  async reportEvaluation(evaluationId, reporterId, reportData) {
    try {
      const {
        reason,
        description
      } = reportData;

      // Verificar se a avaliação existe
      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId }
      });

      if (!evaluation) {
        return {
          success: false,
          error: 'Avaliação não encontrada'
        };
      }

      // Verificar se o usuário já reportou esta avaliação
      const existingReport = await prisma.evaluationReport.findFirst({
        where: {
          evaluationId,
          reporterId
        }
      });

      if (existingReport) {
        return {
          success: false,
          error: 'Usuário já reportou esta avaliação'
        };
      }

      const report = await prisma.evaluationReport.create({
        data: {
          evaluationId,
          reporterId,
          reason,
          description,
          status: 'PENDING'
        },
        include: {
          evaluation: {
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
          },
          reporter: {
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
        data: report
      };
    } catch (error) {
      console.error('Erro ao reportar avaliação:', error);
      return {
        success: false,
        error: 'Erro ao reportar avaliação'
      };
    }
  }

  /**
   * Obter denúncias de avaliações
   */
  async getEvaluationReports(filters = {}) {
    try {
      const {
        status,
        reason,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (status) {
        where.status = status;
      }

      if (reason) {
        where.reason = reason;
      }

      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.evaluationReport.findMany({
          where,
          include: {
            evaluation: {
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
            },
            reporter: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            reviewer: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.evaluationReport.count({ where })
      ]);

      return {
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter denúncias de avaliações:', error);
      return {
        success: false,
        error: 'Erro ao obter denúncias de avaliações'
      };
    }
  }

  /**
   * Obter denúncia específica
   */
  async getEvaluationReport(reportId) {
    try {
      const report = await prisma.evaluationReport.findUnique({
        where: { id: reportId },
        include: {
          evaluation: {
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
          },
          reporter: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        }
      });

      if (!report) {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Erro ao obter denúncia:', error);
      return {
        success: false,
        error: 'Erro ao obter denúncia'
      };
    }
  }

  /**
   * Revisar denúncia
   */
  async reviewReport(reportId, reviewerId, reviewData) {
    try {
      const {
        status,
        reviewNotes
      } = reviewData;

      const report = await prisma.evaluationReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }

      if (report.status !== 'PENDING') {
        return {
          success: false,
          error: 'Denúncia já foi revisada'
        };
      }

      const updatedReport = await prisma.evaluationReport.update({
        where: { id: reportId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
          reviewNotes
        },
        include: {
          evaluation: {
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
          },
          reporter: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        }
      });

      // Se a denúncia foi resolvida, moderar a avaliação
      if (status === 'RESOLVED') {
        await prisma.evaluation.update({
          where: { id: report.evaluationId },
          data: {
            status: 'MODERATED',
            moderatedAt: new Date(),
            moderatedBy: reviewerId,
            moderationReason: `Denúncia resolvida: ${reviewNotes}`
          }
        });
      }

      return {
        success: true,
        data: updatedReport
      };
    } catch (error) {
      console.error('Erro ao revisar denúncia:', error);
      return {
        success: false,
        error: 'Erro ao revisar denúncia'
      };
    }
  }

  /**
   * Obter estatísticas de denúncias
   */
  async getReportStats(filters = {}) {
    try {
      const {
        startDate,
        endDate
      } = filters;

      const where = {};

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
        totalReports,
        pendingReports,
        resolvedReports,
        dismissedReports,
        reasonStats,
        statusStats
      ] = await Promise.all([
        prisma.evaluationReport.count({ where }),
        prisma.evaluationReport.count({ where: { ...where, status: 'PENDING' } }),
        prisma.evaluationReport.count({ where: { ...where, status: 'RESOLVED' } }),
        prisma.evaluationReport.count({ where: { ...where, status: 'DISMISSED' } }),
        prisma.evaluationReport.groupBy({
          by: ['reason'],
          where,
          _count: { id: true }
        }),
        prisma.evaluationReport.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalReports,
          pendingReports,
          resolvedReports,
          dismissedReports,
          resolutionRate: totalReports > 0 ? ((resolvedReports + dismissedReports) / totalReports) * 100 : 0,
          reasonStats: reasonStats.map(stat => ({
            reason: stat.reason,
            count: stat._count.id
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.id
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de denúncias:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas de denúncias'
      };
    }
  }

  /**
   * Obter denúncias por usuário
   */
  async getUserReports(userId, filters = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        reporterId: userId
      };

      if (status) {
        where.status = status;
      }

      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.evaluationReport.findMany({
          where,
          include: {
            evaluation: {
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
            },
            reviewer: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.evaluationReport.count({ where })
      ]);

      return {
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter denúncias do usuário:', error);
      return {
        success: false,
        error: 'Erro ao obter denúncias do usuário'
      };
    }
  }

  /**
   * Cancelar denúncia
   */
  async cancelReport(reportId, userId) {
    try {
      const report = await prisma.evaluationReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }

      if (report.reporterId !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para cancelar esta denúncia'
        };
      }

      if (report.status !== 'PENDING') {
        return {
          success: false,
          error: 'Denúncia não pode ser cancelada neste status'
        };
      }

      await prisma.evaluationReport.update({
        where: { id: reportId },
        data: {
          status: 'DISMISSED',
          reviewedAt: new Date(),
          reviewNotes: 'Cancelada pelo usuário'
        }
      });

      return {
        success: true,
        message: 'Denúncia cancelada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao cancelar denúncia:', error);
      return {
        success: false,
        error: 'Erro ao cancelar denúncia'
      };
    }
  }
}

module.exports = new EvaluationReportService();
