const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ContentModerationService {
  /**
   * Reportar conteúdo para moderação
   */
  async reportContent(reportedBy, contentType, contentId, reason, description = null) {
    try {
      // Verificar se o reportador existe
      const reporter = await prisma.user.findUnique({
        where: { id: reportedBy }
      });

      if (!reporter) {
        return {
          success: false,
          error: 'Usuário reportador não encontrado'
        };
      }

      // Verificar se o conteúdo existe para o tipo especificado
      // Esta lógica pode ser mais complexa dependendo do contentType
      // Por exemplo, se contentType é 'USER_PROFILE', verificar se o User existe
      // Se contentType é 'MESSAGE', verificar se a Message existe, etc.
      // Por simplicidade, vamos apenas criar o ContentModeration record.

      // Verificar se já existe um relatório ativo para este conteúdo
      const existingReport = await prisma.contentModeration.findFirst({
        where: {
          contentType,
          contentId,
          status: { in: ['PENDING', 'REVIEWED'] }
        }
      });

      if (existingReport) {
        return {
          success: false,
          error: 'Já existe um relatório ativo para este conteúdo'
        };
      }

      // Criar relatório de moderação
      const report = await prisma.contentModeration.create({
        data: {
          reportedBy,
          contentType,
          contentId,
          reason,
          description,
          status: 'PENDING'
        },
        include: {
          reporter: {
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
        data: report
      };

    } catch (error) {
      console.error('Erro ao reportar conteúdo:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Moderar conteúdo
   */
  async moderateContent(reportId, moderatedBy, status, action = null, notes = null) {
    try {
      const report = await prisma.contentModeration.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Relatório de moderação não encontrado'
        };
      }

      if (report.status !== 'PENDING') {
        return {
          success: false,
          error: 'Apenas relatórios pendentes podem ser moderados'
        };
      }

      // Verificar se o moderador tem permissão
      const moderator = await prisma.user.findUnique({
        where: { id: moderatedBy }
      });

      if (!moderator || !['ADMIN', 'MODERATOR'].includes(moderator.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para moderar conteúdo'
        };
      }

      // Atualizar relatório de moderação
      const updatedReport = await prisma.contentModeration.update({
        where: { id: reportId },
        data: {
          status,
          moderatedBy,
          moderatedAt: new Date(),
          action,
          notes
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      // Aplicar ação de moderação
      if (action) {
        await this.applyModerationAction(report, action, moderatedBy);
      }

      return {
        success: true,
        data: updatedReport
      };

    } catch (error) {
      console.error('Erro ao moderar conteúdo:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Aplicar ação de moderação
   */
  async applyModerationAction(report, action, moderatedBy) {
    try {
      switch (action) {
        case 'HIDE':
          await this.hideContent(report.contentType, report.contentId);
          break;
        case 'DELETE':
          await this.deleteContent(report.contentType, report.contentId);
          break;
        case 'WARN':
          await this.warnUser(report.reportedBy, report.contentType, report.contentId);
          break;
        case 'SUSPEND':
          await this.suspendUser(report.reportedBy, moderatedBy, 'VIOLATION_OF_TERMS', 'Suspensão por conteúdo inadequado');
          break;
        default:
          console.log(`Ação de moderação não implementada: ${action}`);
      }
    } catch (error) {
      console.error('Erro ao aplicar ação de moderação:', error);
    }
  }

  /**
   * Ocultar conteúdo
   */
  async hideContent(contentType, contentId) {
    try {
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
        case 'USER_PROFILE':
          await prisma.user.update({
            where: { id: contentId },
            data: { isActive: false }
          });
          break;
        case 'MESSAGE':
          await prisma.message.update({
            where: { id: contentId },
            data: { isDeleted: true }
          });
          break;
        case 'COMMENT':
          await prisma.comment.update({
            where: { id: contentId },
            data: { isDeleted: true }
          });
          break;
        default:
          console.log(`Tipo de conteúdo não suportado para ocultação: ${contentType}`);
      }
    } catch (error) {
      console.error('Erro ao ocultar conteúdo:', error);
    }
  }

  /**
   * Deletar conteúdo
   */
  async deleteContent(contentType, contentId) {
    try {
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
        case 'MESSAGE':
          await prisma.message.delete({
            where: { id: contentId }
          });
          break;
        case 'COMMENT':
          await prisma.comment.delete({
            where: { id: contentId }
          });
          break;
        default:
          console.log(`Tipo de conteúdo não suportado para exclusão: ${contentType}`);
      }
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
    }
  }

  /**
   * Avisar usuário
   */
  async warnUser(userId, contentType, contentId) {
    try {
      // Implementar lógica para enviar aviso ao usuário
      // Por exemplo, criar uma notificação ou enviar um email
      console.log(`Aviso enviado ao usuário ${userId} sobre conteúdo ${contentType}:${contentId}`);
    } catch (error) {
      console.error('Erro ao avisar usuário:', error);
    }
  }

  /**
   * Suspender usuário
   */
  async suspendUser(userId, suspendedBy, reason, description) {
    try {
      // Implementar lógica para suspender usuário
      // Por exemplo, criar um UserBlock
      console.log(`Usuário ${userId} suspenso por ${reason}: ${description}`);
    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
    }
  }

  /**
   * Obter relatórios de moderação
   */
  async getModerationReports(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        contentType,
        reason,
        status,
        reportedBy,
        moderatedBy,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (contentType) {
        where.contentType = contentType;
      }

      if (reason) {
        where.reason = reason;
      }

      if (status) {
        where.status = status;
      }

      if (reportedBy) {
        where.reportedBy = reportedBy;
      }

      if (moderatedBy) {
        where.moderatedBy = moderatedBy;
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

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            moderator: {
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
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios de moderação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatório específico
   */
  async getModerationReport(reportId) {
    try {
      const report = await prisma.contentModeration.findUnique({
        where: { id: reportId },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      if (!report) {
        return {
          success: false,
          error: 'Relatório de moderação não encontrado'
        };
      }

      return {
        success: true,
        data: report
      };

    } catch (error) {
      console.error('Erro ao obter relatório de moderação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de moderação
   */
  async getModerationStats(filters = {}) {
    try {
      const { startDate, endDate } = filters;

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
        approvedReports,
        rejectedReports,
        hiddenReports
      ] = await Promise.all([
        prisma.contentModeration.count({ where }),
        prisma.contentModeration.count({ where: { ...where, status: 'PENDING' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'REVIEWED' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'REJECTED' } }),
        prisma.contentModeration.count({ where: { ...where, status: 'HIDDEN' } })
      ]);

      return {
        success: true,
        data: {
          total: totalReports,
          pending: pendingReports,
          reviewed: reviewedReports,
          approved: approvedReports,
          rejected: rejectedReports,
          hidden: hiddenReports
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de moderação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios por status
   */
  async getReportsByStatus(status, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        contentType,
        reason,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status
      };

      if (contentType) {
        where.contentType = contentType;
      }

      if (reason) {
        where.reason = reason;
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

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            moderator: {
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
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios por status:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios por tipo de conteúdo
   */
  async getReportsByContentType(contentType, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        reason,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        contentType
      };

      if (reason) {
        where.reason = reason;
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

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            moderator: {
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
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios por tipo de conteúdo:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios por motivo
   */
  async getReportsByReason(reason, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        contentType,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        reason
      };

      if (contentType) {
        where.contentType = contentType;
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

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            moderator: {
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
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios por motivo:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios pendentes
   */
  async getPendingReports(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        contentType,
        reason,
        sortBy = 'createdAt',
        sortOrder = 'asc'
      } = filters;

      const where = {
        status: 'PENDING'
      };

      if (contentType) {
        where.contentType = contentType;
      }

      if (reason) {
        where.reason = reason;
      }

      const [reports, total] = await Promise.all([
        prisma.contentModeration.findMany({
          where,
          include: {
            reporter: {
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
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios pendentes:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new ContentModerationService();
