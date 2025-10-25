const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

class EmailService {
  constructor() {
    this.provider = config.EMAIL_PROVIDER || 'smtp';
    this.fromEmail = config.FROM_EMAIL || 'noreply@voluntariado.com';
    this.fromName = config.FROM_NAME || 'Plataforma de Voluntariado';
    
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'sendgrid':
        this.initializeSendGrid();
        break;
      case 'mailgun':
        this.initializeMailgun();
        break;
      case 'smtp':
      default:
        this.initializeSMTP();
        break;
    }
  }

  initializeSendGrid() {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
    this.sendEmail = this.sendEmailSendGrid;
  }

  initializeMailgun() {
    const mailgun = require('mailgun-js')({
      apiKey: config.MAILGUN_API_KEY,
      domain: config.MAILGUN_DOMAIN
    });
    this.mailgun = mailgun;
    this.sendEmail = this.sendEmailMailgun;
  }

  initializeSMTP() {
    this.transporter = nodemailer.createTransporter({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      }
    });
    this.sendEmail = this.sendEmailSMTP;
  }

  /**
   * Enviar email usando SendGrid
   * @param {Object} emailData - Dados do email
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEmailSendGrid(emailData) {
    try {
      const msg = {
        to: emailData.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.dynamicTemplateData,
        attachments: emailData.attachments,
        categories: emailData.categories,
        customArgs: emailData.customArgs
      };

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('Erro ao enviar email via SendGrid:', error);
      throw new Error('Erro ao enviar email via SendGrid');
    }
  }

  /**
   * Enviar email usando Mailgun
   * @param {Object} emailData - Dados do email
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEmailMailgun(emailData) {
    try {
      const data = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        'o:tag': emailData.categories || [],
        'v:custom-args': emailData.customArgs || {}
      };

      if (emailData.attachments) {
        data.attachment = emailData.attachments;
      }

      const response = await this.mailgun.messages().send(data);
      
      return {
        success: true,
        messageId: response.id,
        provider: 'mailgun'
      };
    } catch (error) {
      console.error('Erro ao enviar email via Mailgun:', error);
      throw new Error('Erro ao enviar email via Mailgun');
    }
  }

  /**
   * Enviar email usando SMTP
   * @param {Object} emailData - Dados do email
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEmailSMTP(emailData) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments
      };

      const response = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: response.messageId,
        provider: 'smtp'
      };
    } catch (error) {
      console.error('Erro ao enviar email via SMTP:', error);
      throw new Error('Erro ao enviar email via SMTP');
    }
  }

  /**
   * Enviar email de boas-vindas
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendWelcomeEmail(user) {
    const template = await this.loadTemplate('welcome');
    const html = template({
      name: user.name,
      email: user.email,
      userType: user.userType,
      verificationLink: `${config.FRONTEND_URL}/verify-email?token=${user.verificationToken}`
    });

    return await this.sendEmail({
      to: user.email,
      subject: 'Bem-vindo à Plataforma de Voluntariado!',
      html: html,
      text: `Olá ${user.name}, bem-vindo à nossa plataforma!`,
      categories: ['welcome', 'onboarding']
    });
  }

  /**
   * Enviar email de verificação
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendVerificationEmail(user) {
    const template = await this.loadTemplate('verification');
    const html = template({
      name: user.name,
      verificationLink: `${config.FRONTEND_URL}/verify-email?token=${user.verificationToken}`
    });

    return await this.sendEmail({
      to: user.email,
      subject: 'Verifique seu email',
      html: html,
      text: `Olá ${user.name}, clique no link para verificar seu email: ${config.FRONTEND_URL}/verify-email?token=${user.verificationToken}`,
      categories: ['verification', 'security']
    });
  }

  /**
   * Enviar email de recuperação de senha
   * @param {Object} user - Dados do usuário
   * @param {string} resetToken - Token de reset
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendPasswordResetEmail(user, resetToken) {
    const template = await this.loadTemplate('password-reset');
    const html = template({
      name: user.name,
      resetLink: `${config.FRONTEND_URL}/reset-password?token=${resetToken}`
    });

    return await this.sendEmail({
      to: user.email,
      subject: 'Recuperação de senha',
      html: html,
      text: `Olá ${user.name}, clique no link para redefinir sua senha: ${config.FRONTEND_URL}/reset-password?token=${resetToken}`,
      categories: ['password-reset', 'security']
    });
  }

  /**
   * Enviar notificação de nova oportunidade
   * @param {Object} volunteer - Dados do voluntário
   * @param {Object} opportunity - Dados da oportunidade
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendNewOpportunityNotification(volunteer, opportunity) {
    const template = await this.loadTemplate('new-opportunity');
    const html = template({
      name: volunteer.name,
      opportunityTitle: opportunity.title,
      opportunityDescription: opportunity.description,
      opportunityLink: `${config.FRONTEND_URL}/opportunities/${opportunity.id}`,
      institutionName: opportunity.institution.name
    });

    return await this.sendEmail({
      to: volunteer.email,
      subject: `Nova oportunidade: ${opportunity.title}`,
      html: html,
      text: `Olá ${volunteer.name}, uma nova oportunidade foi publicada: ${opportunity.title}`,
      categories: ['opportunity', 'notification']
    });
  }

  /**
   * Enviar notificação de candidatura
   * @param {Object} institution - Dados da instituição
   * @param {Object} application - Dados da candidatura
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendApplicationNotification(institution, application) {
    const template = await this.loadTemplate('application-notification');
    const html = template({
      institutionName: institution.name,
      volunteerName: application.volunteer.name,
      opportunityTitle: application.opportunity.title,
      applicationLink: `${config.FRONTEND_URL}/applications/${application.id}`,
      message: application.message
    });

    return await this.sendEmail({
      to: institution.email,
      subject: `Nova candidatura para: ${application.opportunity.title}`,
      html: html,
      text: `Olá ${institution.name}, ${application.volunteer.name} se candidatou para a oportunidade: ${application.opportunity.title}`,
      categories: ['application', 'notification']
    });
  }

  /**
   * Enviar notificação de status da candidatura
   * @param {Object} volunteer - Dados do voluntário
   * @param {Object} application - Dados da candidatura
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendApplicationStatusNotification(volunteer, application) {
    const template = await this.loadTemplate('application-status');
    const html = template({
      name: volunteer.name,
      opportunityTitle: application.opportunity.title,
      status: application.status,
      institutionName: application.opportunity.institution.name,
      message: application.institutionMessage
    });

    const statusText = {
      'PENDING': 'pendente',
      'APPROVED': 'aprovada',
      'REJECTED': 'rejeitada',
      'CANCELLED': 'cancelada'
    };

    return await this.sendEmail({
      to: volunteer.email,
      subject: `Status da candidatura: ${statusText[application.status]}`,
      html: html,
      text: `Olá ${volunteer.name}, sua candidatura para ${application.opportunity.title} foi ${statusText[application.status]}`,
      categories: ['application-status', 'notification']
    });
  }

  /**
   * Enviar lembrete de atividade
   * @param {Object} participant - Dados do participante
   * @param {Object} activity - Dados da atividade
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendActivityReminder(participant, activity) {
    const template = await this.loadTemplate('activity-reminder');
    const html = template({
      name: participant.name,
      activityTitle: activity.title,
      activityDate: new Date(activity.startDate).toLocaleDateString('pt-BR'),
      activityTime: new Date(activity.startDate).toLocaleTimeString('pt-BR'),
      activityLocation: activity.location,
      activityLink: `${config.FRONTEND_URL}/activities/${activity.id}`
    });

    return await this.sendEmail({
      to: participant.email,
      subject: `Lembrete: ${activity.title} - ${new Date(activity.startDate).toLocaleDateString('pt-BR')}`,
      html: html,
      text: `Olá ${participant.name}, lembrete da atividade: ${activity.title} em ${new Date(activity.startDate).toLocaleDateString('pt-BR')}`,
      categories: ['reminder', 'activity']
    });
  }

  /**
   * Enviar email de avaliação
   * @param {Object} user - Dados do usuário
   * @param {Object} evaluation - Dados da avaliação
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEvaluationEmail(user, evaluation) {
    const template = await this.loadTemplate('evaluation');
    const html = template({
      name: user.name,
      evaluatedName: evaluation.evaluatedUser.name,
      rating: evaluation.rating,
      comment: evaluation.comment,
      evaluationLink: `${config.FRONTEND_URL}/evaluations/${evaluation.id}`
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Nova avaliação recebida`,
      html: html,
      text: `Olá ${user.name}, você recebeu uma nova avaliação de ${evaluation.evaluatedUser.name}`,
      categories: ['evaluation', 'notification']
    });
  }

  /**
   * Enviar email de relatório
   * @param {Object} user - Dados do usuário
   * @param {Object} report - Dados do relatório
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendReportEmail(user, report) {
    const template = await this.loadTemplate('report');
    const html = template({
      name: user.name,
      reportType: report.type,
      reportDescription: report.description,
      reportLink: `${config.FRONTEND_URL}/reports/${report.id}`
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Relatório de ${report.type}`,
      html: html,
      text: `Olá ${user.name}, seu relatório de ${report.type} está disponível`,
      categories: ['report', 'notification']
    });
  }

  /**
   * Enviar email em massa
   * @param {Array} recipients - Lista de destinatários
   * @param {Object} emailData - Dados do email
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendBulkEmail(recipients, emailData) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          ...emailData,
          to: recipient.email
        });
        results.push({ recipient: recipient.email, success: true, result });
      } catch (error) {
        results.push({ recipient: recipient.email, success: false, error: error.message });
      }
    }

    return {
      success: true,
      totalSent: recipients.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Carregar template de email
   * @param {string} templateName - Nome do template
   * @returns {Promise<Function>} Template compilado
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateSource);
    } catch (error) {
      console.error(`Erro ao carregar template ${templateName}:`, error);
      // Retornar template padrão
      return handlebars.compile(`
        <h1>{{title}}</h1>
        <p>{{content}}</p>
      `);
    }
  }

  /**
   * Validar email
   * @param {string} email - Email para validar
   * @returns {boolean} Se o email é válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obter estatísticas de envio
   * @param {string} startDate - Data de início
   * @param {string} endDate - Data de fim
   * @returns {Promise<Object>} Estatísticas
   */
  async getEmailStats(startDate, endDate) {
    // Implementar lógica para obter estatísticas do provedor
    // Isso varia dependendo do provedor usado
    return {
      totalSent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0
    };
  }
}

module.exports = new EmailService();