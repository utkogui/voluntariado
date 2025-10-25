import api from './api';

const geolocationService = {
  // Geocodificar endereço
  geocodeAddress: async (address) => {
    try {
      const response = await api.post('/geolocation/geocode', { address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao geocodificar endereço');
    }
  },

  // Geocodificação reversa
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await api.post('/geolocation/reverse-geocode', { latitude, longitude });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro na geocodificação reversa');
    }
  },

  // Calcular distância entre dois pontos
  calculateDistance: async (point1, point2) => {
    try {
      const response = await api.post('/geolocation/distance', { point1, point2 });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao calcular distância');
    }
  },

  // Buscar lugares próximos
  findNearbyPlaces: async (latitude, longitude, radius = 5000, type = null) => {
    try {
      const params = { latitude, longitude, radius };
      if (type) params.type = type;
      
      const response = await api.get('/geolocation/nearby-places', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar lugares próximos');
    }
  },

  // Obter direções entre dois pontos
  getDirections: async (origin, destination, mode = 'driving') => {
    try {
      const response = await api.post('/geolocation/directions', { origin, destination, mode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter direções');
    }
  },

  // Validar endereço
  validateAddress: async (address) => {
    try {
      const response = await api.post('/geolocation/validate-address', { address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao validar endereço');
    }
  },

  // Obter sugestões de endereço
  getAddressSuggestions: async (input) => {
    try {
      const response = await api.get('/geolocation/address-suggestions', { 
        params: { input } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter sugestões de endereço');
    }
  },

  // Obter detalhes de um lugar
  getPlaceDetails: async (placeId) => {
    try {
      const response = await api.get(`/geolocation/place-details/${placeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter detalhes do lugar');
    }
  },

  // Obter timezone de uma localização
  getTimezone: async (latitude, longitude) => {
    try {
      const response = await api.get('/geolocation/timezone', { 
        params: { latitude, longitude } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter timezone');
    }
  },

  // Buscar oportunidades próximas
  findNearbyOpportunities: async (latitude, longitude, radius = 10000, category = null) => {
    try {
      const params = { latitude, longitude, radius };
      if (category) params.category = category;
      
      const response = await api.get('/geolocation/nearby-opportunities', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar oportunidades próximas');
    }
  },

  // Obter estatísticas de localização
  getLocationStats: async (latitude, longitude, radius = 5000) => {
    try {
      const response = await api.get('/geolocation/location-stats', { 
        params: { latitude, longitude, radius } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas de localização');
    }
  }
};

export default geolocationService;
