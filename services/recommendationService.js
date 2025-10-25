const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');

// Dados de demonstração para voluntários (reutilizando do matchingService)
const demoVolunteers = [
  {
    id: '1',
    userId: 'user-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@email.com',
    skills: ['Ensino', 'Matemática', 'Português', 'Paciência'],
    skillLevels: {
      'Ensino': 'EXPERT',
      'Matemática': 'EXPERT',
      'Português': 'ADVANCED',
      'Paciência': 'EXPERT'
    },
    interests: ['Educação', 'Assistência Social'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isAvailable: true,
    preferences: {
      maxDistance: 30,
      preferredDays: ['saturday', 'sunday'],
      preferredTimeSlots: ['morning'],
      minHoursPerWeek: 2,
      maxHoursPerWeek: 8,
      preferredCategories: ['Educação', 'Assistência Social'],
      avoidCategories: [],
      skillLevelPreference: 'ADVANCED'
    },
    history: {
      appliedOpportunities: ['1', '3'],
      completedOpportunities: ['2'],
      favoritedOpportunities: ['1', '4'],
      rejectedOpportunities: ['5']
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    userId: 'user-2',
    firstName: 'Carlos',
    lastName: 'Santos',
    email: 'carlos.santos@email.com',
    skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git'],
    skillLevels: {
      'JavaScript': 'EXPERT',
      'HTML/CSS': 'EXPERT',
      'React': 'ADVANCED',
      'Node.js': 'ADVANCED',
      'Git': 'ADVANCED'
    },
    interests: ['Tecnologia', 'Proteção Animal'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5615,
    longitude: -46.6565,
    isAvailable: true,
    preferences: {
      maxDistance: 50,
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      preferredTimeSlots: ['evening'],
      minHoursPerWeek: 5,
      maxHoursPerWeek: 15,
      preferredCategories: ['Tecnologia', 'Proteção Animal'],
      avoidCategories: ['Educação'],
      skillLevelPreference: 'INTERMEDIATE'
    },
    history: {
      appliedOpportunities: ['2'],
      completedOpportunities: [],
      favoritedOpportunities: ['2'],
      rejectedOpportunities: ['1', '3']
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    userId: 'user-3',
    firstName: 'Maria',
    lastName: 'Oliveira',
    email: 'maria.oliveira@email.com',
    skills: ['Organização de Eventos', 'Comunicação', 'Liderança', 'Marketing'],
    skillLevels: {
      'Organização de Eventos': 'EXPERT',
      'Comunicação': 'EXPERT',
      'Liderança': 'ADVANCED',
      'Marketing': 'INTERMEDIATE'
    },
    interests: ['Assistência Social', 'Alimentação'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5475,
    longitude: -46.6361,
    isAvailable: true,
    preferences: {
      maxDistance: 25,
      preferredDays: ['saturday', 'sunday'],
      preferredTimeSlots: ['morning', 'afternoon'],
      minHoursPerWeek: 4,
      maxHoursPerWeek: 12,
      preferredCategories: ['Assistência Social', 'Alimentação'],
      avoidCategories: ['Tecnologia'],
      skillLevelPreference: 'INTERMEDIATE'
    },
    history: {
      appliedOpportunities: ['3', '4'],
      completedOpportunities: ['1'],
      favoritedOpportunities: ['3'],
      rejectedOpportunities: ['2']
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
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
    skillLevels: {
      'Ensino': 'INTERMEDIATE',
      'Matemática': 'ADVANCED',
      'Português': 'ADVANCED'
    },
    categories: [
      { id: '1', name: 'Educação', icon: '🎓', color: '#3498db' },
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    popularityScore: 8.5,
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '4 horas/semana'
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
    skillLevels: {
      'JavaScript': 'ADVANCED',
      'HTML/CSS': 'ADVANCED',
      'React': 'INTERMEDIATE',
      'Git': 'INTERMEDIATE'
    },
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '9', name: 'Proteção Animal', icon: '🐕', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    popularityScore: 7.2,
    difficultyLevel: 'ADVANCED',
    timeCommitment: '10 horas/semana'
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
    skillLevels: {
      'Organização de Eventos': 'INTERMEDIATE',
      'Comunicação': 'ADVANCED',
      'Liderança': 'INTERMEDIATE'
    },
    categories: [
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' },
      { id: '11', name: 'Alimentação', icon: '🍎', color: '#f39c12' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    popularityScore: 9.1,
    difficultyLevel: 'BEGINNER',
    timeCommitment: '8 horas/semana'
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
    skillLevels: {
      'Música': 'ADVANCED',
      'Violão': 'ADVANCED',
      'Flauta': 'INTERMEDIATE',
      'Ensino': 'INTERMEDIATE'
    },
    categories: [
      { id: '5', name: 'Cultura', icon: '🎭', color: '#9b59b6' },
      { id: '20', name: 'Música', icon: '🎶', color: '#e67e22' }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    popularityScore: 6.8,
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '3 horas/semana'
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
    skillLevels: {
      'Tecnologia': 'ADVANCED',
      'Paciência': 'EXPERT',
      'Comunicação': 'ADVANCED',
      'Suporte Técnico': 'INTERMEDIATE'
    },
    categories: [
      { id: '7', name: 'Tecnologia', icon: '💻', color: '#3498db' },
      { id: '14', name: 'Idosos', icon: '👵', color: '#2ecc71' }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    popularityScore: 7.5,
    difficultyLevel: 'INTERMEDIATE',
    timeCommitment: '2 horas/semana'
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

// Algoritmo de recomendação baseado em colaboração (collaborative filtering)
const getCollaborativeRecommendations = async (volunteerId, limit = 10) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return { success: false, error: 'Voluntário não encontrado' };
      }

      // Encontrar voluntários similares baseado em histórico e preferências
      const similarVolunteers = demoVolunteers
        .filter(v => v.id !== volunteerId)
        .map(otherVolunteer => {
          // Calcular similaridade baseada em interesses, habilidades e histórico
          const commonInterests = volunteer.interests.filter(interest => 
            otherVolunteer.interests.includes(interest)
          ).length;
          
          const commonSkills = volunteer.skills.filter(skill => 
            otherVolunteer.skills.includes(skill)
          ).length;
          
          const commonApplied = volunteer.history.appliedOpportunities.filter(oppId => 
            otherVolunteer.history.appliedOpportunities.includes(oppId)
          ).length;
          
          const commonFavorited = volunteer.history.favoritedOpportunities.filter(oppId => 
            otherVolunteer.history.favoritedOpportunities.includes(oppId)
          ).length;
          
          // Calcular pontuação de similaridade
          const similarityScore = (
            (commonInterests / Math.max(volunteer.interests.length, otherVolunteer.interests.length)) * 0.3 +
            (commonSkills / Math.max(volunteer.skills.length, otherVolunteer.skills.length)) * 0.4 +
            (commonApplied / Math.max(volunteer.history.appliedOpportunities.length, otherVolunteer.history.appliedOpportunities.length)) * 0.2 +
            (commonFavorited / Math.max(volunteer.history.favoritedOpportunities.length, otherVolunteer.history.favoritedOpportunities.length)) * 0.1
          );
          
          return { volunteer: otherVolunteer, similarity: similarityScore };
        })
        .filter(item => item.similarity > 0.2)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      // Encontrar oportunidades que voluntários similares gostaram
      const recommendedOpportunities = [];
      const alreadySeen = new Set([
        ...volunteer.history.appliedOpportunities,
        ...volunteer.history.favoritedOpportunities,
        ...volunteer.history.rejectedOpportunities
      ]);

      for (const similar of similarVolunteers) {
        const opportunities = demoOpportunities.filter(opp => 
          !alreadySeen.has(opp.id) &&
          similar.volunteer.history.favoritedOpportunities.includes(opp.id)
        );
        
        opportunities.forEach(opp => {
          const existing = recommendedOpportunities.find(r => r.opportunity.id === opp.id);
          if (existing) {
            existing.score += similar.similarity * 0.5;
            existing.reasons.push(`Voluntário similar (${similar.volunteer.firstName}) também gostou`);
          } else {
            recommendedOpportunities.push({
              opportunity: opp,
              score: similar.similarity * 0.5,
              reasons: [`Voluntário similar (${similar.volunteer.firstName}) também gostou`],
              type: 'collaborative'
            });
          }
        });
      }

      return {
        success: true,
        data: recommendedOpportunities
          .sort((a, b) => b.score - a.score)
          .slice(0, limit),
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Algoritmo de recomendação baseado em conteúdo (content-based filtering)
const getContentBasedRecommendations = async (volunteerId, limit = 10) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return { success: false, error: 'Voluntário não encontrado' };
      }

      const recommendations = [];
      const alreadySeen = new Set([
        ...volunteer.history.appliedOpportunities,
        ...volunteer.history.favoritedOpportunities,
        ...volunteer.history.rejectedOpportunities
      ]);

      for (const opportunity of demoOpportunities) {
        if (alreadySeen.has(opportunity.id)) continue;

        let score = 0;
        const reasons = [];

        // Pontuação baseada em habilidades
        const matchingSkills = volunteer.skills.filter(skill => 
          opportunity.requiredSkills.includes(skill)
        );
        const skillScore = (matchingSkills.length / opportunity.requiredSkills.length) * 0.4;
        score += skillScore;
        if (matchingSkills.length > 0) {
          reasons.push(`Habilidades em: ${matchingSkills.join(', ')}`);
        }

        // Pontuação baseada em interesses
        const matchingInterests = volunteer.interests.filter(interest =>
          opportunity.categories.some(cat => 
            cat.name.toLowerCase().includes(interest.toLowerCase())
          )
        );
        const interestScore = (matchingInterests.length / volunteer.interests.length) * 0.3;
        score += interestScore;
        if (matchingInterests.length > 0) {
          reasons.push(`Interesses alinhados: ${matchingInterests.join(', ')}`);
        }

        // Pontuação baseada em localização
        if (volunteer.latitude && volunteer.longitude && opportunity.latitude && opportunity.longitude) {
          const distance = calculateDistance(
            volunteer.latitude, volunteer.longitude,
            opportunity.latitude, opportunity.longitude
          );
          const maxDistance = volunteer.preferences.maxDistance || 50;
          if (distance <= maxDistance) {
            const locationScore = (1 - distance / maxDistance) * 0.2;
            score += locationScore;
            reasons.push(`Localização próxima (${Math.round(distance)}km)`);
          }
        }

        // Pontuação baseada em preferências de categoria
        const preferredCategories = volunteer.preferences.preferredCategories || [];
        const categoryMatch = opportunity.categories.some(cat => 
          preferredCategories.includes(cat.name)
        );
        if (categoryMatch) {
          score += 0.1;
          reasons.push('Categoria preferida');
        }

        // Penalizar categorias evitadas
        const avoidedCategories = volunteer.preferences.avoidCategories || [];
        const avoidedMatch = opportunity.categories.some(cat => 
          avoidedCategories.includes(cat.name)
        );
        if (avoidedMatch) {
          score -= 0.3;
          reasons.push('Categoria evitada');
        }

        if (score > 0.3) {
          recommendations.push({
            opportunity,
            score,
            reasons,
            type: 'content-based'
          });
        }
      }

      return {
        success: true,
        data: recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, limit),
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Algoritmo de recomendação híbrido (combina colaborativo e baseado em conteúdo)
const getHybridRecommendations = async (volunteerId, limit = 10) => {
  try {
    const [collaborativeResult, contentResult] = await Promise.all([
      getCollaborativeRecommendations(volunteerId, limit * 2),
      getContentBasedRecommendations(volunteerId, limit * 2)
    ]);

    if (!collaborativeResult.success || !contentResult.success) {
      return { success: false, error: 'Erro ao obter recomendações' };
    }

    // Combinar recomendações
    const combinedRecommendations = new Map();
    
    // Adicionar recomendações colaborativas
    collaborativeResult.data.forEach(rec => {
      combinedRecommendations.set(rec.opportunity.id, {
        ...rec,
        collaborativeScore: rec.score,
        contentScore: 0
      });
    });

    // Adicionar/atualizar com recomendações baseadas em conteúdo
    contentResult.data.forEach(rec => {
      const existing = combinedRecommendations.get(rec.opportunity.id);
      if (existing) {
        existing.contentScore = rec.score;
        existing.score = (existing.collaborativeScore * 0.3) + (rec.score * 0.7);
        existing.reasons = [...existing.reasons, ...rec.reasons];
        existing.type = 'hybrid';
      } else {
        combinedRecommendations.set(rec.opportunity.id, {
          ...rec,
          collaborativeScore: 0,
          contentScore: rec.score
        });
      }
    });

    const finalRecommendations = Array.from(combinedRecommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      success: true,
      data: finalRecommendations,
      demo: true
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Recomendações baseadas em tendências e popularidade
const getTrendingRecommendations = async (volunteerId, limit = 5) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return { success: false, error: 'Voluntário não encontrado' };
      }

      const alreadySeen = new Set([
        ...volunteer.history.appliedOpportunities,
        ...volunteer.history.favoritedOpportunities,
        ...volunteer.history.rejectedOpportunities
      ]);

      const trendingOpportunities = demoOpportunities
        .filter(opp => !alreadySeen.has(opp.id))
        .filter(opp => opp.popularityScore >= 7.0) // Oportunidades populares
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map(opp => ({
          opportunity: opp,
          score: opp.popularityScore / 10,
          reasons: ['Oportunidade em alta', 'Muitos voluntários interessados'],
          type: 'trending'
        }));

      return {
        success: true,
        data: trendingOpportunities,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Recomendações baseadas em proximidade temporal (oportunidades que começam em breve)
const getUrgentRecommendations = async (volunteerId, limit = 5) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return { success: false, error: 'Voluntário não encontrado' };
      }

      const alreadySeen = new Set([
        ...volunteer.history.appliedOpportunities,
        ...volunteer.history.favoritedOpportunities,
        ...volunteer.history.rejectedOpportunities
      ]);

      const now = new Date();
      const urgentOpportunities = demoOpportunities
        .filter(opp => !alreadySeen.has(opp.id))
        .filter(opp => {
          const startDate = new Date(opp.startDate);
          const daysUntilStart = (startDate - now) / (1000 * 60 * 60 * 24);
          return daysUntilStart <= 7 && daysUntilStart >= 0; // Próximos 7 dias
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, limit)
        .map(opp => {
          const startDate = new Date(opp.startDate);
          const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
          
          return {
            opportunity: opp,
            score: 0.8 - (daysUntilStart / 7) * 0.3, // Maior pontuação para mais urgentes
            reasons: [`Inicia em ${daysUntilStart} dias`, 'Oportunidade urgente'],
            type: 'urgent'
          };
        });

      return {
        success: true,
        data: urgentOpportunities,
        demo: true
      };
    }

    // Implementação com banco de dados (futura)
    return { success: true, data: [], demo: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter recomendações personalizadas completas
const getPersonalizedRecommendations = async (volunteerId, options = {}) => {
  try {
    const {
      limit = 20,
      includeCollaborative = true,
      includeContentBased = true,
      includeTrending = true,
      includeUrgent = true
    } = options;

    const recommendations = [];

    // Recomendações híbridas (colaborativo + baseado em conteúdo)
    if (includeCollaborative && includeContentBased) {
      const hybridResult = await getHybridRecommendations(volunteerId, Math.ceil(limit * 0.6));
      if (hybridResult.success) {
        recommendations.push(...hybridResult.data);
      }
    } else if (includeCollaborative) {
      const collaborativeResult = await getCollaborativeRecommendations(volunteerId, Math.ceil(limit * 0.4));
      if (collaborativeResult.success) {
        recommendations.push(...collaborativeResult.data);
      }
    } else if (includeContentBased) {
      const contentResult = await getContentBasedRecommendations(volunteerId, Math.ceil(limit * 0.6));
      if (contentResult.success) {
        recommendations.push(...contentResult.data);
      }
    }

    // Recomendações de tendências
    if (includeTrending) {
      const trendingResult = await getTrendingRecommendations(volunteerId, Math.ceil(limit * 0.2));
      if (trendingResult.success) {
        recommendations.push(...trendingResult.data);
      }
    }

    // Recomendações urgentes
    if (includeUrgent) {
      const urgentResult = await getUrgentRecommendations(volunteerId, Math.ceil(limit * 0.2));
      if (urgentResult.success) {
        recommendations.push(...urgentResult.data);
      }
    }

    // Remover duplicatas e ordenar
    const uniqueRecommendations = [];
    const seenIds = new Set();

    for (const rec of recommendations) {
      if (!seenIds.has(rec.opportunity.id)) {
        seenIds.add(rec.opportunity.id);
        uniqueRecommendations.push(rec);
      }
    }

    const finalRecommendations = uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      success: true,
      data: finalRecommendations,
      demo: true
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obter estatísticas de recomendações
const getRecommendationStats = async (volunteerId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return { success: false, error: 'Voluntário não encontrado' };
      }

      const stats = {
        totalRecommendations: 0,
        recommendationsByType: {},
        averageScore: 0,
        topCategories: [],
        topSkills: [],
        lastUpdated: new Date()
      };

      // Simular estatísticas baseadas no perfil do voluntário
      const allRecommendations = await getPersonalizedRecommendations(volunteerId, { limit: 50 });
      if (allRecommendations.success) {
        stats.totalRecommendations = allRecommendations.data.length;
        
        allRecommendations.data.forEach(rec => {
          const type = rec.type || 'unknown';
          stats.recommendationsByType[type] = (stats.recommendationsByType[type] || 0) + 1;
        });

        if (allRecommendations.data.length > 0) {
          stats.averageScore = allRecommendations.data.reduce((sum, rec) => sum + rec.score, 0) / allRecommendations.data.length;
        }

        // Top categorias recomendadas
        const categoryCounts = {};
        allRecommendations.data.forEach(rec => {
          rec.opportunity.categories.forEach(cat => {
            categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
          });
        });
        stats.topCategories = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, count]) => ({ category, count }));

        // Top habilidades recomendadas
        const skillCounts = {};
        allRecommendations.data.forEach(rec => {
          rec.opportunity.requiredSkills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });
        stats.topSkills = Object.entries(skillCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([skill, count]) => ({ skill, count }));
      }

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

module.exports = {
  getPersonalizedRecommendations,
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getHybridRecommendations,
  getTrendingRecommendations,
  getUrgentRecommendations,
  getRecommendationStats
};
