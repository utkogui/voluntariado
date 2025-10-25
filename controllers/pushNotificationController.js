const pushNotificationService = require('../services/pushNotificationService');
const { validationResult } = require('express-validator');

class PushNotificationController {
  /**
   * Enviar notificação para um usuário
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendToUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { userId, title, body, data } = req.body;

      const result = await pushNotificationService.sendToUser(userId, {
        title,
        body,
        data
      });

      res.json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar notificação para múltiplos usuários
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendToMultipleUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { userIds, title, body, data } = req.body;

      const result = await pushNotificationService.sendToMultipleUsers(userIds, {
        title,
        body,
        data
      });

      res.json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para múltiplos usuários:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar notificação para um tópico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendToTopic(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { topic, title, body, data } = req.body;

      const result = await pushNotificationService.sendToTopic(topic, {
        title,
        body,
        data
      });

      res.json({
        success: true,
        message: 'Notificação enviada para tópico com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para tópico:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Inscrever usuários em um tópico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async subscribeToTopic(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { tokens, topic } = req.body;

      const result = await pushNotificationService.subscribeToTopic(tokens, topic);

      res.json({
        success: true,
        message: 'Inscrição em tópico realizada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao inscrever em tópico:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Desinscrever usuários de um tópico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async unsubscribeFromTopic(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { tokens, topic } = req.body;

      const result = await pushNotificationService.unsubscribeFromTopic(tokens, topic);

      res.json({
        success: true,
        message: 'Desinscrição de tópico realizada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao desinscrever de tópico:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Agendar notificação
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async scheduleNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { notificationData, scheduleTime } = req.body;

      const result = await pushNotificationService.sendScheduledNotification(
        notificationData,
        scheduleTime
      );

      res.json({
        success: true,
        message: 'Notificação agendada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de notificações
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getNotificationStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const result = await pushNotificationService.getNotificationStats(startDate, endDate);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de notificação:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar notificação de nova oportunidade
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendNewOpportunityNotification(req, res) {
    try {
      const { volunteerId, opportunityId } = req.body;

      // Buscar dados da oportunidade
      const Opportunity = require('../models/Opportunity');
      const opportunity = await Opportunity.findById(opportunityId).populate('institution');

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Oportunidade não encontrada'
        });
      }

      const result = await pushNotificationService.sendToUser(volunteerId, {
        title: 'Nova Oportunidade Disponível!',
        body: `${opportunity.title} - ${opportunity.institution.name}`,
        data: {
          type: 'new_opportunity',
          opportunityId: opportunity._id.toString(),
          institutionId: opportunity.institution._id.toString()
        }
      });

      res.json({
        success: true,
        message: 'Notificação de nova oportunidade enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de nova oportunidade:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar notificação de status da candidatura
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendApplicationStatusNotification(req, res) {
    try {
      const { applicationId } = req.body;

      // Buscar dados da candidatura
      const Application = require('../models/Application');
      const application = await Application.findById(applicationId)
        .populate('volunteer')
        .populate({
          path: 'opportunity',
          populate: {
            path: 'institution',
            model: 'User'
          }
        });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Candidatura não encontrada'
        });
      }

      const statusText = {
        'PENDING': 'pendente',
        'APPROVED': 'aprovada',
        'REJECTED': 'rejeitada',
        'CANCELLED': 'cancelada'
      };

      const result = await pushNotificationService.sendToUser(application.volunteer._id, {
        title: 'Status da Candidatura Atualizado',
        body: `Sua candidatura para "${application.opportunity.title}" foi ${statusText[application.status]}`,
        data: {
          type: 'application_status',
          applicationId: application._id.toString(),
          status: application.status,
          opportunityId: application.opportunity._id.toString()
        }
      });

      res.json({
        success: true,
        message: 'Notificação de status da candidatura enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de status da candidatura:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar lembrete de atividade
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendActivityReminder(req, res) {
    try {
      const { participantId, activityId } = req.body;

      // Buscar dados da atividade
      const Activity = require('../models/Activity');
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Atividade não encontrada'
        });
      }

      const activityDate = new Date(activity.startDate).toLocaleDateString('pt-BR');
      const activityTime = new Date(activity.startDate).toLocaleTimeString('pt-BR');

      const result = await pushNotificationService.sendToUser(participantId, {
        title: 'Lembrete de Atividade',
        body: `${activity.title} - ${activityDate} às ${activityTime}`,
        data: {
          type: 'activity_reminder',
          activityId: activity._id.toString(),
          startDate: activity.startDate
        }
      });

      res.json({
        success: true,
        message: 'Lembrete de atividade enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar lembrete de atividade:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new PushNotificationController();