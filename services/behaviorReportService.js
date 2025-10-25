const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BehaviorReportService {
  /**
   * Reportar comportamento inadequado
   */
  async reportBehavior(reporterId, reportData) {
    try {
      const {
        reportedUserId,
        contentType,
        contentId,
        reason,
        description,
        evidence = [],
        severity = 'MEDIUM'
      } = reportData;

      // Verificar se o usuário não está tentando se auto-reportar
      if (reporterId === reportedUserId) {
        return {
          success: false,
          error: 'Usuário não pode se auto-reportar'
        };
      }

      // Verificar se já existe um report ativo para o mesmo conteúdo
      const existingReport = await prisma.contentModeration.findFirst({
        where: {
          contentId,
          contentType,
          reportedBy: reporterId,
          status: {
            in: ['PENDING', 'REVIEWED']
          }
        }
      });

      if (existingReport) {
        return {
          success: false,
          error: 'Já existe uma denúncia ativa para este conteúdo'
        };
      }

      const report = await prisma.contentModeration.create({
        data: {
          contentType,
          contentId,
          reportedBy: reporterId,
          reason,
          description,
          status: 'PENDING',
          metadata: {
            reportedUserId,
            evidence,
            severity
          }
        },
        include: {
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
      console.error('Erro ao reportar comportamento:', error);
      return {
        success: false,
        error: 'Erro ao reportar comportamento'
      };
    }
  }

  /**
   * Obter denúncias de comportamento
   */
  async getBehaviorReports(filters = {}) {
    try {
      const {
        status,
        reason,
        contentType,
        severity,
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

      if (contentType) {
        where.contentType = contentType;
      }

      if (severity) {
        where.metadata = {
          path: ['severity'],
          equals: severity
        };
      }

      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                userType: true
              }
            },
            moderator: {
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
        prisma.contentModeration.count({ where })
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
      console.error('Erro ao obter denúncias de comportamento:', error);
      return {
        success: false,
        error: 'Erro ao obter denúncias de comportamento'
      };
    }
  }

  /**
   * Obter denúncia específica
   */
  async getBehaviorReport(reportId) {
    try {
      const report = await prisma.contentModeration.findUnique({
        where: { id: reportId },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          moderator: {
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
   * Moderar denúncia
   */
  async moderateReport(reportId, moderatorId, moderationData) {
    try {
      const {
        status,
        action,
        notes
      } = moderationData;

      const report = await prisma.contentModeration.findUnique({
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
          error: 'Denúncia já foi moderada'
        };
      }

      const updatedReport = await prisma.contentModeration.update({
        where: { id: reportId },
        data: {
          status,
          action,
          notes,
          moderatedAt: new Date(),
          moderatedBy: moderatorId
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              userType: true
            }
          }
        }
      });

      // Aplicar ação se necessário
      if (action) {
        await this.applyModerationAction(report, action, moderatorId);
      }

      return {
        success: true,
        data: updatedReport
      };
    } catch (error) {
      console.error('Erro ao moderar denúncia:', error);
      return {
        success: false,
        error: 'Erro ao moderar denúncia'
      };
    }
  }

  /**
   * Aplicar ação de moderação
   */
  async applyModerationAction(report, action, moderatorId) {
    try {
      const { contentId, contentType, metadata } = report;
      const reportedUserId = metadata?.reportedUserId;

      switch (action) {
        case 'WARN':
          // Criar aviso para o usuário
          await this.createUserWarning(reportedUserId, moderatorId, {
            reason: report.reason,
            description: report.description,
            reportId: report.id
          });
          break;

        case 'SUSPEND':
          // Suspender usuário temporariamente
          await this.suspendUser(reportedUserId, moderatorId, {
            reason: report.reason,
            description: report.description,
            duration: 7, // 7 dias
            reportId: report.id
          });
          break;

        case 'HIDE':
          // Ocultar conteúdo
          await this.hideContent(contentId, contentType, moderatorId);
          break;

        case 'DELETE':
          // Deletar conteúdo
          await this.deleteContent(contentId, contentType, moderatorId);
          break;

        case 'BLOCK':
          // Bloquear usuário
          await this.blockUser(reportedUserId, moderatorId, {
            reason: report.reason,
            description: report.description,
            reportId: report.id
          });
          break;
      }
    } catch (error) {
      console.error('Erro ao aplicar ação de moderação:', error);
    }
  }

  /**
   * Criar aviso para usuário
   */
  async createUserWarning(userId, moderatorId, warningData) {
    try {
      // Implementar sistema de avisos
      console.log(`Aviso criado para usuário ${userId}:`, warningData);
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
    }
  }

  /**
   * Suspender usuário
   */
  async suspendUser(userId, moderatorId, suspensionData) {
    try {
      const { reason, description, duration, reportId } = suspensionData;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      await prisma.userBlock.create({
        data: {
          blockedUserId: userId,
          blockedBy: moderatorId,
          reason: 'INAPPROPRIATE_BEHAVIOR',
          description: `${reason}: ${description}`,
          duration,
          expiresAt,
          isActive: true
        }
      });

      // Atualizar status do usuário para suspenso
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
    }
  }

  /**
   * Bloquear usuário
   */
  async blockUser(userId, moderatorId, blockData) {
    try {
      const { reason, description, reportId } = blockData;

      await prisma.userBlock.create({
        data: {
          blockedUserId: userId,
          blockedBy: moderatorId,
          reason: 'INAPPROPRIATE_BEHAVIOR',
          description: `${reason}: ${description}`,
          isActive: true
        }
      });

      // Atualizar status do usuário para bloqueado
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
    }
  }

  /**
   * Ocultar conteúdo
   */
  async hideContent(contentId, contentType, moderatorId) {
    try {
      // Implementar lógica para ocultar conteúdo baseado no tipo
      switch (contentType) {
        case 'EVALUATION':
          await prisma.evaluation.update({
            where: { id: contentId },
            data: { isPublic: false, status: 'HIDDEN' }
          });
          break;
        case 'OPPORTUNITY':
          await prisma.opportunity.update({
            where: { id: contentId },
            data: { isActive: false }
          });
          break;
        // Adicionar outros tipos conforme necessário
      }
    } catch (error) {
      console.error('Erro ao ocultar conteúdo:', error);
    }
  }

  /**
   * Deletar conteúdo
   */
  async deleteContent(contentId, contentType, moderatorId) {
    try {
      // Implementar lógica para deletar conteúdo baseado no tipo
      switch (contentType) {
        case 'EVALUATION':
          await prisma.evaluation.delete({
            where: { id: contentId }
          });
          break;
        case 'OPPORTUNITY':
          await prisma.opportunity.delete({
            where: { id: contentId }
          });
          break;
        // Adicionar outros tipos conforme necessário
      }
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
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
        reviewedReports,
        resolvedReports,
        reasonStats,
        statusStats,
        contentTypeStats,
        severityStats
      ] = await Promise.all([
        prisma.contentModeration.count({ where }),
        prisma.contentModeration.count({ where: { ...where, status: 'PENDING' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'REVIEWED' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.contentModeration.groupBy({
          by: ['reason'],
          where,
          _count: { id: true }
        }),
        prisma.contentModeration.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        }),
        prisma.contentModeration.groupBy({
          by: ['contentType'],
          where,
          _count: { id: true }
        }),
        this.getSeverityStats(where)
      ]);

      return {
        success: true,
        data: {
          totalReports,
          pendingReports,
          reviewedReports,
          resolvedReports,
          resolutionRate: totalReports > 0 ? ((reviewedReports + resolvedReports) / totalReports) * 100 : 0,
          reasonStats: reasonStats.map(stat => ({
            reason: stat.reason,
            count: stat._count.id
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.id
          })),
          contentTypeStats: contentTypeStats.map(stat => ({
            contentType: stat.contentType,
            count: stat._count.id
          })),
          severityStats
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
   * Obter estatísticas de severidade
   */
  async getSeverityStats(where) {
    try {
      const reports = await prisma.contentModeration.findMany({
        where,
        select: {
          metadata: true
        }
      });

      const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

      reports.forEach(report => {
        const severity = report.metadata?.severity || 'MEDIUM';
        if (severityCounts.hasOwnProperty(severity)) {
          severityCounts[severity]++;
        }
      });

      return Object.keys(severityCounts).map(severity => ({
        severity,
        count: severityCounts[severity]
      }));
    } catch (error) {
      console.error('Erro ao obter estatísticas de severidade:', error);
      return [];
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
        reportedBy: userId
      };

      if (status) {
        where.status = status;
      }

      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            moderator: {
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
        prisma.contentModeration.count({ where })
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
      const report = await prisma.contentModeration.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }

      if (report.reportedBy !== userId) {
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

      await prisma.contentModeration.update({
        where: { id: reportId },
        data: {
          status: 'REJECTED',
          moderatedAt: new Date(),
          notes: 'Cancelada pelo usuário'
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

module.exports = new BehaviorReportService();
