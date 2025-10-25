const opportunityCategorizationService = require('../services/opportunityCategorizationService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter todas as categorias de oportunidades
const getAllCategories = async (req, res) => {
  try {
    const options = {
      includeInactive: req.query.includeInactive === 'true',
      parentId: req.query.parentId || null,
      level: req.query.level ? parseInt(req.query.level) : null
    };

    const result = await opportunityCategorizationService.getAllCategories(options);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data,
      total: result.data.length,
      options: options,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter categoria por ID
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const result = await opportunityCategorizationService.getCategoryById(categoryId);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      category: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar categorias
const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    const options = {
      includeInactive: req.query.includeInactive === 'true',
      parentId: req.query.parentId || null,
      level: req.query.level ? parseInt(req.query.level) : null
    };

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await opportunityCategorizationService.searchCategories(q.trim(), options);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categories: result.data,
      query: result.query,
      total: result.data.length,
      options: options,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter árvore de categorias
const getCategoryTree = async (req, res) => {
  try {
    const options = {
      includeInactive: req.query.includeInactive === 'true'
    };

    const result = await opportunityCategorizationService.getCategoryTree(options);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categoryTree: result.data,
      options: options,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas de categorias
const getCategoryStats = async (req, res) => {
  try {
    const result = await opportunityCategorizationService.getCategoryStats();
    
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

// Categorizar oportunidade automaticamente
const categorizeOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, volunteerType } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: 'Título e descrição são obrigatórios'
      });
    }

    const opportunityData = {
      title,
      description,
      requiredSkills: requiredSkills || [],
      volunteerType: volunteerType || 'PRESENTIAL'
    };

    const result = await opportunityCategorizationService.categorizeOpportunity(opportunityData);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      categorization: result.data,
      opportunityData: opportunityData,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter oportunidades por categoria
const getOpportunitiesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      includeSubcategories: req.query.includeSubcategories !== 'false'
    };

    if (options.page < 1) {
      return res.status(400).json({ error: 'Página deve ser maior que 0' });
    }
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({ error: 'Limite deve estar entre 1 e 100' });
    }

    const result = await opportunityCategorizationService.getOpportunitiesByCategory(categoryId, options);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data,
      pagination: result.pagination,
      categoryId: result.categoryId,
      options: options,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Criar nova categoria
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, parentId, sortOrder } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        error: 'Nome e descrição são obrigatórios'
      });
    }

    // Em modo demonstração, simular criação
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Criando nova categoria: ${name}`);
      
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        description,
        icon: icon || '📁',
        color: color || '#3498db',
        parentId: parentId || null,
        level: parentId ? 1 : 0,
        isActive: true,
        sortOrder: sortOrder || 999,
        createdAt: new Date()
      };

      return res.status(201).json({
        message: 'Categoria criada com sucesso (modo demonstração)',
        category: newCategory,
        demo: true
      });
    }

    // Implementação com banco de dados (futura)
    res.status(201).json({
      message: 'Funcionalidade em desenvolvimento',
      demo: true
    });
  } catch (error) {
    throw error;
  }
};

// Atualizar categoria
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, color, sortOrder, isActive } = req.body;

    // Em modo demonstração, simular atualização
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Atualizando categoria ${categoryId}:`, { name, description, icon, color, sortOrder, isActive });
      
      return res.json({
        message: 'Categoria atualizada com sucesso (modo demonstração)',
        categoryId: categoryId,
        updates: { name, description, icon, color, sortOrder, isActive },
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

// Deletar categoria
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Em modo demonstração, simular exclusão
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Deletando categoria ${categoryId}`);
      
      return res.json({
        message: 'Categoria deletada com sucesso (modo demonstração)',
        categoryId: categoryId,
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

// Reordenar categorias
const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        error: 'categoryOrders deve ser um array'
      });
    }

    // Em modo demonstração, simular reordenação
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log(`[DEMO] Reordenando categorias:`, categoryOrders);
      
      return res.json({
        message: 'Categorias reordenadas com sucesso (modo demonstração)',
        categoryOrders: categoryOrders,
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
  getAllCategories,
  getCategoryById,
  searchCategories,
  getCategoryTree,
  getCategoryStats,
  categorizeOpportunity,
  getOpportunitiesByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
