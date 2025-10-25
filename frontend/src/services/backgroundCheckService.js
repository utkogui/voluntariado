import api from './api';

const BACKGROUND_CHECK_API_BASE_URL = '/api/background-check';

const backgroundCheckService = {
  // Iniciar verificação de antecedentes
  initiateBackgroundCheck: async (userId, personalData) => {
    try {
      const response = await api.post(`${BACKGROUND_CHECK_API_BASE_URL}/users/${userId}/checks`, personalData);
      return response.data;
    } catch (error) {
      console.error('Error initiating background check:', error);
      throw error;
    }
  },

  // Verificar status da verificação
  getCheckStatus: async (checkId) => {
    try {
      const response = await api.get(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting check status:', error);
      throw error;
    }
  },

  // Obter relatório completo
  getCheckReport: async (checkId) => {
    try {
      const response = await api.get(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/report`);
      return response.data;
    } catch (error) {
      console.error('Error getting check report:', error);
      throw error;
    }
  },

  // Listar verificações de um usuário
  getUserChecks: async (userId, limit = 10, offset = 0) => {
    try {
      const response = await api.get(`${BACKGROUND_CHECK_API_BASE_URL}/users/${userId}/checks`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user checks:', error);
      throw error;
    }
  },

  // Cancelar verificação
  cancelCheck: async (checkId) => {
    try {
      const response = await api.post(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling check:', error);
      throw error;
    }
  },

  // Verificar elegibilidade para voluntariado
  checkVolunteerEligibility: async (checkId) => {
    try {
      const response = await api.get(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/eligibility`);
      return response.data;
    } catch (error) {
      console.error('Error checking volunteer eligibility:', error);
      throw error;
    }
  },

  // Obter estatísticas de verificações
  getCheckStats: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${BACKGROUND_CHECK_API_BASE_URL}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting check stats:', error);
      throw error;
    }
  }
};

export default backgroundCheckService;
