const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de grupos de mensagens
 */
class MessageGroupService {
  
  /**
   * Criar grupo de mensagens
   * @param {string} createdBy - ID do usuário que está criando
   * @param {Object} groupData - Dados do grupo
   * @returns {Object} Resultado da operação
   */
  static async createMessageGroup(createdBy, groupData) {
    try {
      const {
        name,
        description,
        type = 'MANUAL',
        settings = {}
      } = groupData;

      // Verificar se já existe um grupo com o mesmo nome
      const existingGroup = await prisma.messageGroup.findFirst({
        where: {
          name,
          createdBy
        }
      });

      if (existingGroup) {
        return {
          success: false,
          error: 'Já existe um grupo com este nome'
        };
      }

      // Criar grupo
      const group = await prisma.messageGroup.create({
        data: {
          name,
          description,
          type,
          createdBy,
          settings
        }
      });

      return {
        success: true,
        data: group
      };

    } catch (error) {
      console.error('Erro ao criar grupo de mensagens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar grupo de mensagens
   * @param {string} groupId - ID do grupo
   * @param {string} updatedBy - ID do usuário que está atualizando
   * @param {Object} updateData - Dados para atualização
   * @returns {Object} Resultado da operação
   */
  static async updateMessageGroup(groupId, updatedBy, updateData) {
    try {
      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: updatedBy },
            { members: { some: { userId: updatedBy, role: { in: ['ADMIN', 'MODERATOR'] } } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para editá-lo'
        };
      }

      // Atualizar grupo
      const updatedGroup = await prisma.messageGroup.update({
        where: { id: groupId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedGroup
      };

    } catch (error) {
      console.error('Erro ao atualizar grupo de mensagens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adicionar membro ao grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário a ser adicionado
   * @param {string} addedBy - ID do usuário que está adicionando
   * @param {string} role - Função do membro
   * @returns {Object} Resultado da operação
   */
  static async addMemberToGroup(groupId, userId, addedBy, role = 'MEMBER') {
    try {
      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: addedBy },
            { members: { some: { userId: addedBy, role: { in: ['ADMIN', 'MODERATOR'] } } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para adicionar membros'
        };
      }

      // Verificar se o usuário já é membro
      const existingMember = await prisma.messageGroupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (existingMember) {
        return {
          success: false,
          error: 'Usuário já é membro deste grupo'
        };
      }

      // Adicionar membro
      const member = await prisma.messageGroupMember.create({
        data: {
          groupId,
          userId,
          role,
          addedBy
        }
      });

      return {
        success: true,
        data: member
      };

    } catch (error) {
      console.error('Erro ao adicionar membro ao grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remover membro do grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário a ser removido
   * @param {string} removedBy - ID do usuário que está removendo
   * @returns {Object} Resultado da operação
   */
  static async removeMemberFromGroup(groupId, userId, removedBy) {
    try {
      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: removedBy },
            { members: { some: { userId: removedBy, role: { in: ['ADMIN', 'MODERATOR'] } } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para remover membros'
        };
      }

      // Verificar se o usuário é membro
      const member = await prisma.messageGroupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (!member) {
        return {
          success: false,
          error: 'Usuário não é membro deste grupo'
        };
      }

      // Remover membro
      await prisma.messageGroupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      return {
        success: true,
        data: { removedAt: new Date() }
      };

    } catch (error) {
      console.error('Erro ao remover membro do grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter grupos do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Grupos do usuário
   */
  static async getUserGroups(userId, filters = {}) {
    try {
      const {
        type,
        status = 'ACTIVE',
        includeMembers = false,
        includeStats = false
      } = filters;

      const whereClause = {
        OR: [
          { createdBy: userId },
          { members: { some: { userId } } }
        ]
      };

      if (type) {
        whereClause.type = type;
      }

      if (status) {
        whereClause.status = status;
      }

      const groups = await prisma.messageGroup.findMany({
        where: whereClause,
        include: {
          members: includeMembers ? {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          } : false,
          _count: includeStats ? {
            select: {
              members: true,
              campaigns: true
            }
          } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: groups
      };

    } catch (error) {
      console.error('Erro ao obter grupos do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter grupo específico
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções
   * @returns {Object} Grupo
   */
  static async getMessageGroup(groupId, userId, options = {}) {
    try {
      const {
        includeMembers = true,
        includeStats = true,
        includeCampaigns = false
      } = options;

      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } }
          ]
        },
        include: {
          members: includeMembers ? {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          } : false,
          campaigns: includeCampaigns ? {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          } : false,
          _count: includeStats ? {
            select: {
              members: true,
              campaigns: true
            }
          } : false
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para visualizá-lo'
        };
      }

      return {
        success: true,
        data: group
      };

    } catch (error) {
      console.error('Erro ao obter grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter membros do grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Membros do grupo
   */
  static async getGroupMembers(groupId, userId, filters = {}) {
    try {
      const {
        role,
        limit = 50,
        offset = 0
      } = filters;

      // Verificar se o usuário tem acesso ao grupo
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para visualizá-lo'
        };
      }

      const whereClause = { groupId };
      if (role) {
        whereClause.role = role;
      }

      const members = await prisma.messageGroupMember.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          }
        },
        orderBy: { addedAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: members
      };

    } catch (error) {
      console.error('Erro ao obter membros do grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar função do membro
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @param {string} newRole - Nova função
   * @param {string} updatedBy - ID do usuário que está atualizando
   * @returns {Object} Resultado da operação
   */
  static async updateMemberRole(groupId, userId, newRole, updatedBy) {
    try {
      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: updatedBy },
            { members: { some: { userId: updatedBy, role: 'ADMIN' } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para atualizar funções'
        };
      }

      // Atualizar função
      const updatedMember = await prisma.messageGroupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        },
        data: {
          role: newRole
        }
      });

      return {
        success: true,
        data: updatedMember
      };

    } catch (error) {
      console.error('Erro ao atualizar função do membro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Excluir grupo
   * @param {string} groupId - ID do grupo
   * @param {string} deletedBy - ID do usuário que está excluindo
   * @returns {Object} Resultado da operação
   */
  static async deleteMessageGroup(groupId, deletedBy) {
    try {
      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          createdBy: deletedBy
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para excluí-lo'
        };
      }

      // Excluir grupo
      await prisma.messageGroup.delete({
        where: { id: groupId }
      });

      return {
        success: true,
        data: { deletedAt: new Date() }
      };

    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas do grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas do grupo
   */
  static async getGroupStats(groupId, userId) {
    try {
      // Verificar se o usuário tem acesso ao grupo
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para visualizá-lo'
        };
      }

      const [
        totalMembers,
        byRole,
        totalCampaigns,
        byCampaignStatus,
        recentCampaigns
      ] = await Promise.all([
        prisma.messageGroupMember.count({
          where: { groupId }
        }),
        prisma.messageGroupMember.groupBy({
          by: ['role'],
          where: { groupId },
          _count: { role: true }
        }),
        prisma.massMessageCampaign.count({
          where: { groupId }
        }),
        prisma.massMessageCampaign.groupBy({
          by: ['status'],
          where: { groupId },
          _count: { status: true }
        }),
        prisma.massMessageCampaign.findMany({
          where: { groupId },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            totalSent: true,
            totalDelivered: true,
            totalFailed: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      return {
        success: true,
        data: {
          totalMembers,
          byRole: byRole.map(item => ({
            role: item.role,
            count: item._count.role
          })),
          totalCampaigns,
          byCampaignStatus: byCampaignStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          recentCampaigns
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas do grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar usuários para adicionar ao grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros de busca
   * @returns {Object} Usuários encontrados
   */
  static async searchUsersForGroup(groupId, userId, filters = {}) {
    try {
      const {
        query,
        userType,
        limit = 20,
        offset = 0
      } = filters;

      // Verificar se o usuário tem acesso ao grupo
      const group = await prisma.messageGroup.findFirst({
        where: {
          id: groupId,
          OR: [
            { createdBy: userId },
            { members: { some: { userId, role: { in: ['ADMIN', 'MODERATOR'] } } } }
          ]
        }
      });

      if (!group) {
        return {
          success: false,
          error: 'Grupo não encontrado ou você não tem permissão para adicionar membros'
        };
      }

      const whereClause = {
        NOT: {
          messageGroupMembers: {
            some: { groupId }
          }
        }
      };

      if (query) {
        whereClause.OR = [
          { email: { contains: query, mode: 'insensitive' } },
          { volunteer: { firstName: { contains: query, mode: 'insensitive' } } },
          { volunteer: { lastName: { contains: query, mode: 'insensitive' } } },
          { institution: { name: { contains: query, mode: 'insensitive' } } },
          { company: { name: { contains: query, mode: 'insensitive' } } },
          { university: { name: { contains: query, mode: 'insensitive' } } }
        ];
      }

      if (userType) {
        whereClause.userType = userType;
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          userType: true,
          volunteer: { select: { firstName: true, lastName: true } },
          institution: { select: { name: true } },
          company: { select: { name: true } },
          university: { select: { name: true } }
        },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: users
      };

    } catch (error) {
      console.error('Erro ao buscar usuários para o grupo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = MessageGroupService;
