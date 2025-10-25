const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ImpactReportService {
  /**
   * Criar relatório de impacto
   */
  async createImpactReport(companyId, generatedBy, reportData) {
    try {
      const {
        title,
        description,
        period,
        startDate,
        endDate,
        metrics,
        achievements,
        challenges,
        recommendations,
        isPublic = false
      } = reportData;

      // Verificar se a empresa existe
      const company = await prisma.user.findUnique({
        where: { id: companyId }
      });

      if (!company || company.userType !== 'COMPANY') {
        return {
          success: false,
          error: 'Empresa não encontrada'
        };
      }

      // Verificar se o gerador tem permissão
      const generator = await prisma.user.findUnique({
        where: { id: generatedBy }
      });

      if (!generator || !['ADMIN', 'COMPANY'].includes(generator.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para criar relatórios de impacto'
        };
      }

      // Criar relatório de impacto
      const report = await prisma.impactReport.create({
        data: {
          companyId,
          generatedBy,
          title,
          description,
          period,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          metrics: JSON.stringify(metrics),
          achievements: JSON.stringify(achievements),
          challenges: JSON.stringify(challenges),
          recommendations: JSON.stringify(recommendations),
          isPublic,
          status: 'DRAFT'
        },
        include: {
          company: {
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
          generator: {
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
      console.error('Erro ao criar relatório de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualizar relatório de impacto
   */
  async updateImpactReport(reportId, updateData, updatedBy) {
    try {
      const report = await prisma.impactReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Relatório de impacto não encontrado'
        };
      }

      // Verificar se o usuário tem permissão para atualizar
      const updater = await prisma.user.findUnique({
        where: { id: updatedBy }
      });

      if (!updater || !['ADMIN', 'COMPANY'].includes(updater.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para atualizar relatórios de impacto'
        };
      }

      // Preparar dados para atualização
      const updateFields = { ...updateData };
      if (updateFields.metrics) {
        updateFields.metrics = JSON.stringify(updateFields.metrics);
      }
      if (updateFields.achievements) {
        updateFields.achievements = JSON.stringify(updateFields.achievements);
      }
      if (updateFields.challenges) {
        updateFields.challenges = JSON.stringify(updateFields.challenges);
      }
      if (updateFields.recommendations) {
        updateFields.recommendations = JSON.stringify(updateFields.recommendations);
      }

      const updatedReport = await prisma.impactReport.update({
        where: { id: reportId },
        data: {
          ...updateFields,
          updatedAt: new Date()
        },
        include: {
          company: {
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
          generator: {
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
        data: updatedReport
      };

    } catch (error) {
      console.error('Erro ao atualizar relatório de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios de impacto
   */
  async getImpactReports(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyId,
        generatedBy,
        status,
        isPublic,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (companyId) {
        where.companyId = companyId;
      }

      if (generatedBy) {
        where.generatedBy = generatedBy;
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

      const [reports, total] = await Promise.all([
        prisma.impactReport.findMany({
          where,
          include: {
            company: {
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
            generator: {
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
        prisma.impactReport.count({ where })
      ]);

      // Parse JSON fields
      const parsedReports = reports.map(report => ({
        ...report,
        metrics: JSON.parse(report.metrics || '{}'),
        achievements: JSON.parse(report.achievements || '[]'),
        challenges: JSON.parse(report.challenges || '[]'),
        recommendations: JSON.parse(report.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          reports: parsedReports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatório específico
   */
  async getImpactReport(reportId) {
    try {
      const report = await prisma.impactReport.findUnique({
        where: { id: reportId },
        include: {
          company: {
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
          generator: {
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
          error: 'Relatório de impacto não encontrado'
        };
      }

      // Parse JSON fields
      const parsedReport = {
        ...report,
        metrics: JSON.parse(report.metrics || '{}'),
        achievements: JSON.parse(report.achievements || '[]'),
        challenges: JSON.parse(report.challenges || '[]'),
        recommendations: JSON.parse(report.recommendations || '[]')
      };

      return {
        success: true,
        data: parsedReport
      };

    } catch (error) {
      console.error('Erro ao obter relatório de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Publicar relatório de impacto
   */
  async publishImpactReport(reportId, publishedBy) {
    try {
      const report = await prisma.impactReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Relatório de impacto não encontrado'
        };
      }

      if (report.status !== 'DRAFT') {
        return {
          success: false,
          error: 'Apenas relatórios em rascunho podem ser publicados'
        };
      }

      const updatedReport = await prisma.impactReport.update({
        where: { id: reportId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedBy
        },
        include: {
          company: {
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
          generator: {
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
        data: updatedReport
      };

    } catch (error) {
      console.error('Erro ao publicar relatório de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de relatórios de impacto
   */
  async getImpactReportStats(filters = {}) {
    try {
      const { companyId, startDate, endDate } = filters;

      const where = {};

      if (companyId) {
        where.companyId = companyId;
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
        totalReports,
        draftReports,
        publishedReports,
        publicReports
      ] = await Promise.all([
        prisma.impactReport.count({ where }),
        prisma.impactReport.count({ where: { ...where, status: 'DRAFT' } }),
        prisma.impactReport.count({ where: { ...where, status: 'PUBLISHED' } }),
        prisma.impactReport.count({ where: { ...where, isPublic: true } })
      ]);

      return {
        success: true,
        data: {
          total: totalReports,
          draft: draftReports,
          published: publishedReports,
          public: publicReports
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de relatórios de impacto:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios por status
   */
  async getImpactReportsByStatus(status, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status
      };

      if (companyId) {
        where.companyId = companyId;
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
        prisma.impactReport.findMany({
          where,
          include: {
            company: {
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
            generator: {
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
        prisma.impactReport.count({ where })
      ]);

      // Parse JSON fields
      const parsedReports = reports.map(report => ({
        ...report,
        metrics: JSON.parse(report.metrics || '{}'),
        achievements: JSON.parse(report.achievements || '[]'),
        challenges: JSON.parse(report.challenges || '[]'),
        recommendations: JSON.parse(report.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          reports: parsedReports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios de impacto por status:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios por período
   */
  async getImpactReportsByPeriod(startDate, endDate, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyId,
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

      if (companyId) {
        where.companyId = companyId;
      }

      if (status) {
        where.status = status;
      }

      const [reports, total] = await Promise.all([
        prisma.impactReport.findMany({
          where,
          include: {
            company: {
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
            generator: {
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
        prisma.impactReport.count({ where })
      ]);

      // Parse JSON fields
      const parsedReports = reports.map(report => ({
        ...report,
        metrics: JSON.parse(report.metrics || '{}'),
        achievements: JSON.parse(report.achievements || '[]'),
        challenges: JSON.parse(report.challenges || '[]'),
        recommendations: JSON.parse(report.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          reports: parsedReports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios de impacto por período:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter relatórios públicos
   */
  async getPublicImpactReports(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        companyId,
        startDate,
        endDate,
        sortBy = 'publishedAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        isPublic: true,
        status: 'PUBLISHED'
      };

      if (companyId) {
        where.companyId = companyId;
      }

      if (startDate || endDate) {
        where.publishedAt = {};
        if (startDate) {
          where.publishedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.publishedAt.lte = new Date(endDate);
        }
      }

      const [reports, total] = await Promise.all([
        prisma.impactReport.findMany({
          where,
          include: {
            company: {
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
            generator: {
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
        prisma.impactReport.count({ where })
      ]);

      // Parse JSON fields
      const parsedReports = reports.map(report => ({
        ...report,
        metrics: JSON.parse(report.metrics || '{}'),
        achievements: JSON.parse(report.achievements || '[]'),
        challenges: JSON.parse(report.challenges || '[]'),
        recommendations: JSON.parse(report.recommendations || '[]')
      }));

      return {
        success: true,
        data: {
          reports: parsedReports,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter relatórios de impacto públicos:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new ImpactReportService();
