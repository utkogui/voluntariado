module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/uploads/',
    '/logs/'
  ],
  
  // Configuração de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Arquivos para cobertura
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    'config/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/uploads/**',
    '!**/logs/**'
  ],
  
  // Limite de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup antes dos testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configuração de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1'
  },
  
  // Configuração de transformação
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Configuração de globals
  globals: {
    'process.env.NODE_ENV': 'test'
  },
  
  // Configuração de verbose
  verbose: true,
  
  // Configuração de clearMocks
  clearMocks: true,
  
  // Configuração de restoreMocks
  restoreMocks: true,
  
  // Configuração de resetMocks
  resetMocks: true
};
