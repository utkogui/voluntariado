# 🚀 Guia de Execução Simplificado

## ⚡ Execução Rápida (3 passos)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
# Crie o banco PostgreSQL
createdb voluntariado_db

# Configure o .env (edite com suas credenciais)
cp env.example .env
nano .env

# Execute as migrações
npx prisma generate
npx prisma migrate dev
```

### 3. Executar o projeto
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm start
```

## 🌐 Acessos
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## 🔧 Comandos Úteis

```bash
# Criar usuário admin
npm run create:admin

# Popular banco com dados de exemplo
npm run db:seed

# Verificar saúde do sistema
npm run health:check

# Resetar banco
npm run db:reset
```

## 🐛 Problemas Comuns

### Erro de conexão com banco
```bash
# Verifique se PostgreSQL está rodando
brew services start postgresql
# ou
sudo service postgresql start
```

### Porta já em uso
```bash
# Encontre o processo
lsof -i :3000
# Mate o processo
kill -9 PID
```

### Dependências não instaladas
```bash
# Limpe e reinstale
npm run clean
```

## 📝 Configuração Mínima do .env

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/voluntariado_db"
JWT_SECRET="sua_chave_secreta_jwt_muito_longa_e_segura_aqui"
JWT_REFRESH_SECRET="sua_chave_secreta_refresh_muito_longa_e_segura_aqui"
PORT=3001
NODE_ENV=development
```

## 🎯 Próximos Passos

1. Acesse http://localhost:3000
2. Registre-se como voluntário ou instituição
3. Explore as funcionalidades
4. Teste o sistema de matching
5. Use o chat em tempo real

---

**🎉 Pronto! Seu app está rodando!**
