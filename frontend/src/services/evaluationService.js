import api from './api';

const evaluationService = {
  // Buscar avaliações
  getEvaluations: async (filters = {}) => {
    const response = await api.get('/evaluations', { params: filters });
    return response.data;
  },

  // Buscar avaliação por ID
  getEvaluationById: async (evaluationId) => {
    const response = await api.get(`/evaluations/${evaluationId}`);
    return response.data;
  },

  // Criar avaliação
  createEvaluation: async (evaluationData) => {
    const response = await api.post('/evaluations', evaluationData);
    return response.data;
  },

  // Atualizar avaliação
  updateEvaluation: async (evaluationId, evaluationData) => {
    const response = await api.put(`/evaluations/${evaluationId}`, evaluationData);
    return response.data;
  },

  // Deletar avaliação
  deleteEvaluation: async (evaluationId) => {
    const response = await api.delete(`/evaluations/${evaluationId}`);
    return response.data;
  },

  // Buscar avaliações de um usuário
  getUserEvaluations: async (userId, filters = {}) => {
    const response = await api.get(`/users/${userId}/evaluations`, { params: filters });
    return response.data;
  },

  // Buscar avaliações de uma oportunidade
  getOpportunityEvaluations: async (opportunityId, filters = {}) => {
    const response = await api.get(`/opportunities/${opportunityId}/evaluations`, { params: filters });
    return response.data;
  },

  // Buscar avaliações de uma atividade
  getActivityEvaluations: async (activityId, filters = {}) => {
    const response = await api.get(`/activities/${activityId}/evaluations`, { params: filters });
    return response.data;
  },

  // Buscar estatísticas de avaliações
  getEvaluationStats: async (filters = {}) => {
    const response = await api.get('/evaluations/stats', { params: filters });
    return response.data;
  },

  // Reportar avaliação
  reportEvaluation: async (evaluationId, reportData) => {
    const response = await api.post(`/evaluations/${evaluationId}/report`, reportData);
    return response.data;
  },

  // Buscar relatórios de avaliação
  getEvaluationReports: async (filters = {}) => {
    const response = await api.get('/evaluations/reports', { params: filters });
    return response.data;
  },

  // Moderar avaliação
  moderateEvaluation: async (evaluationId, moderationData) => {
    const response = await api.post(`/evaluations/${evaluationId}/moderate`, moderationData);
    return response.data;
  },

  // Buscar avaliações pendentes de moderação
  getPendingEvaluations: async (filters = {}) => {
    const response = await api.get('/evaluations/pending', { params: filters });
    return response.data;
  },

  // Aprovar avaliação
  approveEvaluation: async (evaluationId) => {
    const response = await api.post(`/evaluations/${evaluationId}/approve`);
    return response.data;
  },

  // Rejeitar avaliação
  rejectEvaluation: async (evaluationId, reason) => {
    const response = await api.post(`/evaluations/${evaluationId}/reject`, { reason });
    return response.data;
  },

  // Buscar avaliações por tipo
  getEvaluationsByType: async (type, filters = {}) => {
    const response = await api.get(`/evaluations/type/${type}`, { params: filters });
    return response.data;
  },

  // Buscar avaliações por status
  getEvaluationsByStatus: async (status, filters = {}) => {
    const response = await api.get(`/evaluations/status/${status}`, { params: filters });
    return response.data;
  },

  // Buscar avaliações recentes
  getRecentEvaluations: async (limit = 10) => {
    const response = await api.get('/evaluations/recent', { params: { limit } });
    return response.data;
  },

  // Buscar avaliações com filtros avançados
  searchEvaluations: async (searchParams) => {
    const response = await api.post('/evaluations/search', searchParams);
    return response.data;
  },

  // Exportar avaliações
  exportEvaluations: async (filters = {}) => {
    const response = await api.get('/evaluations/export', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default evaluationService;
