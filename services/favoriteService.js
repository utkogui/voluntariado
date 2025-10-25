const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');

// Dados de demonstração para favoritos
const demoFavorites = [
  {
    id: 'fav-1',
    volunteerId: '1',
    opportunityId: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Interessante para desenvolver habilidades de ensino'
  },
  {
    id: 'fav-2',
    volunteerId: '1',
    opportunityId: '3',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Boa oportunidade para ajudar a comunidade'
  },
  {
    id: 'fav-3',
    volunteerId: '2',
    opportunityId: '2',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Perfeito para meu portfólio'
  },
  {
    id: 'fav-4',
    volunteerId: '2',
    opportunityId: '5',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Projeto interessante de inclusão digital'
  }
];

// Dados de demonstração para oportunidades (reutilizando)
const demoOpportunities = [
  {
    id: '1',
    title: 'Aulas de reforço para crianças carentes',
    description: 'Precisamos de voluntários para dar aulas de reforço em matemática e português para crianças de 8 a 12 anos em situação de vulnerabilidade social.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 5,
    currentVolunteers: 2,
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    requiredSkills: ['Ensino', 'Matemática', 'Português'],
    categories: [
      { id: '1', name: 'Educação', icon: '🎓', color: '#3498db' },
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Desenvolvimento de site para ONG',
    description: 'Projeto de desenvolvimento de website para uma ONG que trabalha com proteção animal.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 3,
    currentVolunteers: 1,
    isRemote: true,
    requiredSkills: ['JavaScript', 'HTML/CSS', 'React', 'Git'],
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '9', name: 'Proteção Animal', icon: '🐕', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Campanha de arrecadação de alimentos',
    description: 'Organização de campanha para arrecadar alimentos não perecíveis para famílias em situação de vulnerabilidade social.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 10,
    currentVolunteers: 4,
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    requiredSkills: ['Organização de Eventos', 'Comunicação', 'Liderança'],
    categories: [
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' },
      { id: '11', name: 'Alimentação', icon: '🍎', color: '#f39c12' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Aulas de música para crianças',
    description: 'Projeto de ensino de música para crianças de 6 a 12 anos em comunidades carentes.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 4,
    currentVolunteers: 2,
    city: 'Rio de Janeiro',
    state: 'RJ',
    latitude: -22.9068,
    longitude: -43.1729,
    isRemote: false,
    requiredSkills: ['Música', 'Violão', 'Flauta', 'Ensino'],
    categories: [
      { id: '5', name: 'Cultura', icon: '🎭', color: '#9b59b6' },
      { id: '20', name: 'Música', icon: '🎶', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Suporte técnico remoto para idosos',
    description: 'Projeto de inclusão digital para idosos via videochamada.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 8,
    currentVolunteers: 3,
    isRemote: true,
    requiredSkills: ['Tecnologia', 'Paciência', 'Comunicação', 'Suporte Técnico'],
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '14', name: 'Idosos', icon: '👵', color: '#2ecc71' }
    ],
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

// Adicionar oportunidade aos favoritos
const addToFavorites = async (volunteerId, opportunityId, notes = '') => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const existingFavorite = demoFavorites.find(fav => 
        fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
      );
      
      if (existingFavorite) {
        return { success: false, error: 'Oportunidade já está nos favoritos' };
      }

      const opportunity = demoOpportunities.find(opp => opp.id === opportunityId);
      if (!opportunity) {
        return { success: false, error: 'Oportunidade não encontrada' };
      }

      const newFavorite = {
        id: `fav-${Date.now()}`,
        volunteerId,
        opportunityId,
        createdAt: new Date(),
        notes: notes.trim()
      };

      demoFavorites.push(newFavorite);

      return {
        success: true,
        data: {
          ...newFavorite,
          opportunity: opportunity
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

// Remover oportunidade dos favoritos
const removeFromFavorites = async (volunteerId, opportunityId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const favoriteIndex = demoFavorites.findIndex(fav => 
        fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
      );
      
      if (favoriteIndex === -1) {
        return { success: false, error: 'Favorito não encontrado' };
      }

      const removedFavorite = demoFavorites.splice(favoriteIndex, 1)[0];

      return {
        success: true,
        data: removedFavorite,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: {}, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter favoritos de um voluntário
const getVolunteerFavorites = async (volunteerId, options = {}) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteerFavorites = demoFavorites
        .filter(fav => fav.volunteerId === volunteerId)
        .map(fav => {
          const opportunity = demoOpportunities.find(opp => opp.id === fav.opportunityId);
          return {
            ...fav,
            opportunity: opportunity || null
          };
        })
        .filter(fav => fav.opportunity !== null);

      // Ordenação
      volunteerFavorites.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'desc') {
          return new Date(bValue) - new Date(aValue);
        } else {
          return new Date(aValue) - new Date(bValue);
        }
      });

      // Paginação
      const offset = (page - 1) * limit;
      const paginatedFavorites = volunteerFavorites.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedFavorites,
        pagination: {
          page,
          limit,
          total: volunteerFavorites.length,
          totalPages: Math.ceil(volunteerFavorites.length / limit),
          hasNext: page < Math.ceil(volunteerFavorites.length / limit),
          hasPrev: page > 1
        },
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verificar se uma oportunidade está nos favoritos
const isFavorite = async (volunteerId, opportunityId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const favorite = demoFavorites.find(fav => 
        fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
      );
      
      return {
        success: true,
        data: {
          isFavorite: !!favorite,
          favorite: favorite || null
        },
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: { isFavorite: false }, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Atualizar notas de um favorito
const updateFavoriteNotes = async (volunteerId, opportunityId, notes) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const favorite = demoFavorites.find(fav => 
        fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
      );
      
      if (!favorite) {
        return { success: false, error: 'Favorito não encontrado' };
      }

      favorite.notes = notes.trim();
      favorite.updatedAt = new Date();

      return {
        success: true,
        data: favorite,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: {}, demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter estatísticas de favoritos
const getFavoriteStats = async (volunteerId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteerFavorites = demoFavorites.filter(fav => fav.volunteerId === volunteerId);
      
      const stats = {
        totalFavorites: volunteerFavorites.length,
        favoritesByCategory: {},
        favoritesByType: {},
        recentFavorites: volunteerFavorites
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(fav => {
            const opportunity = demoOpportunities.find(opp => opp.id === fav.opportunityId);
            return {
              ...fav,
              opportunity: opportunity ? {
                id: opportunity.id,
                title: opportunity.title,
                categories: opportunity.categories
              } : null
            };
          }),
        averageNotesLength: volunteerFavorites.length > 0 
          ? Math.round(volunteerFavorites.reduce((sum, fav) => sum + (fav.notes?.length || 0), 0) / volunteerFavorites.length)
          : 0
      };

      // Estatísticas por categoria
      volunteerFavorites.forEach(fav => {
        const opportunity = demoOpportunities.find(opp => opp.id === fav.opportunityId);
        if (opportunity) {
          opportunity.categories.forEach(cat => {
            stats.favoritesByCategory[cat.name] = (stats.favoritesByCategory[cat.name] || 0) + 1;
          });
          
          stats.favoritesByType[opportunity.volunteerType] = (stats.favoritesByType[opportunity.volunteerType] || 0) + 1;
        }
      });

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

// Buscar favoritos
const searchFavorites = async (volunteerId, query, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const searchQuery = query.toLowerCase();
      
      const volunteerFavorites = demoFavorites
        .filter(fav => fav.volunteerId === volunteerId)
        .map(fav => {
          const opportunity = demoOpportunities.find(opp => opp.id === fav.opportunityId);
          return {
            ...fav,
            opportunity: opportunity || null
          };
        })
        .filter(fav => fav.opportunity !== null)
        .filter(fav => {
          const opp = fav.opportunity;
          return (
            opp.title.toLowerCase().includes(searchQuery) ||
            opp.description.toLowerCase().includes(searchQuery) ||
            opp.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery)) ||
            opp.categories.some(cat => cat.name.toLowerCase().includes(searchQuery)) ||
            (fav.notes && fav.notes.toLowerCase().includes(searchQuery))
          );
        });

      // Paginação
      const offset = (page - 1) * limit;
      const paginatedFavorites = volunteerFavorites.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedFavorites,
        pagination: {
          page,
          limit,
          total: volunteerFavorites.length,
          totalPages: Math.ceil(volunteerFavorites.length / limit),
          hasNext: page < Math.ceil(volunteerFavorites.length / limit),
          hasPrev: page > 1
        },
        query,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter favoritos por categoria
const getFavoritesByCategory = async (volunteerId, categoryName, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteerFavorites = demoFavorites
        .filter(fav => fav.volunteerId === volunteerId)
        .map(fav => {
          const opportunity = demoOpportunities.find(opp => opp.id === fav.opportunityId);
          return {
            ...fav,
            opportunity: opportunity || null
          };
        })
        .filter(fav => fav.opportunity !== null)
        .filter(fav => 
          fav.opportunity.categories.some(cat => 
            cat.name.toLowerCase().includes(categoryName.toLowerCase())
          )
        );

      // Paginação
      const offset = (page - 1) * limit;
      const paginatedFavorites = volunteerFavorites.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedFavorites,
        pagination: {
          page,
          limit,
          total: volunteerFavorites.length,
          totalPages: Math.ceil(volunteerFavorites.length / limit),
          hasNext: page < Math.ceil(volunteerFavorites.length / limit),
          hasPrev: page > 1
        },
        category: categoryName,
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
  addToFavorites,
  removeFromFavorites,
  getVolunteerFavorites,
  isFavorite,
  updateFavoriteNotes,
  getFavoriteStats,
  searchFavorites,
  getFavoritesByCategory
};
