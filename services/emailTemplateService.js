const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de templates de email
 */
class EmailTemplateService {
  
  /**
   * Templates padrão do sistema
   */
  static getDefaultTemplates() {
    return {
      ACTIVITY_REMINDER_24H: {
        subject: 'Lembrete: {{activity.title}} acontece amanhã',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Lembrete de Atividade</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
              .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Lembrete de Atividade</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <p>A atividade <strong>{{activity.title}}</strong> acontece amanhã!</p>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Descrição:</strong> {{activity.description}}</p>
                </div>
                
                <p>Não esqueça de confirmar sua presença!</p>
                <a href="{{activity.confirmUrl}}" class="button">Confirmar Presença</a>
                <a href="{{activity.detailsUrl}}" class="button">Ver Detalhes</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
                <p>Se você não deseja mais receber estes lembretes, <a href="{{unsubscribeUrl}}">clique aqui</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Lembrete: {{activity.title}} acontece amanhã
          
          Olá {{user.name}}!
          
          A atividade "{{activity.title}}" acontece amanhã!
          
          Detalhes da Atividade:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Descrição: {{activity.description}}
          
          Não esqueça de confirmar sua presença!
          Link para confirmação: {{activity.confirmUrl}}
          Ver detalhes: {{activity.detailsUrl}}
          
          Este é um lembrete automático do sistema de voluntariado.
          Para cancelar os lembretes: {{unsubscribeUrl}}
        `
      },
      ACTIVITY_REMINDER_2H: {
        subject: 'Lembrete: {{activity.title}} começa em 2 horas',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Lembrete Urgente de Atividade</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
              .button { display: inline-block; background: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .urgent { background: #ffebee; border: 1px solid #f44336; padding: 10px; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Lembrete Urgente</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <div class="urgent">
                  <p><strong>🚨 ATENÇÃO:</strong> A atividade <strong>{{activity.title}}</strong> começa em 2 horas!</p>
                </div>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Link da Reunião:</strong> <a href="{{activity.meetingUrl}}">{{activity.meetingUrl}}</a></p>
                </div>
                
                <p>Confirme sua presença o quanto antes!</p>
                <a href="{{activity.confirmUrl}}" class="button">Confirmar Presença</a>
                <a href="{{activity.detailsUrl}}" class="button">Ver Detalhes</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
                <p>Se você não deseja mais receber estes lembretes, <a href="{{unsubscribeUrl}}">clique aqui</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Lembrete Urgente: {{activity.title}} começa em 2 horas
          
          Olá {{user.name}}!
          
          🚨 ATENÇÃO: A atividade "{{activity.title}}" começa em 2 horas!
          
          Detalhes da Atividade:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Link da Reunião: {{activity.meetingUrl}}
          
          Confirme sua presença o quanto antes!
          Link para confirmação: {{activity.confirmUrl}}
          Ver detalhes: {{activity.detailsUrl}}
          
          Este é um lembrete automático do sistema de voluntariado.
          Para cancelar os lembretes: {{unsubscribeUrl}}
        `
      },
      ACTIVITY_REMINDER_30MIN: {
        subject: 'URGENTE: {{activity.title}} começa em 30 minutos',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Lembrete Crítico de Atividade</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f44336; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
              .button { display: inline-block; background: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .critical { background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 5px; text-align: center; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 LEMBRETE CRÍTICO</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <div class="critical">
                  <p><strong>🚨 URGENTE:</strong> A atividade <strong>{{activity.title}}</strong> começa em 30 minutos!</p>
                </div>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Link da Reunião:</strong> <a href="{{activity.meetingUrl}}">{{activity.meetingUrl}}</a></p>
                </div>
                
                <p>Se você não puder participar, cancele sua presença agora!</p>
                <a href="{{activity.confirmUrl}}" class="button">Confirmar Presença</a>
                <a href="{{activity.cancelUrl}}" class="button">Cancelar Presença</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
                <p>Se você não deseja mais receber estes lembretes, <a href="{{unsubscribeUrl}}">clique aqui</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          URGENTE: {{activity.title}} começa em 30 minutos
          
          Olá {{user.name}}!
          
          🚨 URGENTE: A atividade "{{activity.title}}" começa em 30 minutos!
          
          Detalhes da Atividade:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Link da Reunião: {{activity.meetingUrl}}
          
          Se você não puder participar, cancele sua presença agora!
          Link para confirmação: {{activity.confirmUrl}}
          Link para cancelamento: {{activity.cancelUrl}}
          
          Este é um lembrete automático do sistema de voluntariado.
          Para cancelar os lembretes: {{unsubscribeUrl}}
        `
      },
      CONFIRMATION_REMINDER: {
        subject: 'Confirmação de Presença Pendente - {{activity.title}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Confirmação de Presença</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
              .button { display: inline-block; background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Confirmação de Presença</h1>
              </div>
              <div class="content">
                <h2>Olá {{user.name}}!</h2>
                <p>Você ainda não confirmou sua presença na atividade <strong>{{activity.title}}</strong>.</p>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Descrição:</strong> {{activity.description}}</p>
                </div>
                
                <p>Por favor, confirme sua presença para que possamos organizar melhor a atividade.</p>
                <a href="{{activity.confirmUrl}}" class="button">Confirmar Presença</a>
                <a href="{{activity.declineUrl}}" class="button">Declinar Presença</a>
                <a href="{{activity.detailsUrl}}" class="button">Ver Detalhes</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
                <p>Se você não deseja mais receber estes lembretes, <a href="{{unsubscribeUrl}}">clique aqui</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Confirmação de Presença Pendente - {{activity.title}}
          
          Olá {{user.name}}!
          
          Você ainda não confirmou sua presença na atividade "{{activity.title}}".
          
          Detalhes da Atividade:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Descrição: {{activity.description}}
          
          Por favor, confirme sua presença para que possamos organizar melhor a atividade.
          Link para confirmação: {{activity.confirmUrl}}
          Link para declinar: {{activity.declineUrl}}
          Ver detalhes: {{activity.detailsUrl}}
          
          Este é um lembrete automático do sistema de voluntariado.
          Para cancelar os lembretes: {{unsubscribeUrl}}
        `
      },
      ACTIVITY_CANCELLED: {
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
              .header { background: #9E9E9E; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .activity-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9E9E9E; }
              .button { display: inline-block; background: #9E9E9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
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
                <p>Infelizmente, a atividade <strong>{{activity.title}}</strong> foi cancelada.</p>
                
                <div class="activity-info">
                  <h3>📅 Detalhes da Atividade Cancelada</h3>
                  <p><strong>Data:</strong> {{activity.startDate}}</p>
                  <p><strong>Horário:</strong> {{activity.startTime}} - {{activity.endTime}}</p>
                  <p><strong>Local:</strong> {{activity.location}}</p>
                  <p><strong>Motivo:</strong> {{activity.cancellationReason}}</p>
                </div>
                
                <p>Pedimos desculpas pelo inconveniente. Fique atento às próximas oportunidades!</p>
                <a href="{{opportunitiesUrl}}" class="button">Ver Outras Oportunidades</a>
              </div>
              <div class="footer">
                <p>Este é um lembrete automático do sistema de voluntariado.</p>
                <p>Se você não deseja mais receber estes lembretes, <a href="{{unsubscribeUrl}}">clique aqui</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Atividade Cancelada - {{activity.title}}
          
          Olá {{user.name}}!
          
          Infelizmente, a atividade "{{activity.title}}" foi cancelada.
          
          Detalhes da Atividade Cancelada:
          - Data: {{activity.startDate}}
          - Horário: {{activity.startTime}} - {{activity.endTime}}
          - Local: {{activity.location}}
          - Motivo: {{activity.cancellationReason}}
          
          Pedimos desculpas pelo inconveniente. Fique atento às próximas oportunidades!
          Ver outras oportunidades: {{opportunitiesUrl}}
          
          Este é um lembrete automático do sistema de voluntariado.
          Para cancelar os lembretes: {{unsubscribeUrl}}
        `
      }
    };
  }

  /**
   * Obter template por tipo
   * @param {string} type - Tipo do template
   * @returns {Object} Template
   */
  static getTemplateByType(type) {
    const templates = this.getDefaultTemplates();
    return templates[type] || null;
  }

  /**
   * Processar template com dados
   * @param {Object} template - Template
   * @param {Object} data - Dados para substituição
   * @returns {Object} Template processado
   */
  static processTemplate(template, data) {
    const processedTemplate = { ...template };

    // Processar subject
    if (processedTemplate.subject) {
      processedTemplate.subject = this.replaceVariables(processedTemplate.subject, data);
    }

    // Processar HTML
    if (processedTemplate.html) {
      processedTemplate.html = this.replaceVariables(processedTemplate.html, data);
    }

    // Processar texto
    if (processedTemplate.text) {
      processedTemplate.text = this.replaceVariables(processedTemplate.text, data);
    }

    return processedTemplate;
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
   * Formatar data para exibição
   * @param {Date} date - Data
   * @param {string} locale - Localização
   * @returns {string} Data formatada
   */
  static formatDate(date, locale = 'pt-BR') {
    return new Date(date).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatar horário para exibição
   * @param {Date} date - Data
   * @param {string} locale - Localização
   * @returns {string} Horário formatado
   */
  static formatTime(date, locale = 'pt-BR') {
    return new Date(date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Gerar URLs para templates
   * @param {string} baseUrl - URL base
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} URLs geradas
   */
  static generateUrls(baseUrl, activityId, userId) {
    return {
      confirmUrl: `${baseUrl}/activities/${activityId}/confirm`,
      declineUrl: `${baseUrl}/activities/${activityId}/decline`,
      cancelUrl: `${baseUrl}/activities/${activityId}/cancel`,
      detailsUrl: `${baseUrl}/activities/${activityId}`,
      opportunitiesUrl: `${baseUrl}/opportunities`,
      unsubscribeUrl: `${baseUrl}/preferences/notifications?userId=${userId}`
    };
  }

  /**
   * Preparar dados para template
   * @param {Object} activity - Dados da atividade
   * @param {Object} user - Dados do usuário
   * @param {string} baseUrl - URL base
   * @returns {Object} Dados preparados
   */
  static prepareTemplateData(activity, user, baseUrl) {
    const urls = this.generateUrls(baseUrl, activity.id, user.id);
    
    return {
      user: {
        name: this.getUserName(user),
        email: user.email
      },
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startDate: this.formatDate(activity.startDate),
        endDate: this.formatDate(activity.endDate),
        startTime: this.formatTime(activity.startDate),
        endTime: this.formatTime(activity.endDate),
        location: activity.address || 'Online',
        meetingUrl: activity.meetingUrl,
        cancellationReason: activity.cancellationReason,
        ...urls
      }
    };
  }

  /**
   * Obter nome do usuário
   * @param {Object} user - Dados do usuário
   * @returns {string} Nome do usuário
   */
  static getUserName(user) {
    if (user.volunteer) {
      return `${user.volunteer.firstName} ${user.volunteer.lastName}`;
    } else if (user.institution) {
      return user.institution.name;
    } else if (user.company) {
      return user.company.name;
    } else if (user.university) {
      return user.university.name;
    }
    return 'Usuário';
  }
}

module.exports = EmailTemplateService;
