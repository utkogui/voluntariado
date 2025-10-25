const { PrismaClient } = require('@prisma/client');
const EmailService = require('./emailService');
const PushNotificationService = require('./pushNotificationService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de mensagens em massa
 */
class MassMessageService {
  
  /**
   * Criar campanha de mensagem em massa
   * @param {string} createdBy - ID do usuário que está criando
   * @param {Object} campaignData - Dados da campanha
   * @returns {Object} Resultado da operação
   */
  static async createCampaign(createdBy, campaignData) {
    try {
      const {
        name,
        description,
        type = 'ANNOUNCEMENT',
        groupId,
        subject,
        content,
        contentType = 'TEXT',
        templateId,
        channels = ['EMAIL'],
        sendAt,
        timezone = 'America/Sao_Paulo',
        filters = {},
        targetUsers = []
      } = campaignData;

      // Verificar se o grupo existe (se fornecido)
      if (groupId) {
        const group = await prisma.messageGroup.findFirst({
          where: {
            id: groupId,
            OR: [
              { createdBy },
              { members: { some: { userId: createdBy } } }
            ]
          }
        });

        if (!group) {
          return {
            success: false,
            error: 'Grupo não encontrado ou você não tem permissão para usá-lo'
          };
        }
      }

      // Verificar se o template existe (se fornecido)
      if (templateId) {
        const template = await prisma.messageTemplate.findFirst({
          where: {
            id: templateId,
            OR: [
              { createdBy },
              { isPublic: true }
            ]
          }
        });

        if (!template) {
          return {
            success: false,
            error: 'Template não encontrado ou você não tem permissão para usá-lo'
          };
        }
      }

      // Criar campanha
      const campaign = await prisma.massMessageCampaign.create({
        data: {
          name,
          description,
          type,
          createdBy,
          groupId,
          subject,
          content,
          contentType,
          templateId,
          channels,
          sendAt: sendAt ? new Date(sendAt) : null,
          timezone,
          filters,
          targetUsers
        }
      });

      return {
        success: true,
        data: campaign
      };

    } catch (error) {
      console.error('Erro ao criar campanha de mensagem em massa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Executar campanha
   * @param {string} campaignId - ID da campanha
   * @param {string} executedBy - ID do usuário que está executando
   * @returns {Object} Resultado da operação
   */
  static async executeCampaign(campaignId, executedBy) {
    try {
      // Verificar se a campanha existe e se o usuário tem permissão
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: executedBy
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para executá-la'
        };
      }

      if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
        return {
          success: false,
          error: 'Campanha não pode ser executada no status atual'
        };
      }

      // Obter usuários alvo
      const targetUsers = await this.getTargetUsers(campaign);

      if (targetUsers.length === 0) {
        return {
          success: false,
          error: 'Nenhum usuário encontrado para enviar a mensagem'
        };
      }

      // Atualizar status da campanha
      await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'SENDING',
          updatedAt: new Date()
        }
      });

      // Criar mensagens individuais
      const messages = [];
      for (const user of targetUsers) {
        for (const channel of campaign.channels) {
          const message = await prisma.massMessage.create({
            data: {
              campaignId,
              userId: user.id,
              channel,
              subject: campaign.subject,
              content: campaign.content,
              contentType: campaign.contentType,
              scheduledFor: campaign.sendAt || new Date()
            }
          });
          messages.push(message);
        }
      }

      // Processar envio das mensagens
      await this.processMessageSending(campaign, messages);

      return {
        success: true,
        data: {
          campaign,
          totalMessages: messages.length,
          targetUsers: targetUsers.length
        }
      };

    } catch (error) {
      console.error('Erro ao executar campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter usuários alvo da campanha
   * @param {Object} campaign - Dados da campanha
   * @returns {Array} Usuários alvo
   */
  static async getTargetUsers(campaign) {
    try {
      let users = [];

      // Se há usuários específicos definidos
      if (campaign.targetUsers && campaign.targetUsers.length > 0) {
        users = await prisma.user.findMany({
          where: {
            id: { in: campaign.targetUsers }
          },
          select: {
            id: true,
            email: true,
            userType: true,
            volunteer: { select: { firstName: true, lastName: true } },
            institution: { select: { name: true } },
            company: { select: { name: true } },
            university: { select: { name: true } }
          }
        });
      }
      // Se há um grupo definido
      else if (campaign.groupId) {
        const groupMembers = await prisma.messageGroupMember.findMany({
          where: { groupId: campaign.groupId },
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
        });
        users = groupMembers.map(member => member.user);
      }
      // Se há filtros de segmentação
      else if (campaign.filters) {
        users = await this.getUsersByFilters(campaign.filters);
      }

      return users;

    } catch (error) {
      console.error('Erro ao obter usuários alvo:', error);
      return [];
    }
  }

  /**
   * Obter usuários por filtros de segmentação
   * @param {Object} filters - Filtros de segmentação
   * @returns {Array} Usuários encontrados
   */
  static async getUsersByFilters(filters) {
    try {
      const whereClause = {};

      if (filters.userType) {
        whereClause.userType = filters.userType;
      }

      if (filters.city) {
        whereClause.volunteer = {
          city: { contains: filters.city, mode: 'insensitive' }
        };
      }

      if (filters.state) {
        whereClause.volunteer = {
          ...whereClause.volunteer,
          state: { contains: filters.state, mode: 'insensitive' }
        };
      }

      if (filters.skills && filters.skills.length > 0) {
        whereClause.volunteer = {
          ...whereClause.volunteer,
          skills: {
            hasSome: filters.skills
          }
        };
      }

      if (filters.interests && filters.interests.length > 0) {
        whereClause.volunteer = {
          ...whereClause.volunteer,
          interests: {
            hasSome: filters.interests
          }
        };
      }

      if (filters.createdAfter) {
        whereClause.createdAt = {
          gte: new Date(filters.createdAfter)
        };
      }

      if (filters.createdBefore) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          lte: new Date(filters.createdBefore)
        };
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
        }
      });

      return users;

    } catch (error) {
      console.error('Erro ao obter usuários por filtros:', error);
      return [];
    }
  }

  /**
   * Processar envio das mensagens
   * @param {Object} campaign - Dados da campanha
   * @param {Array} messages - Mensagens a serem enviadas
   */
  static async processMessageSending(campaign, messages) {
    try {
      const batchSize = 10; // Processar em lotes de 10
      const batches = [];

      for (let i = 0; i < messages.length; i += batchSize) {
        batches.push(messages.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(batch.map(message => this.sendMessage(message)));
        
        // Pequena pausa entre lotes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Atualizar estatísticas da campanha
      await this.updateCampaignStats(campaign.id);

    } catch (error) {
      console.error('Erro ao processar envio das mensagens:', error);
    }
  }

  /**
   * Enviar mensagem individual
   * @param {Object} message - Dados da mensagem
   */
  static async sendMessage(message) {
    try {
      // Atualizar status para enviando
      await prisma.massMessage.update({
        where: { id: message.id },
        data: {
          status: 'SENDING',
          sentAt: new Date()
        }
      });

      let success = false;
      let errorMessage = null;

      try {
        switch (message.channel) {
          case 'EMAIL':
            success = await this.sendEmailMessage(message);
            break;
          case 'PUSH':
            success = await this.sendPushMessage(message);
            break;
          case 'SMS':
            success = await this.sendSMSMessage(message);
            break;
          case 'IN_APP':
            success = await this.sendInAppMessage(message);
            break;
          default:
            errorMessage = 'Canal de mensagem não suportado';
        }
      } catch (error) {
        errorMessage = error.message;
      }

      // Atualizar status da mensagem
      const status = success ? 'SENT' : 'FAILED';
      const updateData = {
        status,
        deliveredAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage
      };

      if (!success && message.retryCount < message.maxRetries) {
        updateData.status = 'PENDING';
        updateData.retryCount = message.retryCount + 1;
        updateData.scheduledFor = new Date(Date.now() + 5 * 60 * 1000); // Tentar novamente em 5 minutos
      }

      await prisma.massMessage.update({
        where: { id: message.id },
        data: updateData
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  /**
   * Enviar mensagem por email
   * @param {Object} message - Dados da mensagem
   * @returns {boolean} Sucesso do envio
   */
  static async sendEmailMessage(message) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: message.userId }
      });

      if (!user || !user.email) {
        return false;
      }

      await EmailService.sendEmail(
        user.email,
        message.subject || 'Mensagem do Sistema de Voluntariado',
        message.content,
        message.contentType === 'HTML' ? message.content : null
      );

      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Enviar mensagem por push
   * @param {Object} message - Dados da mensagem
   * @returns {boolean} Sucesso do envio
   */
  static async sendPushMessage(message) {
    try {
      await PushNotificationService.sendPushNotificationToUser(message.userId, {
        title: message.subject || 'Nova Mensagem',
        body: message.content,
        data: {
          campaignId: message.campaignId,
          messageId: message.id
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar push:', error);
      return false;
    }
  }

  /**
   * Enviar mensagem por SMS
   * @param {Object} message - Dados da mensagem
   * @returns {boolean} Sucesso do envio
   */
  static async sendSMSMessage(message) {
    try {
      // Implementar envio de SMS aqui
      // Por enquanto, retornar true para simular sucesso
      console.log('SMS enviado para usuário:', message.userId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return false;
    }
  }

  /**
   * Enviar mensagem in-app
   * @param {Object} message - Dados da mensagem
   * @returns {boolean} Sucesso do envio
   */
  static async sendInAppMessage(message) {
    try {
      // Implementar envio de mensagem in-app aqui
      // Por enquanto, retornar true para simular sucesso
      console.log('Mensagem in-app enviada para usuário:', message.userId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem in-app:', error);
      return false;
    }
  }

  /**
   * Atualizar estatísticas da campanha
   * @param {string} campaignId - ID da campanha
   */
  static async updateCampaignStats(campaignId) {
    try {
      const stats = await prisma.massMessage.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: { status: true }
      });

      const totalSent = stats.reduce((sum, stat) => sum + stat._count.status, 0);
      const totalDelivered = stats.find(s => s.status === 'SENT')?._count.status || 0;
      const totalFailed = stats.find(s => s.status === 'FAILED')?._count.status || 0;

      await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          totalSent,
          totalDelivered,
          totalFailed,
          status: totalSent > 0 ? 'SENT' : 'DRAFT'
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar estatísticas da campanha:', error);
    }
  }

  /**
   * Obter campanhas do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Campanhas do usuário
   */
  static async getUserCampaigns(userId, filters = {}) {
    try {
      const {
        type,
        status,
        groupId,
        limit = 20,
        offset = 0
      } = filters;

      const whereClause = { createdBy: userId };
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;
      if (groupId) whereClause.groupId = groupId;

      const campaigns = await prisma.massMessageCampaign.findMany({
        where: whereClause,
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: campaigns
      };

    } catch (error) {
      console.error('Erro ao obter campanhas do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter campanha específica
   * @param {string} campaignId - ID da campanha
   * @param {string} userId - ID do usuário
   * @returns {Object} Campanha
   */
  static async getCampaign(campaignId, userId) {
    try {
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: userId
        },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          },
          messages: {
            select: {
              id: true,
              userId: true,
              channel: true,
              status: true,
              sentAt: true,
              deliveredAt: true,
              failedAt: true,
              errorMessage: true
            },
            take: 100
          }
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada'
        };
      }

      return {
        success: true,
        data: campaign
      };

    } catch (error) {
      console.error('Erro ao obter campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar campanha
   * @param {string} campaignId - ID da campanha
   * @param {string} cancelledBy - ID do usuário que está cancelando
   * @returns {Object} Resultado da operação
   */
  static async cancelCampaign(campaignId, cancelledBy) {
    try {
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: cancelledBy
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada'
        };
      }

      if (campaign.status === 'SENT') {
        return {
          success: false,
          error: 'Campanha já foi enviada e não pode ser cancelada'
        };
      }

      // Atualizar status da campanha
      await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      // Cancelar mensagens pendentes
      await prisma.massMessage.updateMany({
        where: {
          campaignId,
          status: { in: ['PENDING', 'SENDING'] }
        },
        data: {
          status: 'CANCELLED'
        }
      });

      return {
        success: true,
        data: { cancelledAt: new Date() }
      };

    } catch (error) {
      console.error('Erro ao cancelar campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas da campanha
   * @param {string} campaignId - ID da campanha
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas da campanha
   */
  static async getCampaignStats(campaignId, userId) {
    try {
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: userId
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada'
        };
      }

      const [
        byStatus,
        byChannel,
        recentMessages
      ] = await Promise.all([
        prisma.massMessage.groupBy({
          by: ['status'],
          where: { campaignId },
          _count: { status: true }
        }),
        prisma.massMessage.groupBy({
          by: ['channel'],
          where: { campaignId },
          _count: { channel: true }
        }),
        prisma.massMessage.findMany({
          where: { campaignId },
          select: {
            id: true,
            userId: true,
            channel: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            errorMessage: true
          },
          orderBy: { sentAt: 'desc' },
          take: 20
        })
      ]);

      return {
        success: true,
        data: {
          campaign,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          byChannel: byChannel.map(item => ({
            channel: item.channel,
            count: item._count.channel
          })),
          recentMessages
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas da campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = MassMessageService;
