const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class VolunteerApprovalService {
  /**
   * Aprovar voluntário para uma instituição
   */
  async approveVolunteer(volunteerId, institutionId, approvedBy, notes = null) {
    try {
      // Verificar se o voluntário existe
      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId },
        include: { profile: true }
      });

      if (!volunteer || volunteer.userType !== 'VOLUNTEER') {
        return {
          success: false,
          error: 'Voluntário não encontrado'
        };
      }

      // Verificar se a instituição existe
      const institution = await prisma.user.findUnique({
        where: { id: institutionId },
        include: { profile: true }
      });

      if (!institution || institution.userType !== 'INSTITUTION') {
        return {
          success: false,
          error: 'Instituição não encontrada'
        };
      }

      // Verificar se o aprovador tem permissão
      const approver = await prisma.user.findUnique({
        where: { id: approvedBy }
      });

      if (!approver || !['ADMIN', 'INSTITUTION'].includes(approver.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para aprovar voluntários'
        };
      }

      // Verificar se já existe uma aprovação ativa
      const existingApproval = await prisma.userApproval.findFirst({
        where: {
          volunteerId,
          institutionId,
          status: { in: ['PENDING', 'APPROVED'] }
        }
      });

      if (existingApproval) {
        return {
          success: false,
          error: 'Já existe uma aprovação ativa para este voluntário nesta instituição'
        };
      }

      // Criar aprovação
      const approval = await prisma.userApproval.create({
        data: {
          volunteerId,
          institutionId,
          approvedBy,
          status: 'APPROVED',
          notes,
          approvedAt: new Date()
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
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: approval
      };

    } catch (error) {
      console.error('Erro ao aprovar voluntário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Rejeitar voluntário
   */
  async rejectVolunteer(volunteerId, institutionId, rejectedBy, reason, notes = null) {
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

      // Verificar se o rejeitador tem permissão
      const rejector = await prisma.user.findUnique({
        where: { id: rejectedBy }
      });

      if (!rejector || !['ADMIN', 'INSTITUTION'].includes(rejector.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para rejeitar voluntários'
        };
      }

      // Verificar se existe uma aprovação pendente
      const existingApproval = await prisma.userApproval.findFirst({
        where: {
          volunteerId,
          institutionId,
          status: 'PENDING'
        }
      });

      if (!existingApproval) {
        return {
          success: false,
          error: 'Não existe uma aprovação pendente para este voluntário nesta instituição'
        };
      }

      // Atualizar aprovação para rejeitada
      const approval = await prisma.userApproval.update({
        where: { id: existingApproval.id },
        data: {
          status: 'REJECTED',
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason: reason,
          notes
        },
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: approval
      };

    } catch (error) {
      console.error('Erro ao rejeitar voluntário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter aprovações de voluntários
   */
  async getVolunteerApprovals(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        institutionId,
        volunteerId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (status) {
        where.status = status;
      }

      if (institutionId) {
        where.institutionId = institutionId;
      }

      if (volunteerId) {
        where.volunteerId = volunteerId;
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

      const [approvals, total] = await Promise.all([
        prisma.userApproval.findMany({
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
            },
            approver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.userApproval.count({ where })
      ]);

      return {
        success: true,
        data: {
          approvals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter aprovações de voluntários:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter aprovação específica
   */
  async getVolunteerApproval(approvalId) {
    try {
      const approval = await prisma.userApproval.findUnique({
        where: { id: approvalId },
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
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!approval) {
        return {
          success: false,
          error: 'Aprovação não encontrada'
        };
      }

      return {
        success: true,
        data: approval
      };

    } catch (error) {
      console.error('Erro ao obter aprovação de voluntário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Revogar aprovação
   */
  async revokeApproval(approvalId, revokedBy, reason, notes = null) {
    try {
      const approval = await prisma.userApproval.findUnique({
        where: { id: approvalId }
      });

      if (!approval) {
        return {
          success: false,
          error: 'Aprovação não encontrada'
        };
      }

      if (approval.status !== 'APPROVED') {
        return {
          success: false,
          error: 'Apenas aprovações aprovadas podem ser revogadas'
        };
      }

      const updatedApproval = await prisma.userApproval.update({
        where: { id: approvalId },
        data: {
          status: 'REVOKED',
          revokedBy,
          revokedAt: new Date(),
          revocationReason: reason,
          notes
        },
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: updatedApproval
      };

    } catch (error) {
      console.error('Erro ao revogar aprovação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de aprovações
   */
  async getApprovalStats(filters = {}) {
    try {
      const { institutionId, startDate, endDate } = filters;

      const where = {};

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
        totalApprovals,
        pendingApprovals,
        approvedApprovals,
        rejectedApprovals,
        revokedApprovals
      ] = await Promise.all([
        prisma.userApproval.count({ where }),
        prisma.userApproval.count({ where: { ...where, status: 'PENDING' } }),
        prisma.userApproval.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.userApproval.count({ where: { ...where, status: 'REJECTED' } }),
        prisma.userApproval.count({ where: { ...where, status: 'REVOKED' } })
      ]);

      return {
        success: true,
        data: {
          total: totalApprovals,
          pending: pendingApprovals,
          approved: approvedApprovals,
          rejected: rejectedApprovals,
          revoked: revokedApprovals,
          approvalRate: totalApprovals > 0 ? (approvedApprovals / totalApprovals) * 100 : 0
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de aprovações:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter voluntários aprovados por instituição
   */
  async getApprovedVolunteersByInstitution(institutionId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'approvedAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        institutionId,
        status: 'APPROVED'
      };

      if (startDate || endDate) {
        where.approvedAt = {};
        if (startDate) {
          where.approvedAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.approvedAt.lte = new Date(endDate);
        }
      }

      const [approvals, total] = await Promise.all([
        prisma.userApproval.findMany({
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.userApproval.count({ where })
      ]);

      return {
        success: true,
        data: {
          approvals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter voluntários aprovados por instituição:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter aprovações pendentes
   */
  async getPendingApprovals(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        institutionId,
        sortBy = 'createdAt',
        sortOrder = 'asc'
      } = filters;

      const where = {
        status: 'PENDING'
      };

      if (institutionId) {
        where.institutionId = institutionId;
      }

      const [approvals, total] = await Promise.all([
        prisma.userApproval.findMany({
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
        prisma.userApproval.count({ where })
      ]);

      return {
        success: true,
        data: {
          approvals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter aprovações pendentes:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new VolunteerApprovalService();
