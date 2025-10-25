import api from './api';

const PERFORMANCE_MONITORING_API_BASE_URL = '/api/performance-monitoring';

const performanceMonitoringService = {
  getHealthStatus: async () => {
    try {
      const response = await api.get(`${PERFORMANCE_MONITORING_API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  },

  getMetrics: async () => {
    try {
      const response = await api.get(`${PERFORMANCE_MONITORING_API_BASE_URL}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  getSummaryMetrics: async () => {
    try {
      const response = await api.get(`${PERFORMANCE_MONITORING_API_BASE_URL}/metrics/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary metrics:', error);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const response = await api.get(`${PERFORMANCE_MONITORING_API_BASE_URL}/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  updateAlertThresholds: async (thresholds) => {
    try {
      const response = await api.put(`${PERFORMANCE_MONITORING_API_BASE_URL}/alerts/thresholds`, thresholds);
      return response.data;
    } catch (error) {
      console.error('Error updating alert thresholds:', error);
      throw error;
    }
  },

  resetMetrics: async () => {
    try {
      const response = await api.post(`${PERFORMANCE_MONITORING_API_BASE_URL}/metrics/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting metrics:', error);
      throw error;
    }
  }
};

export default performanceMonitoringService;
