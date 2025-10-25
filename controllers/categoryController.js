const categoryService = require('../services/categoryService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter todas as categorias
const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter categoria por ID
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryById(categoryId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      category: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Criar nova categoria
const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const result = await categoryService.createCategory(categoryData);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      category: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Atualizar categoria
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = req.body;
    const result = await categoryService.updateCategory(categoryId, updateData);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message,
      category: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Deletar categoria
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.deleteCategory(categoryId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message
    });
  } catch (error) {
    throw error;
  }
};

// Obter categorias populares
const getPopularCategories = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await categoryService.getPopularCategories(parseInt(limit));
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Buscar categorias
const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await categoryService.searchCategories(q.trim());
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas das categorias
const getCategoryStats = async (req, res) => {
  try {
    const result = await categoryService.getCategoryStats();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getPopularCategories,
  searchCategories,
  getCategoryStats
};
