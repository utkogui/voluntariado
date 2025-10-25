const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de templates de notificação
 */
class NotificationTemplateService {
  
  /**
   * Templates padrão do sistema
   */
  static getDefaultTemplates() {
    return {
      NEW_OPPORTUNITY: {
        title: 'Nova oportunidade relevante!',
        body: 'Encontramos uma oportunidade que pode ser perfeita para você: {{opportunity.title}}',
        type: 'NEW_OPPORTUNITY',
        channelId: 'opportunities',
        sound: 'opportunity_notification.wav',
        icon: 'ic_opportunity',
        color: '#FF6B6B',
        data: {
          opportunityId: '{{opportunity.id}}',
          relevanceScore: '{{relevanceScore}}',
          title: '{{opportunity.title}}',
          description: '{{opportunity.description}}'
        }
      },
      APPLICATION_UPDATE: {
        title: 'Atualização de Candidatura',
        body: '{{statusMessage}}',
        type: 'APPLICATION_UPDATE',
        channelId: 'applications',
        sound: 'application_update.wav',
        icon: 'ic_application',
        color: '#4ECDC4',
        data: {
          applicationId: '{{application.id}}',
          status: '{{status}}',
          opportunityId: '{{application.opportunityId}}'
        }
      },
      MESSAGE: {
        title: 'Nova mensagem',
        body: '{{senderName}}: {{messagePreview}}',
        type: 'MESSAGE',
        channelId: 'messages',
        sound: 'message_notification.wav',
        icon: 'ic_message',
        color: '#45B7D1',
        data: {
          messageId: '{{message.id}}',
          conversationId: '{{message.conversationId}}',
          senderId: '{{sender.id}}'
        }
      },
      REMINDER: {
        title: '{{reminder.title}}',
        body: '{{reminder.message}}',
        type: 'REMINDER',
        channelId: 'reminders',
        sound: 'reminder_notification.wav',
        icon: 'ic_reminder',
        color: '#FFA07A',
        data: {
          reminderId: '{{reminder.id}}',
          actionUrl: '{{reminder.actionUrl}}'
        }
      },
      EVALUATION: {
        title: 'Nova avaliação',
        body: 'Você recebeu uma nova avaliação ({{evaluation.rating}} estrelas)',
        type: 'EVALUATION',
        channelId: 'evaluations',
        sound: 'evaluation_notification.wav',
        icon: 'ic_evaluation',
        color: '#FFD93D',
        data: {
          evaluationId: '{{evaluation.id}}',
          rating: '{{evaluation.rating}}',
          comment: '{{evaluation.comment}}'
        }
      },
      SYSTEM: {
        title: '{{system.title}}',
        body: '{{system.message}}',
        type: 'SYSTEM',
        channelId: 'system',
        sound: 'system_notification.wav',
        icon: 'ic_system',
        color: '#95A5A6',
        data: {
          systemId: '{{system.id}}',
          actionUrl: '{{system.actionUrl}}'
        }
      },
      OPPORTUNITY_DEADLINE: {
        title: 'Prazo se aproximando!',
        body: 'A oportunidade "{{opportunity.title}}" tem prazo em {{daysLeft}} dias',
        type: 'OPPORTUNITY_DEADLINE',
        channelId: 'deadlines',
        sound: 'deadline_notification.wav',
        icon: 'ic_deadline',
        color: '#E74C3C',
        data: {
          opportunityId: '{{opportunity.id}}',
          deadline: '{{opportunity.applicationDeadline}}',
          daysLeft: '{{daysLeft}}'
        }
      },
      VOLUNTEER_ACTIVITY: {
        title: 'Atividade de voluntariado',
        body: 'Sua atividade "{{activity.title}}" está agendada para {{activity.date}}',
        type: 'VOLUNTEER_ACTIVITY',
        channelId: 'activities',
        sound: 'activity_notification.wav',
        icon: 'ic_activity',
        color: '#2ECC71',
        data: {
          activityId: '{{activity.id}}',
          title: '{{activity.title}}',
          date: '{{activity.date}}',
          location: '{{activity.location}}'
        }
      }
    };
  }

  /**
   * Criar template personalizado
   * @param {Object} templateData - Dados do template
   * @returns {Object} Resultado da operação
   */
  static async createTemplate(templateData) {
    try {
      const {
        name,
        type,
        title,
        body,
        channelId,
        sound,
        icon,
        color,
        data,
        isActive = true,
        createdBy
      } = templateData;

      const template = await prisma.notificationTemplate.create({
        data: {
          name,
          type,
          title,
          body,
          channelId,
          sound,
          icon,
          color,
          data,
          isActive,
          createdBy
        }
      });

      return {
        success: true,
        data: template
      };

    } catch (error) {
      console.error('Erro ao criar template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter template por tipo
   * @param {string} type - Tipo do template
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Template
   */
  static async getTemplateByType(type, userId = null) {
    try {
      // Buscar template personalizado do usuário primeiro
      if (userId) {
        const customTemplate = await prisma.notificationTemplate.findFirst({
          where: {
            type,
            createdBy: userId,
            isActive: true
          }
        });

        if (customTemplate) {
          return {
            success: true,
            data: customTemplate
          };
        }
      }

      // Buscar template global
      const globalTemplate = await prisma.notificationTemplate.findFirst({
        where: {
          type,
          createdBy: null,
          isActive: true
        }
      });

      if (globalTemplate) {
        return {
          success: true,
          data: globalTemplate
        };
      }

      // Usar template padrão
      const defaultTemplates = this.getDefaultTemplates();
      const defaultTemplate = defaultTemplates[type];

      if (defaultTemplate) {
        return {
          success: true,
          data: {
            id: 'default',
            name: `${type}_DEFAULT`,
            ...defaultTemplate
          }
        };
      }

      return {
        success: false,
        error: 'Template não encontrado'
      };

    } catch (error) {
      console.error('Erro ao obter template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter todos os templates
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de templates
   */
  static async getTemplates(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        isActive,
        createdBy
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;
      if (createdBy !== undefined) where.createdBy = createdBy;

      const [templates, total] = await Promise.all([
        prisma.notificationTemplate.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notificationTemplate.count({ where })
      ]);

      return {
        success: true,
        data: templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao obter templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar template
   * @param {string} templateId - ID do template
   * @param {Object} updateData - Dados para atualização
   * @returns {Object} Resultado da operação
   */
  static async updateTemplate(templateId, updateData) {
    try {
      const template = await prisma.notificationTemplate.update({
        where: { id: templateId },
        data: updateData
      });

      return {
        success: true,
        data: template
      };

    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deletar template
   * @param {string} templateId - ID do template
   * @returns {Object} Resultado da operação
   */
  static async deleteTemplate(templateId) {
    try {
      await prisma.notificationTemplate.delete({
        where: { id: templateId }
      });

      return {
        success: true,
        message: 'Template deletado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao deletar template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar template com dados
   * @param {Object} template - Template
   * @param {Object} data - Dados para substituição
   * @returns {Object} Template processado
   */
  static processTemplate(template, data) {
    try {
      const processedTemplate = { ...template };

      // Processar título
      if (processedTemplate.title) {
        processedTemplate.title = this.replaceVariables(processedTemplate.title, data);
      }

      // Processar corpo
      if (processedTemplate.body) {
        processedTemplate.body = this.replaceVariables(processedTemplate.body, data);
      }

      // Processar dados
      if (processedTemplate.data) {
        processedTemplate.data = this.processData(processedTemplate.data, data);
      }

      return processedTemplate;

    } catch (error) {
      console.error('Erro ao processar template:', error);
      return template;
    }
  }

  /**
   * Substituir variáveis no texto
   * @param {string} text - Texto com variáveis
   * @param {Object} data - Dados para substituição
   * @returns {string} Texto processado
   */
  static replaceVariables(text, data) {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Processar dados do template
   * @param {Object} templateData - Dados do template
   * @param {Object} data - Dados para substituição
   * @returns {Object} Dados processados
   */
  static processData(templateData, data) {
    const processedData = {};

    for (const [key, value] of Object.entries(templateData)) {
      if (typeof value === 'string') {
        processedData[key] = this.replaceVariables(value, data);
      } else if (typeof value === 'object' && value !== null) {
        processedData[key] = this.processData(value, data);
      } else {
        processedData[key] = value;
      }
    }

    return processedData;
  }

  /**
   * Obter valor aninhado do objeto
   * @param {Object} obj - Objeto
   * @param {string} path - Caminho (ex: 'user.name')
   * @returns {any} Valor encontrado
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Obter estatísticas de templates
   * @returns {Object} Estatísticas
   */
  static async getTemplateStats() {
    try {
      const [
        totalTemplates,
        activeTemplates,
        byType,
        customTemplates
      ] = await Promise.all([
        prisma.notificationTemplate.count(),
        prisma.notificationTemplate.count({ where: { isActive: true } }),
        prisma.notificationTemplate.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        prisma.notificationTemplate.count({ where: { createdBy: { not: null } } })
      ]);

      return {
        success: true,
        data: {
          totalTemplates,
          activeTemplates,
          inactiveTemplates: totalTemplates - activeTemplates,
          customTemplates,
          byType: byType.map(item => ({
            type: item.type,
            count: item._count.type
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Inicializar templates padrão
   * @returns {Object} Resultado da operação
   */
  static async initializeDefaultTemplates() {
    try {
      const defaultTemplates = this.getDefaultTemplates();
      const results = [];

      for (const [type, template] of Object.entries(defaultTemplates)) {
        // Verificar se já existe
        const existing = await prisma.notificationTemplate.findFirst({
          where: {
            type,
            createdBy: null
          }
        });

        if (!existing) {
          const result = await prisma.notificationTemplate.create({
            data: {
              name: `${type}_DEFAULT`,
              type,
              ...template,
              createdBy: null,
              isActive: true
            }
          });
          results.push(result);
        }
      }

      return {
        success: true,
        data: {
          created: results.length,
          templates: results
        }
      };

    } catch (error) {
      console.error('Erro ao inicializar templates padrão:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = NotificationTemplateService;
