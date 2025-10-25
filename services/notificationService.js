const { PrismaClient } = require('@prisma/client');
const matchingService = require('./matchingService');
const HybridMatchingService = require('./hybridMatchingService');

const prisma = new PrismaClient();

/**
 * Serviço de notificações inteligentes para oportunidades relevantes
 */
class NotificationService {
  
  /**
   * Enviar notificações para novas oportunidades relevantes
   * @param {string} opportunityId - ID da oportunidade
   * @returns {Object} Resultado do envio
   */
  static async notifyRelevantVolunteers(opportunityId) {
    try {
      // Buscar a oportunidade
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          categories: true,
          opportunityRequirements: true
        }
      });

      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Buscar voluntários relevantes
      const relevantVolunteers = await this.findRelevantVolunteers(opportunity);

      // Enviar notificações
      const notifications = await this.sendNotifications(relevantVolunteers, opportunity);

      return {
        success: true,
        data: {
          opportunityId,
          volunteersNotified: relevantVolunteers.length,
          notificationsSent: notifications.length
        }
      };

    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Encontrar voluntários relevantes para uma oportunidade
   * @param {Object} opportunity - Oportunidade
   * @returns {Array} Lista de voluntários relevantes
   */
  static async findRelevantVolunteers(opportunity) {
    try {
      // Buscar voluntários ativos
      const volunteers = await prisma.volunteer.findMany({
        where: {
          user: {
            status: 'ACTIVE',
            isVerified: true
          }
        },
        include: {
          user: true,
          backgroundChecks: {
            where: { status: 'APPROVED' }
          }
        }
      });

      const relevantVolunteers = [];

      for (const volunteer of volunteers) {
        // Calcular relevância
        const relevance = await this.calculateRelevance(volunteer, opportunity);
        
        if (relevance.score >= 70) { // Threshold de relevância
          relevantVolunteers.push({
            volunteer,
            relevance
          });
        }
      }

      // Ordenar por relevância
      relevantVolunteers.sort((a, b) => b.relevance.score - a.relevance.score);

      return relevantVolunteers;

    } catch (error) {
      console.error('Erro ao encontrar voluntários relevantes:', error);
      throw error;
    }
  }

  /**
   * Calcular relevância de uma oportunidade para um voluntário
   * @param {Object} volunteer - Voluntário
   * @param {Object} opportunity - Oportunidade
   * @returns {Object} Score de relevância
   */
  static async calculateRelevance(volunteer, opportunity) {
    try {
      // Calcular scores usando o sistema de matching
      const matchingResult = await matchingService.findMatches(volunteer.id, {
        opportunityId: opportunity.id
      });

      if (!matchingResult.success || !matchingResult.data.length) {
        return {
          score: 0,
          reasons: ['Não há compatibilidade']
        };
      }

      const match = matchingResult.data[0];
      const scores = match.scores;

      // Calcular score de relevância baseado nos scores de matching
      const relevanceScore = this.calculateRelevanceScore(scores);

      // Gerar razões de relevância
      const reasons = this.generateRelevanceReasons(scores, volunteer, opportunity);

      return {
        score: relevanceScore,
        reasons,
        scores
      };

    } catch (error) {
      console.error('Erro ao calcular relevância:', error);
      return {
        score: 0,
        reasons: ['Erro ao calcular relevância']
      };
    }
  }

  /**
   * Calcular score de relevância baseado nos scores de matching
   * @param {Object} scores - Scores de matching
   * @returns {number} Score de relevância
   */
  static calculateRelevanceScore(scores) {
    const weights = {
      skills: 0.3,
      location: 0.2,
      availability: 0.15,
      interests: 0.1,
      volunteerType: 0.15,
      requirements: 0.1
    };

    return Math.round(
      (scores.skills * weights.skills) +
      (scores.location * weights.location) +
      (scores.availability * weights.availability) +
      (scores.interests * weights.interests) +
      (scores.volunteerType * weights.volunteerType) +
      (scores.requirements * weights.requirements)
    );
  }

  /**
   * Gerar razões de relevância
   * @param {Object} scores - Scores de matching
   * @param {Object} volunteer - Voluntário
   * @param {Object} opportunity - Oportunidade
   * @returns {Array} Lista de razões
   */
  static generateRelevanceReasons(scores, volunteer, opportunity) {
    const reasons = [];

    if (scores.skills >= 80) {
      reasons.push('Excelente compatibilidade de habilidades');
    } else if (scores.skills >= 60) {
      reasons.push('Boa compatibilidade de habilidades');
    }

    if (scores.location >= 80) {
      reasons.push('Localização muito próxima');
    } else if (scores.location >= 50) {
      reasons.push('Localização próxima');
    }

    if (scores.availability >= 80) {
      reasons.push('Perfeita compatibilidade de horários');
    } else if (scores.availability >= 60) {
      reasons.push('Boa compatibilidade de horários');
    }

    if (scores.interests >= 70) {
      reasons.push('Interesses alinhados com a causa');
    }

    if (scores.volunteerType >= 90) {
      reasons.push('Perfeita compatibilidade de tipo de voluntariado');
    } else if (scores.volunteerType >= 70) {
      reasons.push('Boa compatibilidade de tipo de voluntariado');
    }

    if (scores.requirements >= 90) {
      reasons.push('Atende a todos os requisitos específicos');
    } else if (scores.requirements >= 70) {
      reasons.push('Atende à maioria dos requisitos específicos');
    }

    return reasons;
  }

  /**
   * Enviar notificações para voluntários
   * @param {Array} relevantVolunteers - Lista de voluntários relevantes
   * @param {Object} opportunity - Oportunidade
   * @returns {Array} Lista de notificações enviadas
   */
  static async sendNotifications(relevantVolunteers, opportunity) {
    const notifications = [];

    for (const { volunteer, relevance } of relevantVolunteers) {
      try {
        // Criar notificação
        const notification = await prisma.notification.create({
          data: {
            title: 'Nova oportunidade relevante!',
            message: `Encontramos uma oportunidade que pode ser perfeita para você: ${opportunity.title}`,
            type: 'NEW_OPPORTUNITY',
            userId: volunteer.userId,
            data: {
              opportunityId: opportunity.id,
              relevanceScore: relevance.score,
              reasons: relevance.reasons
            }
          }
        });

        notifications.push(notification);

        // Enviar email (se configurado)
        await this.sendEmailNotification(volunteer, opportunity, relevance);

        // Enviar push notification (se configurado)
        await this.sendPushNotification(volunteer, opportunity, relevance);

      } catch (error) {
        console.error(`Erro ao enviar notificação para ${volunteer.userId}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Enviar notificação por email
   * @param {Object} volunteer - Voluntário
   * @param {Object} opportunity - Oportunidade
   * @param {Object} relevance - Dados de relevância
   */
  static async sendEmailNotification(volunteer, opportunity, relevance) {
    try {
      // Implementar envio de email
      // Por enquanto, apenas log
      console.log(`Email enviado para ${volunteer.user.email}: Nova oportunidade - ${opportunity.title}`);
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  }

  /**
   * Enviar notificação push
   * @param {Object} volunteer - Voluntário
   * @param {Object} opportunity - Oportunidade
   * @param {Object} relevance - Dados de relevância
   */
  static async sendPushNotification(volunteer, opportunity, relevance) {
    try {
      // Implementar push notification
      // Por enquanto, apenas log
      console.log(`Push enviado para ${volunteer.user.email}: Nova oportunidade - ${opportunity.title}`);
      
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
    }
  }

  /**
   * Obter notificações de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de notificações
   */
  static async getUserNotifications(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        isRead,
        startDate,
        endDate
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        userId
      };

      if (type) {
        where.type = type;
      }

      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where })
      ]);

      return {
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar notificação como lida
   * @param {string} notificationId - ID da notificação
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true
        }
      });

      return {
        success: true,
        data: notification
      };

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar todas as notificações como lidas
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return {
        success: true,
        data: {
          updated: result.count
        }
      };

    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deletar notificação
   * @param {string} notificationId - ID da notificação
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId
        }
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de notificações
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  static async getNotificationStats(userId) {
    try {
      const [
        total,
        unread,
        byType,
        recent
      ] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        this.getNotificationsByType(userId),
        prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          total,
          unread,
          recent,
          byType
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de notificações:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter notificações por tipo
   * @param {string} userId - ID do usuário
   * @returns {Array} Estatísticas por tipo
   */
  static async getNotificationsByType(userId) {
    const notifications = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
    });

    return notifications.map(item => ({
      type: item.type,
      count: item._count.type
    }));
  }

  /**
   * Configurar preferências de notificação
   * @param {string} userId - ID do usuário
   * @param {Object} preferences - Preferências
   * @returns {Object} Resultado da operação
   */
  static async setNotificationPreferences(userId, preferences) {
    try {
      // Implementar configuração de preferências
      // Por enquanto, apenas log
      console.log(`Preferências de notificação configuradas para ${userId}:`, preferences);
      
      return {
        success: true,
        data: preferences
      };

    } catch (error) {
      console.error('Erro ao configurar preferências:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar notificações em lote
   * @param {Array} opportunityIds - IDs das oportunidades
   * @returns {Object} Resultado do processamento
   */
  static async processBatchNotifications(opportunityIds) {
    try {
      const results = [];

      for (const opportunityId of opportunityIds) {
        const result = await this.notifyRelevantVolunteers(opportunityId);
        results.push({
          opportunityId,
          success: result.success,
          volunteersNotified: result.data?.volunteersNotified || 0
        });
      }

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Erro ao processar notificações em lote:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = NotificationService;
