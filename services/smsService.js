const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

// Inicializar cliente Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const smsService = {
  // Enviar SMS para um número específico
  sendSMS: async (to, message, from = null) => {
    try {
      const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
      
      if (!fromNumber) {
        throw new Error('Número de telefone remetente não configurado');
      }

      const response = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to
      });

      console.log(`SMS enviado para ${to}: ${response.sid}`);
      return {
        success: true,
        messageId: response.sid,
        status: response.status,
        to: response.to,
        from: response.from,
        body: response.body,
        dateCreated: response.dateCreated
      };
    } catch (error) {
      console.error(`Erro ao enviar SMS para ${to}:`, error);
      throw {
        success: false,
        error: error.message,
        code: error.code,
        to: to
      };
    }
  },

  // Enviar SMS em massa para múltiplos números
  sendBulkSMS: async (recipients, message, from = null) => {
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await smsService.sendSMS(recipient, message, from);
        results.push(result);
      } catch (error) {
        errors.push({
          recipient,
          error: error.message || error
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      totalSent: results.length,
      totalErrors: errors.length
    };
  },

  // Enviar SMS de verificação
  sendVerificationSMS: async (phoneNumber, verificationCode) => {
    const message = `Seu código de verificação é: ${verificationCode}. Use este código para verificar seu número de telefone.`;
    return await smsService.sendSMS(phoneNumber, message);
  },

  // Enviar SMS de lembrete de atividade
  sendActivityReminderSMS: async (phoneNumber, activityName, activityDate, activityTime) => {
    const message = `Lembrete: Você tem uma atividade "${activityName}" agendada para ${activityDate} às ${activityTime}. Não esqueça!`;
    return await smsService.sendSMS(phoneNumber, message);
  },

  // Enviar SMS de confirmação de candidatura
  sendApplicationConfirmationSMS: async (phoneNumber, opportunityName, status) => {
    let message;
    switch (status) {
      case 'approved':
        message = `Parabéns! Sua candidatura para "${opportunityName}" foi aprovada. Aguarde mais informações.`;
        break;
      case 'rejected':
        message = `Sua candidatura para "${opportunityName}" não foi aprovada desta vez. Continue tentando!`;
        break;
      case 'pending':
        message = `Sua candidatura para "${opportunityName}" foi recebida e está sendo analisada.`;
        break;
      default:
        message = `Atualização sobre sua candidatura para "${opportunityName}": ${status}`;
    }
    return await smsService.sendSMS(phoneNumber, message);
  },

  // Enviar SMS de emergência
  sendEmergencySMS: async (phoneNumber, message) => {
    const emergencyMessage = `🚨 URGENTE: ${message}`;
    return await smsService.sendSMS(phoneNumber, emergencyMessage);
  },

  // Verificar status de uma mensagem
  getMessageStatus: async (messageId) => {
    try {
      const message = await client.messages(messageId).fetch();
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error(`Erro ao verificar status da mensagem ${messageId}:`, error);
      throw {
        success: false,
        error: error.message,
        messageId
      };
    }
  },

  // Obter histórico de mensagens
  getMessageHistory: async (limit = 50, startDate = null, endDate = null) => {
    try {
      const options = {
        limit: limit
      };

      if (startDate) {
        options.dateSentAfter = new Date(startDate);
      }
      if (endDate) {
        options.dateSentBefore = new Date(endDate);
      }

      const messages = await client.messages.list(options);
      
      return {
        success: true,
        messages: messages.map(message => ({
          messageId: message.sid,
          status: message.status,
          to: message.to,
          from: message.from,
          body: message.body,
          dateCreated: message.dateCreated,
          dateUpdated: message.dateUpdated,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage
        })),
        total: messages.length
      };
    } catch (error) {
      console.error('Erro ao obter histórico de mensagens:', error);
      throw {
        success: false,
        error: error.message
      };
    }
  },

  // Validar número de telefone
  validatePhoneNumber: async (phoneNumber) => {
    try {
      const lookup = await client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return {
        success: true,
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        nationalFormat: lookup.nationalFormat,
        valid: true
      };
    } catch (error) {
      return {
        success: false,
        phoneNumber,
        valid: false,
        error: error.message
      };
    }
  },

  // Obter estatísticas de SMS
  getSMSStats: async (startDate = null, endDate = null) => {
    try {
      const options = {};
      
      if (startDate) {
        options.startTime = new Date(startDate);
      }
      if (endDate) {
        options.endTime = new Date(endDate);
      }

      const messages = await client.messages.list(options);
      
      const stats = {
        total: messages.length,
        sent: messages.filter(m => m.status === 'sent').length,
        delivered: messages.filter(m => m.status === 'delivered').length,
        failed: messages.filter(m => m.status === 'failed').length,
        undelivered: messages.filter(m => m.status === 'undelivered').length,
        queued: messages.filter(m => m.status === 'queued').length,
        sending: messages.filter(m => m.status === 'sending').length,
        received: messages.filter(m => m.status === 'received').length
      };

      stats.deliveryRate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(2) : 0;
      stats.failureRate = stats.total > 0 ? (stats.failed / stats.total * 100).toFixed(2) : 0;

      return {
        success: true,
        stats,
        period: {
          startDate: startDate || 'início',
          endDate: endDate || 'agora'
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de SMS:', error);
      throw {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = smsService;