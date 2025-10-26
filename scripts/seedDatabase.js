#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados de exemplo
 * Execute: node scripts/seedDatabase.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando população do banco de dados...\n');
    
    // 1. Criar categorias
    console.log('📂 Criando categorias...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Educação' },
        update: {},
        create: {
          name: 'Educação',
          description: 'Oportunidades relacionadas à educação e ensino',
          icon: 'book',
          color: '#4CAF50'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Saúde' },
        update: {},
        create: {
          name: 'Saúde',
          description: 'Oportunidades relacionadas à saúde e bem-estar',
          icon: 'medical',
          color: '#F44336'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Meio Ambiente' },
        update: {},
        create: {
          name: 'Meio Ambiente',
          description: 'Oportunidades relacionadas à preservação ambiental',
          icon: 'leaf',
          color: '#8BC34A'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Assistência Social' },
        update: {},
        create: {
          name: 'Assistência Social',
          description: 'Oportunidades de assistência social e comunitária',
          icon: 'heart',
          color: '#E91E63'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Cultura' },
        update: {},
        create: {
          name: 'Cultura',
          description: 'Oportunidades relacionadas à cultura e arte',
          icon: 'palette',
          color: '#9C27B0'
        }
      })
    ]);
    console.log(`✅ ${categories.length} categorias criadas`);
    
    // 2. Criar usuários de exemplo
    console.log('\n👥 Criando usuários de exemplo...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Administrador
    const admin = await prisma.user.upsert({
      where: { email: 'admin@voluntariado.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@voluntariado.com',
        password: hashedPassword,
        userType: 'ADMIN',
        isVerified: true,
        isActive: true,
        phone: '+55 11 99999-9999',
        bio: 'Administrador do sistema de voluntariado'
      }
    });
    
    // Voluntários
    const volunteers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'maria@email.com' },
        update: {},
        create: {
          name: 'Maria Silva',
          email: 'maria@email.com',
          password: hashedPassword,
          userType: 'VOLUNTEER',
          isVerified: true,
          isActive: true,
          phone: '+55 11 88888-8888',
          bio: 'Professora aposentada, apaixonada por educação',
          skills: ['Ensino', 'Pedagogia', 'Língua Portuguesa'],
          interests: ['Educação', 'Cultura'],
          availability: {
            weekdays: ['segunda', 'terça', 'quarta'],
            weekends: ['sábado'],
            timeSlots: ['manhã', 'tarde']
          },
          location: {
            address: 'Rua das Flores, 123 - São Paulo/SP',
            coordinates: { lat: -23.5505, lng: -46.6333 }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'joao@email.com' },
        update: {},
        create: {
          name: 'João Santos',
          email: 'joao@email.com',
          password: hashedPassword,
          userType: 'VOLUNTEER',
          isVerified: true,
          isActive: true,
          phone: '+55 11 77777-7777',
          bio: 'Estudante de medicina, interessado em saúde pública',
          skills: ['Primeiros Socorros', 'Medicina', 'Comunicação'],
          interests: ['Saúde', 'Assistência Social'],
          availability: {
            weekdays: ['quinta', 'sexta'],
            weekends: ['domingo'],
            timeSlots: ['tarde', 'noite']
          },
          location: {
            address: 'Av. Paulista, 456 - São Paulo/SP',
            coordinates: { lat: -23.5613, lng: -46.6565 }
          }
        }
      })
    ]);
    
    // Instituições
    const institutions = await Promise.all([
      prisma.user.upsert({
        where: { email: 'ong@educacao.org' },
        update: {},
        create: {
          name: 'ONG Educação para Todos',
          email: 'ong@educacao.org',
          password: hashedPassword,
          userType: 'INSTITUTION',
          isVerified: true,
          isActive: true,
          phone: '+55 11 66666-6666',
          bio: 'Organização sem fins lucrativos focada em educação',
          website: 'https://educacaoparatodos.org',
          location: {
            address: 'Rua da Educação, 789 - São Paulo/SP',
            coordinates: { lat: -23.5489, lng: -46.6388 }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'hospital@saude.gov.br' },
        update: {},
        create: {
          name: 'Hospital Municipal São Paulo',
          email: 'hospital@saude.gov.br',
          password: hashedPassword,
          userType: 'INSTITUTION',
          isVerified: true,
          isActive: true,
          phone: '+55 11 55555-5555',
          bio: 'Hospital público municipal',
          website: 'https://hospitalmunicipal.sp.gov.br',
          location: {
            address: 'Av. da Saúde, 321 - São Paulo/SP',
            coordinates: { lat: -23.5329, lng: -46.6399 }
          }
        }
      })
    ]);
    
    console.log(`✅ ${volunteers.length + institutions.length + 1} usuários criados`);
    
    // 3. Criar oportunidades
    console.log('\n🎯 Criando oportunidades de exemplo...');
    
    const opportunities = await Promise.all([
      prisma.opportunity.create({
        data: {
          title: 'Aulas de Português para Crianças',
          description: 'Ensinar português básico para crianças de 6 a 10 anos em comunidade carente',
          institutionId: institutions[0].id,
          categoryId: categories[0].id,
          requirements: {
            skills: ['Ensino', 'Pedagogia'],
            experience: 'Experiência com crianças',
            availability: '2 horas por semana'
          },
          location: {
            address: 'Rua da Educação, 789 - São Paulo/SP',
            coordinates: { lat: -23.5489, lng: -46.6388 },
            isRemote: false
          },
          schedule: {
            weekdays: ['terça', 'quinta'],
            timeSlots: ['manhã'],
            duration: 2
          },
          maxVolunteers: 5,
          status: 'ACTIVE',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-12-31')
        }
      }),
      prisma.opportunity.create({
        data: {
          title: 'Acompanhamento Hospitalar',
          description: 'Acompanhar pacientes em consultas médicas e exames',
          institutionId: institutions[1].id,
          categoryId: categories[1].id,
          requirements: {
            skills: ['Primeiros Socorros', 'Comunicação'],
            experience: 'Conhecimento básico em saúde',
            availability: '4 horas por semana'
          },
          location: {
            address: 'Av. da Saúde, 321 - São Paulo/SP',
            coordinates: { lat: -23.5329, lng: -46.6399 },
            isRemote: false
          },
          schedule: {
            weekdays: ['segunda', 'quarta', 'sexta'],
            timeSlots: ['manhã', 'tarde'],
            duration: 4
          },
          maxVolunteers: 10,
          status: 'ACTIVE',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-12-31')
        }
      }),
      prisma.opportunity.create({
        data: {
          title: 'Limpeza de Praias',
          description: 'Participar de mutirões de limpeza de praias e conscientização ambiental',
          institutionId: institutions[0].id,
          categoryId: categories[2].id,
          requirements: {
            skills: ['Consciência Ambiental'],
            experience: 'Não é necessário',
            availability: 'Finais de semana'
          },
          location: {
            address: 'Praia de Santos - Santos/SP',
            coordinates: { lat: -23.9608, lng: -46.3332 },
            isRemote: false
          },
          schedule: {
            weekdays: [],
            timeSlots: ['manhã'],
            duration: 3
          },
          maxVolunteers: 20,
          status: 'ACTIVE',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-12-31')
        }
      })
    ]);
    
    console.log(`✅ ${opportunities.length} oportunidades criadas`);
    
    // 4. Criar aplicações
    console.log('\n📝 Criando aplicações de exemplo...');
    
    const applications = await Promise.all([
      prisma.application.create({
        data: {
          volunteerId: volunteers[0].id,
          opportunityId: opportunities[0].id,
          status: 'APPROVED',
          appliedAt: new Date(),
          approvedAt: new Date(),
          message: 'Tenho experiência com crianças e gostaria de contribuir com a educação'
        }
      }),
      prisma.application.create({
        data: {
          volunteerId: volunteers[1].id,
          opportunityId: opportunities[1].id,
          status: 'PENDING',
          appliedAt: new Date(),
          message: 'Sou estudante de medicina e gostaria de ganhar experiência prática'
        }
      })
    ]);
    
    console.log(`✅ ${applications.length} aplicações criadas`);
    
    // 5. Criar algumas doações
    console.log('\n🎁 Criando doações de exemplo...');
    
    const donations = await Promise.all([
      prisma.donation.create({
        data: {
          donorId: volunteers[0].id,
          institutionId: institutions[0].id,
          title: 'Livros Didáticos',
          description: 'Coleção de livros didáticos para ensino fundamental',
          category: 'EDUCATIONAL_MATERIALS',
          quantity: 50,
          status: 'PENDING',
          location: {
            address: 'Rua das Flores, 123 - São Paulo/SP',
            coordinates: { lat: -23.5505, lng: -46.6333 }
          }
        }
      }),
      prisma.donation.create({
        data: {
          donorId: volunteers[1].id,
          institutionId: institutions[1].id,
          title: 'Equipamentos Médicos',
          description: 'Estetoscópios e termômetros para o hospital',
          category: 'MEDICAL_EQUIPMENT',
          quantity: 10,
          status: 'APPROVED',
          location: {
            address: 'Av. Paulista, 456 - São Paulo/SP',
            coordinates: { lat: -23.5613, lng: -46.6565 }
          }
        }
      })
    ]);
    
    console.log(`✅ ${donations.length} doações criadas`);
    
    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`- ${categories.length} categorias`);
    console.log(`- ${volunteers.length + institutions.length + 1} usuários`);
    console.log(`- ${opportunities.length} oportunidades`);
    console.log(`- ${applications.length} aplicações`);
    console.log(`- ${donations.length} doações`);
    
    console.log('\n🔑 Credenciais de acesso:');
    console.log('Admin: admin@voluntariado.com / password123');
    console.log('Voluntário: maria@email.com / password123');
    console.log('Voluntário: joao@email.com / password123');
    console.log('Instituição: ong@educacao.org / password123');
    console.log('Instituição: hospital@saude.gov.br / password123');
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
