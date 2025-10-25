const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

class EmailController {
  /**
   * Enviar email de boas-vindas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendWelcomeEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { userId } = req.body;

      // Buscar dados do usuário
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const result = await emailService.sendWelcomeEmail(user);

      res.json({
        success: true,
        message: 'Email de boas-vindas enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar email de verificação
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendVerificationEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { userId } = req.body;

      // Buscar dados do usuário
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const result = await emailService.sendVerificationEmail(user);

      res.json({
        success: true,
        message: 'Email de verificação enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar email de recuperação de senha
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendPasswordResetEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // Buscar usuário por email
      const User = require('../models/User');
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Gerar token de reset
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Salvar token no banco (com expiração)
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const result = await emailService.sendPasswordResetEmail(user, resetToken);

      res.json({
        success: true,
        message: 'Email de recuperação de senha enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar email de recuperação de senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { volunteerId, opportunityId } = req.body;

      // Buscar dados do voluntário e oportunidade
      const User = require('../models/User');
      const Opportunity = require('../models/Opportunity');
      
      const volunteer = await User.findById(volunteerId);
      const opportunity = await Opportunity.findById(opportunityId).populate('institution');
      
      if (!volunteer || !opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Voluntário ou oportunidade não encontrado'
        });
      }

      const result = await emailService.sendNewOpportunityNotification(volunteer, opportunity);

      res.json({
        success: true,
        message: 'Notificação de nova oportunidade enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de nova oportunidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar notificação de candidatura
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendApplicationNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

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

      const result = await emailService.sendApplicationNotification(
        application.opportunity.institution,
        application
      );

      res.json({
        success: true,
        message: 'Notificação de candidatura enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de candidatura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

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

      const result = await emailService.sendApplicationStatusNotification(
        application.volunteer,
        application
      );

      res.json({
        success: true,
        message: 'Notificação de status da candidatura enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de status da candidatura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { participantId, activityId } = req.body;

      // Buscar dados do participante e atividade
      const User = require('../models/User');
      const Activity = require('../models/Activity');
      
      const participant = await User.findById(participantId);
      const activity = await Activity.findById(activityId);
      
      if (!participant || !activity) {
        return res.status(404).json({
          success: false,
          message: 'Participante ou atividade não encontrado'
        });
      }

      const result = await emailService.sendActivityReminder(participant, activity);

      res.json({
        success: true,
        message: 'Lembrete de atividade enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar lembrete de atividade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Enviar email em massa
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendBulkEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { recipients, subject, html, text, categories } = req.body;

      const result = await emailService.sendBulkEmail(recipients, {
        subject,
        html,
        text,
        categories
      });

      res.json({
        success: true,
        message: 'Email em massa enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar email em massa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getEmailStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const result = await emailService.getEmailStats(startDate, endDate);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de email:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Validar email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async validateEmail(req, res) {
    try {
      const { email } = req.body;

      const isValid = emailService.isValidEmail(email);

      res.json({
        success: true,
        data: {
          email,
          isValid
        }
      });
    } catch (error) {
      console.error('Erro ao validar email:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new EmailController();