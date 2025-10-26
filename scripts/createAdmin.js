#!/usr/bin/env node

/**
 * Script para criar usuário administrador inicial
 * Execute: node scripts/createAdmin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário administrador...');
    
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { userType: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Usuário administrador já existe!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      return;
    }
    
    // Dados do administrador
    const adminData = {
      name: 'Administrador',
      email: 'admin@voluntariado.com',
      password: 'admin123',
      userType: 'ADMIN',
      isVerified: true,
      isActive: true
    };
    
    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Criar usuário administrador
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        userType: adminData.userType,
        isVerified: adminData.isVerified,
        isActive: adminData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Senha:', adminData.password);
    console.log('🆔 ID:', admin.id);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
