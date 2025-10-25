const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedCategories } = require('./seed-categories');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar categorias usando o script dedicado
  await seedCategories();

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@volunteerapp.com' },
    update: {},
    create: {
      email: 'admin@volunteerapp.com',
      password: hashedPassword,
      userType: 'INSTITUTION',
      status: 'ACTIVE',
      isVerified: true,
      institution: {
        create: {
          name: 'Volunteer App Admin',
          description: 'Conta administrativa do sistema',
          address: 'Rua Admin, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          documentStatus: 'VERIFIED',
          verifiedAt: new Date()
        }
      }
    }
  });

  console.log('✅ Usuário administrador criado');

  // Criar usuário voluntário de exemplo
  const volunteerUser = await prisma.user.upsert({
    where: { email: 'voluntario@exemplo.com' },
    update: {},
    create: {
      email: 'voluntario@exemplo.com',
      password: hashedPassword,
      userType: 'VOLUNTEER',
      status: 'ACTIVE',
      isVerified: true,
      volunteer: {
        create: {
          firstName: 'João',
          lastName: 'Silva',
          phone: '(11) 99999-9999',
          bio: 'Apaixonado por ajudar pessoas e fazer a diferença na comunidade.',
          city: 'São Paulo',
          state: 'SP',
          skills: ['Ensino', 'Tecnologia', 'Organização'],
          skillLevels: {
            'Ensino': 'INTERMEDIATE',
            'Tecnologia': 'ADVANCED',
            'Organização': 'EXPERT'
          },
          volunteerTypes: ['PRESENTIAL', 'ONLINE'],
          hasBackgroundCheck: true,
          backgroundCheckDate: new Date(),
          backgroundCheckStatus: 'APPROVED'
        }
      }
    }
  });

  console.log('✅ Usuário voluntário de exemplo criado');

  // Criar instituição de exemplo
  const institutionUser = await prisma.user.upsert({
    where: { email: 'ong@exemplo.com' },
    update: {},
    create: {
      email: 'ong@exemplo.com',
      password: hashedPassword,
      userType: 'INSTITUTION',
      status: 'ACTIVE',
      isVerified: true,
      institution: {
        create: {
          name: 'ONG Exemplo',
          description: 'Organização sem fins lucrativos dedicada à educação de crianças carentes.',
          website: 'https://ongexemplo.com.br',
          phone: '(11) 3333-3333',
          email: 'contato@ongexemplo.com.br',
          cnpj: '12.345.678/0001-90',
          documentStatus: 'VERIFIED',
          verifiedAt: new Date(),
          address: 'Rua da Educação, 456',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04567-890',
          categories: {
            connect: [
              { name: 'Educação' },
              { name: 'Assistência Social' }
            ]
          }
        }
      }
    }
  });

  console.log('✅ Instituição de exemplo criada');

  // Criar oportunidade de exemplo
  const opportunity = await prisma.opportunity.create({
    data: {
      title: 'Aulas de reforço para crianças carentes',
      description: 'Precisamos de voluntários para dar aulas de reforço em matemática e português para crianças de 8 a 12 anos.',
      requirements: 'Conhecimento em matemática e português do ensino fundamental, paciência e carinho com crianças.',
      benefits: 'Experiência em ensino, certificado de voluntariado, oportunidade de fazer a diferença na vida das crianças.',
      volunteerType: 'PRESENTIAL',
      status: 'PUBLISHED',
      maxVolunteers: 5,
      address: 'Rua da Educação, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de agora
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de agora
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias a partir de agora
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
        'Lápis e canetas'
      ],
      createdById: institutionUser.id,
      createdByType: 'INSTITUTION',
      categories: {
        connect: [
          { name: 'Educação' },
          { name: 'Assistência Social' }
        ]
      }
    }
  });

  console.log('✅ Oportunidade de exemplo criada');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('- 40+ categorias de atuação');
  console.log('- 1 usuário administrador (admin@volunteerapp.com)');
  console.log('- 1 usuário voluntário (voluntario@exemplo.com)');
  console.log('- 1 instituição (ong@exemplo.com)');
  console.log('- 1 oportunidade de exemplo');
  console.log('\n🔑 Senha padrão para todos os usuários: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
