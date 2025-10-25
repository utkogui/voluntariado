const { PrismaClient } = require('@prisma/client');
const ReminderPushService = require('./reminderPushService');
const EmailTemplateService = require('./emailTemplateService');
const ScheduledNotificationService = require('./scheduledNotificationService');

const prisma = new PrismaClient();
const scheduledService = new ScheduledNotificationService();

/**
 * Serviço de notificações de mudanças em atividades
 */
class ActivityChangeNotificationService {
  
  /**
   * Enviar notificação de mudança
   * @param {string} activityId - ID da atividade
   * @param {string} changeType - Tipo da mudança
   * @param {Object} changeData - Dados da mudança
   * @param {Array} targetUsers - IDs dos usuários alvo
   * @returns {Object} Resultado da operação
   */
  static async sendChangeNotification(activityId, changeType, changeData, targetUsers = []) {
    try {
      // Obter dados da atividade
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
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
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Se não especificados, notificar todos os participantes
      const usersToNotify = targetUsers.length > 0 
        ? activity.participants.filter(p => targetUsers.includes(p.userId))
        : activity.participants;

      const results = [];

      for (const participant of usersToNotify) {
        try {
          // Enviar notificação push
          const pushResult = await this.sendChangePushNotification(
            participant.userId,
            activity,
            changeType,
            changeData
          );

          // Enviar email
          const emailResult = await this.sendChangeEmailNotification(
            participant.userId,
            activity,
            changeType,
            changeData
          );

          results.push({
            userId: participant.userId,
            pushSuccess: pushResult.success,
            emailSuccess: emailResult.success,
            success: pushResult.success || emailResult.success
          });

        } catch (error) {
          results.push({
            userId: participant.userId,
            success: false,
            error: error.message
          });
        }
      }

      // Registrar notificação de mudança
      await prisma.activityChangeNotification.create({
        data: {
          activityId,
          changeType,
          changeData,
          sentTo: results.filter(r => r.success).map(r => r.userId)
        }
      });

      return {
        success: true,
        data: {
          totalSent: results.filter(r => r.success).length,
          totalFailed: results.filter(r => !r.success).length,
          results
        }
      };

    } catch (error) {
      console.error('Erro ao enviar notificação de mudança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação push de mudança
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {string} changeType - Tipo da mudança
   * @param {Object} changeData - Dados da mudança
   * @returns {Object} Resultado da operação
   */
  static async sendChangePushNotification(userId, activity, changeType, changeData) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const notification = this.buildChangeNotification(activity, changeType, changeData, baseUrl);

      const result = await ReminderPushService.sendActivityReminderPush(
        userId,
        activity,
        `CHANGE_${changeType}`,
        changeData
      );

      return result;

    } catch (error) {
      console.error('Erro ao enviar notificação push de mudança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar email de notificação de mudança
   * @param {string} userId - ID do usuário
   * @param {Object} activity - Dados da atividade
   * @param {string} changeType - Tipo da mudança
   * @param {Object} changeData - Dados da mudança
   * @returns {Object} Resultado da operação
   */
  static async sendChangeEmailNotification(userId, activity, changeType, changeData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          volunteer: { select: { firstName: true, lastName: true } },
          institution: { select: { name: true } },
          company: { select: { name: true } },
          university: { select: { name: true } }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const templateData = EmailTemplateService.prepareTemplateData(activity, user, baseUrl);
      
      // Adicionar dados da mudança
      templateData.change = {
        type: changeType,
        data: changeData,
        timestamp: new Date().toISOString()
      };

      const template = this.getChangeEmailTemplate(changeType);
      if (!template) {
        return {
          success: false,
          error: 'Template não encontrado para este tipo de mudança'
        };
      }

      const processedTemplate = EmailTemplateService.processTemplate(template, templateData);
      
      await scheduledService.scheduleNotification({
        userId,
        type: 'EMAIL_CHANGE_NOTIFICATION',
        title: processedTemplate.subject,
        body: processedTemplate.text,
        scheduledFor: new Date(),
        data: {
          template: processedTemplate,
          activityId: activity.id,
          changeType,
          changeData
        },
        priority: 'NORMAL'
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('Erro ao enviar email de notificação de mudança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Construir notificação de mudança
   * @param {Object} activity - Dados da atividade
   * @param {string} changeType - Tipo da mudança
   * @param {Object} changeData - Dados da mudança
   * @param {string} baseUrl - URL base
   * @returns {Object} Notificação configurada
   */
  static buildChangeNotification(activity, changeType, changeData, baseUrl) {
    const notifications = {
      'CANCELLED': {
        title: 'Atividade Cancelada',
        body: `A atividade "${activity.title}" foi cancelada`,
        sound: 'cancellation_notification.wav',
        icon: 'ic_cancelled',
        color: '#f44336',
        channelId: 'activity_changes'
      },
      'RESCHEDULED': {
        title: 'Atividade Reagendada',
        body: `A atividade "${activity.title}" foi reagendada`,
        sound: 'reschedule_notification.wav',
        icon: 'ic_rescheduled',
        color: '#FF9800',
        channelId: 'activity_changes'
      },
      'VENUE_CHANGED': {
        title: 'Local da Atividade Alterado',
        body: `O local da atividade "${activity.title}" foi alterado`,
        sound: 'venue_change_notification.wav',
        icon: 'ic_venue_changed',
        color: '#2196F3',
        channelId: 'activity_changes'
      },
      'TIME_CHANGED': {
        title: 'Horário da Atividade Alterado',
        body: `O horário da atividade "${activity.title}" foi alterado`,
        sound: 'time_change_notification.wav',
        icon: 'ic_time_changed',
        color: '#9C27B0',
        channelId: 'activity_changes'
      },
      'DESCRIPTION_CHANGED': {
        title: 'Descrição da Atividade Atualizada',
        body: `A descrição da atividade "${activity.title}" foi atualizada`,
        sound: 'description_change_notification.wav',
        icon: 'ic_description_changed',
        color: '#607D8B',
        channelId: 'activity_changes'
      },
      'REQUIREMENTS_CHANGED': {
        title: 'Requisitos da Atividade Alterados',
        body: `Os requisitos da atividade "${activity.title}" foram alterados`,
        sound: 'requirements_change_notification.wav',
        icon: 'ic_requirements_changed',
        color: '#795548',
        channelId: 'activity_changes'
      },
      'MATERIALS_CHANGED': {
        title: 'Materiais da Atividade Alterados',
        body: `Os materiais da atividade "${activity.title}" foram alterados`,
        sound: 'materials_change_notification.wav',
        icon: 'ic_materials_changed',
        color: '#FF5722',
        channelId: 'activity_changes'
      }
    };

    const config = notifications[changeType] || {
      title: 'Atividade Atualizada',
      body: `A atividade "${activity.title}" foi atualizada`,
      sound: 'change_notification.wav',
      icon: 'ic_changed',
      color: '#2196F3',
      channelId: 'activity_changes'
    };

    return {
      title: config.title,
      body: config.body,
      type: 'ACTIVITY_CHANGE',
      data: {
        activityId: activity.id,
        changeType,
        changeData,
        timestamp: new Date().toISOString()
      },
      clickAction: `${baseUrl}/activities/${activity.id}`,
      channelId: config.channelId,
      sound: config.sound,
      icon: config.icon,
      color: config.color
    };
  }

  /**
   * Obter template de email para mudança
   * @param {string} changeType - Tipo da mudança
   * @returns {Object} Template de email
   */
  static getChangeEmailTemplate(changeType) {
    const templates = {
      'CANCELLED': {
        subject: 'Atividade Cancelada - {{activity.title}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Atividade Cancelada</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f44336; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
              .button { display: inline-block; background: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>❌ Atividade Cancelada</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <p>A atividade <strong>{{activity.title}}</strong> foi cancelada.</p>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade Cancelada</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Motivo:</strong> {{change.data.reason}}</p>
                  <p><strong>Detalhes:</strong> {{change.data.details}}</p>
                </div>
                
                <p>Pedimos desculpas pelo inconveniente. Fique atento às próximas oportunidades!</p>
                <a href="{{activity.opportunitiesUrl}}" class="button">Ver Outras Oportunidades</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Atividade Cancelada - {{activity.title}}
          
          Olá {{user.name}}!
          
          A atividade "{{activity.title}}" foi cancelada.
          
          Detalhes da Atividade Cancelada:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Motivo: {{change.data.reason}}
          - Detalhes: {{change.data.details}}
          
          Pedimos desculpas pelo inconveniente. Fique atento às próximas oportunidades!
          Ver outras oportunidades: {{activity.opportunitiesUrl}}
        `
      },
      'RESCHEDULED': {
        subject: 'Atividade Reagendada - {{activity.title}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Atividade Reagendada</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
              .change-info { background: #fff3e0; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
              .button { display: inline-block; background: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔄 Atividade Reagendada</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <p>A atividade <strong>{{activity.title}}</strong> foi reagendada.</p>
                
                <div class="change-info">
                  <h3>📅 Mudanças de Data/Horário</h3>
                  <p><strong>Data Anterior:</strong> {{change.data.originalStartDate}}</p>
                  <p><strong>Nova Data:</strong> {{change.data.newStartDate}}</p>
                  <p><strong>Horário Anterior:</strong> {{change.data.originalEndDate}}</p>
                  <p><strong>Novo Horário:</strong> {{change.data.newEndDate}}</p>
                  <p><strong>Motivo:</strong> {{change.data.reason}}</p>
                </div>
                
                <div class="activity-info">
                  <h3>📅 Detalhes Atualizados da Atividade</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                </div>
                
                <p>Por favor, confirme sua presença na nova data!</p>
                <a href="{{activity.confirmUrl}}" class="button">Confirmar Presença</a>
                <a href="{{activity.detailsUrl}}" class="button">Ver Detalhes</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Atividade Reagendada - {{activity.title}}
          
          Olá {{user.name}}!
          
          A atividade "{{activity.title}}" foi reagendada.
          
          Mudanças de Data/Horário:
          - Data Anterior: {{change.data.originalStartDate}}
          - Nova Data: {{change.data.newStartDate}}
          - Horário Anterior: {{change.data.originalEndDate}}
          - Novo Horário: {{change.data.newEndDate}}
          - Motivo: {{change.data.reason}}
          
          Detalhes Atualizados da Atividade:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          
          Por favor, confirme sua presença na nova data!
          Link para confirmação: {{activity.confirmUrl}}
          Ver detalhes: {{activity.detailsUrl}}
        `
      }
    };

    return templates[changeType] || null;
  }

  /**
   * Obter histórico de notificações de mudança
   * @param {string} activityId - ID da atividade
   * @returns {Object} Histórico de notificações
   */
  static async getChangeNotificationHistory(activityId) {
    try {
      const notifications = await prisma.activityChangeNotification.findMany({
        where: { activityId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: notifications
      };

    } catch (error) {
      console.error('Erro ao obter histórico de notificações de mudança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de notificações de mudança
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getChangeNotificationStats(activityId) {
    try {
      const [
        totalNotifications,
        byChangeType,
        recentNotifications
      ] = await Promise.all([
        prisma.activityChangeNotification.count({
          where: { activityId }
        }),
        prisma.activityChangeNotification.groupBy({
          by: ['changeType'],
          where: { activityId },
          _count: { changeType: true }
        }),
        prisma.activityChangeNotification.findMany({
          where: { activityId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return {
        success: true,
        data: {
          totalNotifications,
          byChangeType: byChangeType.map(item => ({
            changeType: item.changeType,
            count: item._count.changeType
          })),
          recentNotifications
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de notificações de mudança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ActivityChangeNotificationService;
