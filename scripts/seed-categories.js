const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  // Educação
  {
    name: 'Educação',
    description: 'Oportunidades relacionadas ao ensino, alfabetização e desenvolvimento educacional',
    icon: '🎓',
    color: '#3498db'
  },
  {
    name: 'Alfabetização',
    description: 'Projetos de alfabetização para crianças e adultos',
    icon: '📚',
    color: '#2ecc71'
  },
  {
    name: 'Apoio Escolar',
    description: 'Reforço escolar e atividades educativas complementares',
    icon: '✏️',
    color: '#f39c12'
  },
  {
    name: 'Educação Especial',
    description: 'Atendimento educacional especializado',
    icon: '♿',
    color: '#9b59b6'
  },

  // Saúde
  {
    name: 'Saúde',
    description: 'Oportunidades na área da saúde e bem-estar',
    icon: '🏥',
    color: '#e74c3c'
  },
  {
    name: 'Saúde Mental',
    description: 'Apoio psicológico e saúde mental',
    icon: '🧠',
    color: '#e67e22'
  },
  {
    name: 'Prevenção',
    description: 'Campanhas de prevenção e conscientização',
    icon: '🛡️',
    color: '#1abc9c'
  },
  {
    name: 'Cuidados Paliativos',
    description: 'Apoio a pacientes em cuidados paliativos',
    icon: '🤝',
    color: '#34495e'
  },

  // Meio Ambiente
  {
    name: 'Meio Ambiente',
    description: 'Projetos de preservação e sustentabilidade ambiental',
    icon: '🌱',
    color: '#27ae60'
  },
  {
    name: 'Reciclagem',
    description: 'Projetos de reciclagem e gestão de resíduos',
    icon: '♻️',
    color: '#16a085'
  },
  {
    name: 'Reflorestamento',
    description: 'Plantio de árvores e recuperação de áreas degradadas',
    icon: '🌳',
    color: '#2ecc71'
  },
  {
    name: 'Conservação',
    description: 'Conservação de espécies e habitats naturais',
    icon: '🦋',
    color: '#8e44ad'
  },

  // Assistência Social
  {
    name: 'Assistência Social',
    description: 'Apoio a pessoas em situação de vulnerabilidade social',
    icon: '🤝',
    color: '#e67e22'
  },
  {
    name: 'Combate à Fome',
    description: 'Distribuição de alimentos e combate à fome',
    icon: '🍽️',
    color: '#d35400'
  },
  {
    name: 'Abrigo',
    description: 'Apoio a pessoas em situação de rua',
    icon: '🏠',
    color: '#95a5a6'
  },
  {
    name: 'Idosos',
    description: 'Atendimento e cuidado com idosos',
    icon: '👴',
    color: '#f39c12'
  },
  {
    name: 'Crianças e Adolescentes',
    description: 'Projetos voltados para crianças e adolescentes',
    icon: '👶',
    color: '#e91e63'
  },

  // Cultura e Arte
  {
    name: 'Cultura',
    description: 'Projetos culturais e artísticos',
    icon: '🎭',
    color: '#9b59b6'
  },
  {
    name: 'Música',
    description: 'Projetos musicais e educação musical',
    icon: '🎵',
    color: '#8e44ad'
  },
  {
    name: 'Arte',
    description: 'Projetos de artes visuais e plásticas',
    icon: '🎨',
    color: '#e74c3c'
  },
  {
    name: 'Teatro',
    description: 'Projetos teatrais e dramaturgia',
    icon: '🎪',
    color: '#f39c12'
  },

  // Esporte
  {
    name: 'Esporte',
    description: 'Projetos esportivos e atividades físicas',
    icon: '⚽',
    color: '#27ae60'
  },
  {
    name: 'Futebol',
    description: 'Projetos de futebol e esportes coletivos',
    icon: '⚽',
    color: '#2ecc71'
  },
  {
    name: 'Artes Marciais',
    description: 'Projetos de artes marciais e defesa pessoal',
    icon: '🥋',
    color: '#34495e'
  },
  {
    name: 'Natação',
    description: 'Projetos de natação e esportes aquáticos',
    icon: '🏊',
    color: '#3498db'
  },

  // Tecnologia
  {
    name: 'Tecnologia',
    description: 'Projetos de inclusão digital e tecnologia',
    icon: '💻',
    color: '#3498db'
  },
  {
    name: 'Programação',
    description: 'Ensino de programação e desenvolvimento',
    icon: '👨‍💻',
    color: '#2c3e50'
  },
  {
    name: 'Inclusão Digital',
    description: 'Projetos de inclusão digital para idosos',
    icon: '📱',
    color: '#7f8c8d'
  },

  // Direitos Humanos
  {
    name: 'Direitos Humanos',
    description: 'Defesa e promoção dos direitos humanos',
    icon: '⚖️',
    color: '#e74c3c'
  },
  {
    name: 'Igualdade de Gênero',
    description: 'Projetos de igualdade de gênero',
    icon: '👥',
    color: '#e91e63'
  },
  {
    name: 'Racial',
    description: 'Combate ao racismo e promoção da igualdade racial',
    icon: '✊',
    color: '#2c3e50'
  },
  {
    name: 'LGBTQIA+',
    description: 'Apoio à comunidade LGBTQIA+',
    icon: '🏳️‍🌈',
    color: '#9b59b6'
  },

  // Emergência e Desastres
  {
    name: 'Emergência',
    description: 'Apoio em situações de emergência e desastres',
    icon: '🚨',
    color: '#e74c3c'
  },
  {
    name: 'Defesa Civil',
    description: 'Apoio à defesa civil e proteção comunitária',
    icon: '🛡️',
    color: '#f39c12'
  },

  // Animais
  {
    name: 'Proteção Animal',
    description: 'Cuidado e proteção de animais',
    icon: '🐕',
    color: '#e67e22'
  },
  {
    name: 'Resgate Animal',
    description: 'Resgate e cuidado de animais abandonados',
    icon: '🐱',
    color: '#f39c12'
  },

  // Voluntariado Corporativo
  {
    name: 'Voluntariado Corporativo',
    description: 'Projetos de voluntariado empresarial',
    icon: '🏢',
    color: '#34495e'
  },
  {
    name: 'Responsabilidade Social',
    description: 'Projetos de responsabilidade social empresarial',
    icon: '🤝',
    color: '#2c3e50'
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Iniciando seed das categorias...');

    // Verificar se já existem categorias
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log('⚠️  Categorias já existem no banco. Pulando seed.');
      return;
    }

    // Criar categorias
    for (const category of categories) {
      await prisma.category.create({
        data: category
      });
      console.log(`✅ Categoria criada: ${category.name}`);
    }

    console.log(`🎉 Seed concluído! ${categories.length} categorias criadas.`);

  } catch (error) {
    console.error('❌ Erro no seed das categorias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories, categories };


