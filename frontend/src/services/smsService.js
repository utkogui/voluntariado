import api from './api';

const SMS_API_BASE_URL = '/api/sms';

const smsService = {
  // Enviar SMS para um número específico
  sendSMS: async (to, message, from = null) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send`, {
        to,
        message,
        from
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  },

  // Enviar SMS em massa
  sendBulkSMS: async (recipients, message, from = null) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send-bulk`, {
        recipients,
        message,
        from
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw error;
    }
  },

  // Enviar SMS de verificação
  sendVerificationSMS: async (phoneNumber, verificationCode) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send-verification`, {
        phoneNumber,
        verificationCode
      });
      return response.data;
    } catch (error) {
      console.error('Error sending verification SMS:', error);
      throw error;
    }
  },

  // Enviar lembrete de atividade
  sendActivityReminderSMS: async (phoneNumber, activityName, activityDate, activityTime) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send-activity-reminder`, {
        phoneNumber,
        activityName,
        activityDate,
        activityTime
      });
      return response.data;
    } catch (error) {
      console.error('Error sending activity reminder SMS:', error);
      throw error;
    }
  },

  // Enviar confirmação de candidatura
  sendApplicationConfirmationSMS: async (phoneNumber, opportunityName, status) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send-application-confirmation`, {
        phoneNumber,
        opportunityName,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error sending application confirmation SMS:', error);
      throw error;
    }
  },

  // Enviar SMS de emergência
  sendEmergencySMS: async (phoneNumber, message) => {
    try {
      const response = await api.post(`${SMS_API_BASE_URL}/send-emergency`, {
        phoneNumber,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      throw error;
    }
  },

  // Verificar status de uma mensagem
  getMessageStatus: async (messageId) => {
    try {
      const response = await api.get(`${SMS_API_BASE_URL}/message/${messageId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting message status:', error);
      throw error;
    }
  },

  // Obter histórico de mensagens
  getMessageHistory: async (limit = 50, startDate = null, endDate = null) => {
    try {
      const params = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${SMS_API_BASE_URL}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting message history:', error);
      throw error;
    }
  },

  // Validar número de telefone
  validatePhoneNumber: async (phoneNumber) => {
    try {
      const response = await api.get(`${SMS_API_BASE_URL}/validate/${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error validating phone number:', error);
      throw error;
    }
  },

  // Obter estatísticas de SMS
  getSMSStats: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${SMS_API_BASE_URL}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting SMS stats:', error);
      throw error;
    }
  }
};

export default smsService;
