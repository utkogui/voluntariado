import api from './api';

const PUSH_NOTIFICATION_API_BASE_URL = '/api/push-notifications';

const pushNotificationService = {
  // Enviar notificação para um usuário específico
  sendToUser: async (userId, notificationData) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-to-user`, {
        userId,
        ...notificationData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  },

  // Enviar notificação para múltiplos usuários
  sendToMultipleUsers: async (userIds, notificationData) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-to-multiple-users`, {
        userIds,
        ...notificationData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending notification to multiple users:', error);
      throw error;
    }
  },

  // Enviar notificação para um tópico
  sendToTopic: async (topic, notificationData) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-to-topic`, {
        topic,
        ...notificationData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending notification to topic:', error);
      throw error;
    }
  },

  // Inscrever em um tópico
  subscribeToTopic: async (tokens, topic) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/subscribe-to-topic`, {
        tokens,
        topic
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  },

  // Cancelar inscrição de um tópico
  unsubscribeFromTopic: async (tokens, topic) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/unsubscribe-from-topic`, {
        tokens,
        topic
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  },

  // Agendar notificação
  scheduleNotification: async (notificationData, scheduleTime) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/schedule-notification`, {
        notificationData,
        scheduleTime
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  },

  // Obter estatísticas de notificações
  getNotificationStats: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${PUSH_NOTIFICATION_API_BASE_URL}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  },

  // Notificações específicas
  sendNewOpportunityNotification: async (volunteerId, opportunityId) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-new-opportunity`, {
        volunteerId,
        opportunityId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending new opportunity notification:', error);
      throw error;
    }
  },

  sendApplicationStatusNotification: async (applicationId) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-application-status`, {
        applicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending application status notification:', error);
      throw error;
    }
  },

  sendActivityReminder: async (participantId, activityId) => {
    try {
      const response = await api.post(`${PUSH_NOTIFICATION_API_BASE_URL}/send-activity-reminder`, {
        participantId,
        activityId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending activity reminder:', error);
      throw error;
    }
  }
};

export default pushNotificationService;
