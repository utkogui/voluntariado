const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserBlockService {
  /**
   * Bloquear usuário
   */
  async blockUser(blockedUserId, blockedBy, reason, description = null, duration = null) {
    try {
      // Verificar se o usuário a ser bloqueado existe
      const blockedUser = await prisma.user.findUnique({
        where: { id: blockedUserId }
      });

      if (!blockedUser) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Verificar se o usuário que está bloqueando tem permissão
      const blocker = await prisma.user.findUnique({
        where: { id: blockedBy }
      });

      if (!blocker || !['ADMIN', 'MODERATOR'].includes(blocker.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para bloquear outros usuários'
        };
      }

      // Verificar se o usuário já está bloqueado
      const existingBlock = await prisma.userBlock.findFirst({
        where: {
          blockedUserId,
          status: 'ACTIVE'
        }
      });

      if (existingBlock) {
        return {
          success: false,
          error: 'Usuário já está bloqueado'
        };
      }

      // Calcular data de expiração se duração for fornecida
      let expiresAt = null;
      if (duration) {
        const durationMs = this.parseDuration(duration);
        if (durationMs > 0) {
          expiresAt = new Date(Date.now() + durationMs);
        }
      }

      // Criar bloqueio
      const block = await prisma.userBlock.create({
        data: {
          blockedUserId,
          blockedBy,
          reason,
          description,
          expiresAt,
          status: 'ACTIVE'
        },
        include: {
          blockedUser: {
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
          blocker: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      // Atualizar status do usuário bloqueado
      await prisma.user.update({
        where: { id: blockedUserId },
        data: { isActive: false }
      });

      return {
        success: true,
        data: block
      };

    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Desbloquear usuário
   */
  async unblockUser(blockId, unblockedBy, reason = null) {
    try {
      const block = await prisma.userBlock.findUnique({
        where: { id: blockId }
      });

      if (!block) {
        return {
          success: false,
          error: 'Bloqueio não encontrado'
        };
      }

      if (block.status !== 'ACTIVE') {
        return {
          success: false,
          error: 'Bloqueio não está ativo'
        };
      }

      // Verificar se o usuário que está desbloqueando tem permissão
      const unblocker = await prisma.user.findUnique({
        where: { id: unblockedBy }
      });

      if (!unblocker || !['ADMIN', 'MODERATOR'].includes(unblocker.userType)) {
        return {
          success: false,
          error: 'Usuário não tem permissão para desbloquear usuários'
        };
      }

      // Atualizar bloqueio
      const updatedBlock = await prisma.userBlock.update({
        where: { id: blockId },
        data: {
          status: 'INACTIVE',
          unblockedBy,
          unblockedAt: new Date(),
          unblockReason: reason
        },
        include: {
          blockedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          blocker: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      // Atualizar status do usuário desbloqueado
      await prisma.user.update({
        where: { id: block.blockedUserId },
        data: { isActive: true }
      });

      return {
        success: true,
        data: updatedBlock
      };

    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter bloqueios de usuários
   */
  async getUserBlocks(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        blockedUserId,
        blockedBy,
        reason,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {};

      if (blockedUserId) {
        where.blockedUserId = blockedUserId;
      }

      if (blockedBy) {
        where.blockedBy = blockedBy;
      }

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

      const [blocks, total] = await Promise.all([
        prisma.userBlock.findMany({
          where,
          include: {
            blockedUser: {
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
            blocker: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            unblocker: {
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
        prisma.userBlock.count({ where })
      ]);

      return {
        success: true,
        data: {
          blocks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter bloqueios de usuários:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter bloqueio específico
   */
  async getUserBlock(blockId) {
    try {
      const block = await prisma.userBlock.findUnique({
        where: { id: blockId },
        include: {
          blockedUser: {
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
          blocker: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          unblocker: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      if (!block) {
        return {
          success: false,
          error: 'Bloqueio não encontrado'
        };
      }

      return {
        success: true,
        data: block
      };

    } catch (error) {
      console.error('Erro ao obter bloqueio de usuário:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter estatísticas de bloqueios
   */
  async getBlockStats(filters = {}) {
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
        totalBlocks,
        activeBlocks,
        inactiveBlocks,
        expiredBlocks
      ] = await Promise.all([
        prisma.userBlock.count({ where }),
        prisma.userBlock.count({ where: { ...where, status: 'ACTIVE' } }),
        prisma.userBlock.count({ where: { ...where, status: 'INACTIVE' } }),
        prisma.userBlock.count({ 
          where: { 
            ...where, 
            status: 'ACTIVE',
            expiresAt: { lte: new Date() }
          } 
        })
      ]);

      return {
        success: true,
        data: {
          total: totalBlocks,
          active: activeBlocks,
          inactive: inactiveBlocks,
          expired: expiredBlocks
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de bloqueios:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter bloqueios por status
   */
  async getBlocksByStatus(status, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        status
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

      const [blocks, total] = await Promise.all([
        prisma.userBlock.findMany({
          where,
          include: {
            blockedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            blocker: {
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
        prisma.userBlock.count({ where })
      ]);

      return {
        success: true,
        data: {
          blocks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter bloqueios por status:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter bloqueios por motivo
   */
  async getBlocksByReason(reason, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        reason
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

      const [blocks, total] = await Promise.all([
        prisma.userBlock.findMany({
          where,
          include: {
            blockedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            blocker: {
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
        prisma.userBlock.count({ where })
      ]);

      return {
        success: true,
        data: {
          blocks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Erro ao obter bloqueios por motivo:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verificar se usuário está bloqueado
   */
  async isUserBlocked(userId) {
    try {
      const block = await prisma.userBlock.findFirst({
        where: {
          blockedUserId: userId,
          status: 'ACTIVE',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      return {
        success: true,
        data: {
          isBlocked: !!block,
          block: block ? {
            id: block.id,
            reason: block.reason,
            description: block.description,
            expiresAt: block.expiresAt,
            createdAt: block.createdAt
          } : null
        }
      };

    } catch (error) {
      console.error('Erro ao verificar se usuário está bloqueado:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Processar bloqueios expirados
   */
  async processExpiredBlocks() {
    try {
      const expiredBlocks = await prisma.userBlock.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lte: new Date() }
        }
      });

      for (const block of expiredBlocks) {
        await prisma.userBlock.update({
          where: { id: block.id },
          data: { status: 'INACTIVE' }
        });

        await prisma.user.update({
          where: { id: block.blockedUserId },
          data: { isActive: true }
        });
      }

      return {
        success: true,
        data: {
          processed: expiredBlocks.length
        }
      };

    } catch (error) {
      console.error('Erro ao processar bloqueios expirados:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Converter duração para milissegundos
   */
  parseDuration(duration) {
    const units = {
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    return units[duration] || 0;
  }
}

module.exports = new UserBlockService();
