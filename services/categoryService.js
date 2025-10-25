const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// Categorias de demonstração (quando não há banco de dados)
const demoCategories = [
  { id: '1', name: 'Educação', description: 'Oportunidades relacionadas ao ensino, alfabetização e desenvolvimento educacional', icon: '🎓', color: '#3498db', isActive: true },
  { id: '2', name: 'Saúde', description: 'Oportunidades na área da saúde e bem-estar', icon: '🏥', color: '#e74c3c', isActive: true },
  { id: '3', name: 'Meio Ambiente', description: 'Projetos de preservação e sustentabilidade ambiental', icon: '🌱', color: '#27ae60', isActive: true },
  { id: '4', name: 'Assistência Social', description: 'Apoio a pessoas em situação de vulnerabilidade social', icon: '🤝', color: '#e67e22', isActive: true },
  { id: '5', name: 'Cultura', description: 'Projetos culturais e artísticos', icon: '🎭', color: '#9b59b6', isActive: true },
  { id: '6', name: 'Esporte', description: 'Projetos esportivos e atividades físicas', icon: '⚽', color: '#27ae60', isActive: true },
  { id: '7', name: 'Tecnologia', description: 'Projetos de inclusão digital e tecnologia', icon: '💻', color: '#3498db', isActive: true },
  { id: '8', name: 'Direitos Humanos', description: 'Defesa e promoção dos direitos humanos', icon: '⚖️', color: '#e74c3c', isActive: true },
  { id: '9', name: 'Proteção Animal', description: 'Cuidado e proteção de animais', icon: '🐕', color: '#e67e22', isActive: true },
  { id: '10', name: 'Emergência', description: 'Apoio em situações de emergência e desastres', icon: '🚨', color: '#e74c3c', isActive: true }
];

// Verificar se o banco está disponível
const isDatabaseAvailable = async () => {
  try {
    // Verificar se a variável DATABASE_URL está definida
    if (!process.env.DATABASE_URL) {
      return false;
    }
    
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Se houver qualquer erro (banco não existe, não conecta, etc.), usar modo demo
    return false;
  }
};

// Obter todas as categorias
const getAllCategories = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - retornar categorias fixas
      return {
        success: true,
        data: demoCategories,
        demo: true
      };
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    // Em caso de erro, retornar categorias de demonstração
    return {
      success: true,
      data: demoCategories,
      demo: true
    };
  }
};

// Obter categoria por ID
const getCategoryById = async (categoryId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const category = demoCategories.find(cat => cat.id === categoryId);
      if (!category) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND
        };
      }
      return {
        success: true,
        data: category,
        demo: true
      };
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        institutions: true,
        opportunities: true
      }
    });

    if (!category) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    return {
      success: true,
      data: category
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Criar nova categoria
const createCategory = async (categoryData) => {
  try {
    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name }
    });

    if (existingCategory) {
      return {
        success: false,
        error: 'Categoria com este nome já existe'
      };
    }

    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        isActive: true
      }
    });

    return {
      success: true,
      data: category,
      message: SUCCESS_MESSAGES.USER_CREATED
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar categoria
const updateCategory = async (categoryId, updateData) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar se já existe outra categoria com o mesmo nome
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: updateData.name }
      });

      if (existingCategory) {
        return {
          success: false,
          error: 'Categoria com este nome já existe'
        };
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    return {
      success: true,
      data: updatedCategory,
      message: SUCCESS_MESSAGES.USER_UPDATED
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Deletar categoria (soft delete)
const deleteCategory = async (categoryId) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar se a categoria está sendo usada
    const institutionsCount = await prisma.institution.count({
      where: {
        categories: {
          some: { id: categoryId }
        }
      }
    });

    const opportunitiesCount = await prisma.opportunity.count({
      where: {
        categories: {
          some: { id: categoryId }
        }
      }
    });

    if (institutionsCount > 0 || opportunitiesCount > 0) {
      return {
        success: false,
        error: 'Não é possível deletar categoria que está sendo usada'
      };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false }
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_DELETED
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter categorias mais populares
const getPopularCategories = async (limit = 10) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            institutions: true,
            opportunities: true
          }
        }
      },
      orderBy: {
        institutions: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Buscar categorias por nome
const searchCategories = async (query) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const filteredCategories = demoCategories.filter(category => 
        category.name.toLowerCase().includes(query.toLowerCase()) ||
        category.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        data: filteredCategories,
        demo: true
      };
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter estatísticas das categorias
const getCategoryStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - estatísticas simuladas
      const stats = demoCategories.map(category => ({
        name: category.name,
        _count: {
          institutions: Math.floor(Math.random() * 20) + 1,
          opportunities: Math.floor(Math.random() * 50) + 1
        }
      })).sort((a, b) => b._count.institutions - a._count.institutions);
      
      return {
        success: true,
        data: stats,
        demo: true
      };
    }

    const stats = await prisma.category.groupBy({
      by: ['name'],
      where: { isActive: true },
      _count: {
        institutions: true,
        opportunities: true
      },
      orderBy: {
        institutions: {
          _count: 'desc'
        }
      }
    });

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
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
