# Guia de Testes e Qualidade

Este documento fornece um guia completo para testes e qualidade no projeto de voluntariado.

## Índice

1. [Visão Geral](#visão-geral)
2. [Estratégia de Testes](#estratégia-de-testes)
3. [Tipos de Testes](#tipos-de-testes)
4. [Configuração e Execução](#configuração-e-execução)
5. [Padrões e Convenções](#padrões-e-convenções)
6. [Ferramentas e Tecnologias](#ferramentas-e-tecnologias)
7. [CI/CD e Automação](#cicd-e-automação)
8. [Métricas e Relatórios](#métricas-e-relatórios)
9. [Troubleshooting](#troubleshooting)
10. [Boas Práticas](#boas-práticas)

## Visão Geral

### Objetivos dos Testes
- **Qualidade**: Garantir que o código funcione corretamente
- **Confiabilidade**: Reduzir bugs e falhas em produção
- **Manutenibilidade**: Facilitar mudanças e refatorações
- **Documentação**: Servir como documentação viva do comportamento
- **Confiança**: Permitir deploys seguros e frequentes

### Cobertura de Testes
- **Backend**: 90%+ de cobertura de código
- **Frontend**: 85%+ de cobertura de código
- **APIs**: 100% dos endpoints testados
- **Fluxos Críticos**: 100% dos fluxos E2E testados
- **Componentes**: 100% dos componentes testados

## Estratégia de Testes

### Pirâmide de Testes

```
    /\
   /  \
  / E2E \     <- Poucos, lentos, caros
 /______\
/        \
/Integração\  <- Alguns, médios
/__________\
/            \
/   Unitários   \  <- Muitos, rápidos, baratos
/________________\
```

### Distribuição Ideal
- **70%** Testes Unitários
- **20%** Testes de Integração
- **10%** Testes End-to-End

### Critérios de Qualidade
- **Funcionalidade**: O código faz o que deveria fazer?
- **Performance**: O código é rápido o suficiente?
- **Segurança**: O código é seguro contra ataques?
- **Acessibilidade**: O código é acessível para todos?
- **Usabilidade**: O código é fácil de usar?

## Tipos de Testes

### 1. Testes Unitários

#### Objetivo
Testar unidades individuais de código (funções, métodos, classes) de forma isolada.

#### Escopo
- **Controllers**: Lógica de negócio dos endpoints
- **Services**: Lógica de negócio dos serviços
- **Utils**: Funções utilitárias
- **Middleware**: Lógica de middleware
- **Models**: Validações e transformações

#### Exemplo
```javascript
describe('AuthController', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'jwt-token';
      
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);
      
      const result = await authController.login({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(result).toEqual({
        success: true,
        token: mockToken,
        user: mockUser
      });
    });
  });
});
```

### 2. Testes de Integração

#### Objetivo
Testar a integração entre diferentes componentes do sistema.

#### Escopo
- **APIs**: Endpoints completos com banco de dados
- **Serviços**: Integração entre serviços
- **Middleware**: Cadeia de middleware
- **Banco de Dados**: Operações CRUD

#### Exemplo
```javascript
describe('Auth API Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  it('should register and login user', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(registerResponse.status).toBe(201);
    
    // Login user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });
});
```

### 3. Testes End-to-End

#### Objetivo
Testar fluxos completos do usuário de ponta a ponta.

#### Escopo
- **Fluxos Críticos**: Registro, login, matching, agendamento
- **Jornadas do Usuário**: Fluxos completos de voluntário e instituição
- **Integrações**: Testes com serviços externos

#### Exemplo
```javascript
describe('Volunteer Registration Flow', () => {
  it('should complete full registration process', async () => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');
    
    // Fill registration form
    await page.fill('[data-testid="name"]', 'John Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="submit"]');
    
    // Verify redirect to dashboard
    await page.waitForURL('**/dashboard');
    expect(await page.textContent('[data-testid="welcome"]')).toContain('John Doe');
  });
});
```

### 4. Testes de Performance

#### Objetivo
Garantir que o sistema atenda aos requisitos de performance.

#### Escopo
- **APIs**: Tempo de resposta e throughput
- **Banco de Dados**: Queries e operações
- **Frontend**: Tempo de carregamento e renderização
- **Carga**: Comportamento sob carga

#### Exemplo
```javascript
describe('API Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill().map(() => 
      request(app).get('/api/opportunities')
    );
    
    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(responses.every(r => r.status === 200)).toBe(true);
  });
});
```

### 5. Testes de Segurança

#### Objetivo
Identificar vulnerabilidades e garantir segurança.

#### Escopo
- **Autenticação**: Login e autorização
- **Autorização**: Controle de acesso
- **Validação**: Entrada de dados
- **Criptografia**: Dados sensíveis

#### Exemplo
```javascript
describe('Security Tests', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .get(`/api/users?search=${maliciousInput}`);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid input');
  });
});
```

### 6. Testes de Acessibilidade

#### Objetivo
Garantir que o sistema seja acessível para todos os usuários.

#### Escopo
- **WCAG**: Conformidade com diretrizes WCAG 2.1
- **Navegação**: Navegação por teclado
- **Screen Readers**: Compatibilidade com leitores de tela
- **Contraste**: Contraste de cores adequado

#### Exemplo
```javascript
describe('Accessibility Tests', () => {
  it('should be keyboard navigable', async () => {
    await page.goto('http://localhost:3000/opportunities');
    
    // Tab through all interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});
```

### 7. Testes Visuais

#### Objetivo
Garantir que a interface visual seja consistente e correta.

#### Escopo
- **Regressão Visual**: Comparação com imagens de referência
- **Screenshots**: Captura de telas para documentação
- **Componentes**: Teste de componentes individuais
- **Responsividade**: Diferentes tamanhos de tela

#### Exemplo
```javascript
describe('Visual Regression Tests', () => {
  it('should match baseline for home page', async () => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('home-page.png');
  });
});
```

## Configuração e Execução

### Instalação de Dependências

```bash
# Instalar dependências principais
npm install

# Instalar dependências de desenvolvimento
npm install --save-dev jest supertest playwright

# Instalar browsers do Playwright
npx playwright install chromium
```

### Scripts de Teste

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:security
npm run test:accessibility
npm run test:visual

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

### Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true
};
```

### Configuração do Playwright

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};
```

## Padrões e Convenções

### Estrutura de Arquivos

```
tests/
├── unit/                    # Testes unitários
│   ├── controllers/         # Testes de controllers
│   ├── services/           # Testes de serviços
│   ├── middleware/         # Testes de middleware
│   └── utils/              # Testes de utilitários
├── integration/            # Testes de integração
│   ├── auth.test.js        # Testes de autenticação
│   ├── opportunities.test.js # Testes de oportunidades
│   └── matching.test.js    # Testes de matching
├── e2e/                    # Testes end-to-end
│   ├── volunteer-flow.test.js
│   ├── institution-flow.test.js
│   └── admin-flow.test.js
├── performance/            # Testes de performance
│   ├── load-test.js
│   ├── stress-test.js
│   └── benchmark.js
├── security/               # Testes de segurança
│   ├── auth-security.test.js
│   ├── input-validation.test.js
│   └── vulnerability-scan.js
├── accessibility/          # Testes de acessibilidade
│   ├── wcag-compliance.test.js
│   └── keyboard-navigation.test.js
├── visual/                 # Testes visuais
│   ├── regression.test.js
│   ├── screenshot.test.js
│   └── component.test.js
└── setup.js               # Configuração global
```

### Convenções de Nomenclatura

#### Arquivos de Teste
- **Unitários**: `*.test.js` ou `*.spec.js`
- **Integração**: `*.integration.test.js`
- **E2E**: `*.e2e.test.js`
- **Performance**: `*.performance.test.js`
- **Segurança**: `*.security.test.js`
- **Acessibilidade**: `*.accessibility.test.js`
- **Visual**: `*.visual.test.js`

#### Descrição de Testes
```javascript
// ✅ Bom
describe('AuthController', () => {
  describe('login', () => {
    it('should return token for valid credentials', () => {});
    it('should return error for invalid credentials', () => {});
    it('should return error for missing email', () => {});
  });
});

// ❌ Ruim
describe('AuthController', () => {
  it('should work', () => {});
  it('should not work', () => {});
});
```

#### Organização de Testes
```javascript
// ✅ Bom - Arrange, Act, Assert
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
    });
  });
});
```

### Mocks e Stubs

#### Quando Usar
- **Mocks**: Para simular dependências externas
- **Stubs**: Para substituir implementações
- **Spies**: Para verificar chamadas de função

#### Exemplo
```javascript
describe('EmailService', () => {
  let mockTransporter;
  
  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    };
    
    jest.spyOn(nodemailer, 'createTransporter').mockReturnValue(mockTransporter);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should send email successfully', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'Test content'
    };
    
    const result = await emailService.sendEmail(emailData);
    
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(emailData);
    expect(result.success).toBe(true);
  });
});
```

## Ferramentas e Tecnologias

### Testes Unitários e Integração
- **Jest**: Framework de testes JavaScript
- **Supertest**: Testes de API HTTP
- **Factory Girl**: Criação de dados de teste
- **Faker**: Geração de dados fake

### Testes End-to-End
- **Playwright**: Automação de navegador
- **Puppeteer**: Alternativa ao Playwright
- **Cypress**: Framework de testes E2E

### Testes de Performance
- **Artillery**: Testes de carga
- **K6**: Testes de performance
- **Autocannon**: Testes de carga HTTP
- **Clinic.js**: Profiling de performance

### Testes de Segurança
- **OWASP ZAP**: Scanner de vulnerabilidades
- **Snyk**: Análise de dependências
- **npm audit**: Auditoria de segurança

### Testes de Acessibilidade
- **Pa11y**: Testes de acessibilidade
- **Axe-core**: Engine de acessibilidade
- **Lighthouse**: Auditoria de acessibilidade

### Testes Visuais
- **Playwright**: Screenshots e comparação
- **pixelmatch**: Comparação de imagens
- **Percy**: Serviço de testes visuais

### Qualidade de Código
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **SonarQube**: Análise de qualidade
- **CodeClimate**: Análise de qualidade

## CI/CD e Automação

### GitHub Actions

#### Workflow de Testes
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

#### Workflow de Qualidade
```yaml
name: Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test:security
      - run: npm run test:accessibility
      - run: npm run test:visual
      - run: npm run quality:report
```

### Configuração de Branches

#### Proteção de Branches
- **main**: Requer testes passando
- **develop**: Requer testes passando
- **feature/**: Requer testes unitários passando

#### Gates de Qualidade
- **Cobertura**: Mínimo 80% de cobertura
- **Linting**: Sem erros de ESLint
- **Formatação**: Código formatado com Prettier
- **Segurança**: Sem vulnerabilidades críticas

## Métricas e Relatórios

### Cobertura de Código

#### Métricas Importantes
- **Statements**: Percentual de statements executados
- **Branches**: Percentual de branches testados
- **Functions**: Percentual de funções testadas
- **Lines**: Percentual de linhas executadas

#### Relatórios
```bash
# Gerar relatório de cobertura
npm run test:coverage

# Visualizar relatório HTML
open coverage/index.html

# Gerar relatório LCOV
npm run test:coverage -- --coverageReporters=lcov
```

### Qualidade de Código

#### Métricas
- **Complexidade Ciclomática**: Número de caminhos independentes
- **Duplicação**: Percentual de código duplicado
- **Manutenibilidade**: Índice de manutenibilidade
- **Confiabilidade**: Índice de confiabilidade

#### Relatórios
```bash
# Gerar relatório de qualidade
npm run quality:report

# Visualizar relatório
open quality-reports/quality-report.html
```

### Performance

#### Métricas
- **Tempo de Resposta**: Tempo médio de resposta
- **Throughput**: Requisições por segundo
- **Latência**: Tempo de resposta percentil 95
- **Erro Rate**: Taxa de erro

#### Relatórios
```bash
# Executar testes de performance
npm run test:performance

# Visualizar relatório
open quality-reports/performance-report.html
```

## Troubleshooting

### Problemas Comuns

#### Testes Falhando
```bash
# Verificar logs detalhados
npm test -- --verbose

# Executar teste específico
npm test -- --testNamePattern="should login user"

# Executar com debug
DEBUG=* npm test
```

#### Problemas de Timeout
```javascript
// Aumentar timeout
jest.setTimeout(30000);

// Ou no arquivo de configuração
module.exports = {
  testTimeout: 30000
};
```

#### Problemas de Banco de Dados
```javascript
// Limpar banco antes de cada teste
beforeEach(async () => {
  await cleanupDatabase();
});

// Usar transações para isolamento
beforeEach(async () => {
  await db.beginTransaction();
});

afterEach(async () => {
  await db.rollback();
});
```

#### Problemas de E2E
```javascript
// Aguardar elementos aparecerem
await page.waitForSelector('[data-testid="submit"]');

// Aguardar navegação
await page.waitForURL('**/dashboard');

// Aguardar carregamento
await page.waitForLoadState('networkidle');
```

### Debugging

#### Debug de Testes Unitários
```javascript
// Usar console.log
console.log('Debug info:', data);

// Usar debugger
debugger;

// Usar expect.any()
expect(result).toEqual(expect.any(Object));
```

#### Debug de Testes E2E
```javascript
// Executar em modo headful
await chromium.launch({ headless: false });

// Pausar execução
await page.pause();

// Tirar screenshot
await page.screenshot({ path: 'debug.png' });
```

## Boas Práticas

### Estrutura de Testes

#### Organização
- **Um arquivo por módulo**: `userController.test.js`
- **Agrupamento lógico**: `describe` para agrupar testes relacionados
- **Nomes descritivos**: `it('should return user when valid id is provided')`
- **Setup e teardown**: `beforeEach` e `afterEach` para preparação

#### Dados de Teste
- **Dados isolados**: Cada teste deve ser independente
- **Dados realistas**: Usar dados que representem casos reais
- **Dados limpos**: Limpar dados após cada teste
- **Dados consistentes**: Usar factories para criar dados

### Performance

#### Otimização
- **Testes paralelos**: Executar testes em paralelo quando possível
- **Mocks eficientes**: Usar mocks para dependências lentas
- **Setup otimizado**: Minimizar setup desnecessário
- **Cleanup eficiente**: Limpar recursos adequadamente

#### Monitoramento
- **Tempo de execução**: Monitorar tempo total de testes
- **Testes lentos**: Identificar e otimizar testes lentos
- **Flaky tests**: Identificar e corrigir testes instáveis
- **Cobertura**: Manter cobertura adequada

### Manutenibilidade

#### Código Limpo
- **DRY**: Don't Repeat Yourself
- **Single Responsibility**: Cada teste deve ter uma responsabilidade
- **Nomes claros**: Nomes que explicam o que está sendo testado
- **Comentários**: Comentar lógica complexa

#### Refatoração
- **Refatorar regularmente**: Manter código de teste limpo
- **Extrair helpers**: Criar funções auxiliares reutilizáveis
- **Padronizar**: Usar padrões consistentes
- **Documentar**: Documentar convenções e padrões

### Qualidade

#### Padrões
- **Convenções**: Seguir convenções estabelecidas
- **Linting**: Usar ESLint para manter qualidade
- **Formatação**: Usar Prettier para formatação consistente
- **Revisão**: Revisar código de teste como código de produção

#### Monitoramento
- **Métricas**: Acompanhar métricas de qualidade
- **Trends**: Monitorar tendências ao longo do tempo
- **Alertas**: Configurar alertas para degradação
- **Relatórios**: Gerar relatórios regulares

### Segurança

#### Dados Sensíveis
- **Não commitar**: Nunca commitar dados sensíveis
- **Variáveis de ambiente**: Usar variáveis de ambiente
- **Secrets**: Usar gerenciamento de secrets
- **Rotação**: Rotacionar credenciais regularmente

#### Testes de Segurança
- **Validação**: Testar validação de entrada
- **Autorização**: Testar controle de acesso
- **Autenticação**: Testar autenticação
- **Criptografia**: Testar criptografia de dados

### Acessibilidade

#### Testes Inclusivos
- **WCAG**: Seguir diretrizes WCAG 2.1
- **Navegação**: Testar navegação por teclado
- **Screen readers**: Testar com leitores de tela
- **Contraste**: Verificar contraste de cores

#### Ferramentas
- **Automated**: Usar ferramentas automatizadas
- **Manual**: Fazer testes manuais regulares
- **Usuários**: Testar com usuários reais
- **Feedback**: Coletar feedback de acessibilidade

### Documentação

#### Testes como Documentação
- **Comportamento**: Testes devem documentar comportamento
- **Casos de uso**: Testes devem cobrir casos de uso
- **Exemplos**: Testes devem servir como exemplos
- **Especificação**: Testes devem especificar requisitos

#### Documentação Técnica
- **README**: Manter README atualizado
- **Guias**: Criar guias para diferentes tipos de teste
- **Exemplos**: Fornecer exemplos práticos
- **Troubleshooting**: Documentar problemas comuns

## Conclusão

Este guia fornece uma base sólida para implementar e manter testes de qualidade no projeto de voluntariado. Seguindo essas práticas e ferramentas, podemos garantir que o sistema seja confiável, seguro e acessível para todos os usuários.

### Próximos Passos
1. **Implementar**: Implementar os testes descritos
2. **Automatizar**: Configurar CI/CD para execução automática
3. **Monitorar**: Configurar monitoramento de qualidade
4. **Melhorar**: Continuar melhorando baseado em feedback
5. **Documentar**: Manter documentação atualizada

### Recursos Adicionais
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
