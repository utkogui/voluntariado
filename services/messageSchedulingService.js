const { PrismaClient } = require('@prisma/client');
const MassMessageService = require('./massMessageService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de agendamento de mensagens
 */
class MessageSchedulingService {
  
  /**
   * Agendar campanha de mensagem
   * @param {string} campaignId - ID da campanha
   * @param {string} scheduledBy - ID do usuário que está agendando
   * @param {Object} scheduleData - Dados do agendamento
   * @returns {Object} Resultado da operação
   */
  static async scheduleCampaign(campaignId, scheduledBy, scheduleData) {
    try {
      const {
        sendAt,
        timezone = 'America/Sao_Paulo',
        recurrence = null
      } = scheduleData;

      // Verificar se a campanha existe e se o usuário tem permissão
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: scheduledBy
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para agendá-la'
        };
      }

      if (campaign.status !== 'DRAFT') {
        return {
          success: false,
          error: 'Campanha não pode ser agendada no status atual'
        };
      }

      // Validar data de envio
      const sendDate = new Date(sendAt);
      const now = new Date();

      if (sendDate <= now) {
        return {
          success: false,
          error: 'Data de envio deve ser futura'
        };
      }

      // Atualizar campanha
      const updatedCampaign = await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          sendAt: sendDate,
          timezone,
          status: 'SCHEDULED',
          updatedAt: new Date()
        }
      });

      // Agendar execução
      await this.scheduleCampaignExecution(campaignId, sendDate, timezone);

      return {
        success: true,
        data: updatedCampaign
      };

    } catch (error) {
      console.error('Erro ao agendar campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar execução da campanha
   * @param {string} campaignId - ID da campanha
   * @param {Date} sendDate - Data de envio
   * @param {string} timezone - Fuso horário
   */
  static async scheduleCampaignExecution(campaignId, sendDate, timezone) {
    try {
      // Agendar notificação para execução
      await scheduledService.scheduleNotification({
        type: 'CAMPAIGN_EXECUTION',
        title: 'Executar Campanha de Mensagem',
        body: `Executar campanha ${campaignId}`,
        scheduledFor: sendDate,
        data: {
          campaignId,
          timezone
        },
        priority: 'HIGH'
      });

    } catch (error) {
      console.error('Erro ao agendar execução da campanha:', error);
    }
  }

  /**
   * Processar campanhas agendadas
   * @returns {Object} Resultado da operação
   */
  static async processScheduledCampaigns() {
    try {
      const now = new Date();
      
      // Buscar campanhas agendadas para execução
      const scheduledCampaigns = await prisma.massMessageCampaign.findMany({
        where: {
          status: 'SCHEDULED',
          sendAt: {
            lte: now
          }
        }
      });

      const results = [];

      for (const campaign of scheduledCampaigns) {
        try {
          // Executar campanha
          const result = await MassMessageService.executeCampaign(
            campaign.id,
            campaign.createdBy
          );

          results.push({
            campaignId: campaign.id,
            success: result.success,
            error: result.error
          });

        } catch (error) {
          results.push({
            campaignId: campaign.id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: {
          processed: scheduledCampaigns.length,
          results
        }
      };

    } catch (error) {
      console.error('Erro ao processar campanhas agendadas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar agendamento de campanha
   * @param {string} campaignId - ID da campanha
   * @param {string} cancelledBy - ID do usuário que está cancelando
   * @returns {Object} Resultado da operação
   */
  static async cancelScheduledCampaign(campaignId, cancelledBy) {
    try {
      // Verificar se a campanha existe e se o usuário tem permissão
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: cancelledBy
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para cancelá-la'
        };
      }

      if (campaign.status !== 'SCHEDULED') {
        return {
          success: false,
          error: 'Campanha não está agendada'
        };
      }

      // Atualizar campanha
      const updatedCampaign = await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'CANCELLED',
          sendAt: null,
          updatedAt: new Date()
        }
      });

      // Cancelar notificação agendada
      await this.cancelScheduledNotification(campaignId);

      return {
        success: true,
        data: updatedCampaign
      };

    } catch (error) {
      console.error('Erro ao cancelar agendamento da campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancelar notificação agendada
   * @param {string} campaignId - ID da campanha
   */
  static async cancelScheduledNotification(campaignId) {
    try {
      await prisma.scheduledNotification.updateMany({
        where: {
          type: 'CAMPAIGN_EXECUTION',
          data: {
            path: ['campaignId'],
            equals: campaignId
          },
          status: 'SCHEDULED'
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

    } catch (error) {
      console.error('Erro ao cancelar notificação agendada:', error);
    }
  }

  /**
   * Reagendar campanha
   * @param {string} campaignId - ID da campanha
   * @param {string} rescheduledBy - ID do usuário que está reagendando
   * @param {Object} rescheduleData - Dados do reagendamento
   * @returns {Object} Resultado da operação
   */
  static async rescheduleCampaign(campaignId, rescheduledBy, rescheduleData) {
    try {
      const {
        newSendAt,
        timezone = 'America/Sao_Paulo'
      } = rescheduleData;

      // Verificar se a campanha existe e se o usuário tem permissão
      const campaign = await prisma.massMessageCampaign.findFirst({
        where: {
          id: campaignId,
          createdBy: rescheduledBy
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para reagendá-la'
        };
      }

      if (campaign.status !== 'SCHEDULED') {
        return {
          success: false,
          error: 'Campanha não está agendada'
        };
      }

      // Validar nova data de envio
      const newSendDate = new Date(newSendAt);
      const now = new Date();

      if (newSendDate <= now) {
        return {
          success: false,
          error: 'Nova data de envio deve ser futura'
        };
      }

      // Cancelar agendamento anterior
      await this.cancelScheduledNotification(campaignId);

      // Atualizar campanha
      const updatedCampaign = await prisma.massMessageCampaign.update({
        where: { id: campaignId },
        data: {
          sendAt: newSendDate,
          timezone,
          updatedAt: new Date()
        }
      });

      // Agendar nova execução
      await this.scheduleCampaignExecution(campaignId, newSendDate, timezone);

      return {
        success: true,
        data: updatedCampaign
      };

    } catch (error) {
      console.error('Erro ao reagendar campanha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter campanhas agendadas
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Campanhas agendadas
   */
  static async getScheduledCampaigns(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = filters;

      const whereClause = {
        createdBy: userId,
        status: 'SCHEDULED'
      };

      if (startDate || endDate) {
        whereClause.sendAt = {};
        if (startDate) whereClause.sendAt.gte = new Date(startDate);
        if (endDate) whereClause.sendAt.lte = new Date(endDate);
      }

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
        orderBy: { sendAt: 'asc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: campaigns
      };

    } catch (error) {
      console.error('Erro ao obter campanhas agendadas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de agendamento
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Estatísticas de agendamento
   */
  static async getSchedulingStats(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate
      } = filters;

      const whereClause = {
        createdBy: userId
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const [
        totalCampaigns,
        byStatus,
        scheduledCampaigns,
        upcomingCampaigns
      ] = await Promise.all([
        prisma.massMessageCampaign.count({ where: whereClause }),
        prisma.massMessageCampaign.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true }
        }),
        prisma.massMessageCampaign.count({
          where: {
            ...whereClause,
            status: 'SCHEDULED'
          }
        }),
        prisma.massMessageCampaign.count({
          where: {
            ...whereClause,
            status: 'SCHEDULED',
            sendAt: {
              gte: new Date()
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalCampaigns,
          scheduledCampaigns,
          upcomingCampaigns,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de agendamento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter campanhas próximas do envio
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções
   * @returns {Object} Campanhas próximas
   */
  static async getUpcomingCampaigns(userId, options = {}) {
    try {
      const {
        hours = 24,
        limit = 10
      } = options;

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + hours);

      const campaigns = await prisma.massMessageCampaign.findMany({
        where: {
          createdBy: userId,
          status: 'SCHEDULED',
          sendAt: {
            gte: new Date(),
            lte: futureDate
          }
        },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { sendAt: 'asc' },
        take: limit
      });

      return {
        success: true,
        data: campaigns
      };

    } catch (error) {
      console.error('Erro ao obter campanhas próximas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter histórico de agendamentos
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Histórico de agendamentos
   */
  static async getSchedulingHistory(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = filters;

      const whereClause = {
        createdBy: userId,
        status: { in: ['SCHEDULED', 'SENT', 'CANCELLED'] }
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

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
      console.error('Erro ao obter histórico de agendamentos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Iniciar processador de campanhas agendadas
   * @param {number} intervalMs - Intervalo em milissegundos
   */
  static startScheduler(intervalMs = 60000) {
    console.log(`Iniciando processador de campanhas agendadas com intervalo de ${intervalMs / 1000} segundos`);
    
    setInterval(async () => {
      try {
        await this.processScheduledCampaigns();
      } catch (error) {
        console.error('Erro no processador de campanhas agendadas:', error);
      }
    }, intervalMs);
  }

  /**
   * Parar processador de campanhas agendadas
   */
  static stopScheduler() {
    console.log('Parando processador de campanhas agendadas');
    // Implementar lógica para parar o processador se necessário
  }
}

module.exports = MessageSchedulingService;
