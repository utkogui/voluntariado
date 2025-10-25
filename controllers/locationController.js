const locationService = require('../services/locationService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter todos os estados
const getAllStates = async (req, res) => {
  try {
    const result = await locationService.getAllStates();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      states: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter cidades por estado
const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const result = await locationService.getCitiesByState(stateId);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      cities: result.data,
      state: result.state,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar cidades
const searchCities = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await locationService.searchCities(q.trim());
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      cities: result.data,
      query: result.query,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar cidades próximas
const getNearbyCities = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude e longitude são obrigatórios'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Latitude e longitude devem ser números válidos'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Latitude deve estar entre -90 e 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Longitude deve estar entre -180 e 180'
      });
    }

    const result = await locationService.getNearbyCities(latitude, longitude, radiusKm);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      cities: result.data,
      center: result.center,
      radius: result.radius,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de localização
const getLocationStats = async (req, res) => {
  try {
    const result = await locationService.getLocationStats();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Validar CEP
const validateCEP = async (req, res) => {
  try {
    const { cep } = req.params;
    
    if (!cep) {
      return res.status(400).json({
        error: 'CEP é obrigatório'
      });
    }

    const result = await locationService.validateCEP(cep);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      address: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Calcular distância entre duas coordenadas
const calculateDistance = async (req, res) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.query;
    
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return res.status(400).json({
        error: 'Todas as coordenadas são obrigatórias (lat1, lng1, lat2, lng2)'
      });
    }

    const latitude1 = parseFloat(lat1);
    const longitude1 = parseFloat(lng1);
    const latitude2 = parseFloat(lat2);
    const longitude2 = parseFloat(lng2);

    if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
      return res.status(400).json({
        error: 'Todas as coordenadas devem ser números válidos'
      });
    }

    const distance = locationService.calculateDistance(
      latitude1, longitude1, 
      latitude2, longitude2
    );

    res.json({
      distance: Math.round(distance * 100) / 100, // Arredondar para 2 casas decimais
      unit: 'km',
      coordinates: {
        from: { lat: latitude1, lng: longitude1 },
        to: { lat: latitude2, lng: longitude2 }
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllStates,
  getCitiesByState,
  searchCities,
  getNearbyCities,
  getLocationStats,
  validateCEP,
  calculateDistance
};


