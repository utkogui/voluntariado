const { prisma } = require('../config/database');
const { ERROR_MESSAGES } = require('../utils/constants');
const OpportunityRequirementsService = require('./opportunityRequirementsService');

// Dados de demonstração para voluntários
const demoVolunteers = [
  {
    id: '1',
    userId: 'user-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-1111',
    birthDate: '1995-03-15',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    latitude: -23.5505,
    longitude: -46.6333,
    bio: 'Professora de matemática com 5 anos de experiência, apaixonada por educação.',
    skills: ['Ensino', 'Matemática', 'Português', 'Paciência'],
    skillLevels: {
      'Ensino': 'EXPERT',
      'Matemática': 'EXPERT',
      'Português': 'ADVANCED',
      'Paciência': 'EXPERT'
    },
    interests: ['Educação', 'Assistência Social'],
    availability: {
      weekdays: ['saturday'],
      timeSlots: ['morning'],
      hoursPerWeek: 4
    },
    isAvailable: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    userId: 'user-2',
    firstName: 'Carlos',
    lastName: 'Santos',
    email: 'carlos.santos@email.com',
    phone: '(11) 99999-2222',
    birthDate: '1990-07-22',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    latitude: -23.5615,
    longitude: -46.6565,
    bio: 'Desenvolvedor full-stack com experiência em React, Node.js e Python.',
    skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git'],
    skillLevels: {
      'JavaScript': 'EXPERT',
      'HTML/CSS': 'EXPERT',
      'React': 'ADVANCED',
      'Node.js': 'ADVANCED',
      'Git': 'ADVANCED'
    },
    interests: ['Tecnologia', 'Proteção Animal'],
    availability: {
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['evening'],
      hoursPerWeek: 10
    },
    isAvailable: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    userId: 'user-3',
    firstName: 'Maria',
    lastName: 'Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(11) 99999-3333',
    birthDate: '1988-12-10',
    address: 'Rua da Consolação, 500',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01302-000',
    latitude: -23.5475,
    longitude: -46.6361,
    bio: 'Organizadora de eventos com experiência em campanhas sociais e arrecadação de alimentos.',
    skills: ['Organização de Eventos', 'Comunicação', 'Liderança', 'Marketing'],
    skillLevels: {
      'Organização de Eventos': 'EXPERT',
      'Comunicação': 'EXPERT',
      'Liderança': 'ADVANCED',
      'Marketing': 'INTERMEDIATE'
    },
    interests: ['Assistência Social', 'Alimentação'],
    availability: {
      weekdays: ['saturday', 'sunday'],
      timeSlots: ['morning', 'afternoon'],
      hoursPerWeek: 8
    },
    isAvailable: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    userId: 'user-4',
    firstName: 'João',
    lastName: 'Costa',
    email: 'joao.costa@email.com',
    phone: '(11) 99999-4444',
    birthDate: '1992-05-18',
    address: 'Rua Augusta, 200',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01305-000',
    latitude: -23.5615,
    longitude: -46.6565,
    bio: 'Músico e professor de violão, com experiência em ensino para crianças.',
    skills: ['Música', 'Violão', 'Flauta', 'Ensino', 'Paciência'],
    skillLevels: {
      'Música': 'EXPERT',
      'Violão': 'EXPERT',
      'Flauta': 'ADVANCED',
      'Ensino': 'ADVANCED',
      'Paciência': 'EXPERT'
    },
    interests: ['Cultura', 'Música', 'Educação'],
    availability: {
      weekdays: ['sunday'],
      timeSlots: ['afternoon'],
      hoursPerWeek: 3
    },
    isAvailable: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    userId: 'user-5',
    firstName: 'Fernanda',
    lastName: 'Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 99999-5555',
    birthDate: '1993-09-25',
    address: 'Rua Oscar Freire, 300',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01426-000',
    latitude: -23.5615,
    longitude: -46.6565,
    bio: 'Técnica em informática com especialização em suporte técnico para idosos.',
    skills: ['Tecnologia', 'Suporte Técnico', 'Paciência', 'Comunicação'],
    skillLevels: {
      'Tecnologia': 'ADVANCED',
      'Suporte Técnico': 'EXPERT',
      'Paciência': 'EXPERT',
      'Comunicação': 'ADVANCED'
    },
    interests: ['Tecnologia', 'Idosos'],
    availability: {
      weekdays: ['monday', 'wednesday', 'friday'],
      timeSlots: ['morning', 'afternoon'],
      hoursPerWeek: 6
    },
    isAvailable: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

// Dados de demonstração para oportunidades (reutilizando do opportunityService)
const demoOpportunities = [
  {
    id: '1',
    title: 'Aulas de reforço para crianças carentes',
    description: 'Precisamos de voluntários para dar aulas de reforço em matemática e português para crianças de 8 a 12 anos em situação de vulnerabilidade social.',
    requirements: 'Conhecimento em matemática e português do ensino fundamental, paciência e carinho com crianças, disponibilidade aos sábados das 9h às 12h.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 5,
    currentVolunteers: 2,
    address: 'Rua da Educação, 456',
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Ensino', 'Matemática', 'Português'],
    skillLevels: {
      'Ensino': 'INTERMEDIATE',
      'Matemática': 'ADVANCED',
      'Português': 'ADVANCED'
    },
    categories: [
      { id: '1', name: 'Educação', icon: '🎓', color: '#3498db' },
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' }
    ]
  },
  {
    id: '2',
    title: 'Desenvolvimento de site para ONG',
    description: 'Projeto de desenvolvimento de website para uma ONG que trabalha com proteção animal. Precisamos de voluntários com conhecimento em desenvolvimento web.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 3,
    currentVolunteers: 1,
    isRemote: true,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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
    ]
  },
  {
    id: '3',
    title: 'Campanha de arrecadação de alimentos',
    description: 'Organização de campanha para arrecadar alimentos não perecíveis para famílias em situação de vulnerabilidade social.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 10,
    currentVolunteers: 4,
    address: 'Praça da Liberdade, Centro',
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isRemote: false,
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    requiredSkills: ['Organização de Eventos', 'Comunicação', 'Liderança'],
    skillLevels: {
      'Organização de Eventos': 'INTERMEDIATE',
      'Comunicação': 'ADVANCED',
      'Liderança': 'INTERMEDIATE'
    },
    categories: [
      { id: '4', name: 'Assistência Social', icon: '🤝', color: '#e67e22' },
      { id: '11', name: 'Alimentação', icon: '🍎', color: '#f39c12' }
    ]
  },
  {
    id: '4',
    title: 'Aulas de música para crianças',
    description: 'Projeto de ensino de música para crianças de 6 a 12 anos em comunidades carentes. Ensinamos violão, flauta e canto.',
    volunteerType: 'PRESENTIAL',
    status: 'PUBLISHED',
    maxVolunteers: 4,
    currentVolunteers: 2,
    address: 'Centro Cultural da Comunidade',
    city: 'Rio de Janeiro',
    state: 'RJ',
    latitude: -22.9068,
    longitude: -43.1729,
    isRemote: false,
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
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
    ]
  },
  {
    id: '5',
    title: 'Suporte técnico remoto para idosos',
    description: 'Projeto de inclusão digital para idosos. Voluntários ajudam via videochamada com uso de smartphones, computadores e internet.',
    volunteerType: 'ONLINE',
    status: 'PUBLISHED',
    maxVolunteers: 8,
    currentVolunteers: 3,
    isRemote: true,
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
    ]
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

// Função para calcular pontuação de habilidades
const calculateSkillScore = (volunteerSkills, volunteerSkillLevels, requiredSkills, requiredSkillLevels) => {
  let totalScore = 0;
  let matchedSkills = 0;
  
  for (const requiredSkill of requiredSkills) {
    if (volunteerSkills.includes(requiredSkill)) {
      matchedSkills++;
      
      // Calcular pontuação baseada no nível de habilidade
      const volunteerLevel = volunteerSkillLevels[requiredSkill] || 'BEGINNER';
      const requiredLevel = requiredSkillLevels[requiredSkill] || 'BEGINNER';
      
      const levelScores = {
        'BEGINNER': 1,
        'INTERMEDIATE': 2,
        'ADVANCED': 3,
        'EXPERT': 4
      };
      
      const volunteerScore = levelScores[volunteerLevel] || 1;
      const requiredScore = levelScores[requiredLevel] || 1;
      
      // Pontuação baseada na adequação do nível
      if (volunteerScore >= requiredScore) {
        totalScore += volunteerScore * 2; // Bônus por atender ou exceder o requisito
      } else {
        totalScore += volunteerScore; // Pontuação reduzida se não atender
      }
    }
  }
  
  // Normalizar pontuação (0-100)
  const maxPossibleScore = requiredSkills.length * 8; // Máximo 4 pontos por habilidade
  return Math.min(100, (totalScore / maxPossibleScore) * 100);
};

// Função para calcular pontuação de localização
const calculateLocationScore = (volunteerLat, volunteerLng, opportunityLat, opportunityLng, maxDistance = 50) => {
  if (!volunteerLat || !volunteerLng || !opportunityLat || !opportunityLng) {
    return 0; // Sem dados de localização
  }
  
  const distance = calculateDistance(volunteerLat, volunteerLng, opportunityLat, opportunityLng);
  
  if (distance <= maxDistance) {
    // Pontuação decresce com a distância
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }
  
  return 0; // Fora do raio máximo
};

// Função para calcular pontuação de disponibilidade
const calculateAvailabilityScore = (volunteerAvailability, opportunitySchedule, volunteerType) => {
  // Implementação simplificada - em produção seria mais complexa
  let score = 0;
  
  // Verificar compatibilidade de dias da semana
  if (volunteerAvailability.weekdays && opportunitySchedule.weekdays) {
    const commonDays = volunteerAvailability.weekdays.filter(day => 
      opportunitySchedule.weekdays.includes(day)
    );
    score += (commonDays.length / opportunitySchedule.weekdays.length) * 40;
  }
  
  // Verificar compatibilidade de horários
  if (volunteerAvailability.timeSlots && opportunitySchedule.timeSlots) {
    const commonSlots = volunteerAvailability.timeSlots.filter(slot => 
      opportunitySchedule.timeSlots.includes(slot)
    );
    score += (commonSlots.length / opportunitySchedule.timeSlots.length) * 30;
  }
  
  // Verificar compatibilidade de horas por semana
  if (volunteerAvailability.hoursPerWeek && opportunitySchedule.hoursPerWeek) {
    if (volunteerAvailability.hoursPerWeek >= opportunitySchedule.hoursPerWeek) {
      score += 30; // Voluntário tem tempo suficiente
    } else {
      score += (volunteerAvailability.hoursPerWeek / opportunitySchedule.hoursPerWeek) * 30;
    }
  }
  
  return Math.min(100, score);
};

// Função para calcular pontuação de tipo de voluntariado
const calculateVolunteerTypeScore = (volunteerPreferences, opportunityType) => {
  // Se o voluntário não tem preferências definidas, dar pontuação neutra
  if (!volunteerPreferences || !volunteerPreferences.volunteerTypes) {
    return 50; // Pontuação neutra
  }
  
  const volunteerTypes = volunteerPreferences.volunteerTypes || [];
  
  // Verificar se o tipo de oportunidade está nas preferências do voluntário
  if (volunteerTypes.includes(opportunityType)) {
    return 100; // Perfeita compatibilidade
  }
  
  // Verificar compatibilidade híbrida
  if (opportunityType === 'HYBRID') {
    const hasPresential = volunteerTypes.includes('PRESENTIAL');
    const hasOnline = volunteerTypes.includes('ONLINE');
    
    if (hasPresential && hasOnline) {
      return 100; // Perfeita compatibilidade híbrida
    } else if (hasPresential || hasOnline) {
      return 75; // Boa compatibilidade híbrida
    }
  }
  
  // Verificar se é compatível com híbrido
  if (volunteerTypes.includes('HYBRID')) {
    return 90; // Boa compatibilidade
  }
  
  return 0; // Incompatível
};

// Função para calcular pontuação de interesses
const calculateInterestScore = (volunteerInterests, opportunityCategories) => {
  if (!volunteerInterests || !opportunityCategories) {
    return 0;
  }
  
  const volunteerInterestNames = volunteerInterests.map(interest => 
    typeof interest === 'string' ? interest : interest.name
  );
  
  const opportunityCategoryNames = opportunityCategories.map(category => 
    typeof category === 'string' ? category : category.name
  );
  
  const commonInterests = volunteerInterestNames.filter(interest => 
    opportunityCategoryNames.some(category => 
      category.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(category.toLowerCase())
    )
  );
  
  return (commonInterests.length / opportunityCategoryNames.length) * 100;
};

// Função para calcular pontuação de requisitos específicos
const calculateRequirementsScore = async (volunteerId, opportunityId) => {
  try {
    const validationResult = await OpportunityRequirementsService.validateVolunteerForOpportunity(
      opportunityId, 
      volunteerId
    );
    
    if (!validationResult.meetsAllRequirements) {
      return 0; // Não atende aos requisitos obrigatórios
    }
    
    // Calcular pontuação baseada na validação
    const { summary } = validationResult;
    const totalRequirements = summary.total;
    const validRequirements = summary.valid;
    
    if (totalRequirements === 0) {
      return 100; // Sem requisitos específicos
    }
    
    // Pontuação baseada na porcentagem de requisitos atendidos
    const baseScore = (validRequirements / totalRequirements) * 100;
    
    // Penalizar falhas críticas
    const criticalPenalty = summary.critical * 20;
    
    // Bônus por atender todos os requisitos obrigatórios
    const requiredBonus = summary.requiredValid === summary.required ? 10 : 0;
    
    return Math.max(0, Math.min(100, baseScore - criticalPenalty + requiredBonus));
    
  } catch (error) {
    console.error('Erro ao calcular pontuação de requisitos:', error);
    return 0; // Em caso de erro, não pontuar
  }
};

// Algoritmo principal de matching
const findMatches = async (volunteerId, filters = {}) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const volunteer = demoVolunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        return {
          success: false,
          error: 'Voluntário não encontrado'
        };
      }
      
      const matches = [];
      
      for (const opportunity of demoOpportunities) {
        // Pular oportunidades já preenchidas
        if (opportunity.currentVolunteers >= opportunity.maxVolunteers) {
          continue;
        }
        
        // Calcular pontuações
        const skillScore = calculateSkillScore(
          volunteer.skills,
          volunteer.skillLevels,
          opportunity.requiredSkills,
          opportunity.skillLevels
        );
        
        const locationScore = calculateLocationScore(
          volunteer.latitude,
          volunteer.longitude,
          opportunity.latitude,
          opportunity.longitude
        );
        
        const availabilityScore = calculateAvailabilityScore(
          volunteer.availability,
          {
            weekdays: opportunity.volunteerType === 'ONLINE' ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] : ['saturday', 'sunday'],
            timeSlots: ['morning', 'afternoon'],
            hoursPerWeek: 4
          },
          opportunity.volunteerType
        );
        
        const interestScore = calculateInterestScore(
          volunteer.interests,
          opportunity.categories
        );
        
        // Calcular pontuação de tipo de voluntariado
        const volunteerTypeScore = calculateVolunteerTypeScore(
          volunteer,
          opportunity.volunteerType
        );
        
        // Calcular pontuação de requisitos específicos
        const requirementsScore = await calculateRequirementsScore(volunteer.id, opportunity.id);
        
        // Calcular pontuação total (pesos configuráveis)
        const weights = {
          skills: 0.25,
          location: 0.15,
          availability: 0.15,
          interests: 0.1,
          volunteerType: 0.15,
          requirements: 0.2
        };
        
        const totalScore = 
          (skillScore * weights.skills) +
          (locationScore * weights.location) +
          (availabilityScore * weights.availability) +
          (interestScore * weights.interests) +
          (volunteerTypeScore * weights.volunteerType) +
          (requirementsScore * weights.requirements);
        
        // Aplicar filtros
        if (filters.minScore && totalScore < filters.minScore) {
          continue;
        }
        
        if (filters.volunteerType && opportunity.volunteerType !== filters.volunteerType) {
          continue;
        }
        
        if (filters.city && opportunity.city && !opportunity.city.toLowerCase().includes(filters.city.toLowerCase())) {
          continue;
        }
        
        if (filters.category && !opportunity.categories.some(cat => 
          cat.name.toLowerCase().includes(filters.category.toLowerCase())
        )) {
          continue;
        }
        
        matches.push({
          opportunity,
          scores: {
            total: Math.round(totalScore * 100) / 100,
            skills: Math.round(skillScore * 100) / 100,
            location: Math.round(locationScore * 100) / 100,
            availability: Math.round(availabilityScore * 100) / 100,
            interests: Math.round(interestScore * 100) / 100,
            volunteerType: Math.round(volunteerTypeScore * 100) / 100,
            requirements: Math.round(requirementsScore * 100) / 100
          },
          reasons: generateMatchReasons(volunteer, opportunity, {
            skillScore,
            locationScore,
            availabilityScore,
            interestScore,
            volunteerTypeScore,
            requirementsScore
          })
        });
      }
      
      // Ordenar por pontuação total
      matches.sort((a, b) => b.scores.total - a.scores.total);
      
      return {
        success: true,
        data: matches,
        volunteer: volunteer,
        demo: true
      };
    }
    
    // Implementação com banco de dados (futura)
    // Por enquanto, retornar dados de demonstração
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

// Gerar razões para o matching
const generateMatchReasons = (volunteer, opportunity, scores) => {
  const reasons = [];
  
  if (scores.skillScore >= 80) {
    reasons.push('Excelente compatibilidade de habilidades');
  } else if (scores.skillScore >= 60) {
    reasons.push('Boa compatibilidade de habilidades');
  }
  
  if (scores.locationScore >= 80) {
    reasons.push('Localização muito próxima');
  } else if (scores.locationScore >= 50) {
    reasons.push('Localização próxima');
  }
  
  if (scores.availabilityScore >= 80) {
    reasons.push('Perfeita compatibilidade de horários');
  } else if (scores.availabilityScore >= 60) {
    reasons.push('Boa compatibilidade de horários');
  }
  
  if (scores.interestScore >= 70) {
    reasons.push('Interesses alinhados com a causa');
  }
  
  // Razões baseadas em tipo de voluntariado
  if (scores.volunteerTypeScore >= 90) {
    reasons.push('Perfeita compatibilidade de tipo de voluntariado');
  } else if (scores.volunteerTypeScore >= 70) {
    reasons.push('Boa compatibilidade de tipo de voluntariado');
  } else if (scores.volunteerTypeScore >= 50) {
    reasons.push('Compatibilidade moderada de tipo de voluntariado');
  } else if (scores.volunteerTypeScore === 0) {
    reasons.push('Incompatibilidade de tipo de voluntariado');
  }
  
  // Razões baseadas em requisitos específicos
  if (scores.requirementsScore >= 90) {
    reasons.push('Atende a todos os requisitos específicos');
  } else if (scores.requirementsScore >= 70) {
    reasons.push('Atende à maioria dos requisitos específicos');
  } else if (scores.requirementsScore >= 50) {
    reasons.push('Atende a alguns requisitos específicos');
  } else if (scores.requirementsScore === 0) {
    reasons.push('Não atende aos requisitos obrigatórios');
  }
  
  // Razões específicas baseadas em habilidades
  const matchingSkills = volunteer.skills.filter(skill => 
    opportunity.requiredSkills.includes(skill)
  );
  
  if (matchingSkills.length > 0) {
    reasons.push(`Habilidades em: ${matchingSkills.join(', ')}`);
  }
  
  return reasons;
};

// Encontrar voluntários para uma oportunidade
const findVolunteersForOpportunity = async (opportunityId, filters = {}) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const opportunity = demoOpportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        return {
          success: false,
          error: 'Oportunidade não encontrada'
        };
      }
      
      const matches = [];
      
      for (const volunteer of demoVolunteers) {
        if (!volunteer.isAvailable) {
          continue;
        }
        
        // Calcular pontuações
        const skillScore = calculateSkillScore(
          volunteer.skills,
          volunteer.skillLevels,
          opportunity.requiredSkills,
          opportunity.skillLevels
        );
        
        const locationScore = calculateLocationScore(
          volunteer.latitude,
          volunteer.longitude,
          opportunity.latitude,
          opportunity.longitude
        );
        
        const availabilityScore = calculateAvailabilityScore(
          volunteer.availability,
          {
            weekdays: opportunity.volunteerType === 'ONLINE' ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] : ['saturday', 'sunday'],
            timeSlots: ['morning', 'afternoon'],
            hoursPerWeek: 4
          },
          opportunity.volunteerType
        );
        
        const interestScore = calculateInterestScore(
          volunteer.interests,
          opportunity.categories
        );
        
        // Calcular pontuação de tipo de voluntariado
        const volunteerTypeScore = calculateVolunteerTypeScore(
          volunteer,
          opportunity.volunteerType
        );
        
        // Calcular pontuação de requisitos específicos
        const requirementsScore = await calculateRequirementsScore(volunteer.id, opportunity.id);
        
        // Calcular pontuação total
        const weights = {
          skills: 0.25,
          location: 0.15,
          availability: 0.15,
          interests: 0.1,
          volunteerType: 0.15,
          requirements: 0.2
        };
        
        const totalScore = 
          (skillScore * weights.skills) +
          (locationScore * weights.location) +
          (availabilityScore * weights.availability) +
          (interestScore * weights.interests) +
          (volunteerTypeScore * weights.volunteerType) +
          (requirementsScore * weights.requirements);
        
        // Aplicar filtros
        if (filters.minScore && totalScore < filters.minScore) {
          continue;
        }
        
        matches.push({
          volunteer,
          scores: {
            total: Math.round(totalScore * 100) / 100,
            skills: Math.round(skillScore * 100) / 100,
            location: Math.round(locationScore * 100) / 100,
            availability: Math.round(availabilityScore * 100) / 100,
            interests: Math.round(interestScore * 100) / 100,
            volunteerType: Math.round(volunteerTypeScore * 100) / 100,
            requirements: Math.round(requirementsScore * 100) / 100
          },
          reasons: generateMatchReasons(volunteer, opportunity, {
            skillScore,
            locationScore,
            availabilityScore,
            interestScore,
            volunteerTypeScore,
            requirementsScore
          })
        });
      }
      
      // Ordenar por pontuação total
      matches.sort((a, b) => b.scores.total - a.scores.total);
      
      return {
        success: true,
        data: matches,
        opportunity: opportunity,
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

// Obter estatísticas de matching
const getMatchingStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Modo demonstração
      const stats = {
        totalVolunteers: demoVolunteers.length,
        totalOpportunities: demoOpportunities.length,
        availableVolunteers: demoVolunteers.filter(v => v.isAvailable).length,
        openOpportunities: demoOpportunities.filter(o => o.currentVolunteers < o.maxVolunteers).length,
        averageSkillsPerVolunteer: demoVolunteers.reduce((sum, v) => sum + v.skills.length, 0) / demoVolunteers.length,
        averageRequiredSkillsPerOpportunity: demoOpportunities.reduce((sum, o) => sum + o.requiredSkills.length, 0) / demoOpportunities.length,
        topSkills: getTopSkills(demoVolunteers),
        topCategories: getTopCategories(demoOpportunities)
      };
      
      return {
        success: true,
        data: stats,
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

// Função auxiliar para obter habilidades mais comuns
const getTopSkills = (volunteers) => {
  const skillCount = {};
  volunteers.forEach(volunteer => {
    volunteer.skills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
};

// Função auxiliar para obter categorias mais comuns
const getTopCategories = (opportunities) => {
  const categoryCount = {};
  opportunities.forEach(opportunity => {
    opportunity.categories.forEach(category => {
      const categoryName = typeof category === 'string' ? category : category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));
};

module.exports = {
  findMatches,
  findVolunteersForOpportunity,
  getMatchingStats,
  calculateDistance,
  calculateSkillScore,
  calculateLocationScore,
  calculateAvailabilityScore,
  calculateInterestScore,
  calculateRequirementsScore,
  calculateVolunteerTypeScore
};


