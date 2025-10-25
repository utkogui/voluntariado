const request = require('supertest');
const app = require('../server');

describe('Validation Middleware', () => {
  describe('Email validation', () => {
    it('should accept valid email format', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      // Deve processar a requisição (pode falhar por outros motivos, mas não por validação)
      expect(response.status).not.toBe(400);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('Password validation', () => {
    it('should accept password with 6+ characters', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      expect(response.status).not.toBe(400);
    });

    it('should reject password with less than 6 characters', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('User type validation', () => {
    it('should accept valid user types', async () => {
      const validTypes = ['VOLUNTEER', 'INSTITUTION', 'COMPANY', 'UNIVERSITY'];

      for (const userType of validTypes) {
        const data = {
          email: `test-${userType.toLowerCase()}@example.com`,
          password: 'password123',
          userType: userType,
          firstName: 'João',
          lastName: 'Silva'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(data);

        expect(response.status).not.toBe(400);
      }
    });

    it('should reject invalid user type', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'INVALID_TYPE',
        firstName: 'João',
        lastName: 'Silva'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('Phone validation', () => {
    it('should accept valid phone format', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva',
        phone: '(11) 99999-9999'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid phone format', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva',
        phone: '11999999999' // Formato inválido
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('CNPJ validation', () => {
    it('should accept valid CNPJ format', async () => {
      const validData = {
        email: 'institution@example.com',
        password: 'password123',
        userType: 'INSTITUTION',
        name: 'ONG Teste',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        cnpj: '12.345.678/0001-90'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid CNPJ format', async () => {
      const invalidData = {
        email: 'institution@example.com',
        password: 'password123',
        userType: 'INSTITUTION',
        name: 'ONG Teste',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        cnpj: '12345678000190' // Formato inválido
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });
});
