const skillService = require('../services/skillService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter todas as habilidades
const getAllSkills = async (req, res) => {
  try {
    const result = await skillService.getAllSkills();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      skills: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter habilidades por categoria
const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await skillService.getSkillsByCategory(category);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      skills: result.data,
      category: category,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar habilidades
const searchSkills = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await skillService.searchSkills(q.trim());
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      skills: result.data,
      query: q.trim(),
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter categorias de habilidades
const getSkillCategories = async (req, res) => {
  try {
    const result = await skillService.getSkillCategories();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter níveis de habilidade
const getSkillLevels = async (req, res) => {
  try {
    const result = await skillService.getSkillLevels();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      levels: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter habilidades populares
const getPopularSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await skillService.getPopularSkills(parseInt(limit));
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      skills: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas das habilidades
const getSkillStats = async (req, res) => {
  try {
    const result = await skillService.getSkillStats();
    
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

module.exports = {
  getAllSkills,
  getSkillsByCategory,
  searchSkills,
  getSkillCategories,
  getSkillLevels,
  getPopularSkills,
  getSkillStats
};


