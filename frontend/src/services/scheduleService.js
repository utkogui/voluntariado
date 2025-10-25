import api from './api';

const scheduleService = {
  // Buscar atividades do usuário
  getActivities: async (filters = {}) => {
    try {
      const response = await api.get('/activities', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades');
    }
  },

  // Buscar atividade por ID
  getActivityById: async (activityId) => {
    try {
      const response = await api.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividade');
    }
  },

  // Criar nova atividade
  createActivity: async (activityData) => {
    try {
      const response = await api.post('/activities', activityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar atividade');
    }
  },

  // Atualizar atividade
  updateActivity: async (activityId, activityData) => {
    try {
      const response = await api.put(`/activities/${activityId}`, activityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar atividade');
    }
  },

  // Deletar atividade
  deleteActivity: async (activityId) => {
    try {
      const response = await api.delete(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar atividade');
    }
  },

  // Inscrever-se em atividade
  registerForActivity: async (activityId) => {
    try {
      const response = await api.post(`/activities/${activityId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao se inscrever na atividade');
    }
  },

  // Cancelar inscrição em atividade
  unregisterFromActivity: async (activityId) => {
    try {
      const response = await api.delete(`/activities/${activityId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao cancelar inscrição');
    }
  },

  // Confirmar presença
  confirmAttendance: async (activityId) => {
    try {
      const response = await api.post(`/activities/${activityId}/confirm-attendance`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao confirmar presença');
    }
  },

  // Cancelar presença
  cancelAttendance: async (activityId, reason) => {
    try {
      const response = await api.post(`/activities/${activityId}/cancel-attendance`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao cancelar presença');
    }
  },

  // Reagendar atividade
  rescheduleActivity: async (activityId, newDateTime, reason) => {
    try {
      const response = await api.post(`/activities/${activityId}/reschedule`, {
        newDateTime,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao reagendar atividade');
    }
  },

  // Buscar atividades por data
  getActivitiesByDate: async (date) => {
    try {
      const response = await api.get('/activities/by-date', { params: { date } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades por data');
    }
  },

  // Buscar atividades por período
  getActivitiesByPeriod: async (startDate, endDate) => {
    try {
      const response = await api.get('/activities/by-period', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades por período');
    }
  },

  // Buscar atividades próximas
  getUpcomingActivities: async (limit = 10) => {
    try {
      const response = await api.get('/activities/upcoming', { params: { limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades próximas');
    }
  },

  // Buscar atividades passadas
  getPastActivities: async (limit = 10) => {
    try {
      const response = await api.get('/activities/past', { params: { limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades passadas');
    }
  },

  // Buscar atividades por status
  getActivitiesByStatus: async (status) => {
    try {
      const response = await api.get('/activities/by-status', { params: { status } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades por status');
    }
  },

  // Buscar atividades por tipo
  getActivitiesByType: async (type) => {
    try {
      const response = await api.get('/activities/by-type', { params: { type } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades por tipo');
    }
  },

  // Buscar atividades por localização
  getActivitiesByLocation: async (latitude, longitude, radius = 10) => {
    try {
      const response = await api.get('/activities/by-location', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar atividades por localização');
    }
  },

  // Buscar participantes de uma atividade
  getActivityParticipants: async (activityId) => {
    try {
      const response = await api.get(`/activities/${activityId}/participants`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar participantes');
    }
  },

  // Adicionar participante à atividade
  addParticipant: async (activityId, userId) => {
    try {
      const response = await api.post(`/activities/${activityId}/participants`, { userId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao adicionar participante');
    }
  },

  // Remover participante da atividade
  removeParticipant: async (activityId, userId) => {
    try {
      const response = await api.delete(`/activities/${activityId}/participants/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao remover participante');
    }
  },

  // Buscar estatísticas de atividades
  getActivityStats: async (period = 'month') => {
    try {
      const response = await api.get('/activities/stats', { params: { period } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar estatísticas');
    }
  },

  // Buscar relatório de presença
  getAttendanceReport: async (activityId) => {
    try {
      const response = await api.get(`/activities/${activityId}/attendance-report`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar relatório de presença');
    }
  },

  // Exportar atividades
  exportActivities: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/activities/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao exportar atividades');
    }
  },

  // Buscar configurações de agendamento
  getScheduleSettings: async () => {
    try {
      const response = await api.get('/schedule/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar configurações');
    }
  },

  // Atualizar configurações de agendamento
  updateScheduleSettings: async (settings) => {
    try {
      const response = await api.put('/schedule/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar configurações');
    }
  },

  // Buscar disponibilidade
  getAvailability: async (userId, startDate, endDate) => {
    try {
      const response = await api.get('/schedule/availability', {
        params: { userId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar disponibilidade');
    }
  },

  // Atualizar disponibilidade
  updateAvailability: async (availabilityData) => {
    try {
      const response = await api.put('/schedule/availability', availabilityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar disponibilidade');
    }
  },

  // Buscar conflitos de horário
  getScheduleConflicts: async (activityId, startDateTime, endDateTime) => {
    try {
      const response = await api.get('/schedule/conflicts', {
        params: { activityId, startDateTime, endDateTime }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar conflitos');
    }
  },

  // Validar horário
  validateSchedule: async (startDateTime, endDateTime, participants = []) => {
    try {
      const response = await api.post('/schedule/validate', {
        startDateTime,
        endDateTime,
        participants
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao validar horário');
    }
  }
};

export default scheduleService;
