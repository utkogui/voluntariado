# Checklist de Testes

Este documento fornece um checklist abrangente para garantir que todos os aspectos do sistema sejam testados adequadamente.

## Índice

1. [Testes Unitários](#testes-unitários)
2. [Testes de Integração](#testes-de-integração)
3. [Testes End-to-End](#testes-end-to-end)
4. [Testes de Performance](#testes-de-performance)
5. [Testes de Segurança](#testes-de-segurança)
6. [Testes de Acessibilidade](#testes-de-acessibilidade)
7. [Testes Visuais](#testes-visuais)
8. [Testes de API](#testes-de-api)
9. [Testes de Banco de Dados](#testes-de-banco-de-dados)
10. [Testes de Integração Externa](#testes-de-integração-externa)

## Testes Unitários

### Controllers
- [ ] **AuthController**
  - [ ] `login()` - credenciais válidas
  - [ ] `login()` - credenciais inválidas
  - [ ] `login()` - usuário inativo
  - [ ] `register()` - dados válidos
  - [ ] `register()` - email duplicado
  - [ ] `register()` - dados inválidos
  - [ ] `logout()` - logout bem-sucedido
  - [ ] `refreshToken()` - token válido
  - [ ] `refreshToken()` - token inválido
  - [ ] `forgotPassword()` - email válido
  - [ ] `forgotPassword()` - email inválido
  - [ ] `resetPassword()` - token válido
  - [ ] `resetPassword()` - token inválido

- [ ] **UserController**
  - [ ] `getProfile()` - usuário autenticado
  - [ ] `getProfile()` - usuário não autenticado
  - [ ] `updateProfile()` - dados válidos
  - [ ] `updateProfile()` - dados inválidos
  - [ ] `deleteProfile()` - usuário autenticado
  - [ ] `deleteProfile()` - usuário não autenticado
  - [ ] `getUsers()` - com filtros
  - [ ] `getUsers()` - sem filtros
  - [ ] `getUsers()` - paginação
  - [ ] `getUserById()` - ID válido
  - [ ] `getUserById()` - ID inválido

- [ ] **OpportunityController**
  - [ ] `createOpportunity()` - dados válidos
  - [ ] `createOpportunity()` - dados inválidos
  - [ ] `getOpportunities()` - com filtros
  - [ ] `getOpportunities()` - sem filtros
  - [ ] `getOpportunityById()` - ID válido
  - [ ] `getOpportunityById()` - ID inválido
  - [ ] `updateOpportunity()` - dados válidos
  - [ ] `updateOpportunity()` - dados inválidos
  - [ ] `deleteOpportunity()` - ID válido
  - [ ] `deleteOpportunity()` - ID inválido
  - [ ] `applyToOpportunity()` - aplicação válida
  - [ ] `applyToOpportunity()` - aplicação inválida

- [ ] **MatchingController**
  - [ ] `findMatches()` - critérios válidos
  - [ ] `findMatches()` - critérios inválidos
  - [ ] `getMatchScore()` - usuário e oportunidade válidos
  - [ ] `getMatchScore()` - usuário ou oportunidade inválidos
  - [ ] `updateMatchPreferences()` - preferências válidas
  - [ ] `updateMatchPreferences()` - preferências inválidas

### Services
- [ ] **UserService**
  - [ ] `createUser()` - dados válidos
  - [ ] `createUser()` - email duplicado
  - [ ] `createUser()` - dados inválidos
  - [ ] `findById()` - ID válido
  - [ ] `findById()` - ID inválido
  - [ ] `updateUser()` - dados válidos
  - [ ] `updateUser()` - dados inválidos
  - [ ] `deleteUser()` - ID válido
  - [ ] `deleteUser()` - ID inválido
  - [ ] `validatePassword()` - senha válida
  - [ ] `validatePassword()` - senha inválida
  - [ ] `hashPassword()` - hash correto
  - [ ] `comparePassword()` - senha correta
  - [ ] `comparePassword()` - senha incorreta

- [ ] **OpportunityService**
  - [ ] `createOpportunity()` - dados válidos
  - [ ] `createOpportunity()` - dados inválidos
  - [ ] `findById()` - ID válido
  - [ ] `findById()` - ID inválido
  - [ ] `updateOpportunity()` - dados válidos
  - [ ] `updateOpportunity()` - dados inválidos
  - [ ] `deleteOpportunity()` - ID válido
  - [ ] `deleteOpportunity()` - ID inválido
  - [ ] `searchOpportunities()` - critérios válidos
  - [ ] `searchOpportunities()` - critérios inválidos
  - [ ] `getOpportunitiesByInstitution()` - instituição válida
  - [ ] `getOpportunitiesByInstitution()` - instituição inválida

- [ ] **MatchingService**
  - [ ] `calculateMatchScore()` - critérios válidos
  - [ ] `calculateMatchScore()` - critérios inválidos
  - [ ] `findMatches()` - usuário válido
  - [ ] `findMatches()` - usuário inválido
  - [ ] `updateMatchPreferences()` - preferências válidas
  - [ ] `updateMatchPreferences()` - preferências inválidas
  - [ ] `getMatchHistory()` - usuário válido
  - [ ] `getMatchHistory()` - usuário inválido

### Middleware
- [ ] **AuthMiddleware**
  - [ ] Token válido
  - [ ] Token inválido
  - [ ] Token expirado
  - [ ] Token ausente
  - [ ] Usuário inativo
  - [ ] Usuário não encontrado

- [ ] **ValidationMiddleware**
  - [ ] Dados válidos
  - [ ] Dados inválidos
  - [ ] Dados ausentes
  - [ ] Dados malformados
  - [ ] Dados com tipos incorretos

- [ ] **ErrorHandlerMiddleware**
  - [ ] Erro de validação
  - [ ] Erro de autenticação
  - [ ] Erro de autorização
  - [ ] Erro de banco de dados
  - [ ] Erro interno do servidor

### Utils
- [ ] **ValidationUtils**
  - [ ] `validateEmail()` - email válido
  - [ ] `validateEmail()` - email inválido
  - [ ] `validatePassword()` - senha válida
  - [ ] `validatePassword()` - senha inválida
  - [ ] `validatePhone()` - telefone válido
  - [ ] `validatePhone()` - telefone inválido
  - [ ] `validateDate()` - data válida
  - [ ] `validateDate()` - data inválida

- [ ] **FormatUtils**
  - [ ] `formatDate()` - data válida
  - [ ] `formatDate()` - data inválida
  - [ ] `formatCurrency()` - valor válido
  - [ ] `formatCurrency()` - valor inválido
  - [ ] `formatPhone()` - telefone válido
  - [ ] `formatPhone()` - telefone inválido

## Testes de Integração

### APIs de Autenticação
- [ ] **POST /api/auth/register**
  - [ ] Registro com dados válidos
  - [ ] Registro com email duplicado
  - [ ] Registro com dados inválidos
  - [ ] Registro com dados ausentes
  - [ ] Registro com dados malformados

- [ ] **POST /api/auth/login**
  - [ ] Login com credenciais válidas
  - [ ] Login com credenciais inválidas
  - [ ] Login com usuário inativo
  - [ ] Login com dados ausentes
  - [ ] Login com dados malformados

- [ ] **POST /api/auth/logout**
  - [ ] Logout com token válido
  - [ ] Logout com token inválido
  - [ ] Logout com token ausente

- [ ] **POST /api/auth/refresh**
  - [ ] Refresh com token válido
  - [ ] Refresh com token inválido
  - [ ] Refresh com token expirado

### APIs de Usuário
- [ ] **GET /api/users/profile**
  - [ ] Perfil com usuário autenticado
  - [ ] Perfil com usuário não autenticado
  - [ ] Perfil com token inválido

- [ ] **PUT /api/users/profile**
  - [ ] Atualização com dados válidos
  - [ ] Atualização com dados inválidos
  - [ ] Atualização com usuário não autenticado

- [ ] **GET /api/users**
  - [ ] Lista com filtros válidos
  - [ ] Lista sem filtros
  - [ ] Lista com paginação
  - [ ] Lista com usuário não autenticado

### APIs de Oportunidades
- [ ] **GET /api/opportunities**
  - [ ] Lista com filtros válidos
  - [ ] Lista sem filtros
  - [ ] Lista com paginação
  - [ ] Lista com busca por texto

- [ ] **POST /api/opportunities**
  - [ ] Criação com dados válidos
  - [ ] Criação com dados inválidos
  - [ ] Criação com usuário não autenticado
  - [ ] Criação com usuário sem permissão

- [ ] **GET /api/opportunities/:id**
  - [ ] Busca com ID válido
  - [ ] Busca com ID inválido
  - [ ] Busca com ID inexistente

- [ ] **PUT /api/opportunities/:id**
  - [ ] Atualização com dados válidos
  - [ ] Atualização com dados inválidos
  - [ ] Atualização com usuário não autenticado
  - [ ] Atualização com usuário sem permissão

- [ ] **DELETE /api/opportunities/:id**
  - [ ] Exclusão com ID válido
  - [ ] Exclusão com ID inválido
  - [ ] Exclusão com usuário não autenticado
  - [ ] Exclusão com usuário sem permissão

### APIs de Matching
- [ ] **GET /api/matching/matches**
  - [ ] Busca com critérios válidos
  - [ ] Busca com critérios inválidos
  - [ ] Busca com usuário não autenticado

- [ ] **POST /api/matching/apply**
  - [ ] Aplicação com dados válidos
  - [ ] Aplicação com dados inválidos
  - [ ] Aplicação com usuário não autenticado
  - [ ] Aplicação com oportunidade inexistente

## Testes End-to-End

### Fluxo de Voluntário
- [ ] **Registro de Voluntário**
  - [ ] Acesso à página de registro
  - [ ] Preenchimento do formulário
  - [ ] Validação de dados
  - [ ] Submissão do formulário
  - [ ] Confirmação de registro
  - [ ] Redirecionamento para dashboard

- [ ] **Login de Voluntário**
  - [ ] Acesso à página de login
  - [ ] Preenchimento de credenciais
  - [ ] Validação de credenciais
  - [ ] Autenticação bem-sucedida
  - [ ] Redirecionamento para dashboard

- [ ] **Busca de Oportunidades**
  - [ ] Acesso à página de oportunidades
  - [ ] Aplicação de filtros
  - [ ] Busca por texto
  - [ ] Visualização de resultados
  - [ ] Paginação de resultados

- [ ] **Aplicação para Oportunidade**
  - [ ] Seleção de oportunidade
  - [ ] Visualização de detalhes
  - [ ] Preenchimento de formulário de aplicação
  - [ ] Submissão de aplicação
  - [ ] Confirmação de aplicação

### Fluxo de Instituição
- [ ] **Registro de Instituição**
  - [ ] Acesso à página de registro
  - [ ] Preenchimento do formulário
  - [ ] Validação de dados
  - [ ] Submissão do formulário
  - [ ] Confirmação de registro
  - [ ] Redirecionamento para dashboard

- [ ] **Criação de Oportunidade**
  - [ ] Acesso à página de criação
  - [ ] Preenchimento do formulário
  - [ ] Validação de dados
  - [ ] Submissão do formulário
  - [ ] Confirmação de criação
  - [ ] Visualização na lista

- [ ] **Gerenciamento de Aplicações**
  - [ ] Acesso à lista de aplicações
  - [ ] Visualização de aplicações
  - [ ] Aprovação de aplicação
  - [ ] Rejeição de aplicação
  - [ ] Comunicação com voluntário

### Fluxo de Administração
- [ ] **Login de Administrador**
  - [ ] Acesso à página de login
  - [ ] Preenchimento de credenciais
  - [ ] Autenticação bem-sucedida
  - [ ] Redirecionamento para dashboard

- [ ] **Gerenciamento de Usuários**
  - [ ] Acesso à lista de usuários
  - [ ] Visualização de usuários
  - [ ] Edição de usuário
  - [ ] Exclusão de usuário
  - [ ] Suspensão de usuário

- [ ] **Gerenciamento de Oportunidades**
  - [ ] Acesso à lista de oportunidades
  - [ ] Visualização de oportunidades
  - [ ] Edição de oportunidade
  - [ ] Exclusão de oportunidade
  - [ ] Aprovação de oportunidade

## Testes de Performance

### APIs
- [ ] **Tempo de Resposta**
  - [ ] GET /api/opportunities < 200ms
  - [ ] POST /api/auth/login < 500ms
  - [ ] GET /api/users/profile < 100ms
  - [ ] POST /api/opportunities < 1000ms
  - [ ] GET /api/matching/matches < 300ms

- [ ] **Throughput**
  - [ ] 100 requisições/segundo para GET /api/opportunities
  - [ ] 50 requisições/segundo para POST /api/auth/login
  - [ ] 200 requisições/segundo para GET /api/users/profile
  - [ ] 20 requisições/segundo para POST /api/opportunities
  - [ ] 30 requisições/segundo para GET /api/matching/matches

- [ ] **Concorrência**
  - [ ] 100 usuários simultâneos
  - [ ] 500 usuários simultâneos
  - [ ] 1000 usuários simultâneos
  - [ ] 2000 usuários simultâneos

### Banco de Dados
- [ ] **Queries**
  - [ ] Query de busca de oportunidades < 100ms
  - [ ] Query de criação de usuário < 50ms
  - [ ] Query de atualização de perfil < 50ms
  - [ ] Query de busca de matches < 200ms
  - [ ] Query de listagem de usuários < 150ms

- [ ] **Índices**
  - [ ] Índice em email de usuário
  - [ ] Índice em status de oportunidade
  - [ ] Índice em data de início de oportunidade
  - [ ] Índice em localização de oportunidade
  - [ ] Índice em categoria de oportunidade

### Frontend
- [ ] **Tempo de Carregamento**
  - [ ] Página inicial < 2s
  - [ ] Página de login < 1s
  - [ ] Página de oportunidades < 3s
  - [ ] Página de perfil < 2s
  - [ ] Página de dashboard < 2s

- [ ] **Tempo de Renderização**
  - [ ] Lista de oportunidades < 500ms
  - [ ] Formulário de login < 200ms
  - [ ] Formulário de registro < 300ms
  - [ ] Formulário de perfil < 400ms
  - [ ] Formulário de oportunidade < 600ms

## Testes de Segurança

### Autenticação
- [ ] **Login**
  - [ ] Credenciais válidas
  - [ ] Credenciais inválidas
  - [ ] Usuário inexistente
  - [ ] Senha incorreta
  - [ ] Usuário inativo
  - [ ] Múltiplas tentativas de login

- [ ] **Registro**
  - [ ] Dados válidos
  - [ ] Email duplicado
  - [ ] Dados inválidos
  - [ ] Dados malformados
  - [ ] Ataques de injeção

### Autorização
- [ ] **Controle de Acesso**
  - [ ] Usuário autenticado
  - [ ] Usuário não autenticado
  - [ ] Usuário com permissão
  - [ ] Usuário sem permissão
  - [ ] Escalação de privilégios

- [ ] **Recursos Protegidos**
  - [ ] Acesso a perfil próprio
  - [ ] Acesso a perfil de outros
  - [ ] Criação de oportunidades
  - [ ] Edição de oportunidades
  - [ ] Exclusão de oportunidades

### Validação de Entrada
- [ ] **Dados de Entrada**
  - [ ] Validação de email
  - [ ] Validação de senha
  - [ ] Validação de telefone
  - [ ] Validação de data
  - [ ] Validação de URL

- [ ] **Ataques Comuns**
  - [ ] SQL Injection
  - [ ] XSS (Cross-Site Scripting)
  - [ ] CSRF (Cross-Site Request Forgery)
  - [ ] Path Traversal
  - [ ] Command Injection

### Criptografia
- [ ] **Senhas**
  - [ ] Hash com bcrypt
  - [ ] Salt único por usuário
  - [ ] Rounds adequados (12+)
  - [ ] Verificação de senha

- [ ] **Tokens**
  - [ ] JWT com assinatura
  - [ ] Expiração adequada
  - [ ] Refresh token seguro
  - [ ] Revogação de token

## Testes de Acessibilidade

### Navegação por Teclado
- [ ] **Elementos Interativos**
  - [ ] Botões acessíveis
  - [ ] Links acessíveis
  - [ ] Formulários acessíveis
  - [ ] Menus acessíveis
  - [ ] Modais acessíveis

- [ ] **Ordem de Tabulação**
  - [ ] Ordem lógica
  - [ ] Foco visível
  - [ ] Indicador de foco
  - [ ] Navegação circular
  - [ ] Escape de modais

### Screen Readers
- [ ] **Conteúdo Estruturado**
  - [ ] Headings hierárquicos
  - [ ] Listas estruturadas
  - [ ] Tabelas acessíveis
  - [ ] Formulários estruturados
  - [ ] Navegação estruturada

- [ ] **Textos Alternativos**
  - [ ] Alt text em imagens
  - [ ] Labels em formulários
  - [ ] Descriptions em elementos
  - [ ] Aria labels
  - [ ] Aria descriptions

### Contraste e Cores
- [ ] **Contraste de Cores**
  - [ ] Contraste 4.5:1 ou superior
  - [ ] Contraste 3:1 para texto grande
  - [ ] Contraste em estados de foco
  - [ ] Contraste em estados de hover
  - [ ] Contraste em estados de erro

- [ ] **Independência de Cor**
  - [ ] Informação não apenas por cor
  - [ ] Indicadores visuais adicionais
  - [ ] Texto descritivo
  - [ ] Ícones descritivos
  - [ ] Padrões visuais

### Responsividade
- [ ] **Diferentes Tamanhos**
  - [ ] Desktop (1920x1080)
  - [ ] Laptop (1366x768)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
  - [ ] Mobile grande (414x896)

- [ ] **Orientação**
  - [ ] Retrato
  - [ ] Paisagem
  - [ ] Rotação de tela
  - [ ] Zoom 200%
  - [ ] Zoom 400%

## Testes Visuais

### Regressão Visual
- [ ] **Páginas Principais**
  - [ ] Página inicial
  - [ ] Página de login
  - [ ] Página de registro
  - [ ] Página de oportunidades
  - [ ] Página de perfil
  - [ ] Página de dashboard

- [ ] **Componentes**
  - [ ] Cards de oportunidade
  - [ ] Formulários
  - [ ] Botões
  - [ ] Navegação
  - [ ] Modais
  - [ ] Alertas

### Screenshots
- [ ] **Documentação**
  - [ ] Screenshots de todas as páginas
  - [ ] Screenshots de todos os componentes
  - [ ] Screenshots de diferentes estados
  - [ ] Screenshots de diferentes breakpoints
  - [ ] Screenshots de diferentes navegadores

### Componentes
- [ ] **Estados dos Componentes**
  - [ ] Estado padrão
  - [ ] Estado hover
  - [ ] Estado focus
  - [ ] Estado active
  - [ ] Estado disabled
  - [ ] Estado loading
  - [ ] Estado error
  - [ ] Estado success

## Testes de API

### Endpoints
- [ ] **Métodos HTTP**
  - [ ] GET endpoints
  - [ ] POST endpoints
  - [ ] PUT endpoints
  - [ ] DELETE endpoints
  - [ ] PATCH endpoints

- [ ] **Códigos de Status**
  - [ ] 200 OK
  - [ ] 201 Created
  - [ ] 400 Bad Request
  - [ ] 401 Unauthorized
  - [ ] 403 Forbidden
  - [ ] 404 Not Found
  - [ ] 409 Conflict
  - [ ] 422 Unprocessable Entity
  - [ ] 500 Internal Server Error

### Validação
- [ ] **Dados de Entrada**
  - [ ] Validação de tipos
  - [ ] Validação de formato
  - [ ] Validação de tamanho
  - [ ] Validação de obrigatoriedade
  - [ ] Validação de unicidade

- [ ] **Dados de Saída**
  - [ ] Formato JSON válido
  - [ ] Estrutura consistente
  - [ ] Campos obrigatórios
  - [ ] Tipos corretos
  - [ ] Valores válidos

### Autenticação
- [ ] **Tokens**
  - [ ] Token válido
  - [ ] Token inválido
  - [ ] Token expirado
  - [ ] Token ausente
  - [ ] Token malformado

- [ ] **Permissões**
  - [ ] Usuário autenticado
  - [ ] Usuário não autenticado
  - [ ] Usuário com permissão
  - [ ] Usuário sem permissão
  - [ ] Escalação de privilégios

## Testes de Banco de Dados

### Operações CRUD
- [ ] **Create**
  - [ ] Criação de usuário
  - [ ] Criação de oportunidade
  - [ ] Criação de aplicação
  - [ ] Criação de avaliação
  - [ ] Criação de mensagem

- [ ] **Read**
  - [ ] Leitura de usuário por ID
  - [ ] Leitura de usuário por email
  - [ ] Leitura de oportunidades com filtros
  - [ ] Leitura de aplicações por usuário
  - [ ] Leitura de avaliações por oportunidade

- [ ] **Update**
  - [ ] Atualização de perfil de usuário
  - [ ] Atualização de oportunidade
  - [ ] Atualização de status de aplicação
  - [ ] Atualização de avaliação
  - [ ] Atualização de mensagem

- [ ] **Delete**
  - [ ] Exclusão de usuário
  - [ ] Exclusão de oportunidade
  - [ ] Exclusão de aplicação
  - [ ] Exclusão de avaliação
  - [ ] Exclusão de mensagem

### Relacionamentos
- [ ] **Foreign Keys**
  - [ ] Integridade referencial
  - [ ] Cascata de exclusão
  - [ ] Restrição de exclusão
  - [ ] Atualização em cascata
  - [ ] Validação de relacionamentos

- [ ] **Joins**
  - [ ] Join simples
  - [ ] Join múltiplo
  - [ ] Join com filtros
  - [ ] Join com ordenação
  - [ ] Join com paginação

### Transações
- [ ] **Atomicidade**
  - [ ] Transação bem-sucedida
  - [ ] Rollback em caso de erro
  - [ ] Commit em caso de sucesso
  - [ ] Isolamento de transações
  - [ ] Consistência de dados

## Testes de Integração Externa

### Serviços de Email
- [ ] **Envio de Email**
  - [ ] Email de boas-vindas
  - [ ] Email de confirmação
  - [ ] Email de recuperação de senha
  - [ ] Email de notificação
  - [ ] Email de lembrete

- [ ] **Templates**
  - [ ] Template de boas-vindas
  - [ ] Template de confirmação
  - [ ] Template de recuperação
  - [ ] Template de notificação
  - [ ] Template de lembrete

### Serviços de SMS
- [ ] **Envio de SMS**
  - [ ] SMS de confirmação
  - [ ] SMS de notificação
  - [ ] SMS de lembrete
  - [ ] SMS de alerta
  - [ ] SMS de marketing

### Serviços de Pagamento
- [ ] **Processamento**
  - [ ] Pagamento bem-sucedido
  - [ ] Pagamento falhado
  - [ ] Pagamento cancelado
  - [ ] Reembolso
  - [ ] Assinatura

### Serviços de Geolocalização
- [ ] **Geocoding**
  - [ ] Endereço para coordenadas
  - [ ] Coordenadas para endereço
  - [ ] Validação de endereço
  - [ ] Busca por proximidade
  - [ ] Cálculo de distância

### Serviços de Notificação Push
- [ ] **Notificações**
  - [ ] Notificação de nova oportunidade
  - [ ] Notificação de aplicação aprovada
  - [ ] Notificação de lembrete
  - [ ] Notificação de mensagem
  - [ ] Notificação de sistema

## Checklist de Execução

### Antes dos Testes
- [ ] Ambiente de teste configurado
- [ ] Dados de teste preparados
- [ ] Ferramentas de teste instaladas
- [ ] Configurações de teste validadas
- [ ] Equipe de teste treinada

### Durante os Testes
- [ ] Executar testes em ordem
- [ ] Documentar falhas encontradas
- [ ] Registrar evidências de teste
- [ ] Atualizar status dos testes
- [ ] Comunicar problemas encontrados

### Após os Testes
- [ ] Compilar relatório de testes
- [ ] Analisar resultados
- [ ] Identificar padrões de falha
- [ ] Priorizar correções
- [ ] Planejar próximos passos

### Critérios de Aprovação
- [ ] Todos os testes passando
- [ ] Cobertura de código >= 80%
- [ ] Performance dentro dos limites
- [ ] Segurança validada
- [ ] Acessibilidade validada
- [ ] Documentação atualizada

## Ferramentas de Teste

### Testes Unitários
- [ ] Jest configurado
- [ ] Supertest configurado
- [ ] Mocks configurados
- [ ] Coverage configurado
- [ ] Reports configurados

### Testes E2E
- [ ] Playwright configurado
- [ ] Browsers instalados
- [ ] Testes escritos
- [ ] Reports configurados
- [ ] CI/CD configurado

### Testes de Performance
- [ ] Artillery configurado
- [ ] K6 configurado
- [ ] Autocannon configurado
- [ ] Clinic.js configurado
- [ ] Reports configurados

### Testes de Segurança
- [ ] OWASP ZAP configurado
- [ ] Snyk configurado
- [ ] npm audit configurado
- [ ] Reports configurados
- [ ] Alertas configurados

### Testes de Acessibilidade
- [ ] Pa11y configurado
- [ ] Axe-core configurado
- [ ] Lighthouse configurado
- [ ] Reports configurados
- [ ] CI/CD configurado

### Testes Visuais
- [ ] Playwright configurado
- [ ] Screenshots configurados
- [ ] Baselines configurados
- [ ] Reports configurados
- [ ] CI/CD configurado
