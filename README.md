# 🤝 Volunteer App - Aplicativo de Voluntariado

Conecte instituições que precisam de ajuda com voluntários qualificados e disponíveis.

## 📋 Sobre o Projeto

O Volunteer App é uma plataforma digital que facilita o encontro entre necessidades sociais e pessoas dispostas a ajudar. O aplicativo conecta ONGs, hospitais, escolas, empresas e universidades com voluntários que possuem as habilidades e disponibilidade necessárias.

## 🚀 Funcionalidades Principais

- **Sistema de Matching Automático**: Conecta voluntários com oportunidades baseado em habilidades, localização e disponibilidade
- **Cadastro Multi-tipo**: Suporte para voluntários, instituições, empresas e universidades
- **Gestão de Oportunidades**: Criação e gerenciamento de oportunidades de voluntariado
- **Sistema de Comunicação**: Chat simples entre instituições e voluntários
- **Avaliações Bidirecionais**: Sistema de feedback e avaliações
- **Notificações**: Alertas para novas oportunidades relevantes
- **Agendamento**: Sistema de agendamento de atividades

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para banco de dados
- **JWT** - Autenticação
- **Socket.io** - Comunicação em tempo real
- **Redis** - Cache e sessões

### Frontend
- **React** - Biblioteca para interface
- **JavaScript/TypeScript** - Linguagem de programação
- **CSS3** - Estilização

### Infraestrutura
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Cloudinary** - Upload de imagens
- **SendGrid** - Serviço de email

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 13
- Redis >= 6

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/volunteer-app.git
   cd volunteer-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Configure o banco de dados**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Execute o projeto**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## 📚 Documentação da API

A documentação completa da API está disponível em `/api/docs` quando o servidor estiver rodando.

### Endpoints Principais

- `GET /api/health` - Health check
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/opportunities` - Listar oportunidades
- `POST /api/opportunities` - Criar oportunidade
- `GET /api/matching/suggestions` - Sugestões de matching

## 🏗️ Estrutura do Projeto

```
volunteer-app/
├── config/                 # Configurações
├── controllers/            # Controladores da API
├── models/                 # Modelos de dados
├── routes/                 # Rotas da API
├── middleware/             # Middlewares
├── services/               # Serviços de negócio
├── utils/                  # Utilitários
├── tests/                  # Testes
├── frontend/               # Aplicação React
├── scripts/                # Scripts de automação
└── logs/                   # Logs da aplicação
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@volunteerapp.com ou abra uma issue no GitHub.

## 🎯 Roadmap

- [ ] Implementação do sistema de matching
- [ ] Integração com APIs de geolocalização
- [ ] Sistema de notificações push
- [ ] Aplicativo mobile
- [ ] Sistema de pagamentos
- [ ] Analytics avançados

---

**Desenvolvido com ❤️ para conectar pessoas e causas sociais**
