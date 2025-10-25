const favoriteService = require('../services/favoriteService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Adicionar oportunidade aos favoritos
const addToFavorites = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;
    const { notes } = req.body;

    const result = await favoriteService.addToFavorites(volunteerId, opportunityId, notes);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.status(201).json({
      message: 'Oportunidade adicionada aos favoritos com sucesso',
      favorite: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Remover oportunidade dos favoritos
const removeFromFavorites = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;

    const result = await favoriteService.removeFromFavorites(volunteerId, opportunityId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: 'Oportunidade removida dos favoritos com sucesso',
      favorite: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter favoritos de um voluntário
const getVolunteerFavorites = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    // Validar parâmetros
    if (options.page < 1) {
      return res.status(400).json({ error: 'Página deve ser maior que 0' });
    }
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({ error: 'Limite deve estar entre 1 e 100' });
    }
    if (!['createdAt', 'title', 'volunteerType'].includes(options.sortBy)) {
      return res.status(400).json({ error: 'Campo de ordenação inválido' });
    }
    if (!['asc', 'desc'].includes(options.sortOrder)) {
      return res.status(400).json({ error: 'Ordem de classificação inválida' });
    }

    const result = await favoriteService.getVolunteerFavorites(volunteerId, options);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      favorites: result.data,
      pagination: result.pagination,
      volunteerId: volunteerId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Verificar se uma oportunidade está nos favoritos
const isFavorite = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;

    const result = await favoriteService.isFavorite(volunteerId, opportunityId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      isFavorite: result.data.isFavorite,
      favorite: result.data.favorite,
      volunteerId: volunteerId,
      opportunityId: opportunityId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Atualizar notas de um favorito
const updateFavoriteNotes = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;
    const { notes } = req.body;

    if (notes && notes.length > 500) {
      return res.status(400).json({
        error: 'Notas devem ter no máximo 500 caracteres'
      });
    }

    const result = await favoriteService.updateFavoriteNotes(volunteerId, opportunityId, notes || '');
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: 'Notas do favorito atualizadas com sucesso',
      favorite: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de favoritos
const getFavoriteStats = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const result = await favoriteService.getFavoriteStats(volunteerId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data,
      volunteerId: volunteerId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar favoritos
const searchFavorites = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { q } = req.query;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    };

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    if (options.page < 1) {
      return res.status(400).json({ error: 'Página deve ser maior que 0' });
    }
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({ error: 'Limite deve estar entre 1 e 100' });
    }

    const result = await favoriteService.searchFavorites(volunteerId, q.trim(), options);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      favorites: result.data,
      pagination: result.pagination,
      query: result.query,
      volunteerId: volunteerId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter favoritos por categoria
const getFavoritesByCategory = async (req, res) => {
  try {
    const { volunteerId, categoryName } = req.params;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    };

    if (options.page < 1) {
      return res.status(400).json({ error: 'Página deve ser maior que 0' });
    }
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({ error: 'Limite deve estar entre 1 e 100' });
    }

    const result = await favoriteService.getFavoritesByCategory(volunteerId, categoryName, options);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      favorites: result.data,
      pagination: result.pagination,
      category: result.category,
      volunteerId: volunteerId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Alternar status de favorito (adicionar/remover)
const toggleFavorite = async (req, res) => {
  try {
    const { volunteerId, opportunityId } = req.params;
    const { notes } = req.body;

    // Primeiro verificar se já é favorito
    const isFavoriteResult = await favoriteService.isFavorite(volunteerId, opportunityId);
    
    if (!isFavoriteResult.success) {
      const statusCode = isFavoriteResult.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: isFavoriteResult.error
      });
    }

    if (isFavoriteResult.data.isFavorite) {
      // Se já é favorito, remover
      const removeResult = await favoriteService.removeFromFavorites(volunteerId, opportunityId);
      
      if (!removeResult.success) {
        return res.status(400).json({ error: removeResult.error });
      }

      return res.json({
        message: 'Oportunidade removida dos favoritos',
        action: 'removed',
        favorite: removeResult.data,
        demo: removeResult.demo || false
      });
    } else {
      // Se não é favorito, adicionar
      const addResult = await favoriteService.addToFavorites(volunteerId, opportunityId, notes || '');
      
      if (!addResult.success) {
        return res.status(400).json({ error: addResult.error });
      }

      return res.status(201).json({
        message: 'Oportunidade adicionada aos favoritos',
        action: 'added',
        favorite: addResult.data,
        demo: addResult.demo || false
      });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getVolunteerFavorites,
  isFavorite,
  updateFavoriteNotes,
  getFavoriteStats,
  searchFavorites,
  getFavoritesByCategory,
  toggleFavorite
};
