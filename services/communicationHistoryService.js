const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommunicationHistoryService {
  /**
   * Registrar comunicação no histórico
   */
  async logCommunication(data) {
    try {
      const {
        type,
        channel,
        senderId,
        recipientId,
        subject,
        content,
        metadata = {},
        status = 'SENT',
        sentAt = new Date(),
        deliveredAt = null,
        openedAt = null,
        clickedAt = null,
        errorMessage = null
      } = data;

      const communication = await prisma.communicationHistory.create({
        data: {
          type,
          channel,
          senderId,
          recipientId,
          subject,
          content,
          metadata,
          status,
          sentAt,
          deliveredAt,
          openedAt,
          clickedAt,
          errorMessage
        }
      });

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao registrar comunicação no histórico:', error);
      return {
        success: false,
        error: 'Erro ao registrar comunicação no histórico'
      };
    }
  }

  /**
   * Obter histórico de comunicações do usuário
   */
  async getUserCommunicationHistory(userId, filters = {}) {
    try {
      const {
        type,
        channel,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sortBy = 'sentAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      };

      if (type) {
        where.type = type;
      }

      if (channel) {
        where.channel = channel;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
          where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.sentAt.lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [communications, total] = await Promise.all([
        prisma.communicationHistory.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            recipient: {
              select: {
                id: true,
                name: true,
                email: true,
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
        prisma.communicationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          communications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter histórico de comunicações do usuário:', error);
      return {
        success: false,
        error: 'Erro ao obter histórico de comunicações'
      };
    }
  }

  /**
   * Obter histórico de comunicações de uma campanha
   */
  async getCampaignCommunicationHistory(campaignId, filters = {}) {
    try {
      const {
        channel,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sortBy = 'sentAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        metadata: {
          path: ['campaignId'],
          equals: campaignId
        }
      };

      if (channel) {
        where.channel = channel;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
          where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.sentAt.lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [communications, total] = await Promise.all([
        prisma.communicationHistory.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            recipient: {
              select: {
                id: true,
                name: true,
                email: true,
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
        prisma.communicationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          communications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter histórico de comunicações da campanha:', error);
      return {
        success: false,
        error: 'Erro ao obter histórico de comunicações da campanha'
      };
    }
  }

  /**
   * Obter estatísticas de comunicação
   */
  async getCommunicationStats(filters = {}) {
    try {
      const {
        userId,
        type,
        channel,
        startDate,
        endDate,
        groupBy = 'day'
      } = filters;

      const where = {};

      if (userId) {
        where.OR = [
          { senderId: userId },
          { recipientId: userId }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (channel) {
        where.channel = channel;
      }

      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
          where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.sentAt.lte = new Date(endDate);
        }
      }

      // Estatísticas gerais
      const [
        totalCommunications,
        sentCount,
        deliveredCount,
        openedCount,
        clickedCount,
        failedCount
      ] = await Promise.all([
        prisma.communicationHistory.count({ where }),
        prisma.communicationHistory.count({ where: { ...where, status: 'SENT' } }),
        prisma.communicationHistory.count({ where: { ...where, status: 'DELIVERED' } }),
        prisma.communicationHistory.count({ where: { ...where, openedAt: { not: null } } }),
        prisma.communicationHistory.count({ where: { ...where, clickedAt: { not: null } } }),
        prisma.communicationHistory.count({ where: { ...where, status: 'FAILED' } })
      ]);

      // Estatísticas por canal
      const channelStats = await prisma.communicationHistory.groupBy({
        by: ['channel'],
        where,
        _count: {
          id: true
        }
      });

      // Estatísticas por tipo
      const typeStats = await prisma.communicationHistory.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true
        }
      });

      // Estatísticas por status
      const statusStats = await prisma.communicationHistory.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true
        }
      });

      // Estatísticas temporais
      let temporalStats = [];
      if (groupBy === 'day') {
        temporalStats = await prisma.communicationHistory.groupBy({
          by: ['sentAt'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            sentAt: 'asc'
          }
        });
      } else if (groupBy === 'hour') {
        // Agrupar por hora do dia
        const rawData = await prisma.communicationHistory.findMany({
          where,
          select: {
            sentAt: true
          }
        });

        const hourlyStats = {};
        rawData.forEach(comm => {
          const hour = new Date(comm.sentAt).getHours();
          hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        });

        temporalStats = Object.entries(hourlyStats).map(([hour, count]) => ({
          hour: parseInt(hour),
          count
        }));
      }

      // Taxas de engajamento
      const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
      const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
      const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
      const failureRate = totalCommunications > 0 ? (failedCount / totalCommunications) * 100 : 0;

      return {
        success: true,
        data: {
          overview: {
            totalCommunications,
            sentCount,
            deliveredCount,
            openedCount,
            clickedCount,
            failedCount,
            deliveryRate: Math.round(deliveryRate * 100) / 100,
            openRate: Math.round(openRate * 100) / 100,
            clickRate: Math.round(clickRate * 100) / 100,
            failureRate: Math.round(failureRate * 100) / 100
          },
          channelStats: channelStats.map(stat => ({
            channel: stat.channel,
            count: stat._count.id
          })),
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.id
          })),
          temporalStats
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de comunicação:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas de comunicação'
      };
    }
  }

  /**
   * Obter histórico de comunicações entre dois usuários
   */
  async getConversationHistory(user1Id, user2Id, filters = {}) {
    try {
      const {
        type,
        channel,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sortBy = 'sentAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        OR: [
          {
            senderId: user1Id,
            recipientId: user2Id
          },
          {
            senderId: user2Id,
            recipientId: user1Id
          }
        ]
      };

      if (type) {
        where.type = type;
      }

      if (channel) {
        where.channel = channel;
      }

      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) {
          where.sentAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.sentAt.lte = new Date(endDate);
        }
      }

      const skip = (page - 1) * limit;

      const [communications, total] = await Promise.all([
        prisma.communicationHistory.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            },
            recipient: {
              select: {
                id: true,
                name: true,
                email: true,
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
        prisma.communicationHistory.count({ where })
      ]);

      return {
        success: true,
        data: {
          communications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter histórico de conversa:', error);
      return {
        success: false,
        error: 'Erro ao obter histórico de conversa'
      };
    }
  }

  /**
   * Marcar comunicação como entregue
   */
  async markAsDelivered(communicationId) {
    try {
      const communication = await prisma.communicationHistory.update({
        where: { id: communicationId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao marcar comunicação como entregue:', error);
      return {
        success: false,
        error: 'Erro ao marcar comunicação como entregue'
      };
    }
  }

  /**
   * Marcar comunicação como aberta
   */
  async markAsOpened(communicationId) {
    try {
      const communication = await prisma.communicationHistory.update({
        where: { id: communicationId },
        data: {
          openedAt: new Date()
        }
      });

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao marcar comunicação como aberta:', error);
      return {
        success: false,
        error: 'Erro ao marcar comunicação como aberta'
      };
    }
  }

  /**
   * Marcar comunicação como clicada
   */
  async markAsClicked(communicationId) {
    try {
      const communication = await prisma.communicationHistory.update({
        where: { id: communicationId },
        data: {
          clickedAt: new Date()
        }
      });

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao marcar comunicação como clicada:', error);
      return {
        success: false,
        error: 'Erro ao marcar comunicação como clicada'
      };
    }
  }

  /**
   * Marcar comunicação como falhada
   */
  async markAsFailed(communicationId, errorMessage) {
    try {
      const communication = await prisma.communicationHistory.update({
        where: { id: communicationId },
        data: {
          status: 'FAILED',
          errorMessage,
          failedAt: new Date()
        }
      });

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao marcar comunicação como falhada:', error);
      return {
        success: false,
        error: 'Erro ao marcar comunicação como falhada'
      };
    }
  }

  /**
   * Obter comunicação específica
   */
  async getCommunication(communicationId) {
    try {
      const communication = await prisma.communicationHistory.findUnique({
        where: { id: communicationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      if (!communication) {
        return {
          success: false,
          error: 'Comunicação não encontrada'
        };
      }

      return {
        success: true,
        data: communication
      };
    } catch (error) {
      console.error('Erro ao obter comunicação:', error);
      return {
        success: false,
        error: 'Erro ao obter comunicação'
      };
    }
  }

  /**
   * Excluir comunicação do histórico
   */
  async deleteCommunication(communicationId, deletedBy) {
    try {
      const communication = await prisma.communicationHistory.findUnique({
        where: { id: communicationId }
      });

      if (!communication) {
        return {
          success: false,
          error: 'Comunicação não encontrada'
        };
      }

      // Verificar se o usuário tem permissão para excluir
      if (communication.senderId !== deletedBy && communication.recipientId !== deletedBy) {
        return {
          success: false,
          error: 'Usuário não tem permissão para excluir esta comunicação'
        };
      }

      await prisma.communicationHistory.delete({
        where: { id: communicationId }
      });

      return {
        success: true,
        message: 'Comunicação excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir comunicação:', error);
      return {
        success: false,
        error: 'Erro ao excluir comunicação'
      };
    }
  }

  /**
   * Obter resumo de comunicações recentes
   */
  async getRecentCommunicationsSummary(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const where = {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ],
        sentAt: {
          gte: startDate
        }
      };

      const [
        totalCommunications,
        unreadCount,
        channelStats,
        typeStats
      ] = await Promise.all([
        prisma.communicationHistory.count({ where }),
        prisma.communicationHistory.count({
          where: {
            ...where,
            recipientId: userId,
            openedAt: null
          }
        }),
        prisma.communicationHistory.groupBy({
          by: ['channel'],
          where,
          _count: { id: true }
        }),
        prisma.communicationHistory.groupBy({
          by: ['type'],
          where,
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalCommunications,
          unreadCount,
          channelStats: channelStats.map(stat => ({
            channel: stat.channel,
            count: stat._count.id
          })),
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao obter resumo de comunicações recentes:', error);
      return {
        success: false,
        error: 'Erro ao obter resumo de comunicações recentes'
      };
    }
  }
}

module.exports = new CommunicationHistoryService();
