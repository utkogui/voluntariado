const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');

// Dados de demonstração para categorias de oportunidades
const demoOpportunityCategories = [
  {
    id: '1',
    name: 'Educação',
    description: 'Oportunidades relacionadas ao ensino, capacitação e desenvolvimento educacional',
    icon: '🎓',
    color: '#3498db',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Saúde',
    description: 'Oportunidades na área da saúde, bem-estar e cuidados médicos',
    icon: '🏥',
    color: '#e74c3c',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Meio Ambiente',
    description: 'Oportunidades de preservação ambiental e sustentabilidade',
    icon: '🌱',
    color: '#27ae60',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Assistência Social',
    description: 'Oportunidades de apoio social e assistência a pessoas em vulnerabilidade',
    icon: '🤝',
    color: '#e67e22',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    name: 'Cultura',
    description: 'Oportunidades culturais, artísticas e de preservação do patrimônio',
    icon: '🎭',
    color: '#9b59b6',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    name: 'Esportes',
    description: 'Oportunidades esportivas e de atividades físicas',
    icon: '⚽',
    color: '#f39c12',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 6,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    name: 'Tecnologia',
    description: 'Oportunidades na área de tecnologia e inovação',
    icon: '💻',
    color: '#3498db',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 7,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    name: 'Animais',
    description: 'Oportunidades de proteção e cuidado animal',
    icon: '🐕',
    color: '#e67e22',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '9',
    name: 'Idosos',
    description: 'Oportunidades de apoio e cuidado com idosos',
    icon: '👵',
    color: '#2ecc71',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 9,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '10',
    name: 'Crianças',
    description: 'Oportunidades de apoio e cuidado com crianças',
    icon: '👶',
    color: '#f1c40f',
    parentId: null,
    level: 0,
    isActive: true,
    sortOrder: 10,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  // Subcategorias
  {
    id: '11',
    name: 'Alfabetização',
    description: 'Oportunidades de ensino de leitura e escrita',
    icon: '📚',
    color: '#3498db',
    parentId: '1',
    level: 1,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '12',
    name: 'Reforço Escolar',
    description: 'Oportunidades de apoio escolar e reforço de matérias',
    icon: '✏️',
    color: '#3498db',
    parentId: '1',
    level: 1,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '13',
    name: 'Capacitação Profissional',
    description: 'Oportunidades de capacitação e treinamento profissional',
    icon: '🎯',
    color: '#3498db',
    parentId: '1',
    level: 1,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '14',
    name: 'Atenção Primária',
    description: 'Oportunidades de cuidados básicos de saúde',
    icon: '🩺',
    color: '#e74c3c',
    parentId: '2',
    level: 1,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '15',
    name: 'Saúde Mental',
    description: 'Oportunidades de apoio psicológico e saúde mental',
    icon: '🧠',
    color: '#e74c3c',
    parentId: '2',
    level: 1,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '16',
    name: 'Reciclagem',
    description: 'Oportunidades de reciclagem e gestão de resíduos',
    icon: '♻️',
    color: '#27ae60',
    parentId: '3',
    level: 1,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: '17',
    name: 'Conservação',
    description: 'Oportunidades de conservação da natureza e biodiversidade',
    icon: '🌿',
    color: '#27ae60',
    parentId: '3',
    level: 1,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  }
];

// Dados de demonstração para oportunidades com categorização
const demoOpportunitiesWithCategories = [
  {
    id: '1',
    title: 'Aulas de reforço para crianças carentes',
    description: 'Precisamos de voluntários para dar aulas de reforço em matemática e português para crianças de 8 a 12 anos em situação de vulnerabilidade social.',
    primaryCategoryId: '12', // Reforço Escolar
    secondaryCategoryIds: ['4', '10'], // Assistência Social, Crianças
    tags: ['educação', 'crianças', 'matemática', 'português', 'vulnerabilidade'],
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '4 horas/semana',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Desenvolvimento de site para ONG',
    description: 'Projeto de desenvolvimento de website para uma ONG que trabalha com proteção animal.',
    primaryCategoryId: '7', // Tecnologia
    secondaryCategoryIds: ['8'], // Animais
    tags: ['tecnologia', 'desenvolvimento', 'web', 'ong', 'animais'],
    difficultyLevel: 'ADVANCED',
    timeCommitment: '10 horas/semana',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Campanha de arrecadação de alimentos',
    description: 'Organização de campanha para arrecadar alimentos não perecíveis para famílias em situação de vulnerabilidade social.',
    primaryCategoryId: '4', // Assistência Social
    secondaryCategoryIds: ['10'], // Crianças
    tags: ['assistência social', 'alimentação', 'arrecadação', 'vulnerabilidade'],
    difficultyLevel: 'BEGINNER',
    timeCommitment: '8 horas/semana',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Aulas de música para crianças',
    description: 'Projeto de ensino de música para crianças de 6 a 12 anos em comunidades carentes.',
    primaryCategoryId: '5', // Cultura
    secondaryCategoryIds: ['1', '10'], // Educação, Crianças
    tags: ['música', 'cultura', 'crianças', 'arte', 'comunidade'],
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '3 horas/semana',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Suporte técnico remoto para idosos',
    description: 'Projeto de inclusão digital para idosos via videochamada.',
    primaryCategoryId: '7', // Tecnologia
    secondaryCategoryIds: ['9'], // Idosos
    tags: ['tecnologia', 'inclusão digital', 'idosos', 'suporte', 'remoto'],
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '2 horas/semana',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

// Verificar se o banco está disponível
const isDatabaseAvailable = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

// Obter todas as categorias de oportunidades
const getAllCategories = async (options = {}) => {
  try {
    const { includeInactive = false, parentId = null, level = null } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      let categories = [...demoOpportunityCategories];
      
      if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
      }
      
      if (parentId !== null) {
        categories = categories.filter(cat => cat.parentId === parentId);
      }
      
      if (level !== null) {
        categories = categories.filter(cat => cat.level === level);
      }
      
      // Ordenar por sortOrder
      categories.sort((a, b) => a.sortOrder - b.sortOrder);
      
      return {
        success: true,
        data: categories,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter categoria por ID
const getCategoryById = async (categoryId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const category = demoOpportunityCategories.find(cat => cat.id === categoryId);
      
      if (!category) {
        return { success: false, error: 'Categoria não encontrada' };
      }
      
      return {
        success: true,
        data: category,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: {}, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Buscar categorias
const searchCategories = async (query, options = {}) => {
  try {
    const { includeInactive = false, parentId = null, level = null } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const searchQuery = query.toLowerCase();
      
      let categories = demoOpportunityCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery) ||
        cat.description.toLowerCase().includes(searchQuery)
      );
      
      if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
      }
      
      if (parentId !== null) {
        categories = categories.filter(cat => cat.parentId === parentId);
      }
      
      if (level !== null) {
        categories = categories.filter(cat => cat.level === level);
      }
      
      // Ordenar por relevância (nome primeiro, depois descrição)
      categories.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(searchQuery);
        const bNameMatch = b.name.toLowerCase().includes(searchQuery);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return a.sortOrder - b.sortOrder;
      });
      
      return {
        success: true,
        data: categories,
        query: query,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter categorias hierárquicas (árvore)
const getCategoryTree = async (options = {}) => {
  try {
    const { includeInactive = false } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      let categories = [...demoOpportunityCategories];
      
      if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
      }
      
      // Construir árvore hierárquica
      const categoryMap = new Map();
      const rootCategories = [];
      
      // Primeiro, mapear todas as categorias
      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });
      
      // Depois, construir a hierarquia
      categories.forEach(cat => {
        if (cat.parentId === null) {
          rootCategories.push(categoryMap.get(cat.id));
        } else {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            parent.children.push(categoryMap.get(cat.id));
          }
        }
      });
      
      // Ordenar cada nível
      const sortCategories = (cats) => {
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
        cats.forEach(cat => {
          if (cat.children.length > 0) {
            sortCategories(cat.children);
          }
        });
      };
      
      sortCategories(rootCategories);
      
      return {
        success: true,
        data: rootCategories,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter estatísticas de categorias
const getCategoryStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const stats = {
        totalCategories: demoOpportunityCategories.length,
        activeCategories: demoOpportunityCategories.filter(cat => cat.isActive).length,
        inactiveCategories: demoOpportunityCategories.filter(cat => !cat.isActive).length,
        categoriesByLevel: {},
        mostUsedCategories: [],
        recentCategories: demoOpportunityCategories
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      };
      
      // Estatísticas por nível
      demoOpportunityCategories.forEach(cat => {
        stats.categoriesByLevel[cat.level] = (stats.categoriesByLevel[cat.level] || 0) + 1;
      });
      
      // Categorias mais usadas (baseado nas oportunidades)
      const categoryUsage = {};
      demoOpportunitiesWithCategories.forEach(opp => {
        if (categoryUsage[opp.primaryCategoryId]) {
          categoryUsage[opp.primaryCategoryId]++;
        } else {
          categoryUsage[opp.primaryCategoryId] = 1;
        }
        
        opp.secondaryCategoryIds.forEach(catId => {
          if (categoryUsage[catId]) {
            categoryUsage[catId]++;
          } else {
            categoryUsage[catId] = 1;
          }
        });
      });
      
      stats.mostUsedCategories = Object.entries(categoryUsage)
        .map(([categoryId, count]) => {
          const category = demoOpportunityCategories.find(cat => cat.id === categoryId);
          return {
            category: category || { id: categoryId, name: 'Desconhecida' },
            count: count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        success: true,
        data: stats,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: {}, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Categorizar oportunidade automaticamente
const categorizeOpportunity = async (opportunityData) => {
  try {
    const { title, description, requiredSkills, volunteerType } = opportunityData;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - algoritmo simples de categorização
      const text = `${title} ${description} ${requiredSkills.join(' ')}`.toLowerCase();
      
      const categoryScores = {};
      
      // Palavras-chave para cada categoria
      const keywords = {
        '1': ['educação', 'ensino', 'escola', 'aula', 'professor', 'estudante', 'aprender', 'conhecimento'],
        '2': ['saúde', 'médico', 'hospital', 'cuidado', 'tratamento', 'doença', 'bem-estar'],
        '3': ['meio ambiente', 'natureza', 'sustentabilidade', 'ecologia', 'verde', 'reciclagem'],
        '4': ['assistência social', 'vulnerabilidade', 'pobreza', 'ajuda', 'apoio', 'comunidade'],
        '5': ['cultura', 'arte', 'música', 'teatro', 'dança', 'patrimônio', 'história'],
        '6': ['esporte', 'futebol', 'atividade física', 'exercício', 'competição'],
        '7': ['tecnologia', 'computador', 'programação', 'software', 'digital', 'internet'],
        '8': ['animal', 'pet', 'cachorro', 'gato', 'proteção animal', 'veterinário'],
        '9': ['idoso', 'terceira idade', 'idosos', 'envelhecimento'],
        '10': ['criança', 'crianças', 'infantil', 'jovem', 'adolescente']
      };
      
      // Calcular pontuação para cada categoria
      Object.entries(keywords).forEach(([categoryId, words]) => {
        let score = 0;
        words.forEach(word => {
          if (text.includes(word)) {
            score += 1;
          }
        });
        if (score > 0) {
          categoryScores[categoryId] = score;
        }
      });
      
      // Encontrar categoria principal (maior pontuação)
      const sortedScores = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a);
      
      const primaryCategoryId = sortedScores.length > 0 ? sortedScores[0][0] : '4'; // Default: Assistência Social
      const secondaryCategoryIds = sortedScores.slice(1, 3).map(([id]) => id);
      
      // Gerar tags baseadas no conteúdo
      const tags = [];
      const commonWords = text.split(' ').filter(word => 
        word.length > 3 && 
        !['para', 'com', 'dos', 'das', 'uma', 'uma', 'são', 'que', 'não'].includes(word)
      );
      
      // Adicionar palavras mais comuns como tags
      const wordCount = {};
      commonWords.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      tags.push(...topWords);
      
      return {
        success: true,
        data: {
          primaryCategoryId,
          secondaryCategoryIds,
          tags: [...new Set(tags)], // Remover duplicatas
          confidence: sortedScores.length > 0 ? sortedScores[0][1] / 10 : 0.1
        },
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: {}, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter oportunidades por categoria
const getOpportunitiesByCategory = async (categoryId, options = {}) => {
  try {
    const { page = 1, limit = 20, includeSubcategories = true } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      let opportunities = demoOpportunitiesWithCategories.filter(opp => 
        opp.primaryCategoryId === categoryId ||
        opp.secondaryCategoryIds.includes(categoryId)
      );
      
      if (includeSubcategories) {
        // Incluir subcategorias
        const category = demoOpportunityCategories.find(cat => cat.id === categoryId);
        if (category) {
          const subcategories = demoOpportunityCategories.filter(cat => cat.parentId === categoryId);
          subcategories.forEach(subcat => {
            const subcatOpportunities = demoOpportunitiesWithCategories.filter(opp => 
              opp.primaryCategoryId === subcat.id ||
              opp.secondaryCategoryIds.includes(subcat.id)
            );
            opportunities = [...opportunities, ...subcatOpportunities];
          });
        }
      }
      
      // Remover duplicatas
      const uniqueOpportunities = opportunities.filter((opp, index, self) => 
        index === self.findIndex(o => o.id === opp.id)
      );
      
      // Paginação
      const offset = (page - 1) * limit;
      const paginatedOpportunities = uniqueOpportunities.slice(offset, offset + limit);
      
      return {
        success: true,
        data: paginatedOpportunities,
        pagination: {
          page,
          limit,
          total: uniqueOpportunities.length,
          totalPages: Math.ceil(uniqueOpportunities.length / limit),
          hasNext: page < Math.ceil(uniqueOpportunities.length / limit),
          hasPrev: page > 1
        },
        categoryId: categoryId,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  searchCategories,
  getCategoryTree,
  getCategoryStats,
  categorizeOpportunity,
  getOpportunitiesByCategory
};
