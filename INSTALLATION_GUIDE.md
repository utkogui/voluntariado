# 🚀 Guia de Instalação e Execução - Aplicativo de Voluntariado

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 13 ou superior)
- **Redis** (opcional, para cache)
- **Git**

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone git@github.com:utkogui/voluntariado.git
cd voluntariado
```

### 2. Instale as dependências do backend
```bash
npm install
```

### 3. Instale as dependências do frontend
```bash
cd frontend
npm install
cd ..
```

## 🗄️ Configuração do Banco de Dados

### 1. Configure o PostgreSQL
```bash
# Crie um banco de dados
createdb voluntariado_db

# Ou usando psql
psql -U postgres
CREATE DATABASE voluntariado_db;
\q
```

### 2. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Configurações mínimas necessárias no .env:**
```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/voluntariado_db"

# JWT
JWT_SECRET="sua_chave_secreta_jwt_aqui"
JWT_REFRESH_SECRET="sua_chave_secreta_refresh_aqui"

# Servidor
PORT=3000
NODE_ENV=development

# Email (opcional para desenvolvimento)
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

### 3. Execute as migrações do Prisma
```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate dev

# (Opcional) Visualize o banco de dados
npx prisma studio
```

## 🚀 Execução

### Opção 1: Execução Manual

#### Terminal 1 - Backend
```bash
# Na raiz do projeto
npm run dev
```

#### Terminal 2 - Frontend
```bash
# Na pasta frontend
cd frontend
npm start
```

### Opção 2: Execução com Docker

#### 1. Configure o docker-compose
```bash
# Edite o arquivo docker-compose.yml se necessário
nano docker-compose.yml
```

#### 2. Execute com Docker
```bash
# Execute todos os serviços
docker-compose up -d

# Ou apenas o banco de dados
docker-compose up -d postgres redis
```

## 🌐 Acessos

Após a execução, você terá acesso a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api-docs
- **Prisma Studio**: http://localhost:5555 (se executado)

## 👤 Primeiros Usuários

### Criar usuário administrador
```bash
# Execute o script de criação de admin
node scripts/createAdmin.js
```

### Ou via API
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@voluntariado.com",
    "password": "admin123",
    "userType": "ADMIN"
  }'
```

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

## 🔍 Verificação da Instalação

### 1. Verifique se o backend está funcionando
```bash
curl http://localhost:3001/api/v1/health
```

### 2. Verifique se o frontend está funcionando
Abra http://localhost:3000 no navegador

### 3. Verifique se o banco de dados está conectado
```bash
npx prisma db pull
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Reiniciar servidor
npm run dev

# Limpar cache
npm run clean

# Verificar linting
npm run lint

# Corrigir linting automaticamente
npm run lint:fix
```

### Banco de Dados
```bash
# Resetar banco de dados
npx prisma migrate reset

# Aplicar migrações
npx prisma migrate deploy

# Visualizar schema
npx prisma format
```

### Docker
```bash
# Parar todos os containers
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild das imagens
docker-compose build --no-cache
```

## 🐛 Troubleshooting

### Problema: Erro de conexão com banco de dados
```bash
# Verifique se o PostgreSQL está rodando
sudo service postgresql status

# Verifique as credenciais no .env
cat .env | grep DATABASE_URL
```

### Problema: Porta já em uso
```bash
# Encontre o processo usando a porta
lsof -i :3000
lsof -i :3001

# Mate o processo
kill -9 PID_DO_PROCESSO
```

### Problema: Dependências não instaladas
```bash
# Limpe o cache do npm
npm cache clean --force

# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Problema: Migrações do Prisma falhando
```bash
# Reset do banco de dados
npx prisma migrate reset

# Ou force uma nova migração
npx prisma migrate dev --name init
```

## 📱 Testando no Mobile

### 1. Instale o Expo CLI
```bash
npm install -g @expo/cli
```

### 2. Execute no mobile
```bash
cd frontend
npx expo start
```

## 🔐 Configurações de Segurança

### 1. Configure HTTPS (produção)
```bash
# Gere certificados SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 2. Configure variáveis de ambiente de produção
```bash
# Copie o arquivo de produção
cp config/production.env .env.production

# Configure as variáveis
nano .env.production
```

## 📊 Monitoramento

### 1. Visualizar logs
```bash
# Logs do backend
npm run logs

# Logs do Docker
docker-compose logs -f
```

### 2. Monitorar performance
```bash
# Executar análise de performance
npm run analyze

# Executar testes de carga
npm run load-test
```

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Explore a documentação**: http://localhost:3001/api-docs
2. **Crie seu primeiro usuário**: Registre-se no frontend
3. **Teste as funcionalidades**: Explore todas as features
4. **Configure notificações**: Configure email e push notifications
5. **Personalize**: Adapte para suas necessidades

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Consulte a documentação técnica
3. Verifique as issues no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

**🎉 Parabéns! Seu aplicativo de voluntariado está rodando!**
