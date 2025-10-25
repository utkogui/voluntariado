const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// Habilidades de demonstração (quando não há banco de dados)
const demoSkills = [
  // Habilidades Técnicas
  { id: '1', name: 'JavaScript', category: 'TECHNICAL', level: 'INTERMEDIATE', description: 'Linguagem de programação JavaScript' },
  { id: '2', name: 'Python', category: 'TECHNICAL', level: 'ADVANCED', description: 'Linguagem de programação Python' },
  { id: '3', name: 'React', category: 'TECHNICAL', level: 'INTERMEDIATE', description: 'Biblioteca React para desenvolvimento web' },
  { id: '4', name: 'Node.js', category: 'TECHNICAL', level: 'INTERMEDIATE', description: 'Runtime JavaScript para backend' },
  { id: '5', name: 'HTML/CSS', category: 'TECHNICAL', level: 'ADVANCED', description: 'Linguagens de marcação e estilo' },
  { id: '6', name: 'SQL', category: 'TECHNICAL', level: 'INTERMEDIATE', description: 'Linguagem de consulta estruturada' },
  { id: '7', name: 'Git', category: 'TECHNICAL', level: 'INTERMEDIATE', description: 'Sistema de controle de versão' },
  { id: '8', name: 'Docker', category: 'TECHNICAL', level: 'BEGINNER', description: 'Plataforma de containerização' },

  // Habilidades de Ensino
  { id: '9', name: 'Ensino de Matemática', category: 'EDUCATION', level: 'ADVANCED', description: 'Ensino de matemática para diferentes níveis' },
  { id: '10', name: 'Ensino de Português', category: 'EDUCATION', level: 'ADVANCED', description: 'Ensino de língua portuguesa' },
  { id: '11', name: 'Alfabetização', category: 'EDUCATION', level: 'EXPERT', description: 'Ensino de alfabetização para adultos' },
  { id: '12', name: 'Ensino de Inglês', category: 'EDUCATION', level: 'INTERMEDIATE', description: 'Ensino de língua inglesa' },
  { id: '13', name: 'Educação Especial', category: 'EDUCATION', level: 'ADVANCED', description: 'Ensino para pessoas com necessidades especiais' },
  { id: '14', name: 'Aulas de Reforço', category: 'EDUCATION', level: 'INTERMEDIATE', description: 'Aulas de reforço escolar' },

  // Habilidades de Saúde
  { id: '15', name: 'Primeiros Socorros', category: 'HEALTH', level: 'INTERMEDIATE', description: 'Técnicas básicas de primeiros socorros' },
  { id: '16', name: 'Cuidados com Idosos', category: 'HEALTH', level: 'ADVANCED', description: 'Cuidados específicos para idosos' },
  { id: '17', name: 'Apoio Psicológico', category: 'HEALTH', level: 'INTERMEDIATE', description: 'Apoio emocional e psicológico' },
  { id: '18', name: 'Nutrição', category: 'HEALTH', level: 'INTERMEDIATE', description: 'Conhecimentos em nutrição e alimentação' },
  { id: '19', name: 'Fisioterapia', category: 'HEALTH', level: 'ADVANCED', description: 'Técnicas de fisioterapia básica' },

  // Habilidades Artísticas
  { id: '20', name: 'Música', category: 'ARTS', level: 'ADVANCED', description: 'Conhecimento musical e instrumentos' },
  { id: '21', name: 'Pintura', category: 'ARTS', level: 'INTERMEDIATE', description: 'Técnicas de pintura e arte visual' },
  { id: '22', name: 'Teatro', category: 'ARTS', level: 'INTERMEDIATE', description: 'Arte dramática e interpretação' },
  { id: '23', name: 'Dança', category: 'ARTS', level: 'ADVANCED', description: 'Diferentes estilos de dança' },
  { id: '24', name: 'Fotografia', category: 'ARTS', level: 'INTERMEDIATE', description: 'Técnicas fotográficas' },

  // Habilidades Esportivas
  { id: '25', name: 'Futebol', category: 'SPORTS', level: 'ADVANCED', description: 'Técnicas e regras do futebol' },
  { id: '26', name: 'Natação', category: 'SPORTS', level: 'INTERMEDIATE', description: 'Técnicas de natação' },
  { id: '27', name: 'Artes Marciais', category: 'SPORTS', level: 'ADVANCED', description: 'Diferentes modalidades de artes marciais' },
  { id: '28', name: 'Yoga', category: 'SPORTS', level: 'INTERMEDIATE', description: 'Práticas de yoga e meditação' },
  { id: '29', name: 'Atletismo', category: 'SPORTS', level: 'INTERMEDIATE', description: 'Modalidades de atletismo' },

  // Habilidades de Comunicação
  { id: '30', name: 'Oratória', category: 'COMMUNICATION', level: 'ADVANCED', description: 'Técnicas de apresentação e fala em público' },
  { id: '31', name: 'Redação', category: 'COMMUNICATION', level: 'ADVANCED', description: 'Técnicas de escrita e redação' },
  { id: '32', name: 'Tradução', category: 'COMMUNICATION', level: 'INTERMEDIATE', description: 'Tradução entre idiomas' },
  { id: '33', name: 'Comunicação Visual', category: 'COMMUNICATION', level: 'INTERMEDIATE', description: 'Design gráfico e comunicação visual' },

  // Habilidades Organizacionais
  { id: '34', name: 'Gestão de Projetos', category: 'MANAGEMENT', level: 'ADVANCED', description: 'Planejamento e execução de projetos' },
  { id: '35', name: 'Liderança', category: 'MANAGEMENT', level: 'ADVANCED', description: 'Habilidades de liderança e coordenação' },
  { id: '36', name: 'Organização de Eventos', category: 'MANAGEMENT', level: 'INTERMEDIATE', description: 'Planejamento e execução de eventos' },
  { id: '37', name: 'Voluntariado', category: 'MANAGEMENT', level: 'EXPERT', description: 'Experiência em atividades voluntárias' },

  // Habilidades Práticas
  { id: '38', name: 'Construção Civil', category: 'PRACTICAL', level: 'INTERMEDIATE', description: 'Técnicas básicas de construção' },
  { id: '39', name: 'Jardinagem', category: 'PRACTICAL', level: 'INTERMEDIATE', description: 'Cuidados com plantas e jardins' },
  { id: '40', name: 'Culinária', category: 'PRACTICAL', level: 'ADVANCED', description: 'Técnicas culinárias e preparo de alimentos' },
  { id: '41', name: 'Costura', category: 'PRACTICAL', level: 'INTERMEDIATE', description: 'Técnicas de costura e reparos' },
  { id: '42', name: 'Mecânica Básica', category: 'PRACTICAL', level: 'BEGINNER', description: 'Reparos básicos em equipamentos' }
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

// Obter todas as habilidades
const getAllSkills = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      return {
        success: true,
        data: demoSkills,
        demo: true
      };
    }

    const skills = await prisma.skill.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return {
      success: true,
      data: skills
    };
  } catch (error) {
    return {
      success: true,
      data: demoSkills,
      demo: true
    };
  }
};

// Obter habilidades por categoria
const getSkillsByCategory = async (category) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const filteredSkills = demoSkills.filter(skill => skill.category === category);
      return {
        success: true,
        data: filteredSkills,
        demo: true
      };
    }

    const skills = await prisma.skill.findMany({
      where: { 
        isActive: true,
        category: category
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: skills
    };
  } catch (error) {
    return {
      success: true,
      data: demoSkills.filter(skill => skill.category === category),
      demo: true
    };
  }
};

// Buscar habilidades por nome
const searchSkills = async (query) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const filteredSkills = demoSkills.filter(skill => 
        skill.name.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        data: filteredSkills,
        demo: true
      };
    }

    const skills = await prisma.skill.findMany({
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
      data: skills
    };
  } catch (error) {
    return {
      success: true,
      data: demoSkills.filter(skill => 
        skill.name.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      ),
      demo: true
    };
  }
};

// Obter categorias de habilidades
const getSkillCategories = async () => {
  const categories = [
    { id: 'TECHNICAL', name: 'Técnicas', description: 'Habilidades técnicas e tecnológicas', icon: '💻', color: '#3498db' },
    { id: 'EDUCATION', name: 'Educação', description: 'Habilidades relacionadas ao ensino', icon: '🎓', color: '#2ecc71' },
    { id: 'HEALTH', name: 'Saúde', description: 'Habilidades na área da saúde', icon: '🏥', color: '#e74c3c' },
    { id: 'ARTS', name: 'Artes', description: 'Habilidades artísticas e criativas', icon: '🎨', color: '#9b59b6' },
    { id: 'SPORTS', name: 'Esportes', description: 'Habilidades esportivas e físicas', icon: '⚽', color: '#f39c12' },
    { id: 'COMMUNICATION', name: 'Comunicação', description: 'Habilidades de comunicação', icon: '💬', color: '#1abc9c' },
    { id: 'MANAGEMENT', name: 'Gestão', description: 'Habilidades de liderança e gestão', icon: '👥', color: '#34495e' },
    { id: 'PRACTICAL', name: 'Práticas', description: 'Habilidades práticas e manuais', icon: '🔧', color: '#e67e22' }
  ];

  return {
    success: true,
    data: categories,
    demo: true
  };
};

// Obter níveis de habilidade
const getSkillLevels = async () => {
  const levels = [
    { id: 'BEGINNER', name: 'Iniciante', description: 'Conhecimento básico', color: '#95a5a6' },
    { id: 'INTERMEDIATE', name: 'Intermediário', description: 'Conhecimento intermediário', color: '#f39c12' },
    { id: 'ADVANCED', name: 'Avançado', description: 'Conhecimento avançado', color: '#e74c3c' },
    { id: 'EXPERT', name: 'Especialista', description: 'Conhecimento especializado', color: '#8e44ad' }
  ];

  return {
    success: true,
    data: levels,
    demo: true
  };
};

// Obter habilidades populares
const getPopularSkills = async (limit = 10) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Simular habilidades populares baseadas em uso
      const popularSkills = demoSkills
        .sort((a, b) => Math.random() - 0.5)
        .slice(0, limit);
      
      return {
        success: true,
        data: popularSkills,
        demo: true
      };
    }

    const skills = await prisma.skill.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            volunteers: true
          }
        }
      },
      orderBy: {
        volunteers: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return {
      success: true,
      data: skills
    };
  } catch (error) {
    return {
      success: true,
      data: demoSkills.slice(0, limit),
      demo: true
    };
  }
};

// Obter estatísticas das habilidades
const getSkillStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // Estatísticas simuladas
      const stats = {
        totalSkills: demoSkills.length,
        skillsByCategory: demoSkills.reduce((acc, skill) => {
          acc[skill.category] = (acc[skill.category] || 0) + 1;
          return acc;
        }, {}),
        skillsByLevel: demoSkills.reduce((acc, skill) => {
          acc[skill.level] = (acc[skill.level] || 0) + 1;
          return acc;
        }, {}),
        mostPopular: demoSkills.slice(0, 5).map(skill => skill.name)
      };
      
      return {
        success: true,
        data: stats,
        demo: true
      };
    }

    const totalSkills = await prisma.skill.count({
      where: { isActive: true }
    });

    const skillsByCategory = await prisma.skill.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    });

    const skillsByLevel = await prisma.skill.groupBy({
      by: ['level'],
      where: { isActive: true },
      _count: true
    });

    return {
      success: true,
      data: {
        totalSkills,
        skillsByCategory: skillsByCategory.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {}),
        skillsByLevel: skillsByLevel.reduce((acc, item) => {
          acc[item.level] = item._count;
          return acc;
        }, {})
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
  getAllSkills,
  getSkillsByCategory,
  searchSkills,
  getSkillCategories,
  getSkillLevels,
  getPopularSkills,
  getSkillStats
};


