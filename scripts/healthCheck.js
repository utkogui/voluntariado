#!/usr/bin/env node

/**
 * Script para verificar a saúde do sistema
 * Execute: node scripts/healthCheck.js
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function healthCheck() {
  console.log('🏥 Verificando saúde do sistema...\n');
  
  const checks = [];
  
  // 1. Verificar conexão com banco de dados
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: 'Banco de Dados', status: '✅ OK', details: 'Conexão estabelecida' });
  } catch (error) {
    checks.push({ name: 'Banco de Dados', status: '❌ ERRO', details: error.message });
  }
  
  // 2. Verificar se as tabelas existem
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    checks.push({ 
      name: 'Tabelas do Banco', 
      status: '✅ OK', 
      details: `${tables.length} tabelas encontradas` 
    });
  } catch (error) {
    checks.push({ name: 'Tabelas do Banco', status: '❌ ERRO', details: error.message });
  }
  
  // 3. Verificar usuários no sistema
  try {
    const userCount = await prisma.user.count();
    checks.push({ 
      name: 'Usuários', 
      status: '✅ OK', 
      details: `${userCount} usuários cadastrados` 
    });
  } catch (error) {
    checks.push({ name: 'Usuários', status: '❌ ERRO', details: error.message });
  }
  
  // 4. Verificar se existe administrador
  try {
    const adminCount = await prisma.user.count({
      where: { userType: 'ADMIN' }
    });
    if (adminCount > 0) {
      checks.push({ 
        name: 'Administrador', 
        status: '✅ OK', 
        details: `${adminCount} administrador(es) encontrado(s)` 
      });
    } else {
      checks.push({ 
        name: 'Administrador', 
        status: '⚠️  AVISO', 
        details: 'Nenhum administrador encontrado' 
      });
    }
  } catch (error) {
    checks.push({ name: 'Administrador', status: '❌ ERRO', details: error.message });
  }
  
  // 5. Verificar API (se estiver rodando)
  try {
    const response = await axios.get('http://localhost:3001/api/v1/health', { timeout: 5000 });
    checks.push({ 
      name: 'API Backend', 
      status: '✅ OK', 
      details: `Status: ${response.status}` 
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      checks.push({ 
        name: 'API Backend', 
        status: '⚠️  AVISO', 
        details: 'API não está rodando (normal se não iniciada)' 
      });
    } else {
      checks.push({ 
        name: 'API Backend', 
        status: '❌ ERRO', 
        details: error.message 
      });
    }
  }
  
  // 6. Verificar Frontend (se estiver rodando)
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    checks.push({ 
      name: 'Frontend', 
      status: '✅ OK', 
      details: `Status: ${response.status}` 
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      checks.push({ 
        name: 'Frontend', 
        status: '⚠️  AVISO', 
        details: 'Frontend não está rodando (normal se não iniciado)' 
      });
    } else {
      checks.push({ 
        name: 'Frontend', 
        status: '❌ ERRO', 
        details: error.message 
      });
    }
  }
  
  // Exibir resultados
  console.log('📊 Resultados da Verificação:\n');
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.details}`);
  });
  
  // Resumo
  const okCount = checks.filter(c => c.status.includes('✅')).length;
  const warningCount = checks.filter(c => c.status.includes('⚠️')).length;
  const errorCount = checks.filter(c => c.status.includes('❌')).length;
  
  console.log('\n📈 Resumo:');
  console.log(`✅ OK: ${okCount}`);
  console.log(`⚠️  Avisos: ${warningCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Sistema está funcionando corretamente!');
  } else {
    console.log('\n⚠️  Alguns problemas foram encontrados. Verifique os erros acima.');
  }
  
  // Sugestões
  console.log('\n💡 Próximos passos:');
  if (warningCount > 0 || errorCount > 0) {
    console.log('1. Verifique as configurações do banco de dados');
    console.log('2. Execute as migrações: npx prisma migrate dev');
    console.log('3. Crie um administrador: node scripts/createAdmin.js');
  }
  console.log('4. Inicie o backend: npm run dev');
  console.log('5. Inicie o frontend: cd frontend && npm start');
  console.log('6. Acesse: http://localhost:3000');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export { healthCheck };
