// require('dotenv').config(); // Removido para simplificar o servidor de demonstração
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota de categorias de demonstração
app.get('/api/categories', (req, res) => {
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
  
  res.json({
    categories: demoCategories,
    demo: true,
    message: 'Modo demonstração - categorias carregadas com sucesso!'
  });
});

// Buscar categorias
app.get('/api/categories/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }
  
  const demoCategories = [
    { id: '1', name: 'Educação', description: 'Oportunidades relacionadas ao ensino', icon: '🎓', color: '#3498db', isActive: true },
    { id: '2', name: 'Saúde', description: 'Oportunidades na área da saúde', icon: '🏥', color: '#e74c3c', isActive: true },
    { id: '3', name: 'Meio Ambiente', description: 'Projetos de preservação ambiental', icon: '🌱', color: '#27ae60', isActive: true },
    { id: '4', name: 'Assistência Social', description: 'Apoio a pessoas em situação de vulnerabilidade', icon: '🤝', color: '#e67e22', isActive: true },
    { id: '5', name: 'Cultura', description: 'Projetos culturais e artísticos', icon: '🎭', color: '#9b59b6', isActive: true },
    { id: '6', name: 'Esporte', description: 'Projetos esportivos e atividades físicas', icon: '⚽', color: '#27ae60', isActive: true },
    { id: '7', name: 'Tecnologia', description: 'Projetos de inclusão digital e tecnologia', icon: '💻', color: '#3498db', isActive: true },
    { id: '8', name: 'Direitos Humanos', description: 'Defesa e promoção dos direitos humanos', icon: '⚖️', color: '#e74c3c', isActive: true },
    { id: '9', name: 'Proteção Animal', description: 'Cuidado e proteção de animais', icon: '🐕', color: '#e67e22', isActive: true },
    { id: '10', name: 'Emergência', description: 'Apoio em situações de emergência e desastres', icon: '🚨', color: '#e74c3c', isActive: true }
  ];
  
  const filteredCategories = demoCategories.filter(category => 
    category.name.toLowerCase().includes(q.toLowerCase()) ||
    category.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    categories: filteredCategories,
    demo: true,
    query: q
  });
});

// Estatísticas das categorias
app.get('/api/categories/stats', (req, res) => {
  const stats = [
    { name: 'Educação', _count: { institutions: 15, opportunities: 42 } },
    { name: 'Saúde', _count: { institutions: 12, opportunities: 38 } },
    { name: 'Meio Ambiente', _count: { institutions: 8, opportunities: 25 } },
    { name: 'Assistência Social', _count: { institutions: 20, opportunities: 55 } },
    { name: 'Cultura', _count: { institutions: 6, opportunities: 18 } },
    { name: 'Esporte', _count: { institutions: 10, opportunities: 30 } },
    { name: 'Tecnologia', _count: { institutions: 5, opportunities: 22 } },
    { name: 'Direitos Humanos', _count: { institutions: 7, opportunities: 20 } },
    { name: 'Proteção Animal', _count: { institutions: 4, opportunities: 15 } },
    { name: 'Emergência', _count: { institutions: 3, opportunities: 12 } }
  ];
  
  res.json({
    stats: stats,
    demo: true
  });
});

// ===== SISTEMA DE HABILIDADES =====

// Habilidades de demonstração
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

// Obter todas as habilidades
app.get('/api/skills', (req, res) => {
  res.json({
    skills: demoSkills,
    demo: true,
    message: 'Sistema de habilidades carregado com sucesso!'
  });
});

// Obter categorias de habilidades
app.get('/api/skills/categories', (req, res) => {
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
  
  res.json({
    categories: categories,
    demo: true
  });
});

// Obter níveis de habilidade
app.get('/api/skills/levels', (req, res) => {
  const levels = [
    { id: 'BEGINNER', name: 'Iniciante', description: 'Conhecimento básico', color: '#95a5a6' },
    { id: 'INTERMEDIATE', name: 'Intermediário', description: 'Conhecimento intermediário', color: '#f39c12' },
    { id: 'ADVANCED', name: 'Avançado', description: 'Conhecimento avançado', color: '#e74c3c' },
    { id: 'EXPERT', name: 'Especialista', description: 'Conhecimento especializado', color: '#8e44ad' }
  ];
  
  res.json({
    levels: levels,
    demo: true
  });
});

// Buscar habilidades
app.get('/api/skills/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }
  
  const filteredSkills = demoSkills.filter(skill => 
    skill.name.toLowerCase().includes(q.toLowerCase()) ||
    skill.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    skills: filteredSkills,
    query: q,
    demo: true
  });
});

// Obter habilidades por categoria
app.get('/api/skills/category/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['TECHNICAL', 'EDUCATION', 'HEALTH', 'ARTS', 'SPORTS', 'COMMUNICATION', 'MANAGEMENT', 'PRACTICAL'];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria inválida' });
  }
  
  const filteredSkills = demoSkills.filter(skill => skill.category === category);
  
  res.json({
    skills: filteredSkills,
    category: category,
    demo: true
  });
});

// Obter habilidades populares
app.get('/api/skills/popular', (req, res) => {
  const { limit = 10 } = req.query;
  const popularSkills = demoSkills
    .sort((a, b) => Math.random() - 0.5)
    .slice(0, parseInt(limit));
  
  res.json({
    skills: popularSkills,
    demo: true
  });
});

// Obter estatísticas das habilidades
app.get('/api/skills/stats', (req, res) => {
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
  
  res.json({
    stats: stats,
    demo: true
  });
});

// ===== SISTEMA DE LOCALIZAÇÃO =====

// Estados brasileiros
const demoStates = [
  { id: 'AC', name: 'Acre', region: 'Norte', capital: 'Rio Branco' },
  { id: 'AL', name: 'Alagoas', region: 'Nordeste', capital: 'Maceió' },
  { id: 'AP', name: 'Amapá', region: 'Norte', capital: 'Macapá' },
  { id: 'AM', name: 'Amazonas', region: 'Norte', capital: 'Manaus' },
  { id: 'BA', name: 'Bahia', region: 'Nordeste', capital: 'Salvador' },
  { id: 'CE', name: 'Ceará', region: 'Nordeste', capital: 'Fortaleza' },
  { id: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', capital: 'Brasília' },
  { id: 'ES', name: 'Espírito Santo', region: 'Sudeste', capital: 'Vitória' },
  { id: 'GO', name: 'Goiás', region: 'Centro-Oeste', capital: 'Goiânia' },
  { id: 'MA', name: 'Maranhão', region: 'Nordeste', capital: 'São Luís' },
  { id: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', capital: 'Cuiabá' },
  { id: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste', capital: 'Campo Grande' },
  { id: 'MG', name: 'Minas Gerais', region: 'Sudeste', capital: 'Belo Horizonte' },
  { id: 'PA', name: 'Pará', region: 'Norte', capital: 'Belém' },
  { id: 'PB', name: 'Paraíba', region: 'Nordeste', capital: 'João Pessoa' },
  { id: 'PR', name: 'Paraná', region: 'Sul', capital: 'Curitiba' },
  { id: 'PE', name: 'Pernambuco', region: 'Nordeste', capital: 'Recife' },
  { id: 'PI', name: 'Piauí', region: 'Nordeste', capital: 'Teresina' },
  { id: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', capital: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste', capital: 'Natal' },
  { id: 'RS', name: 'Rio Grande do Sul', region: 'Sul', capital: 'Porto Alegre' },
  { id: 'RO', name: 'Rondônia', region: 'Norte', capital: 'Porto Velho' },
  { id: 'RR', name: 'Roraima', region: 'Norte', capital: 'Boa Vista' },
  { id: 'SC', name: 'Santa Catarina', region: 'Sul', capital: 'Florianópolis' },
  { id: 'SP', name: 'São Paulo', region: 'Sudeste', capital: 'São Paulo' },
  { id: 'SE', name: 'Sergipe', region: 'Nordeste', capital: 'Aracaju' },
  { id: 'TO', name: 'Tocantins', region: 'Norte', capital: 'Palmas' }
];

// Cidades principais
const demoCities = [
  // São Paulo
  { id: '1', name: 'São Paulo', state: 'SP', region: 'Sudeste', population: 12396372, coordinates: { lat: -23.5505, lng: -46.6333 } },
  { id: '2', name: 'Guarulhos', state: 'SP', region: 'Sudeste', population: 1392121, coordinates: { lat: -23.4538, lng: -46.5333 } },
  { id: '3', name: 'Campinas', state: 'SP', region: 'Sudeste', population: 1223237, coordinates: { lat: -22.9056, lng: -47.0608 } },
  { id: '4', name: 'São Bernardo do Campo', state: 'SP', region: 'Sudeste', population: 844483, coordinates: { lat: -23.6939, lng: -46.5650 } },
  { id: '5', name: 'Santo André', state: 'SP', region: 'Sudeste', population: 721368, coordinates: { lat: -23.6639, lng: -46.5383 } },
  
  // Rio de Janeiro
  { id: '6', name: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste', population: 6747815, coordinates: { lat: -22.9068, lng: -43.1729 } },
  { id: '7', name: 'Nova Iguaçu', state: 'RJ', region: 'Sudeste', population: 823302, coordinates: { lat: -22.7559, lng: -43.4606 } },
  { id: '8', name: 'Niterói', state: 'RJ', region: 'Sudeste', population: 515317, coordinates: { lat: -22.8833, lng: -43.1036 } },
  
  // Minas Gerais
  { id: '9', name: 'Belo Horizonte', state: 'MG', region: 'Sudeste', population: 2530701, coordinates: { lat: -19.9167, lng: -43.9345 } },
  { id: '10', name: 'Uberlândia', state: 'MG', region: 'Sudeste', population: 699097, coordinates: { lat: -18.9186, lng: -48.2772 } },
  { id: '11', name: 'Contagem', state: 'MG', region: 'Sudeste', population: 668949, coordinates: { lat: -19.9167, lng: -44.0833 } },
  
  // Bahia
  { id: '12', name: 'Salvador', state: 'BA', region: 'Nordeste', population: 2886698, coordinates: { lat: -12.9714, lng: -38.5014 } },
  { id: '13', name: 'Feira de Santana', state: 'BA', region: 'Nordeste', population: 619609, coordinates: { lat: -12.2667, lng: -38.9667 } },
  
  // Ceará
  { id: '14', name: 'Fortaleza', state: 'CE', region: 'Nordeste', population: 2703391, coordinates: { lat: -3.7172, lng: -38.5434 } },
  { id: '15', name: 'Caucaia', state: 'CE', region: 'Nordeste', population: 368918, coordinates: { lat: -3.7333, lng: -38.6667 } },
  
  // Paraná
  { id: '16', name: 'Curitiba', state: 'PR', region: 'Sul', population: 1963726, coordinates: { lat: -25.4244, lng: -49.2654 } },
  { id: '17', name: 'Londrina', state: 'PR', region: 'Sul', population: 575377, coordinates: { lat: -23.3103, lng: -51.1628 } },
  
  // Rio Grande do Sul
  { id: '18', name: 'Porto Alegre', state: 'RS', region: 'Sul', population: 1492530, coordinates: { lat: -30.0346, lng: -51.2177 } },
  { id: '19', name: 'Caxias do Sul', state: 'RS', region: 'Sul', population: 517451, coordinates: { lat: -29.1681, lng: -51.1794 } },
  
  // Pernambuco
  { id: '20', name: 'Recife', state: 'PE', region: 'Nordeste', population: 1653461, coordinates: { lat: -8.0476, lng: -34.8770 } },
  { id: '21', name: 'Jaboatão dos Guararapes', state: 'PE', region: 'Nordeste', population: 706867, coordinates: { lat: -8.1128, lng: -35.0147 } },
  
  // Distrito Federal
  { id: '22', name: 'Brasília', state: 'DF', region: 'Centro-Oeste', population: 3094325, coordinates: { lat: -15.7801, lng: -47.9292 } },
  
  // Goiás
  { id: '23', name: 'Goiânia', state: 'GO', region: 'Centro-Oeste', population: 1555626, coordinates: { lat: -16.6864, lng: -49.2643 } },
  
  // Pará
  { id: '24', name: 'Belém', state: 'PA', region: 'Norte', population: 1506420, coordinates: { lat: -1.4558, lng: -48.5044 } },
  
  // Amazonas
  { id: '25', name: 'Manaus', state: 'AM', region: 'Norte', population: 2255903, coordinates: { lat: -3.1190, lng: -60.0217 } }
];

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

// Obter todos os estados
app.get('/api/location/states', (req, res) => {
  res.json({
    states: demoStates,
    demo: true,
    message: 'Sistema de localização carregado com sucesso!'
  });
});

// Obter cidades por estado
app.get('/api/location/cities/state/:stateId', (req, res) => {
  const { stateId } = req.params;
  const filteredCities = demoCities.filter(city => city.state === stateId);
  
  res.json({
    cities: filteredCities,
    state: stateId,
    demo: true
  });
});

// Buscar cidades
app.get('/api/location/cities/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }
  
  const filteredCities = demoCities.filter(city => 
    city.name.toLowerCase().includes(q.toLowerCase()) ||
    city.state.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    cities: filteredCities,
    query: q,
    demo: true
  });
});

// Buscar cidades próximas
app.get('/api/location/cities/nearby', (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseInt(radius);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Latitude e longitude devem ser números válidos' });
  }

  const nearbyCities = demoCities.filter(city => {
    if (!city.coordinates) return false;
    const distance = calculateDistance(latitude, longitude, city.coordinates.lat, city.coordinates.lng);
    return distance <= radiusKm;
  }).map(city => ({
    ...city,
    distance: calculateDistance(latitude, longitude, city.coordinates.lat, city.coordinates.lng)
  })).sort((a, b) => a.distance - b.distance);
  
  res.json({
    cities: nearbyCities,
    center: { lat: latitude, lng: longitude },
    radius: radiusKm,
    demo: true
  });
});

// Obter estatísticas de localização
app.get('/api/location/stats', (req, res) => {
  const stats = {
    totalStates: demoStates.length,
    totalCities: demoCities.length,
    citiesByRegion: demoCities.reduce((acc, city) => {
      acc[city.region] = (acc[city.region] || 0) + 1;
      return acc;
    }, {}),
    citiesByState: demoCities.reduce((acc, city) => {
      acc[city.state] = (acc[city.state] || 0) + 1;
      return acc;
    }, {}),
    mostPopulatedCities: demoCities
      .sort((a, b) => b.population - a.population)
      .slice(0, 10)
      .map(city => ({ name: city.name, state: city.state, population: city.population }))
  };
  
  res.json({
    stats: stats,
    demo: true
  });
});

// Validar CEP
app.get('/api/location/cep/:cep', (req, res) => {
  const { cep } = req.params;
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) {
    return res.status(400).json({ error: 'CEP deve ter 8 dígitos' });
  }

  // Simulação de validação de CEP
  const mockAddress = {
    cep: cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2'),
    logradouro: 'Rua Exemplo',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  };

  res.json({
    address: mockAddress,
    demo: true
  });
});

// Calcular distância entre duas coordenadas
app.get('/api/location/distance', (req, res) => {
  const { lat1, lng1, lat2, lng2 } = req.query;
  
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return res.status(400).json({ error: 'Todas as coordenadas são obrigatórias' });
  }

  const latitude1 = parseFloat(lat1);
  const longitude1 = parseFloat(lng1);
  const latitude2 = parseFloat(lat2);
  const longitude2 = parseFloat(lng2);

  if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
    return res.status(400).json({ error: 'Todas as coordenadas devem ser números válidos' });
  }

  const distance = calculateDistance(latitude1, longitude1, latitude2, longitude2);

  res.json({
    distance: Math.round(distance * 100) / 100,
    unit: 'km',
    coordinates: {
      from: { lat: latitude1, lng: longitude1 },
      to: { lat: latitude2, lng: longitude2 }
    }
  });
});

// ===== SISTEMA DE EMAIL =====

// Enviar email de verificação
app.post('/api/email/send-verification', (req, res) => {
  const { email, userType } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Simular envio de email
  console.log('📧 [DEMO] Email de verificação enviado para:', email);
  console.log('👤 Tipo de usuário:', userType || 'voluntário');
  console.log('🔗 Link de verificação: http://localhost:3000/verify-email?token=demo-token-123');

  res.json({
    message: 'Email de verificação enviado com sucesso',
    demo: true
  });
});

// Verificar email com token
app.get('/api/email/verify/:token', (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }

  // Simular verificação de email
  console.log('✅ [DEMO] Email verificado com token:', token);

  res.json({
    message: 'Email verificado com sucesso',
    demo: true
  });
});

// Solicitar redefinição de senha
app.post('/api/email/request-password-reset', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Simular solicitação de redefinição
  console.log('📧 [DEMO] Email de redefinição enviado para:', email);
  console.log('🔗 Link de redefinição: http://localhost:3000/reset-password?token=demo-reset-token-456');

  res.json({
    message: 'Email de redefinição enviado com sucesso',
    demo: true
  });
});

// Verificar token de redefinição de senha
app.get('/api/email/verify-password-reset/:token', (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }

  // Simular verificação de token
  console.log('✅ [DEMO] Token de redefinição verificado:', token);

  res.json({
    message: 'Token válido',
    userId: 'demo-user-id',
    demo: true
  });
});

// Redefinir senha com token
app.post('/api/email/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
  }

  // Simular redefinição de senha
  console.log('🔐 [DEMO] Senha redefinida com token:', token);
  console.log('🔑 Nova senha (hash):', '***' + newPassword.slice(-3));

  res.json({
    message: 'Senha redefinida com sucesso',
    demo: true
  });
});

// Reenviar email de verificação
app.post('/api/email/resend-verification', (req, res) => {
  const { email, userType } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Simular reenvio de email
  console.log('📧 [DEMO] Email de verificação reenviado para:', email);
  console.log('👤 Tipo de usuário:', userType || 'voluntário');
  console.log('🔗 Link de verificação: http://localhost:3000/verify-email?token=demo-token-789');

  res.json({
    message: 'Email de verificação reenviado com sucesso',
    demo: true
  });
});

// Testar envio de email
app.post('/api/email/test', (req, res) => {
  const { email, type = 'verification' } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Simular teste de email
  console.log(`📧 [DEMO] Email de ${type} enviado para:`, email);
  console.log('🔗 Link:', `http://localhost:3000/${type === 'verification' ? 'verify-email' : 'reset-password'}?token=test-token-${Date.now()}`);

  res.json({
    message: `Email de ${type} enviado com sucesso`,
    demo: true
  });
});

// ===== SISTEMA DE OPORTUNIDADES =====

// Oportunidades de demonstração
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
  }
];

// Obter todas as oportunidades
app.get('/api/opportunities', (req, res) => {
  let filteredOpportunities = [...demoOpportunities];
  
  // Aplicar filtros
  if (req.query.status) {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.status === req.query.status);
  }
  
  if (req.query.volunteerType) {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.volunteerType === req.query.volunteerType);
  }
  
  if (req.query.city) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.city && opp.city.toLowerCase().includes(req.query.city.toLowerCase())
    );
  }
  
  if (req.query.category) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.categories.some(cat => cat.name.toLowerCase().includes(req.query.category.toLowerCase()))
    );
  }
  
  if (req.query.skill) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.requiredSkills.some(skill => skill.toLowerCase().includes(req.query.skill.toLowerCase()))
    );
  }
  
  if (req.query.isRemote !== undefined) {
    const isRemote = req.query.isRemote === 'true';
    filteredOpportunities = filteredOpportunities.filter(opp => opp.isRemote === isRemote);
  }

  res.json({
    opportunities: filteredOpportunities,
    filters: req.query,
    demo: true
  });
});

// Obter oportunidade por ID
app.get('/api/opportunities/:id', (req, res) => {
  const { id } = req.params;
  const opportunity = demoOpportunities.find(opp => opp.id === id);
  
  if (!opportunity) {
    return res.status(404).json({ error: 'Oportunidade não encontrada' });
  }

  res.json({
    opportunity: opportunity,
    demo: true
  });
});

// Buscar oportunidades
app.get('/api/opportunities/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }

  const filteredOpportunities = demoOpportunities.filter(opp => 
    opp.title.toLowerCase().includes(q.toLowerCase()) ||
    opp.description.toLowerCase().includes(q.toLowerCase()) ||
    opp.requirements?.toLowerCase().includes(q.toLowerCase()) ||
    opp.requiredSkills.some(skill => skill.toLowerCase().includes(q.toLowerCase()))
  );

  res.json({
    opportunities: filteredOpportunities,
    query: q,
    demo: true
  });
});

// Obter oportunidades por categoria
app.get('/api/opportunities/category/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const filteredOpportunities = demoOpportunities.filter(opp => 
    opp.categories.some(cat => cat.id === categoryId)
  );

  res.json({
    opportunities: filteredOpportunities,
    categoryId: categoryId,
    demo: true
  });
});

// Obter oportunidades próximas
app.get('/api/opportunities/nearby', (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseInt(radius);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Latitude e longitude devem ser números válidos' });
  }

  // Função para calcular distância
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const nearbyOpportunities = demoOpportunities.filter(opp => {
    if (!opp.latitude || !opp.longitude) return false;
    const distance = calculateDistance(latitude, longitude, opp.latitude, opp.longitude);
    return distance <= radiusKm;
  }).map(opp => ({
    ...opp,
    distance: Math.round(calculateDistance(latitude, longitude, opp.latitude, opp.longitude) * 100) / 100
  })).sort((a, b) => a.distance - b.distance);

  res.json({
    opportunities: nearbyOpportunities,
    center: { lat: latitude, lng: longitude },
    radius: radiusKm,
    demo: true
  });
});

// Obter estatísticas das oportunidades
app.get('/api/opportunities/stats', (req, res) => {
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

  res.json({
    stats: stats,
    demo: true
  });
});

// Criar nova oportunidade (simulação)
app.post('/api/opportunities', (req, res) => {
  const opportunityData = req.body;
  
  const newOpportunity = {
    id: 'demo-' + Date.now(),
    ...opportunityData,
    currentVolunteers: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('📝 [DEMO] Nova oportunidade criada:', newOpportunity.title);

  res.status(201).json({
    message: 'Oportunidade criada com sucesso (modo demonstração)',
    opportunity: newOpportunity,
    demo: true
  });
});

// ===== SISTEMA DE MATCHING =====

// Dados de demonstração para voluntários
const demoVolunteers = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@email.com',
    skills: ['Ensino', 'Matemática', 'Português', 'Paciência'],
    interests: ['Educação', 'Assistência Social'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    isAvailable: true
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Santos',
    email: 'carlos.santos@email.com',
    skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git'],
    interests: ['Tecnologia', 'Proteção Animal'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5615,
    longitude: -46.6565,
    isAvailable: true
  },
  {
    id: '3',
    firstName: 'Maria',
    lastName: 'Oliveira',
    email: 'maria.oliveira@email.com',
    skills: ['Organização de Eventos', 'Comunicação', 'Liderança', 'Marketing'],
    interests: ['Assistência Social', 'Alimentação'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5475,
    longitude: -46.6361,
    isAvailable: true
  }
];

// Função para calcular distância (reutilizando a existente)

// Encontrar matches para um voluntário
app.get('/api/matching/volunteer/:volunteerId/matches', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteers.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
  }

  const matches = [];
  
  for (const opportunity of demoOpportunities) {
    if (opportunity.currentVolunteers >= opportunity.maxVolunteers) {
      continue;
    }

    // Calcular pontuação de habilidades
    const matchingSkills = volunteer.skills.filter(skill => 
      opportunity.requiredSkills.includes(skill)
    );
    const skillScore = (matchingSkills.length / opportunity.requiredSkills.length) * 100;

    // Calcular pontuação de localização
    let locationScore = 0;
    if (volunteer.latitude && volunteer.longitude && opportunity.latitude && opportunity.longitude) {
      const distance = calculateDistance(
        volunteer.latitude, volunteer.longitude,
        opportunity.latitude, opportunity.longitude
      );
      locationScore = Math.max(0, 100 - (distance / 50) * 100);
    }

    // Calcular pontuação de interesses
    const matchingInterests = volunteer.interests.filter(interest =>
      opportunity.categories.some(cat => 
        cat.name.toLowerCase().includes(interest.toLowerCase())
      )
    );
    const interestScore = (matchingInterests.length / opportunity.categories.length) * 100;

    // Pontuação total
    const totalScore = (skillScore * 0.5) + (locationScore * 0.3) + (interestScore * 0.2);

    matches.push({
      opportunity,
      scores: {
        total: Math.round(totalScore * 100) / 100,
        skills: Math.round(skillScore * 100) / 100,
        location: Math.round(locationScore * 100) / 100,
        interests: Math.round(interestScore * 100) / 100
      },
      reasons: [
        `Habilidades em: ${matchingSkills.join(', ')}`,
        locationScore > 50 ? 'Localização próxima' : 'Localização distante',
        interestScore > 50 ? 'Interesses alinhados' : 'Interesses diferentes'
      ]
    });
  }

  // Ordenar por pontuação total
  matches.sort((a, b) => b.scores.total - a.scores.total);

  res.json({
    matches: matches,
    volunteer: volunteer,
    totalMatches: matches.length,
    demo: true
  });
});

// Encontrar voluntários para uma oportunidade
app.get('/api/matching/opportunity/:opportunityId/volunteers', (req, res) => {
  const { opportunityId } = req.params;
  const opportunity = demoOpportunities.find(o => o.id === opportunityId);
  
  if (!opportunity) {
    return res.status(404).json({ error: 'Oportunidade não encontrada' });
  }

  const matches = [];
  
  for (const volunteer of demoVolunteers) {
    if (!volunteer.isAvailable) {
      continue;
    }

    // Calcular pontuação de habilidades
    const matchingSkills = volunteer.skills.filter(skill => 
      opportunity.requiredSkills.includes(skill)
    );
    const skillScore = (matchingSkills.length / opportunity.requiredSkills.length) * 100;

    // Calcular pontuação de localização
    let locationScore = 0;
    if (volunteer.latitude && volunteer.longitude && opportunity.latitude && opportunity.longitude) {
      const distance = calculateDistance(
        volunteer.latitude, volunteer.longitude,
        opportunity.latitude, opportunity.longitude
      );
      locationScore = Math.max(0, 100 - (distance / 50) * 100);
    }

    // Calcular pontuação de interesses
    const matchingInterests = volunteer.interests.filter(interest =>
      opportunity.categories.some(cat => 
        cat.name.toLowerCase().includes(interest.toLowerCase())
      )
    );
    const interestScore = (matchingInterests.length / opportunity.categories.length) * 100;

    // Pontuação total
    const totalScore = (skillScore * 0.5) + (locationScore * 0.3) + (interestScore * 0.2);

    matches.push({
      volunteer,
      scores: {
        total: Math.round(totalScore * 100) / 100,
        skills: Math.round(skillScore * 100) / 100,
        location: Math.round(locationScore * 100) / 100,
        interests: Math.round(interestScore * 100) / 100
      },
      reasons: [
        `Habilidades em: ${matchingSkills.join(', ')}`,
        locationScore > 50 ? 'Localização próxima' : 'Localização distante',
        interestScore > 50 ? 'Interesses alinhados' : 'Interesses diferentes'
      ]
    });
  }

  // Ordenar por pontuação total
  matches.sort((a, b) => b.scores.total - a.scores.total);

  res.json({
    matches: matches,
    opportunity: opportunity,
    totalMatches: matches.length,
    demo: true
  });
});

// Obter estatísticas de matching
app.get('/api/matching/stats', (req, res) => {
  const stats = {
    totalVolunteers: demoVolunteers.length,
    totalOpportunities: demoOpportunities.length,
    availableVolunteers: demoVolunteers.filter(v => v.isAvailable).length,
    openOpportunities: demoOpportunities.filter(o => o.currentVolunteers < o.maxVolunteers).length,
    averageSkillsPerVolunteer: demoVolunteers.reduce((sum, v) => sum + v.skills.length, 0) / demoVolunteers.length,
    averageRequiredSkillsPerOpportunity: demoOpportunities.reduce((sum, o) => sum + o.requiredSkills.length, 0) / demoOpportunities.length
  };

  res.json({
    stats: stats,
    demo: true
  });
});

// Calcular compatibilidade entre voluntário e oportunidade
app.get('/api/matching/compatibility/:volunteerId/:opportunityId', (req, res) => {
  const { volunteerId, opportunityId } = req.params;
  
  const volunteer = demoVolunteers.find(v => v.id === volunteerId);
  const opportunity = demoOpportunities.find(o => o.id === opportunityId);
  
  if (!volunteer || !opportunity) {
    return res.status(404).json({ error: 'Voluntário ou oportunidade não encontrado' });
  }

  // Calcular pontuações
  const matchingSkills = volunteer.skills.filter(skill => 
    opportunity.requiredSkills.includes(skill)
  );
  const skillScore = (matchingSkills.length / opportunity.requiredSkills.length) * 100;

  let locationScore = 0;
  if (volunteer.latitude && volunteer.longitude && opportunity.latitude && opportunity.longitude) {
    const distance = calculateDistance(
      volunteer.latitude, volunteer.longitude,
      opportunity.latitude, opportunity.longitude
    );
    locationScore = Math.max(0, 100 - (distance / 50) * 100);
  }

  const matchingInterests = volunteer.interests.filter(interest =>
    opportunity.categories.some(cat => 
      cat.name.toLowerCase().includes(interest.toLowerCase())
    )
  );
  const interestScore = (matchingInterests.length / opportunity.categories.length) * 100;

  const totalScore = (skillScore * 0.5) + (locationScore * 0.3) + (interestScore * 0.2);

  res.json({
    volunteerId,
    opportunityId,
    scores: {
      total: Math.round(totalScore * 100) / 100,
      skills: Math.round(skillScore * 100) / 100,
      location: Math.round(locationScore * 100) / 100,
      interests: Math.round(interestScore * 100) / 100
    },
    reasons: [
      `Habilidades em: ${matchingSkills.join(', ')}`,
      locationScore > 50 ? 'Localização próxima' : 'Localização distante',
      interestScore > 50 ? 'Interesses alinhados' : 'Interesses diferentes'
    ],
    recommendation: totalScore >= 80 ? 'Alta compatibilidade' : 
                   totalScore >= 60 ? 'Boa compatibilidade' : 
                   totalScore >= 40 ? 'Compatibilidade moderada' : 'Baixa compatibilidade',
    demo: true
  });
});

// ===== SISTEMA DE BUSCA AVANÇADA =====

// Busca avançada de oportunidades
app.get('/api/search/advanced', (req, res) => {
  let filteredOpportunities = [...demoOpportunities];
  
  // Aplicar filtros
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.title.toLowerCase().includes(query) ||
      opp.description.toLowerCase().includes(query) ||
      opp.requirements?.toLowerCase().includes(query) ||
      opp.benefits?.toLowerCase().includes(query) ||
      opp.requiredSkills.some(skill => skill.toLowerCase().includes(query))
    );
  }
  
  if (req.query.status) {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.status === req.query.status);
  }
  
  if (req.query.volunteerType) {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.volunteerType === req.query.volunteerType);
  }
  
  if (req.query.city) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.city && opp.city.toLowerCase().includes(req.query.city.toLowerCase())
    );
  }
  
  if (req.query.state) {
    filteredOpportunities = filteredOpportunities.filter(opp => opp.state === req.query.state);
  }
  
  if (req.query.category) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.categories.some(cat => cat.name.toLowerCase().includes(req.query.category.toLowerCase()))
    );
  }
  
  if (req.query.skill) {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.requiredSkills.some(skill => skill.toLowerCase().includes(req.query.skill.toLowerCase()))
    );
  }
  
  if (req.query.isRemote !== undefined) {
    const isRemote = req.query.isRemote === 'true';
    filteredOpportunities = filteredOpportunities.filter(opp => opp.isRemote === isRemote);
  }
  
  if (req.query.needsDonations !== undefined) {
    const needsDonations = req.query.needsDonations === 'true';
    filteredOpportunities = filteredOpportunities.filter(opp => opp.needsDonations === needsDonations);
  }
  
  if (req.query.hasAvailableSlots === 'true') {
    filteredOpportunities = filteredOpportunities.filter(opp => 
      opp.currentVolunteers < opp.maxVolunteers
    );
  }
  
  // Ordenação
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
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
    }
  }
  
  // Paginação
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const paginatedOpportunities = filteredOpportunities.slice(offset, offset + limit);
  
  res.json({
    opportunities: paginatedOpportunities,
    pagination: {
      page,
      limit,
      total: filteredOpportunities.length,
      totalPages: Math.ceil(filteredOpportunities.length / limit),
      hasNext: page < Math.ceil(filteredOpportunities.length / limit),
      hasPrev: page > 1
    },
    filters: req.query,
    demo: true
  });
});

// Obter sugestões de busca
app.get('/api/search/suggestions', (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }

  const suggestions = {
    opportunities: [],
    categories: [],
    skills: [],
    cities: []
  };
  
  const searchQuery = q.toLowerCase();
  
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

  res.json({
    suggestions: suggestions,
    query: q,
    demo: true
  });
});

// Obter filtros disponíveis
app.get('/api/search/filters', (req, res) => {
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

  res.json({
    filters: filters,
    demo: true
  });
});

// Obter tags populares
app.get('/api/search/tags/popular', (req, res) => {
  const { limit = 20 } = req.query;
  
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
    .slice(0, parseInt(limit))
    .map(([tag, count]) => ({ tag, count }));

  res.json({
    tags: popularTags,
    demo: true
  });
});

// Busca rápida
app.get('/api/search/quick', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
  }

  const query = q.toLowerCase();
  const filteredOpportunities = demoOpportunities.filter(opp => 
    opp.title.toLowerCase().includes(query) ||
    opp.description.toLowerCase().includes(query) ||
    opp.requiredSkills.some(skill => skill.toLowerCase().includes(query))
  ).slice(0, 10);

  res.json({
    opportunities: filteredOpportunities,
    query: q,
    total: filteredOpportunities.length,
    demo: true
  });
});

// ===== SISTEMA DE RECOMENDAÇÕES PERSONALIZADAS =====

// Dados de demonstração para voluntários com histórico
const demoVolunteersWithHistory = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'Silva',
    skills: ['Ensino', 'Matemática', 'Português', 'Paciência'],
    interests: ['Educação', 'Assistência Social'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    preferences: {
      maxDistance: 30,
      preferredDays: ['saturday', 'sunday'],
      preferredTimeSlots: ['morning'],
      preferredCategories: ['Educação', 'Assistência Social'],
      avoidCategories: []
    },
    history: {
      appliedOpportunities: ['1', '3'],
      completedOpportunities: ['2'],
      favoritedOpportunities: ['1', '4'],
      rejectedOpportunities: ['5']
    }
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Santos',
    skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git'],
    interests: ['Tecnologia', 'Proteção Animal'],
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5615,
    longitude: -46.6565,
    preferences: {
      maxDistance: 50,
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      preferredTimeSlots: ['evening'],
      preferredCategories: ['Tecnologia', 'Proteção Animal'],
      avoidCategories: ['Educação']
    },
    history: {
      appliedOpportunities: ['2'],
      completedOpportunities: [],
      favoritedOpportunities: ['2'],
      rejectedOpportunities: ['1', '3']
    }
  }
];

// Recomendações personalizadas
app.get('/api/recommendations/volunteer/:volunteerId/personalized', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteersWithHistory.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
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

    if (score > 0.3) {
      recommendations.push({
        opportunity,
        score: Math.round(score * 100) / 100,
        reasons,
        type: 'personalized'
      });
    }
  }

  // Ordenar por pontuação
  recommendations.sort((a, b) => b.score - a.score);

  res.json({
    recommendations: recommendations,
    volunteerId: volunteerId,
    total: recommendations.length,
    demo: true
  });
});

// Recomendações colaborativas
app.get('/api/recommendations/volunteer/:volunteerId/collaborative', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteersWithHistory.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
  }

  // Encontrar voluntários similares
  const similarVolunteers = demoVolunteersWithHistory
    .filter(v => v.id !== volunteerId)
    .map(otherVolunteer => {
      const commonInterests = volunteer.interests.filter(interest => 
        otherVolunteer.interests.includes(interest)
      ).length;
      
      const commonSkills = volunteer.skills.filter(skill => 
        otherVolunteer.skills.includes(skill)
      ).length;
      
      const similarity = (commonInterests + commonSkills) / (volunteer.interests.length + volunteer.skills.length);
      
      return { volunteer: otherVolunteer, similarity };
    })
    .filter(item => item.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 2);

  const recommendations = [];
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
      recommendations.push({
        opportunity: opp,
        score: Math.round(similar.similarity * 100) / 100,
        reasons: [`Voluntário similar (${similar.volunteer.firstName}) também gostou`],
        type: 'collaborative'
      });
    });
  }

  // Remover duplicatas e ordenar
  const uniqueRecommendations = recommendations.filter((rec, index, self) => 
    index === self.findIndex(r => r.opportunity.id === rec.opportunity.id)
  ).sort((a, b) => b.score - a.score);

  res.json({
    recommendations: uniqueRecommendations,
    volunteerId: volunteerId,
    type: 'collaborative',
    total: uniqueRecommendations.length,
    demo: true
  });
});

// Estatísticas de recomendações
app.get('/api/recommendations/volunteer/:volunteerId/stats', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteersWithHistory.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
  }

  const stats = {
    totalRecommendations: 15,
    recommendationsByType: {
      'personalized': 8,
      'collaborative': 4,
      'trending': 2,
      'urgent': 1
    },
    averageScore: 0.72,
    topCategories: [
      { category: 'Educação', count: 5 },
      { category: 'Assistência Social', count: 4 },
      { category: 'Tecnologia', count: 3 }
    ],
    topSkills: [
      { skill: 'Ensino', count: 6 },
      { skill: 'Comunicação', count: 4 },
      { skill: 'Matemática', count: 3 }
    ],
    lastUpdated: new Date()
  };

  res.json({
    stats: stats,
    volunteerId: volunteerId,
    demo: true
  });
});

// Recomendações em alta
app.get('/api/recommendations/volunteer/:volunteerId/trending', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteersWithHistory.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
  }

  const alreadySeen = new Set([
    ...volunteer.history.appliedOpportunities,
    ...volunteer.history.favoritedOpportunities,
    ...volunteer.history.rejectedOpportunities
  ]);

  const trendingOpportunities = demoOpportunities
    .filter(opp => !alreadySeen.has(opp.id))
    .filter(opp => opp.popularityScore >= 7.0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 5)
    .map(opp => ({
      opportunity: opp,
      score: Math.round((opp.popularityScore / 10) * 100) / 100,
      reasons: ['Oportunidade em alta', 'Muitos voluntários interessados'],
      type: 'trending'
    }));

  res.json({
    recommendations: trendingOpportunities,
    volunteerId: volunteerId,
    type: 'trending',
    total: trendingOpportunities.length,
    demo: true
  });
});

// Recomendações urgentes
app.get('/api/recommendations/volunteer/:volunteerId/urgent', (req, res) => {
  const { volunteerId } = req.params;
  const volunteer = demoVolunteersWithHistory.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Voluntário não encontrado' });
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
      return daysUntilStart <= 7 && daysUntilStart >= 0;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5)
    .map(opp => {
      const startDate = new Date(opp.startDate);
      const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        opportunity: opp,
        score: Math.round((0.8 - (daysUntilStart / 7) * 0.3) * 100) / 100,
        reasons: [`Inicia em ${daysUntilStart} dias`, 'Oportunidade urgente'],
        type: 'urgent'
      };
    });

  res.json({
    recommendations: urgentOpportunities,
    volunteerId: volunteerId,
    type: 'urgent',
    total: urgentOpportunities.length,
    demo: true
  });
});

// ===== SISTEMA DE FAVORITOS =====

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

// Obter favoritos de um voluntário
app.get('/api/favorites/volunteer/:volunteerId', (req, res) => {
  const { volunteerId } = req.params;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.opportunity.title;
        bValue = b.opportunity.title;
        break;
      case 'volunteerType':
        aValue = a.opportunity.volunteerType;
        bValue = b.opportunity.volunteerType;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  // Paginação
  const offset = (page - 1) * limit;
  const paginatedFavorites = volunteerFavorites.slice(offset, offset + parseInt(limit));

  res.json({
    favorites: paginatedFavorites,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: volunteerFavorites.length,
      totalPages: Math.ceil(volunteerFavorites.length / limit),
      hasNext: page < Math.ceil(volunteerFavorites.length / limit),
      hasPrev: page > 1
    },
    volunteerId: volunteerId,
    demo: true
  });
});

// Adicionar favorito
app.post('/api/favorites/volunteer/:volunteerId/opportunity/:opportunityId', (req, res) => {
  const { volunteerId, opportunityId } = req.params;
  const { notes = '' } = req.body;

  const existingFavorite = demoFavorites.find(fav => 
    fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
  );
  
  if (existingFavorite) {
    return res.status(400).json({ error: 'Oportunidade já está nos favoritos' });
  }

  const opportunity = demoOpportunities.find(opp => opp.id === opportunityId);
  if (!opportunity) {
    return res.status(404).json({ error: 'Oportunidade não encontrada' });
  }

  const newFavorite = {
    id: `fav-${Date.now()}`,
    volunteerId,
    opportunityId,
    createdAt: new Date(),
    notes: notes.trim()
  };

  demoFavorites.push(newFavorite);

  res.status(201).json({
    message: 'Oportunidade adicionada aos favoritos com sucesso',
    favorite: {
      ...newFavorite,
      opportunity: opportunity
    },
    demo: true
  });
});

// Remover favorito
app.delete('/api/favorites/volunteer/:volunteerId/opportunity/:opportunityId', (req, res) => {
  const { volunteerId, opportunityId } = req.params;

  const favoriteIndex = demoFavorites.findIndex(fav => 
    fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
  );
  
  if (favoriteIndex === -1) {
    return res.status(404).json({ error: 'Favorito não encontrado' });
  }

  const removedFavorite = demoFavorites.splice(favoriteIndex, 1)[0];

  res.json({
    message: 'Oportunidade removida dos favoritos com sucesso',
    favorite: removedFavorite,
    demo: true
  });
});

// Verificar se é favorito
app.get('/api/favorites/volunteer/:volunteerId/opportunity/:opportunityId/status', (req, res) => {
  const { volunteerId, opportunityId } = req.params;

  const favorite = demoFavorites.find(fav => 
    fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
  );

  res.json({
    isFavorite: !!favorite,
    favorite: favorite || null,
    volunteerId: volunteerId,
    opportunityId: opportunityId,
    demo: true
  });
});

// Alternar favorito
app.post('/api/favorites/volunteer/:volunteerId/opportunity/:opportunityId/toggle', (req, res) => {
  const { volunteerId, opportunityId } = req.params;
  const { notes = '' } = req.body;

  const existingFavorite = demoFavorites.find(fav => 
    fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
  );

  if (existingFavorite) {
    // Remover favorito
    const favoriteIndex = demoFavorites.findIndex(fav => 
      fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
    );
    const removedFavorite = demoFavorites.splice(favoriteIndex, 1)[0];

    res.json({
      message: 'Oportunidade removida dos favoritos',
      action: 'removed',
      favorite: removedFavorite,
      demo: true
    });
  } else {
    // Adicionar favorito
    const opportunity = demoOpportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidade não encontrada' });
    }

    const newFavorite = {
      id: `fav-${Date.now()}`,
      volunteerId,
      opportunityId,
      createdAt: new Date(),
      notes: notes.trim()
    };

    demoFavorites.push(newFavorite);

    res.status(201).json({
      message: 'Oportunidade adicionada aos favoritos',
      action: 'added',
      favorite: {
        ...newFavorite,
        opportunity: opportunity
      },
      demo: true
    });
  }
});

// Atualizar notas do favorito
app.put('/api/favorites/volunteer/:volunteerId/opportunity/:opportunityId/notes', (req, res) => {
  const { volunteerId, opportunityId } = req.params;
  const { notes = '' } = req.body;

  const favorite = demoFavorites.find(fav => 
    fav.volunteerId === volunteerId && fav.opportunityId === opportunityId
  );
  
  if (!favorite) {
    return res.status(404).json({ error: 'Favorito não encontrado' });
  }

  favorite.notes = notes.trim();
  favorite.updatedAt = new Date();

  res.json({
    message: 'Notas do favorito atualizadas com sucesso',
    favorite: favorite,
    demo: true
  });
});

// Estatísticas de favoritos
app.get('/api/favorites/volunteer/:volunteerId/stats', (req, res) => {
  const { volunteerId } = req.params;

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

  res.json({
    stats: stats,
    volunteerId: volunteerId,
    demo: true
  });
});

// Buscar favoritos
app.get('/api/favorites/volunteer/:volunteerId/search', (req, res) => {
  const { volunteerId } = req.params;
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query de busca deve ter pelo menos 2 caracteres' });
  }

  const searchQuery = q.toLowerCase();
  
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
  const paginatedFavorites = volunteerFavorites.slice(offset, offset + parseInt(limit));

  res.json({
    favorites: paginatedFavorites,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: volunteerFavorites.length,
      totalPages: Math.ceil(volunteerFavorites.length / limit),
      hasNext: page < Math.ceil(volunteerFavorites.length / limit),
      hasPrev: page > 1
    },
    query: q,
    volunteerId: volunteerId,
    demo: true
  });
});

// Favoritos por categoria
app.get('/api/favorites/volunteer/:volunteerId/category/:categoryName', (req, res) => {
  const { volunteerId, categoryName } = req.params;
  const { page = 1, limit = 20 } = req.query;

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
  const paginatedFavorites = volunteerFavorites.slice(offset, offset + parseInt(limit));

  res.json({
    favorites: paginatedFavorites,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: volunteerFavorites.length,
      totalPages: Math.ceil(volunteerFavorites.length / limit),
      hasNext: page < Math.ceil(volunteerFavorites.length / limit),
      hasPrev: page > 1
    },
    category: categoryName,
    volunteerId: volunteerId,
    demo: true
  });
});

// ===== SISTEMA DE CATEGORIZAÇÃO DE OPORTUNIDADES =====

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

// Obter todas as categorias
app.get('/api/opportunity-categories/categories', (req, res) => {
  const { includeInactive = false, parentId = null, level = null } = req.query;
  
  let categories = [...demoOpportunityCategories];
  
  if (includeInactive !== 'true') {
    categories = categories.filter(cat => cat.isActive);
  }
  
  if (parentId !== null && parentId !== undefined) {
    categories = categories.filter(cat => cat.parentId === parentId);
  }
  
  if (level !== null && level !== undefined) {
    categories = categories.filter(cat => cat.level === parseInt(level));
  }
  
  // Ordenar por sortOrder
  categories.sort((a, b) => a.sortOrder - b.sortOrder);
  
  res.json({
    categories: categories,
    total: categories.length,
    options: { includeInactive, parentId, level },
    demo: true
  });
});

// Obter categoria por ID
app.get('/api/opportunity-categories/categories/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  
  const category = demoOpportunityCategories.find(cat => cat.id === categoryId);
  
  if (!category) {
    return res.status(404).json({ error: 'Categoria não encontrada' });
  }
  
  res.json({
    category: category,
    demo: true
  });
});

// Buscar categorias
app.get('/api/opportunity-categories/categories/search', (req, res) => {
  const { q, includeInactive = false, parentId = null, level = null } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query de busca deve ter pelo menos 2 caracteres' });
  }
  
  const searchQuery = q.toLowerCase();
  
  let categories = demoOpportunityCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery) ||
    cat.description.toLowerCase().includes(searchQuery)
  );
  
  if (includeInactive !== 'true') {
    categories = categories.filter(cat => cat.isActive);
  }
  
  if (parentId !== null && parentId !== undefined) {
    categories = categories.filter(cat => cat.parentId === parentId);
  }
  
  if (level !== null && level !== undefined) {
    categories = categories.filter(cat => cat.level === parseInt(level));
  }
  
  // Ordenar por relevância
  categories.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(searchQuery);
    const bNameMatch = b.name.toLowerCase().includes(searchQuery);
    
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    
    return a.sortOrder - b.sortOrder;
  });
  
  res.json({
    categories: categories,
    query: q,
    total: categories.length,
    options: { includeInactive, parentId, level },
    demo: true
  });
});

// Obter árvore de categorias
app.get('/api/opportunity-categories/categories/tree', (req, res) => {
  const { includeInactive = false } = req.query;
  
  let categories = [...demoOpportunityCategories];
  
  if (includeInactive !== 'true') {
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
  
  res.json({
    categoryTree: rootCategories,
    options: { includeInactive },
    demo: true
  });
});

// Estatísticas de categorias
app.get('/api/opportunity-categories/categories/stats', (req, res) => {
  const stats = {
    totalCategories: demoOpportunityCategories.length,
    activeCategories: demoOpportunityCategories.filter(cat => cat.isActive).length,
    inactiveCategories: demoOpportunityCategories.filter(cat => !cat.isActive).length,
    categoriesByLevel: {},
    mostUsedCategories: [
      { category: { id: '1', name: 'Educação' }, count: 15 },
      { category: { id: '4', name: 'Assistência Social' }, count: 12 },
      { category: { id: '7', name: 'Tecnologia' }, count: 8 },
      { category: { id: '2', name: 'Saúde' }, count: 6 },
      { category: { id: '5', name: 'Cultura' }, count: 4 }
    ],
    recentCategories: demoOpportunityCategories
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };
  
  // Estatísticas por nível
  demoOpportunityCategories.forEach(cat => {
    stats.categoriesByLevel[cat.level] = (stats.categoriesByLevel[cat.level] || 0) + 1;
  });
  
  res.json({
    stats: stats,
    demo: true
  });
});

// Categorizar oportunidade automaticamente
app.post('/api/opportunity-categories/categorize', (req, res) => {
  const { title, description, requiredSkills = [], volunteerType = 'PRESENTIAL' } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }
  
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
  
  res.json({
    categorization: {
      primaryCategoryId,
      secondaryCategoryIds,
      tags: [...new Set(tags)], // Remover duplicatas
      confidence: sortedScores.length > 0 ? sortedScores[0][1] / 10 : 0.1
    },
    opportunityData: { title, description, requiredSkills, volunteerType },
    demo: true
  });
});

// Obter oportunidades por categoria
app.get('/api/opportunity-categories/categories/:categoryId/opportunities', (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 20, includeSubcategories = true } = req.query;
  
  let opportunities = demoOpportunitiesWithCategories.filter(opp => 
    opp.primaryCategoryId === categoryId ||
    opp.secondaryCategoryIds.includes(categoryId)
  );
  
  if (includeSubcategories === 'true') {
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
  const paginatedOpportunities = uniqueOpportunities.slice(offset, offset + parseInt(limit));
  
  res.json({
    opportunities: paginatedOpportunities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: uniqueOpportunities.length,
      totalPages: Math.ceil(uniqueOpportunities.length / limit),
      hasNext: page < Math.ceil(uniqueOpportunities.length / limit),
      hasPrev: page > 1
    },
    categoryId: categoryId,
    options: { page, limit, includeSubcategories },
    demo: true
  });
});

// ===== SISTEMA DE REQUISITOS DE OPORTUNIDADES =====

// Dados de demonstração para requisitos de oportunidades
const demoOpportunityRequirements = [
  {
    id: 'req-1',
    opportunityId: '1',
    type: 'SKILL',
    title: 'Conhecimento em Matemática',
    description: 'Domínio de matemática do ensino fundamental',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      minLevel: 'INTERMEDIATE',
      skills: ['Matemática'],
      experienceYears: 1
    },
    alternatives: [
      {
        type: 'CERTIFICATION',
        title: 'Certificação em Matemática',
        description: 'Certificado de curso de matemática'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-2',
    opportunityId: '1',
    type: 'SKILL',
    title: 'Paciência com Crianças',
    description: 'Capacidade de trabalhar com crianças de 8 a 12 anos',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      minLevel: 'INTERMEDIATE',
      skills: ['Paciência', 'Trabalho com Crianças'],
      experienceYears: 0.5
    },
    alternatives: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-3',
    opportunityId: '1',
    type: 'AVAILABILITY',
    title: 'Disponibilidade aos Sábados',
    description: 'Disponibilidade das 9h às 12h aos sábados',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      days: ['saturday'],
      timeSlots: ['morning'],
      minHoursPerWeek: 3
    },
    alternatives: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-4',
    opportunityId: '1',
    type: 'DOCUMENT',
    title: 'Certidão de Antecedentes Criminais',
    description: 'Certidão negativa de antecedentes criminais',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      documentType: 'CRIMINAL_RECORD',
      maxAge: 90, // dias
      mustBeClean: true
    },
    alternatives: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-5',
    opportunityId: '2',
    type: 'SKILL',
    title: 'Conhecimento em JavaScript',
    description: 'Domínio de JavaScript moderno (ES6+)',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      minLevel: 'ADVANCED',
      skills: ['JavaScript'],
      experienceYears: 2
    },
    alternatives: [
      {
        type: 'PORTFOLIO',
        title: 'Portfólio com Projetos JavaScript',
        description: 'Mostrar projetos desenvolvidos em JavaScript'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-6',
    opportunityId: '2',
    type: 'SKILL',
    title: 'Conhecimento em React',
    description: 'Experiência com React.js',
    isRequired: true,
    priority: 'MEDIUM',
    validationCriteria: {
      minLevel: 'INTERMEDIATE',
      skills: ['React'],
      experienceYears: 1
    },
    alternatives: [
      {
        type: 'SKILL',
        title: 'Conhecimento em Vue.js',
        description: 'Experiência equivalente com Vue.js'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-7',
    opportunityId: '2',
    type: 'AVAILABILITY',
    title: 'Disponibilidade Remota',
    description: 'Disponibilidade para trabalho remoto',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      isRemote: true,
      minHoursPerWeek: 10,
      timezone: 'America/Sao_Paulo'
    },
    alternatives: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-8',
    opportunityId: '3',
    type: 'SKILL',
    title: 'Organização de Eventos',
    description: 'Experiência em organização de eventos',
    isRequired: false,
    priority: 'MEDIUM',
    validationCriteria: {
      minLevel: 'BEGINNER',
      skills: ['Organização de Eventos'],
      experienceYears: 0
    },
    alternatives: [
      {
        type: 'SKILL',
        title: 'Comunicação',
        description: 'Boa capacidade de comunicação'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-9',
    opportunityId: '3',
    type: 'AVAILABILITY',
    title: 'Disponibilidade aos Finais de Semana',
    description: 'Disponibilidade aos sábados e domingos',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      days: ['saturday', 'sunday'],
      timeSlots: ['morning', 'afternoon'],
      minHoursPerWeek: 8
    },
    alternatives: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'req-10',
    opportunityId: '4',
    type: 'SKILL',
    title: 'Conhecimento Musical',
    description: 'Conhecimento em violão ou flauta',
    isRequired: true,
    priority: 'HIGH',
    validationCriteria: {
      minLevel: 'INTERMEDIATE',
      skills: ['Música', 'Violão', 'Flauta'],
      experienceYears: 1
    },
    alternatives: [
      {
        type: 'SKILL',
        title: 'Outro Instrumento',
        description: 'Conhecimento em outro instrumento musical'
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// Dados de demonstração para tipos de requisitos
const demoRequirementTypes = [
  {
    id: 'SKILL',
    name: 'Habilidade',
    description: 'Conhecimentos técnicos ou habilidades específicas',
    icon: '🎯',
    color: '#3498db',
    validationFields: ['minLevel', 'skills', 'experienceYears']
  },
  {
    id: 'AVAILABILITY',
    name: 'Disponibilidade',
    description: 'Horários e dias disponíveis para voluntariado',
    icon: '⏰',
    color: '#e67e22',
    validationFields: ['days', 'timeSlots', 'minHoursPerWeek', 'timezone']
  },
  {
    id: 'DOCUMENT',
    name: 'Documento',
    description: 'Documentos obrigatórios para participação',
    icon: '📄',
    color: '#e74c3c',
    validationFields: ['documentType', 'maxAge', 'mustBeClean']
  },
  {
    id: 'EXPERIENCE',
    name: 'Experiência',
    description: 'Experiência prévia em áreas específicas',
    icon: '💼',
    color: '#9b59b6',
    validationFields: ['minYears', 'areas', 'achievements']
  },
  {
    id: 'CERTIFICATION',
    name: 'Certificação',
    description: 'Certificações ou qualificações específicas',
    icon: '🏆',
    color: '#f39c12',
    validationFields: ['certificationType', 'issuer', 'validUntil']
  },
  {
    id: 'AGE',
    name: 'Idade',
    description: 'Faixa etária específica para a oportunidade',
    icon: '👥',
    color: '#2ecc71',
    validationFields: ['minAge', 'maxAge']
  },
  {
    id: 'LOCATION',
    name: 'Localização',
    description: 'Requisitos de localização ou deslocamento',
    icon: '📍',
    color: '#34495e',
    validationFields: ['maxDistance', 'transportation', 'accessibility']
  },
  {
    id: 'LANGUAGE',
    name: 'Idioma',
    description: 'Conhecimento de idiomas específicos',
    icon: '🗣️',
    color: '#16a085',
    validationFields: ['languages', 'proficiencyLevel']
  }
];

// Obter tipos de requisitos
app.get('/api/opportunity-requirements/types', (req, res) => {
  res.json({
    types: demoRequirementTypes,
    total: demoRequirementTypes.length,
    demo: true
  });
});

// Obter requisitos de uma oportunidade
app.get('/api/opportunity-requirements/opportunity/:opportunityId', (req, res) => {
  const { opportunityId } = req.params;
  const { includeInactive = false, type = null, priority = null } = req.query;
  
  let requirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === opportunityId
  );
  
  if (includeInactive !== 'true') {
    requirements = requirements.filter(req => req.isActive !== false);
  }
  
  if (type) {
    requirements = requirements.filter(req => req.type === type);
  }
  
  if (priority) {
    requirements = requirements.filter(req => req.priority === priority);
  }
  
  // Ordenar por prioridade e data de criação
  const priorityOrder = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  requirements.sort((a, b) => {
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  res.json({
    requirements: requirements,
    opportunityId: opportunityId,
    total: requirements.length,
    options: { includeInactive, type, priority },
    demo: true
  });
});

// Obter requisito por ID
app.get('/api/opportunity-requirements/:requirementId', (req, res) => {
  const { requirementId } = req.params;
  
  const requirement = demoOpportunityRequirements.find(req => req.id === requirementId);
  
  if (!requirement) {
    return res.status(404).json({ error: 'Requisito não encontrado' });
  }
  
  res.json({
    requirement: requirement,
    demo: true
  });
});

// Criar requisito para oportunidade
app.post('/api/opportunity-requirements/opportunity/:opportunityId', (req, res) => {
  const { opportunityId } = req.params;
  const { type, title, description, isRequired = true, priority = 'MEDIUM', validationCriteria = {}, alternatives = [] } = req.body;
  
  if (!type || !title || !description) {
    return res.status(400).json({ error: 'Tipo, título e descrição são obrigatórios' });
  }
  
  const newRequirement = {
    id: `req-${Date.now()}`,
    opportunityId,
    type,
    title,
    description,
    isRequired,
    priority,
    validationCriteria,
    alternatives,
    createdAt: new Date()
  };
  
  demoOpportunityRequirements.push(newRequirement);
  
  res.status(201).json({
    message: 'Requisito criado com sucesso',
    requirement: newRequirement,
    demo: true
  });
});

// Atualizar requisito
app.put('/api/opportunity-requirements/:requirementId', (req, res) => {
  const { requirementId } = req.params;
  const updateData = req.body;
  
  const requirementIndex = demoOpportunityRequirements.findIndex(req => req.id === requirementId);
  
  if (requirementIndex === -1) {
    return res.status(404).json({ error: 'Requisito não encontrado' });
  }
  
  const updatedRequirement = {
    ...demoOpportunityRequirements[requirementIndex],
    ...updateData,
    updatedAt: new Date()
  };
  
  demoOpportunityRequirements[requirementIndex] = updatedRequirement;
  
  res.json({
    message: 'Requisito atualizado com sucesso',
    requirement: updatedRequirement,
    demo: true
  });
});

// Deletar requisito
app.delete('/api/opportunity-requirements/:requirementId', (req, res) => {
  const { requirementId } = req.params;
  
  const requirementIndex = demoOpportunityRequirements.findIndex(req => req.id === requirementId);
  
  if (requirementIndex === -1) {
    return res.status(404).json({ error: 'Requisito não encontrado' });
  }
  
  const deletedRequirement = demoOpportunityRequirements.splice(requirementIndex, 1)[0];
  
  res.json({
    message: 'Requisito deletado com sucesso',
    requirement: deletedRequirement,
    demo: true
  });
});

// Validar se voluntário atende aos requisitos
app.get('/api/opportunity-requirements/opportunity/:opportunityId/volunteer/:volunteerId/validate', (req, res) => {
  const { opportunityId, volunteerId } = req.params;
  
  const requirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === opportunityId && req.isRequired
  );
  
  // Dados de demonstração para voluntário
  const volunteer = {
    id: volunteerId,
    skills: ['Matemática', 'Paciência', 'Trabalho com Crianças', 'JavaScript', 'React'],
    experience: {
      'Matemática': 2,
      'Paciência': 1,
      'Trabalho com Crianças': 0.5,
      'JavaScript': 3,
      'React': 2
    },
    availability: {
      days: ['saturday', 'sunday'],
      timeSlots: ['morning', 'afternoon'],
      hoursPerWeek: 10
    },
    documents: {
      criminalRecord: {
        hasDocument: true,
        isClean: true,
        issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    age: 25,
    languages: ['portuguese', 'english']
  };
  
  const validationResults = [];
  let totalScore = 0;
  let maxScore = 0;
  
  requirements.forEach(requirement => {
    const result = {
      requirementId: requirement.id,
      title: requirement.title,
      type: requirement.type,
      isMet: false,
      score: 0,
      maxScore: 1,
      reasons: [],
      alternatives: []
    };
    
    switch (requirement.type) {
      case 'SKILL':
        const skillValidation = validateSkillRequirement(volunteer, requirement);
        result.isMet = skillValidation.isMet;
        result.score = skillValidation.score;
        result.reasons = skillValidation.reasons;
        result.alternatives = skillValidation.alternatives;
        break;
        
      case 'AVAILABILITY':
        const availabilityValidation = validateAvailabilityRequirement(volunteer, requirement);
        result.isMet = availabilityValidation.isMet;
        result.score = availabilityValidation.score;
        result.reasons = availabilityValidation.reasons;
        break;
        
      case 'DOCUMENT':
        const documentValidation = validateDocumentRequirement(volunteer, requirement);
        result.isMet = documentValidation.isMet;
        result.score = documentValidation.score;
        result.reasons = documentValidation.reasons;
        break;
    }
    
    totalScore += result.score;
    maxScore += result.maxScore;
    validationResults.push(result);
  });
  
  const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const isEligible = validationResults.every(result => result.isMet);
  
  res.json({
    validation: {
      volunteerId,
      opportunityId,
      isEligible,
      overallScore: Math.round(overallScore),
      requirements: validationResults,
      summary: {
        total: requirements.length,
        met: validationResults.filter(r => r.isMet).length,
        notMet: validationResults.filter(r => !r.isMet).length,
        score: Math.round(overallScore)
      }
    },
    demo: true
  });
});

// Funções auxiliares para validação
const validateSkillRequirement = (volunteer, requirement) => {
  const { minLevel, skills, experienceYears } = requirement.validationCriteria;
  const volunteerSkills = volunteer.skills || [];
  const volunteerExperience = volunteer.experience || {};
  
  let score = 0;
  let reasons = [];
  let alternatives = [];
  
  // Verificar se tem as habilidades necessárias
  const hasRequiredSkills = skills.every(skill => 
    volunteerSkills.some(vSkill => 
      vSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(vSkill.toLowerCase())
    )
  );
  
  if (hasRequiredSkills) {
    score += 0.6;
    reasons.push(`Possui as habilidades necessárias: ${skills.join(', ')}`);
  } else {
    const missingSkills = skills.filter(skill => 
      !volunteerSkills.some(vSkill => 
        vSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(vSkill.toLowerCase())
      )
    );
    reasons.push(`Faltam habilidades: ${missingSkills.join(', ')}`);
  }
  
  // Verificar experiência
  const hasExperience = skills.some(skill => {
    const experience = volunteerExperience[skill] || 0;
    return experience >= experienceYears;
  });
  
  if (hasExperience) {
    score += 0.4;
    reasons.push(`Possui experiência suficiente (${experienceYears}+ anos)`);
  } else {
    reasons.push(`Experiência insuficiente (necessário: ${experienceYears}+ anos)`);
  }
  
  return {
    isMet: hasRequiredSkills && hasExperience,
    score: Math.min(score, 1),
    reasons,
    alternatives
  };
};

const validateAvailabilityRequirement = (volunteer, requirement) => {
  const { days, timeSlots, minHoursPerWeek } = requirement.validationCriteria;
  const volunteerAvailability = volunteer.availability || {};
  
  let score = 0;
  let reasons = [];
  
  // Verificar dias
  const hasRequiredDays = days.every(day => 
    volunteerAvailability.days && volunteerAvailability.days.includes(day)
  );
  
  if (hasRequiredDays) {
    score += 0.5;
    reasons.push(`Disponível nos dias necessários: ${days.join(', ')}`);
  } else {
    const missingDays = days.filter(day => 
      !volunteerAvailability.days || !volunteerAvailability.days.includes(day)
    );
    reasons.push(`Não disponível nos dias: ${missingDays.join(', ')}`);
  }
  
  // Verificar horários
  const hasRequiredTimeSlots = timeSlots.every(timeSlot => 
    volunteerAvailability.timeSlots && volunteerAvailability.timeSlots.includes(timeSlot)
  );
  
  if (hasRequiredTimeSlots) {
    score += 0.3;
    reasons.push(`Disponível nos horários: ${timeSlots.join(', ')}`);
  } else {
    const missingTimeSlots = timeSlots.filter(timeSlot => 
      !volunteerAvailability.timeSlots || !volunteerAvailability.timeSlots.includes(timeSlot)
    );
    reasons.push(`Não disponível nos horários: ${missingTimeSlots.join(', ')}`);
  }
  
  // Verificar horas por semana
  const hasEnoughHours = volunteerAvailability.hoursPerWeek >= minHoursPerWeek;
  
  if (hasEnoughHours) {
    score += 0.2;
    reasons.push(`Disponibilidade suficiente: ${volunteerAvailability.hoursPerWeek}h/semana`);
  } else {
    reasons.push(`Disponibilidade insuficiente: ${volunteerAvailability.hoursPerWeek}h/semana (necessário: ${minHoursPerWeek}h)`);
  }
  
  return {
    isMet: hasRequiredDays && hasRequiredTimeSlots && hasEnoughHours,
    score: Math.min(score, 1),
    reasons
  };
};

const validateDocumentRequirement = (volunteer, requirement) => {
  const { documentType, maxAge, mustBeClean } = requirement.validationCriteria;
  const volunteerDocuments = volunteer.documents || {};
  
  let score = 0;
  let reasons = [];
  
  if (documentType === 'CRIMINAL_RECORD') {
    const criminalRecord = volunteerDocuments.criminalRecord;
    
    if (criminalRecord && criminalRecord.hasDocument) {
      score += 0.5;
      reasons.push('Possui certidão de antecedentes criminais');
      
      // Verificar se está limpa
      if (mustBeClean && criminalRecord.isClean) {
        score += 0.3;
        reasons.push('Certidão está limpa (sem antecedentes)');
      } else if (mustBeClean && !criminalRecord.isClean) {
        reasons.push('Certidão não está limpa (possui antecedentes)');
      }
      
      // Verificar idade do documento
      if (maxAge && criminalRecord.issuedDate) {
        const daysSinceIssued = (new Date() - new Date(criminalRecord.issuedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceIssued <= maxAge) {
          score += 0.2;
          reasons.push(`Documento está atualizado (${Math.round(daysSinceIssued)} dias)`);
        } else {
          reasons.push(`Documento vencido (${Math.round(daysSinceIssued)} dias, máximo: ${maxAge})`);
        }
      }
    } else {
      reasons.push('Não possui certidão de antecedentes criminais');
    }
  }
  
  return {
    isMet: score >= 0.8,
    score: Math.min(score, 1),
    reasons
  };
};

// Estatísticas de requisitos
app.get('/api/opportunity-requirements/opportunity/:opportunityId/stats', (req, res) => {
  const { opportunityId } = req.params;
  
  const requirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === opportunityId
  );
  
  const stats = {
    totalRequirements: requirements.length,
    requiredRequirements: requirements.filter(req => req.isRequired).length,
    optionalRequirements: requirements.filter(req => !req.isRequired).length,
    requirementsByType: {},
    requirementsByPriority: {},
    averageAlternatives: requirements.reduce((sum, req) => sum + req.alternatives.length, 0) / requirements.length || 0
  };
  
  // Estatísticas por tipo
  requirements.forEach(req => {
    stats.requirementsByType[req.type] = (stats.requirementsByType[req.type] || 0) + 1;
    stats.requirementsByPriority[req.priority] = (stats.requirementsByPriority[req.priority] || 0) + 1;
  });
  
  res.json({
    stats: stats,
    opportunityId: opportunityId,
    demo: true
  });
});

// Requisitos por tipo
app.get('/api/opportunity-requirements/opportunity/:opportunityId/type/:type', (req, res) => {
  const { opportunityId, type } = req.params;
  
  const requirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === opportunityId && req.type === type
  );
  
  res.json({
    requirements: requirements,
    type: type,
    opportunityId: opportunityId,
    total: requirements.length,
    demo: true
  });
});

// Requisitos por prioridade
app.get('/api/opportunity-requirements/opportunity/:opportunityId/priority/:priority', (req, res) => {
  const { opportunityId, priority } = req.params;
  
  const requirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === opportunityId && req.priority === priority
  );
  
  res.json({
    requirements: requirements,
    priority: priority,
    opportunityId: opportunityId,
    total: requirements.length,
    demo: true
  });
});

// Validar requisito específico
app.get('/api/opportunity-requirements/:requirementId/volunteer/:volunteerId/validate', (req, res) => {
  const { requirementId, volunteerId } = req.params;
  
  const requirement = demoOpportunityRequirements.find(req => req.id === requirementId);
  
  if (!requirement) {
    return res.status(404).json({ error: 'Requisito não encontrado' });
  }
  
  // Dados de demonstração para voluntário
  const volunteer = {
    id: volunteerId,
    skills: ['Matemática', 'Paciência', 'JavaScript'],
    experience: { 'Matemática': 2, 'Paciência': 1, 'JavaScript': 3 },
    availability: { days: ['saturday'], timeSlots: ['morning'], hoursPerWeek: 5 },
    documents: { criminalRecord: { hasDocument: true, isClean: true } },
    age: 25,
    languages: ['portuguese']
  };
  
  let validation = {
    requirementId: requirement.id,
    volunteerId: volunteer.id,
    isMet: true,
    score: 0.9,
    reasons: ['Requisito atendido'],
    alternatives: []
  };
  
  // Validação específica baseada no tipo
  if (requirement.type === 'SKILL') {
    const skillValidation = validateSkillRequirement(volunteer, requirement);
    validation = {
      ...validation,
      isMet: skillValidation.isMet,
      score: skillValidation.score,
      reasons: skillValidation.reasons,
      alternatives: skillValidation.alternatives
    };
  }
  
  res.json({
    validation: validation,
    demo: true
  });
});

// Duplicar requisitos
app.post('/api/opportunity-requirements/duplicate', (req, res) => {
  const { sourceOpportunityId, targetOpportunityId } = req.body;
  
  if (!sourceOpportunityId || !targetOpportunityId) {
    return res.status(400).json({ error: 'IDs das oportunidades de origem e destino são obrigatórios' });
  }
  
  const sourceRequirements = demoOpportunityRequirements.filter(req => 
    req.opportunityId === sourceOpportunityId
  );
  
  const duplicatedRequirements = sourceRequirements.map(req => {
    const newRequirement = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      opportunityId: targetOpportunityId,
      createdAt: new Date()
    };
    
    demoOpportunityRequirements.push(newRequirement);
    return newRequirement;
  });
  
  res.json({
    message: 'Requisitos duplicados com sucesso',
    duplicatedRequirements: duplicatedRequirements,
    sourceOpportunityId: sourceOpportunityId,
    targetOpportunityId: targetOpportunityId,
    total: duplicatedRequirements.length,
    demo: true
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de demonstração rodando na porta ${PORT}`);
  console.log(`📊 Categorias: http://localhost:${PORT}/api/categories`);
  console.log(`🔍 Busca: http://localhost:${PORT}/api/categories/search?q=educação`);
  console.log(`📈 Estatísticas: http://localhost:${PORT}/api/categories/stats`);
  console.log(`🎯 Habilidades: http://localhost:${PORT}/api/skills`);
  console.log(`🔍 Busca Habilidades: http://localhost:${PORT}/api/skills/search?q=javascript`);
  console.log(`📈 Stats Habilidades: http://localhost:${PORT}/api/skills/stats`);
  console.log(`🌍 Estados: http://localhost:${PORT}/api/location/states`);
  console.log(`🏙️ Cidades SP: http://localhost:${PORT}/api/location/cities/state/SP`);
  console.log(`🔍 Busca Cidades: http://localhost:${PORT}/api/location/cities/search?q=são paulo`);
  console.log(`📍 Cidades Próximas: http://localhost:${PORT}/api/location/cities/nearby?lat=-23.5505&lng=-46.6333&radius=50`);
  console.log(`📮 CEP: http://localhost:${PORT}/api/location/cep/01234567`);
  console.log(`📏 Distância: http://localhost:${PORT}/api/location/distance?lat1=-23.5505&lng1=-46.6333&lat2=-22.9068&lng2=-43.1729`);
  console.log(`📧 Verificar Email: POST http://localhost:${PORT}/api/email/send-verification`);
  console.log(`🔐 Redefinir Senha: POST http://localhost:${PORT}/api/email/request-password-reset`);
  console.log(`🧪 Teste Email: POST http://localhost:${PORT}/api/email/test`);
  console.log(`📝 Oportunidades: http://localhost:${PORT}/api/opportunities`);
  console.log(`🔍 Busca Oportunidades: http://localhost:${PORT}/api/opportunities/search?q=educação`);
  console.log(`📍 Oportunidades Próximas: http://localhost:${PORT}/api/opportunities/nearby?lat=-23.5505&lng=-46.6333&radius=50`);
  console.log(`📈 Stats Oportunidades: http://localhost:${PORT}/api/opportunities/stats`);
  console.log(`🎯 Matching Stats: http://localhost:${PORT}/api/matching/stats`);
  console.log(`👤 Matches Voluntário: http://localhost:${PORT}/api/matching/volunteer/1/matches`);
  console.log(`📋 Voluntários Oportunidade: http://localhost:${PORT}/api/matching/opportunity/1/volunteers`);
  console.log(`💯 Compatibilidade: http://localhost:${PORT}/api/matching/compatibility/1/1`);
  console.log(`🔍 Busca Avançada: http://localhost:${PORT}/api/search/advanced?q=educação&volunteerType=PRESENTIAL`);
  console.log(`💡 Sugestões: http://localhost:${PORT}/api/search/suggestions?q=edu`);
  console.log(`🏷️ Tags Populares: http://localhost:${PORT}/api/search/tags/popular`);
  console.log(`⚡ Busca Rápida: http://localhost:${PORT}/api/search/quick?q=aulas`);
  console.log(`🎯 Recomendações Personalizadas: http://localhost:${PORT}/api/recommendations/volunteer/1/personalized`);
  console.log(`🤝 Recomendações Colaborativas: http://localhost:${PORT}/api/recommendations/volunteer/1/collaborative`);
  console.log(`📊 Stats Recomendações: http://localhost:${PORT}/api/recommendations/volunteer/1/stats`);
  console.log(`📈 Recomendações em Alta: http://localhost:${PORT}/api/recommendations/volunteer/1/trending`);
  console.log(`❤️ Favoritos Voluntário: http://localhost:${PORT}/api/favorites/volunteer/1`);
  console.log(`➕ Adicionar Favorito: POST http://localhost:${PORT}/api/favorites/volunteer/1/opportunity/2`);
  console.log(`🔄 Alternar Favorito: POST http://localhost:${PORT}/api/favorites/volunteer/1/opportunity/2/toggle`);
  console.log(`📊 Stats Favoritos: http://localhost:${PORT}/api/favorites/volunteer/1/stats`);
  console.log(`🏷️ Categorias Oportunidades: http://localhost:${PORT}/api/opportunity-categories/categories`);
  console.log(`🌳 Árvore Categorias: http://localhost:${PORT}/api/opportunity-categories/categories/tree`);
  console.log(`🔍 Buscar Categorias: http://localhost:${PORT}/api/opportunity-categories/categories/search?q=educação`);
  console.log(`📊 Stats Categorias: http://localhost:${PORT}/api/opportunity-categories/categories/stats`);
  console.log(`🤖 Categorizar Oportunidade: POST http://localhost:${PORT}/api/opportunity-categories/categorize`);
  console.log(`📋 Requisitos Oportunidade: http://localhost:${PORT}/api/opportunity-requirements/opportunity/1`);
  console.log(`🎯 Tipos Requisitos: http://localhost:${PORT}/api/opportunity-requirements/types`);
  console.log(`✅ Validar Voluntário: http://localhost:${PORT}/api/opportunity-requirements/opportunity/1/volunteer/1/validate`);
  console.log(`📊 Stats Requisitos: http://localhost:${PORT}/api/opportunity-requirements/opportunity/1/stats`);
});
