import api from './api';

const ANALYTICS_API_BASE_URL = '/api/analytics';

const analyticsService = {
  // Google Analytics
  getGAReport: async (startDate = null, endDate = null, metrics = [], dimensions = []) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (metrics.length > 0) params.metrics = metrics;
      if (dimensions.length > 0) params.dimensions = dimensions;

      const response = await api.get(`${ANALYTICS_API_BASE_URL}/ga/report`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting GA report:', error);
      throw error;
    }
  },

  getGARealtime: async () => {
    try {
      const response = await api.get(`${ANALYTICS_API_BASE_URL}/ga/realtime`);
      return response.data;
    } catch (error) {
      console.error('Error getting GA realtime data:', error);
      throw error;
    }
  },

  // Mixpanel
  trackMixpanelEvent: async (eventName, properties = {}, userId = null) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/mixpanel/track`, {
        eventName,
        properties,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking Mixpanel event:', error);
      throw error;
    }
  },

  setMixpanelUserProperties: async (userId, properties = {}) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/mixpanel/user-properties`, {
        userId,
        properties
      });
      return response.data;
    } catch (error) {
      console.error('Error setting Mixpanel user properties:', error);
      throw error;
    }
  },

  getMixpanelInsights: async (event, fromDate = null, toDate = null, unit = 'day') => {
    try {
      const params = { event, unit };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(`${ANALYTICS_API_BASE_URL}/mixpanel/insights`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting Mixpanel insights:', error);
      throw error;
    }
  },

  // Eventos específicos
  trackUserRegistration: async (userId, userType, registrationMethod = 'email') => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/events/user-registration`, {
        userId,
        userType,
        registrationMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking user registration:', error);
      throw error;
    }
  },

  trackOpportunityView: async (userId, opportunityId, opportunityType) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/events/opportunity-view`, {
        userId,
        opportunityId,
        opportunityType
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking opportunity view:', error);
      throw error;
    }
  },

  trackApplicationSubmission: async (userId, opportunityId, applicationId) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/events/application-submission`, {
        userId,
        opportunityId,
        applicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking application submission:', error);
      throw error;
    }
  },

  trackVolunteerActivity: async (userId, activityId, activityType, duration = null) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/events/volunteer-activity`, {
        userId,
        activityId,
        activityType,
        duration
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking volunteer activity:', error);
      throw error;
    }
  },

  trackDonation: async (userId, amount, donationType, organizationId) => {
    try {
      const response = await api.post(`${ANALYTICS_API_BASE_URL}/events/donation`, {
        userId,
        amount,
        donationType,
        organizationId
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking donation:', error);
      throw error;
    }
  },

  // Métricas e relatórios
  getConsolidatedMetrics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${ANALYTICS_API_BASE_URL}/metrics/consolidated`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting consolidated metrics:', error);
      throw error;
    }
  },

  getConversionFunnel: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${ANALYTICS_API_BASE_URL}/metrics/conversion-funnel`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      throw error;
    }
  },

  getUserSegmentation: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${ANALYTICS_API_BASE_URL}/metrics/user-segmentation`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user segmentation:', error);
      throw error;
    }
  }
};

export default analyticsService;