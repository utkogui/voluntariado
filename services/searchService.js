const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');

// Dados de demonstração para oportunidades (reutilizando do opportunityService)
const demoOpportunities = [
  {
    id: '1',
    title: 'Aulas de reforço para crianças carentes',
    description: 'Precisamos de voluntários para dar aulas de reforço em matemática e português para crianças de 8 a 12 anos em situação de vulnerabilidade social.',
    requirements: 'Conhecimento em matemática e português do ensino fundamental, paciência e carinho com crianças, disponibilidade aos sábados das 9h às 12h.',
    benefits: 'Experiência em ensino, certificado de voluntariado, oportunidade de fazer a diferença na vida das crianças, networking com outros voluntários.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 5,
    currentVolunteers: 2,
    address: 'Rua da Educação, 456',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04567-890',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Ensino', 'Matemática', 'Português'],
    skillLevels: {
      'Ensino': 'INTERMEDIATE',
      'Matemática': 'ADVANCED',
      'Português': 'ADVANCED'
    },
    needsDonations: true,
    donationItems: ['Livros didáticos', 'Material escolar', 'Lápis e canetas', 'Cadernos'],
    createdById: 'demo-institution-1',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '1', name: 'Educação', icon: '🎓', color: '#3498db' },
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Desenvolvimento de site para ONG',
    description: 'Projeto de desenvolvimento de website para uma ONG que trabalha com proteção animal. Precisamos de voluntários com conhecimento em desenvolvimento web.',
    requirements: 'Conhecimento em HTML, CSS, JavaScript, preferencialmente React ou Vue.js, disponibilidade de 10h por semana.',
    benefits: 'Portfólio profissional, experiência com projetos reais, certificado de voluntariado, networking na área de tecnologia.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 3,
    currentVolunteers: 1,
    isRemote: true,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    requiredSkills: ['JavaScript', 'HTML/CSS', 'React', 'Git'],
    skillLevels: {
      'JavaScript': 'ADVANCED',
      'HTML/CSS': 'ADVANCED',
      'React': 'INTERMEDIATE',
      'Git': 'INTERMEDIATE'
    },
    needsDonations: false,
    createdById: 'demo-institution-2',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '9', name: 'Proteção Animal', icon: '🐕', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Campanha de arrecadação de alimentos',
    description: 'Organização de campanha para arrecadar alimentos não perecíveis para famílias em situação de vulnerabilidade social.',
    requirements: 'Disponibilidade aos finais de semana, boa comunicação, experiência em organização de eventos (desejável).',
    benefits: 'Experiência em organização de eventos, networking, certificado de voluntariado, impacto social direto.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 10,
    currentVolunteers: 4,
    address: 'Praça da Liberdade, Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Organização de Eventos', 'Comunicação', 'Liderança'],
    skillLevels: {
      'Organização de Eventos': 'INTERMEDIATE',
      'Comunicação': 'ADVANCED',
      'Liderança': 'INTERMEDIATE'
    },
    needsDonations: true,
    donationItems: ['Arroz', 'Feijão', 'Macarrão', 'Óleo de cozinha', 'Leite em pó'],
    createdById: 'demo-institution-3',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' },
      { id: '11', name: 'Alimentação', icon: '🍎', color: '#f39c12' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Aulas de música para crianças',
    description: 'Projeto de ensino de música para crianças de 6 a 12 anos em comunidades carentes. Ensinamos violão, flauta e canto.',
    requirements: 'Conhecimento musical, preferencialmente violão ou flauta, paciência com crianças, disponibilidade aos domingos das 14h às 17h.',
    benefits: 'Experiência em ensino musical, certificado de voluntariado, oportunidade de compartilhar talentos, networking musical.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 4,
    currentVolunteers: 2,
    address: 'Centro Cultural da Comunidade',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20000-000',
    latitude: -22.9068,
    longitude: -43.1729,
    isRemote: false,
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Música', 'Violão', 'Flauta', 'Ensino'],
    skillLevels: {
      'Música': 'ADVANCED',
      'Violão': 'ADVANCED',
      'Flauta': 'INTERMEDIATE',
      'Ensino': 'INTERMEDIATE'
    },
    needsDonations: true,
    donationItems: ['Violões', 'Flautas', 'Partituras', 'Livros de música'],
    createdById: 'demo-institution-4',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '5', name: 'Cultura', icon: '🎭', color: '#9b59b6' },
      { id: '20', name: 'Música', icon: '🎶', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Suporte técnico remoto para idosos',
    description: 'Projeto de inclusão digital para idosos. Voluntários ajudam via videochamada com uso de smartphones, computadores e internet.',
    requirements: 'Paciência, conhecimento básico em tecnologia, boa comunicação, disponibilidade de 2h por semana.',
    benefits: 'Experiência em suporte técnico, certificado de voluntariado, impacto social na inclusão digital.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 8,
    currentVolunteers: 3,
    isRemote: true,
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Tecnologia', 'Paciência', 'Comunicação', 'Suporte Técnico'],
    skillLevels: {
      'Tecnologia': 'ADVANCED',
      'Paciência': 'EXPERT',
      'Comunicação': 'ADVANCED',
      'Suporte Técnico': 'INTERMEDIATE'
    },
    needsDonations: false,
    createdById: 'demo-institution-5',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '14', name: 'Idosos', icon: '👵', color: '#2ecc71' }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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

// Função para calcular distância entre duas coordenadas (Haversine)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Busca avançada com múltiplos filtros
const advancedSearch = async (searchParams) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - aplicar filtros
      let filteredOpportunities = [...demoOpportunities];
      
      // Filtro por texto (busca em título, descrição, requisitos)
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase();
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.title.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query) ||
          opp.requirements?.toLowerCase().includes(query) ||
          opp.benefits?.toLowerCase().includes(query) ||
          opp.requiredSkills.some(skill => skill.toLowerCase().includes(query))
        );
      }
      
      // Filtro por status
      if (searchParams.status) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.status === searchParams.status
        );
      }
      
      // Filtro por tipo de voluntariado
      if (searchParams.volunteerType) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.volunteerType === searchParams.volunteerType
        );
      }
      
      // Filtro por cidade
      if (searchParams.city) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.city && opp.city.toLowerCase().includes(searchParams.city.toLowerCase())
        );
      }
      
      // Filtro por estado
      if (searchParams.state) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.state === searchParams.state
        );
      }
      
      // Filtro por categoria
      if (searchParams.category) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.categories.some(cat => 
            cat.name.toLowerCase().includes(searchParams.category.toLowerCase())
          )
        );
      }
      
      // Filtro por habilidade
      if (searchParams.skill) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.requiredSkills.some(skill => 
            skill.toLowerCase().includes(searchParams.skill.toLowerCase())
          )
        );
      }
      
      // Filtro por disponibilidade (presencial/remoto)
      if (searchParams.isRemote !== undefined) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.isRemote === searchParams.isRemote
        );
      }
      
      // Filtro por necessidade de doações
      if (searchParams.needsDonations !== undefined) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.needsDonations === searchParams.needsDonations
        );
      }
      
      // Filtro por data de início
      if (searchParams.startDateFrom) {
        const startDateFrom = new Date(searchParams.startDateFrom);
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.startDate && new Date(opp.startDate) >= startDateFrom
        );
      }
      
      if (searchParams.startDateTo) {
        const startDateTo = new Date(searchParams.startDateTo);
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.startDate && new Date(opp.startDate) <= startDateTo
        );
      }
      
      // Filtro por prazo de inscrição
      if (searchParams.applicationDeadlineFrom) {
        const deadlineFrom = new Date(searchParams.applicationDeadlineFrom);
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.applicationDeadline && new Date(opp.applicationDeadline) >= deadlineFrom
        );
      }
      
      if (searchParams.applicationDeadlineTo) {
        const deadlineTo = new Date(searchParams.applicationDeadlineTo);
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.applicationDeadline && new Date(opp.applicationDeadline) <= deadlineTo
        );
      }
      
      // Filtro por vagas disponíveis
      if (searchParams.hasAvailableSlots) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.currentVolunteers < opp.maxVolunteers
        );
      }
      
      // Filtro por proximidade geográfica
      if (searchParams.latitude && searchParams.longitude && searchParams.radius) {
        const lat = parseFloat(searchParams.latitude);
        const lng = parseFloat(searchParams.longitude);
        const radius = parseFloat(searchParams.radius);
        
        filteredOpportunities = filteredOpportunities.filter(opp => {
          if (!opp.latitude || !opp.longitude) return false;
          const distance = calculateDistance(lat, lng, opp.latitude, opp.longitude);
          return distance <= radius;
        });
      }
      
      // Ordenação
      if (searchParams.sortBy) {
        switch (searchParams.sortBy) {
          case 'title':
            filteredOpportunities.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'createdAt':
            filteredOpportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'startDate':
            filteredOpportunities.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            break;
          case 'applicationDeadline':
            filteredOpportunities.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
            break;
          case 'volunteersNeeded':
            filteredOpportunities.sort((a, b) => (b.maxVolunteers - b.currentVolunteers) - (a.maxVolunteers - a.currentVolunteers));
            break;
          case 'distance':
            if (searchParams.latitude && searchParams.longitude) {
              const lat = parseFloat(searchParams.latitude);
              const lng = parseFloat(searchParams.longitude);
              filteredOpportunities.sort((a, b) => {
                if (!a.latitude || !a.longitude) return 1;
                if (!b.latitude || !b.longitude) return -1;
                const distanceA = calculateDistance(lat, lng, a.latitude, a.longitude);
                const distanceB = calculateDistance(lat, lng, b.latitude, b.longitude);
                return distanceA - distanceB;
              });
            }
            break;
        }
      }
      
      // Ordenação padrão por data de criação (mais recentes primeiro)
      if (!searchParams.sortBy) {
        filteredOpportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Paginação
      const page = parseInt(searchParams.page) || 1;
      const limit = parseInt(searchParams.limit) || 20;
      const offset = (page - 1) * limit;
      
      const paginatedOpportunities = filteredOpportunities.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          opportunities: paginatedOpportunities,
          pagination: {
            page,
            limit,
            total: filteredOpportunities.length,
            totalPages: Math.ceil(filteredOpportunities.length / limit),
            hasNext: page < Math.ceil(filteredOpportunities.length / limit),
            hasPrev: page > 1
          },
          filters: searchParams
        },
        demo: true
      };
    }
    
    // Implementação com banco de dados (futura)
    return {
      success: true,
      data: {
        opportunities: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        filters: searchParams
      },
      demo: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Busca por sugestões (autocomplete)
const getSearchSuggestions = async (query, type = 'all') => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const suggestions = {
        opportunities: [],
        categories: [],
        skills: [],
        cities: []
      };
      
      if (query && query.length >= 2) {
        const searchQuery = query.toLowerCase();
        
        // Sugestões de oportunidades
        if (type === 'all' || type === 'opportunities') {
          suggestions.opportunities = demoOpportunities
            .filter(opp => 
              opp.title.toLowerCase().includes(searchQuery) ||
              opp.description.toLowerCase().includes(searchQuery)
            )
            .slice(0, 5)
            .map(opp => ({
              id: opp.id,
              title: opp.title,
              type: 'opportunity'
            }));
        }
        
        // Sugestões de categorias
        if (type === 'all' || type === 'categories') {
          const allCategories = demoOpportunities.flatMap(opp => opp.categories);
          const uniqueCategories = allCategories.filter((cat, index, self) => 
            index === self.findIndex(c => c.id === cat.id)
          );
          
          suggestions.categories = uniqueCategories
            .filter(cat => cat.name.toLowerCase().includes(searchQuery))
            .slice(0, 5)
            .map(cat => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
              type: 'category'
            }));
        }
        
        // Sugestões de habilidades
        if (type === 'all' || type === 'skills') {
          const allSkills = demoOpportunities.flatMap(opp => opp.requiredSkills);
          const uniqueSkills = [...new Set(allSkills)];
          
          suggestions.skills = uniqueSkills
            .filter(skill => skill.toLowerCase().includes(searchQuery))
            .slice(0, 5)
            .map(skill => ({
              name: skill,
              type: 'skill'
            }));
        }
        
        // Sugestões de cidades
        if (type === 'all' || type === 'cities') {
          const allCities = demoOpportunities
            .filter(opp => opp.city)
            .map(opp => ({ city: opp.city, state: opp.state }))
            .filter((item, index, self) => 
              index === self.findIndex(c => c.city === item.city && c.state === item.state)
            );
          
          suggestions.cities = allCities
            .filter(item => 
              item.city.toLowerCase().includes(searchQuery) ||
              item.state.toLowerCase().includes(searchQuery)
            )
            .slice(0, 5)
            .map(item => ({
              city: item.city,
              state: item.state,
              type: 'city'
            }));
        }
      }
      
      return {
        success: true,
        data: suggestions,
        query,
        demo: true
      };
    }
    
    // Implementação com banco de dados (futura)
    return {
      success: true,
      data: {
        opportunities: [],
        categories: [],
        skills: [],
        cities: []
      },
      query,
      demo: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter filtros disponíveis
const getAvailableFilters = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const filters = {
        statuses: ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'],
        volunteerTypes: ['PRESENTIAL', 'ONLINE', 'HYBRID'],
        categories: demoOpportunities
          .flatMap(opp => opp.categories)
          .filter((cat, index, self) => 
            index === self.findIndex(c => c.id === cat.id)
          ),
        skills: [...new Set(demoOpportunities.flatMap(opp => opp.requiredSkills))],
        cities: [...new Set(demoOpportunities.filter(opp => opp.city).map(opp => opp.city))],
        states: [...new Set(demoOpportunities.filter(opp => opp.state).map(opp => opp.state))],
        skillLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        sortOptions: [
          { value: 'createdAt', label: 'Mais recentes' },
          { value: 'title', label: 'Título A-Z' },
          { value: 'startDate', label: 'Data de início' },
          { value: 'applicationDeadline', label: 'Prazo de inscrição' },
          { value: 'volunteersNeeded', label: 'Mais vagas disponíveis' },
          { value: 'distance', label: 'Mais próximas' }
        ]
      };
      
      return {
        success: true,
        data: filters,
        demo: true
      };
    }
    
    // Implementação com banco de dados (futura)
    return {
      success: true,
      data: {},
      demo: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Busca por tags populares
const getPopularTags = async (limit = 20) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const tagCounts = {};
      
      // Contar categorias
      demoOpportunities.forEach(opp => {
        opp.categories.forEach(cat => {
          tagCounts[cat.name] = (tagCounts[cat.name] || 0) + 1;
        });
      });
      
      // Contar habilidades
      demoOpportunities.forEach(opp => {
        opp.requiredSkills.forEach(skill => {
          tagCounts[skill] = (tagCounts[skill] || 0) + 1;
        });
      });
      
      // Contar cidades
      demoOpportunities.forEach(opp => {
        if (opp.city) {
          tagCounts[opp.city] = (tagCounts[opp.city] || 0) + 1;
        }
      });
      
      const popularTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
      
      return {
        success: true,
        data: popularTags,
        demo: true
      };
    }
    
    // Implementação com banco de dados (futura)
    return {
      success: true,
      data: [],
      demo: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getAvailableFilters,
  getPopularTags
};


