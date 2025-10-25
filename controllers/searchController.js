const searchService = require('../services/searchService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Busca avançada de oportunidades
const advancedSearch = async (req, res) => {
  try {
    const searchParams = {
      // Parâmetros de busca
      query: req.query.q,
      
      // Filtros básicos
      status: req.query.status,
      volunteerType: req.query.volunteerType,
      city: req.query.city,
      state: req.query.state,
      category: req.query.category,
      skill: req.query.skill,
      isRemote: req.query.isRemote === 'true' ? true : req.query.isRemote === 'false' ? false : undefined,
      needsDonations: req.query.needsDonations === 'true' ? true : req.query.needsDonations === 'false' ? false : undefined,
      
      // Filtros de data
      startDateFrom: req.query.startDateFrom,
      startDateTo: req.query.startDateTo,
      applicationDeadlineFrom: req.query.applicationDeadlineFrom,
      applicationDeadlineTo: req.query.applicationDeadlineTo,
      
      // Filtros de localização
      latitude: req.query.lat,
      longitude: req.query.lng,
      radius: req.query.radius,
      
      // Filtros de disponibilidade
      hasAvailableSlots: req.query.hasAvailableSlots === 'true' ? true : undefined,
      
      // Ordenação e paginação
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      pagination: result.data.pagination,
      filters: result.data.filters,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter sugestões de busca
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    const { type = 'all' } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query deve ter pelo menos 2 caracteres'
      });
    }

    const result = await searchService.getSearchSuggestions(q.trim(), type);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      suggestions: result.data,
      query: result.query,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter filtros disponíveis
const getAvailableFilters = async (req, res) => {
  try {
    const result = await searchService.getAvailableFilters();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      filters: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter tags populares
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const result = await searchService.getPopularTags(parseInt(limit));
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      tags: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Busca rápida (busca simples)
const quickSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query deve ter pelo menos 2 caracteres'
      });
    }

    // Usar busca avançada com apenas o parâmetro de query
    const searchParams = {
      query: q.trim(),
      limit: 10
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      query: q.trim(),
      total: result.data.pagination.total,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Busca por proximidade
const searchByLocation = async (req, res) => {
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

    const searchParams = {
      latitude,
      longitude,
      radius: radiusKm,
      sortBy: 'distance'
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      center: { lat: latitude, lng: longitude },
      radius: radiusKm,
      total: result.data.pagination.total,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Busca por categoria
const searchByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 20 } = req.query;

    const searchParams = {
      category: categoryId,
      limit: parseInt(limit)
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      categoryId: categoryId,
      total: result.data.pagination.total,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Busca por habilidade
const searchBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { limit = 20 } = req.query;

    const searchParams = {
      skill: skill,
      limit: parseInt(limit)
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      skill: skill,
      total: result.data.pagination.total,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Busca por cidade
const searchByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 20 } = req.query;

    const searchParams = {
      city: city,
      limit: parseInt(limit)
    };

    const result = await searchService.advancedSearch(searchParams);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data.opportunities,
      city: city,
      total: result.data.pagination.total,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getAvailableFilters,
  getPopularTags,
  quickSearch,
  searchByLocation,
  searchByCategory,
  searchBySkill,
  searchByCity
};


