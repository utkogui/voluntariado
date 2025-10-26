# 🚀 Guia Rápido de Execução - Aplicativo de Voluntariado

## ⚡ Execução Rápida (5 minutos)

### 1. Pré-requisitos
```bash
# Verifique se tem Node.js 18+
node --version

# Verifique se tem PostgreSQL
psql --version
```

### 2. Instalação
```bash
# Clone e instale
git clone git@github.com:utkogui/voluntariado.git
cd voluntariado
npm install
cd frontend && npm install && cd ..
```

### 3. Configuração do Banco
```bash
# Crie o banco
createdb voluntariado_db

# Configure o .env
cp env.example .env
# Edite o .env com suas credenciais do PostgreSQL
```

### 4. Execução
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

### 5. Acessos
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## 🔧 Comandos Úteis

```bash
# Verificar saúde do sistema
npm run health:check

# Criar usuário admin
npm run create:admin

# Popular banco com dados de exemplo
npm run db:seed

# Resetar banco de dados
npm run db:reset

# Executar testes
npm test

# Ver logs
npm run logs
```

## 🐛 Problemas Comuns

### Erro de conexão com banco
```bash
# Verifique se PostgreSQL está rodando
sudo service postgresql start

# Verifique as credenciais no .env
cat .env | grep DATABASE_URL
```

### Porta já em uso
```bash
# Encontre e mate o processo
lsof -i :3000
kill -9 PID
```

### Dependências não instaladas
```bash
# Limpe e reinstale
npm run clean
```

## 📱 Testando

1. **Acesse**: http://localhost:3000
2. **Registre-se** como voluntário ou instituição
3. **Explore** as funcionalidades
4. **Teste** o sistema de matching
5. **Use** o chat em tempo real

## 🎯 Próximos Passos

- Configure notificações por email
- Personalize para suas necessidades
- Deploy em produção
- Configure monitoramento

---

**🎉 Pronto! Seu app está rodando!**
