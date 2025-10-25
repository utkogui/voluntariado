const matchingService = require('../services/matchingService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Encontrar oportunidades para um voluntário
const findMatchesForVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const filters = {
      minScore: req.query.minScore ? parseFloat(req.query.minScore) : undefined,
      volunteerType: req.query.volunteerType,
      city: req.query.city,
      category: req.query.category,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    };

    const result = await matchingService.findMatches(volunteerId, filters);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    // Aplicar limite se especificado
    if (filters.limit && result.data.length > filters.limit) {
      result.data = result.data.slice(0, filters.limit);
    }

    res.json({
      matches: result.data,
      volunteer: result.volunteer,
      filters: filters,
      totalMatches: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Encontrar voluntários para uma oportunidade
const findVolunteersForOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const filters = {
      minScore: req.query.minScore ? parseFloat(req.query.minScore) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    };

    const result = await matchingService.findVolunteersForOpportunity(opportunityId, filters);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    // Aplicar limite se especificado
    if (filters.limit && result.data.length > filters.limit) {
      result.data = result.data.slice(0, filters.limit);
    }

    res.json({
      matches: result.data,
      opportunity: result.opportunity,
      filters: filters,
      totalMatches: result.data.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de matching
const getMatchingStats = async (req, res) => {
  try {
    const result = await matchingService.getMatchingStats();
    
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

// Calcular compatibilidade entre voluntário e oportunidade
const calculateCompatibility = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;
    
    // Em modo demonstração, simular cálculo
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      const compatibility = {
        volunteerId,
        opportunityId,
        scores: {
          total: Math.random() * 100,
          skills: Math.random() * 100,
          location: Math.random() * 100,
          availability: Math.random() * 100,
          interests: Math.random() * 100
        },
        reasons: [
          'Habilidades compatíveis',
          'Localização próxima',
          'Horários adequados',
          'Interesses alinhados'
        ],
        recommendation: 'Alta compatibilidade',
        demo: true
      };
      
      return res.json(compatibility);
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Obter sugestões personalizadas para voluntário
const getPersonalizedSuggestions = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const filters = {
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      minScore: req.query.minScore ? parseFloat(req.query.minScore) : 70
    };

    const result = await matchingService.findMatches(volunteerId, filters);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    // Filtrar apenas sugestões de alta qualidade
    const suggestions = result.data.filter(match => match.scores.total >= filters.minScore);

    res.json({
      suggestions: suggestions,
      volunteer: result.volunteer,
      filters: filters,
      totalSuggestions: suggestions.length,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter oportunidades similares
const getSimilarOpportunities = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const filters = {
      limit: req.query.limit ? parseInt(req.query.limit) : 5
    };

    // Em modo demonstração, simular oportunidades similares
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      const similarOpportunities = [
        {
          id: 'similar-1',
          title: 'Oportunidade Similar 1',
          description: 'Descrição da oportunidade similar',
          similarityScore: 85.5,
          commonSkills: ['Ensino', 'Matemática'],
          commonCategories: ['Educação']
        },
        {
          id: 'similar-2',
          title: 'Oportunidade Similar 2',
          description: 'Outra oportunidade similar',
          similarityScore: 78.2,
          commonSkills: ['Comunicação'],
          commonCategories: ['Assistência Social']
        }
      ];

      return res.json({
        similarOpportunities: similarOpportunities.slice(0, filters.limit),
        originalOpportunityId: opportunityId,
        totalSimilar: similarOpportunities.length,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Obter voluntários similares
const getSimilarVolunteers = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const filters = {
      limit: req.query.limit ? parseInt(req.query.limit) : 5
    };

    // Em modo demonstração, simular voluntários similares
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      const similarVolunteers = [
        {
          id: 'similar-vol-1',
          firstName: 'Voluntário',
          lastName: 'Similar 1',
          similarityScore: 82.3,
          commonSkills: ['Ensino', 'Matemática'],
          commonInterests: ['Educação']
        },
        {
          id: 'similar-vol-2',
          firstName: 'Voluntário',
          lastName: 'Similar 2',
          similarityScore: 75.8,
          commonSkills: ['Comunicação'],
          commonInterests: ['Assistência Social']
        }
      ];

      return res.json({
        similarVolunteers: similarVolunteers.slice(0, filters.limit),
        originalVolunteerId: volunteerId,
        totalSimilar: similarVolunteers.length,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findMatchesForVolunteer,
  findVolunteersForOpportunity,
  getMatchingStats,
  calculateCompatibility,
  getPersonalizedSuggestions,
  getSimilarOpportunities,
  getSimilarVolunteers
};


