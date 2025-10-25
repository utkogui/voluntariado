const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de comunicação para notificações push e email
 */
class CommunicationService {
  
  /**
   * Enviar notificação por email
   * @param {Object} user - Usuário
   * @param {Object} opportunity - Oportunidade
   * @param {Object} relevance - Dados de relevância
   * @returns {Object} Resultado do envio
   */
  static async sendEmailNotification(user, opportunity, relevance) {
    try {
      const emailData = {
        to: user.email,
        subject: `Nova oportunidade relevante: ${opportunity.title}`,
        template: 'opportunity-notification',
        data: {
          userName: user.firstName || 'Voluntário',
          opportunityTitle: opportunity.title,
          opportunityDescription: opportunity.description,
          relevanceScore: relevance.score,
          reasons: relevance.reasons,
          opportunityUrl: `${process.env.FRONTEND_URL}/opportunities/${opportunity.id}`,
          unsubscribeUrl: `${process.env.FRONTEND_URL}/notifications/preferences`
        }
      };

      // Implementar envio de email real (SendGrid, Mailgun, etc.)
      const result = await this.sendEmail(emailData);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação push
   * @param {Object} user - Usuário
   * @param {Object} opportunity - Oportunidade
   * @param {Object} relevance - Dados de relevância
   * @returns {Object} Resultado do envio
   */
  static async sendPushNotification(user, opportunity, relevance) {
    try {
      const pushData = {
        to: user.id,
        title: 'Nova oportunidade relevante!',
        body: `Encontramos uma oportunidade que pode ser perfeita para você: ${opportunity.title}`,
        data: {
          type: 'NEW_OPPORTUNITY',
          opportunityId: opportunity.id,
          relevanceScore: relevance.score,
          url: `/opportunities/${opportunity.id}`
        },
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png'
      };

      // Implementar envio de push real (Firebase, OneSignal, etc.)
      const result = await this.sendPush(pushData);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação SMS
   * @param {Object} user - Usuário
   * @param {Object} opportunity - Oportunidade
   * @param {Object} relevance - Dados de relevância
   * @returns {Object} Resultado do envio
   */
  static async sendSMSNotification(user, opportunity, relevance) {
    try {
      const smsData = {
        to: user.phone,
        message: `Nova oportunidade: ${opportunity.title}. Score: ${relevance.score}%. Acesse: ${process.env.FRONTEND_URL}/opportunities/${opportunity.id}`
      };

      // Implementar envio de SMS real (Twilio, etc.)
      const result = await this.sendSMS(smsData);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar email usando serviço externo
   * @param {Object} emailData - Dados do email
   * @returns {Object} Resultado do envio
   */
  static async sendEmail(emailData) {
    try {
      // Implementar integração com SendGrid, Mailgun, etc.
      // Por enquanto, apenas log
      console.log('Email enviado:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template
      });

      return {
        messageId: `email_${Date.now()}`,
        status: 'sent'
      };

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Enviar push notification usando serviço externo
   * @param {Object} pushData - Dados do push
   * @returns {Object} Resultado do envio
   */
  static async sendPush(pushData) {
    try {
      // Implementar integração com Firebase, OneSignal, etc.
      // Por enquanto, apenas log
      console.log('Push notification enviada:', {
        to: pushData.to,
        title: pushData.title,
        body: pushData.body
      });

      return {
        messageId: `push_${Date.now()}`,
        status: 'sent'
      };

    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      throw error;
    }
  }

  /**
   * Enviar SMS usando serviço externo
   * @param {Object} smsData - Dados do SMS
   * @returns {Object} Resultado do envio
   */
  static async sendSMS(smsData) {
    try {
      // Implementar integração com Twilio, etc.
      // Por enquanto, apenas log
      console.log('SMS enviado:', {
        to: smsData.to,
        message: smsData.message
      });

      return {
        messageId: `sms_${Date.now()}`,
        status: 'sent'
      };

    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de atualização de aplicação
   * @param {Object} user - Usuário
   * @param {Object} application - Aplicação
   * @param {string} status - Novo status
   * @returns {Object} Resultado do envio
   */
  static async sendApplicationUpdateNotification(user, application, status) {
    try {
      const statusMessages = {
        'APPROVED': 'Sua candidatura foi aprovada!',
        'REJECTED': 'Sua candidatura foi rejeitada.',
        'PENDING': 'Sua candidatura está sendo analisada.'
      };

      const message = statusMessages[status] || 'Status da sua candidatura foi atualizado.';

      // Enviar notificação no banco
      await prisma.notification.create({
        data: {
          title: 'Atualização de Candidatura',
          message,
          type: 'APPLICATION_UPDATE',
          userId: user.id,
          data: {
            applicationId: application.id,
            status,
            opportunityId: application.opportunityId
          }
        }
      });

      // Enviar email
      await this.sendEmail({
        to: user.email,
        subject: 'Atualização de Candidatura',
        template: 'application-update',
        data: {
          userName: user.firstName || 'Voluntário',
          message,
          applicationUrl: `${process.env.FRONTEND_URL}/applications/${application.id}`
        }
      });

      return {
        success: true,
        message: 'Notificação de atualização enviada'
      };

    } catch (error) {
      console.error('Erro ao enviar notificação de atualização:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação de lembrete
   * @param {Object} user - Usuário
   * @param {Object} reminder - Dados do lembrete
   * @returns {Object} Resultado do envio
   */
  static async sendReminderNotification(user, reminder) {
    try {
      // Enviar notificação no banco
      await prisma.notification.create({
        data: {
          title: reminder.title,
          message: reminder.message,
          type: 'REMINDER',
          userId: user.id,
          data: reminder.data
        }
      });

      // Enviar email se configurado
      if (reminder.sendEmail) {
        await this.sendEmail({
          to: user.email,
          subject: reminder.title,
          template: 'reminder',
          data: {
            userName: user.firstName || 'Voluntário',
            message: reminder.message,
            actionUrl: reminder.actionUrl
          }
        });
      }

      return {
        success: true,
        message: 'Lembrete enviado'
      };

    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação de mensagem
   * @param {Object} sender - Remetente
   * @param {Object} receiver - Destinatário
   * @param {Object} message - Mensagem
   * @returns {Object} Resultado do envio
   */
  static async sendMessageNotification(sender, receiver, message) {
    try {
      // Enviar notificação no banco
      await prisma.notification.create({
        data: {
          title: 'Nova mensagem',
          message: `Você recebeu uma mensagem de ${sender.firstName || 'Usuário'}`,
          type: 'MESSAGE',
          userId: receiver.id,
          data: {
            senderId: sender.id,
            messageId: message.id,
            messagePreview: message.content.substring(0, 100)
          }
        }
      });

      // Enviar push notification
      await this.sendPush({
        to: receiver.id,
        title: 'Nova mensagem',
        body: `Você recebeu uma mensagem de ${sender.firstName || 'Usuário'}`,
        data: {
          type: 'MESSAGE',
          senderId: sender.id,
          messageId: message.id
        }
      });

      return {
        success: true,
        message: 'Notificação de mensagem enviada'
      };

    } catch (error) {
      console.error('Erro ao enviar notificação de mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação de avaliação
   * @param {Object} user - Usuário
   * @param {Object} evaluation - Avaliação
   * @returns {Object} Resultado do envio
   */
  static async sendEvaluationNotification(user, evaluation) {
    try {
      // Enviar notificação no banco
      await prisma.notification.create({
        data: {
          title: 'Nova avaliação',
          message: `Você recebeu uma nova avaliação (${evaluation.rating} estrelas)`,
          type: 'EVALUATION',
          userId: user.id,
          data: {
            evaluationId: evaluation.id,
            rating: evaluation.rating,
            comment: evaluation.comment
          }
        }
      });

      return {
        success: true,
        message: 'Notificação de avaliação enviada'
      };

    } catch (error) {
      console.error('Erro ao enviar notificação de avaliação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação do sistema
   * @param {Object} user - Usuário
   * @param {Object} systemNotification - Notificação do sistema
   * @returns {Object} Resultado do envio
   */
  static async sendSystemNotification(user, systemNotification) {
    try {
      // Enviar notificação no banco
      await prisma.notification.create({
        data: {
          title: systemNotification.title,
          message: systemNotification.message,
          type: 'SYSTEM',
          userId: user.id,
          data: systemNotification.data
        }
      });

      return {
        success: true,
        message: 'Notificação do sistema enviada'
      };

    } catch (error) {
      console.error('Erro ao enviar notificação do sistema:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificações em lote
   * @param {Array} notifications - Lista de notificações
   * @returns {Object} Resultado do envio
   */
  static async sendBatchNotifications(notifications) {
    try {
      const results = [];

      for (const notification of notifications) {
        try {
          const result = await this.sendNotification(notification);
          results.push({
            id: notification.id,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            id: notification.id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Erro ao enviar notificações em lote:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificação genérica
   * @param {Object} notification - Dados da notificação
   * @returns {Object} Resultado do envio
   */
  static async sendNotification(notification) {
    try {
      const { type, user, data } = notification;

      switch (type) {
        case 'NEW_OPPORTUNITY':
          return await this.sendEmailNotification(user, data.opportunity, data.relevance);
        
        case 'APPLICATION_UPDATE':
          return await this.sendApplicationUpdateNotification(user, data.application, data.status);
        
        case 'REMINDER':
          return await this.sendReminderNotification(user, data);
        
        case 'MESSAGE':
          return await this.sendMessageNotification(data.sender, user, data.message);
        
        case 'EVALUATION':
          return await this.sendEvaluationNotification(user, data.evaluation);
        
        case 'SYSTEM':
          return await this.sendSystemNotification(user, data);
        
        default:
          throw new Error(`Tipo de notificação não suportado: ${type}`);
      }

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CommunicationService;
