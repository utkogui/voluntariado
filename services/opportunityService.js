const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// Oportunidades de demonstração (quando não há banco de dados)
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
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
    requiredSkills: ['Ensino', 'Matemática', 'Português'],
    skillLevels: {
      'Ensino': 'INTERMEDIATE',
      'Matemática': 'ADVANCED',
      'Português': 'ADVANCED'
    },
    needsDonations: true,
    donationItems: [
      'Livros didáticos',
      'Material escolar',
      'Lápis e canetas',
      'Cadernos'
    ],
    createdById: 'demo-institution-1',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '1', name: 'Educação', icon: '🎓', color: '#3498db' },
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
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
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
    applicationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
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
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 horas atrás
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
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 dias
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    requiredSkills: ['Organização de Eventos', 'Comunicação', 'Liderança'],
    skillLevels: {
      'Organização de Eventos': 'INTERMEDIATE',
      'Comunicação': 'ADVANCED',
      'Liderança': 'INTERMEDIATE'
    },
    needsDonations: true,
    donationItems: [
      'Arroz',
      'Feijão',
      'Macarrão',
      'Óleo de cozinha',
      'Leite em pó'
    ],
    createdById: 'demo-institution-3',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' },
      { id: '11', name: 'Alimentação', icon: '🍎', color: '#f39c12' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
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
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    requiredSkills: ['Música', 'Violão', 'Flauta', 'Ensino'],
    skillLevels: {
      'Música': 'ADVANCED',
      'Violão': 'ADVANCED',
      'Flauta': 'INTERMEDIATE',
      'Ensino': 'INTERMEDIATE'
    },
    needsDonations: true,
    donationItems: [
      'Violões',
      'Flautas',
      'Partituras',
      'Livros de música'
    ],
    createdById: 'demo-institution-4',
    createdByType: 'INSTITUTION',
    categories: [
      { id: '5', name: 'Cultura', icon: '🎭', color: '#9b59b6' },
      { id: '20', name: 'Música', icon: '🎶', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
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
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
    applicationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
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

// Obter todas as oportunidades
const getAllOpportunities = async (filters = {}) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - aplicar filtros básicos
      let filteredOpportunities = [...demoOpportunities];
      
      if (filters.status) {
        filteredOpportunities = filteredOpportunities.filter(opp => opp.status === filters.status);
      }
      
      if (filters.volunteerType) {
        filteredOpportunities = filteredOpportunities.filter(opp => opp.volunteerType === filters.volunteerType);
      }
      
      if (filters.city) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.city && opp.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      
      if (filters.category) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.categories.some(cat => cat.name.toLowerCase().includes(filters.category.toLowerCase()))
        );
      }
      
      if (filters.skill) {
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.requiredSkills.some(skill => skill.toLowerCase().includes(filters.skill.toLowerCase()))
        );
      }
      
      return {
        success: true,
        data: filteredOpportunities,
        demo: true
      };
    }

    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.volunteerType) {
      where.volunteerType = filters.volunteerType;
    }
    
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    
    if (filters.isRemote !== undefined) {
      where.isRemote = filters.isRemote;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true,
        applications: {
          where: { status: 'APPROVED' },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: opportunities
    };
  } catch (error) {
    return {
      success: true,
      data: demoOpportunities,
      demo: true
    };
  }
};

// Obter oportunidade por ID
const getOpportunityById = async (id) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const opportunity = demoOpportunities.find(opp => opp.id === id);
      if (!opportunity) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND
        };
      }
      
      return {
        success: true,
        data: opportunity,
        demo: true
      };
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true,
        applications: {
          include: {
            volunteer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!opportunity) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    return {
      success: true,
      data: opportunity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Buscar oportunidades
const searchOpportunities = async (query, filters = {}) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - busca simples
      const filteredOpportunities = demoOpportunities.filter(opp => 
        opp.title.toLowerCase().includes(query.toLowerCase()) ||
        opp.description.toLowerCase().includes(query.toLowerCase()) ||
        opp.requirements?.toLowerCase().includes(query.toLowerCase()) ||
        opp.requiredSkills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
      );
      
      return {
        success: true,
        data: filteredOpportunities,
        query,
        demo: true
      };
    }

    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { requirements: { contains: query, mode: 'insensitive' } },
        { requiredSkills: { has: query } }
      ]
    };

    // Aplicar filtros adicionais
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.volunteerType) {
      where.volunteerType = filters.volunteerType;
    }
    
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: opportunities,
      query
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter oportunidades por categoria
const getOpportunitiesByCategory = async (categoryId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const filteredOpportunities = demoOpportunities.filter(opp => 
        opp.categories.some(cat => cat.id === categoryId)
      );
      
      return {
        success: true,
        data: filteredOpportunities,
        categoryId,
        demo: true
      };
    }

    const opportunities = await prisma.opportunity.findMany({
      where: {
        categories: {
          some: { id: categoryId }
        }
      },
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: opportunities,
      categoryId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter oportunidades próximas
const getNearbyOpportunities = async (lat, lng, radiusKm = 50) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração - simular busca por proximidade
      const nearbyOpportunities = demoOpportunities.filter(opp => {
        if (!opp.latitude || !opp.longitude) return false;
        
        // Cálculo simples de distância (Haversine)
        const R = 6371; // Raio da Terra em km
        const dLat = (opp.latitude - lat) * Math.PI / 180;
        const dLng = (opp.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(opp.latitude * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= radiusKm;
      }).map(opp => ({
        ...opp,
        distance: Math.round(calculateDistance(lat, lng, opp.latitude, opp.longitude) * 100) / 100
      })).sort((a, b) => a.distance - b.distance);
      
      return {
        success: true,
        data: nearbyOpportunities,
        center: { lat, lng },
        radius: radiusKm,
        demo: true
      };
    }

    // Em produção, usar consulta espacial do PostgreSQL
    const opportunities = await prisma.opportunity.findMany({
      where: {
        latitude: {
          gte: lat - (radiusKm / 111),
          lte: lat + (radiusKm / 111)
        },
        longitude: {
          gte: lng - (radiusKm / 111),
          lte: lng + (radiusKm / 111)
        }
      },
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true
      }
    });

    // Calcular distâncias reais e filtrar
    const nearbyOpportunities = opportunities
      .map(opp => ({
        ...opp,
        distance: calculateDistance(lat, lng, opp.latitude, opp.longitude)
      }))
      .filter(opp => opp.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      data: nearbyOpportunities,
      center: { lat, lng },
      radius: radiusKm
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Função auxiliar para calcular distância
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

// Obter estatísticas das oportunidades
const getOpportunityStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const stats = {
        totalOpportunities: demoOpportunities.length,
        opportunitiesByStatus: demoOpportunities.reduce((acc, opp) => {
          acc[opp.status] = (acc[opp.status] || 0) + 1;
          return acc;
        }, {}),
        opportunitiesByType: demoOpportunities.reduce((acc, opp) => {
          acc[opp.volunteerType] = (acc[opp.volunteerType] || 0) + 1;
          return acc;
        }, {}),
        opportunitiesByCategory: demoOpportunities.reduce((acc, opp) => {
          opp.categories.forEach(cat => {
            acc[cat.name] = (acc[cat.name] || 0) + 1;
          });
          return acc;
        }, {}),
        totalVolunteersNeeded: demoOpportunities.reduce((sum, opp) => sum + (opp.maxVolunteers || 0), 0),
        totalCurrentVolunteers: demoOpportunities.reduce((sum, opp) => sum + opp.currentVolunteers, 0)
      };
      
      return {
        success: true,
        data: stats,
        demo: true
      };
    }

    const totalOpportunities = await prisma.opportunity.count();
    
    const opportunitiesByStatus = await prisma.opportunity.groupBy({
      by: ['status'],
      _count: true
    });
    
    const opportunitiesByType = await prisma.opportunity.groupBy({
      by: ['volunteerType'],
      _count: true
    });

    const totalVolunteersNeeded = await prisma.opportunity.aggregate({
      _sum: { maxVolunteers: true }
    });

    const totalCurrentVolunteers = await prisma.opportunity.aggregate({
      _sum: { currentVolunteers: true }
    });

    return {
      success: true,
      data: {
        totalOpportunities,
        opportunitiesByStatus: opportunitiesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        opportunitiesByType: opportunitiesByType.reduce((acc, item) => {
          acc[item.volunteerType] = item._count;
          return acc;
        }, {}),
        totalVolunteersNeeded: totalVolunteersNeeded._sum.maxVolunteers || 0,
        totalCurrentVolunteers: totalCurrentVolunteers._sum.currentVolunteers || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getAllOpportunities,
  getOpportunityById,
  searchOpportunities,
  getOpportunitiesByCategory,
  getNearbyOpportunities,
  getOpportunityStats
};


