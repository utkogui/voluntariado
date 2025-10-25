const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/database');

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new volunteer successfully', async () => {
      const volunteerData = {
        email: 'volunteer@test.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva',
        phone: '(11) 99999-9999',
        city: 'São Paulo',
        state: 'SP',
        skills: ['Ensino', 'Tecnologia'],
        volunteerTypes: ['PRESENTIAL']
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(volunteerData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(volunteerData.email);
      expect(response.body.user.userType).toBe('VOLUNTEER');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should register a new institution successfully', async () => {
      const institutionData = {
        email: 'institution@test.com',
        password: 'password123',
        userType: 'INSTITUTION',
        name: 'ONG Teste',
        description: 'Organização de teste',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        cnpj: '12.345.678/0001-90'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(institutionData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(institutionData.email);
      expect(response.body.user.userType).toBe('INSTITUTION');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        userType: 'VOLUNTEER',
        firstName: 'João',
        lastName: 'Silva'
      };

      // Primeiro registro
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Muito curta
        userType: 'INVALID_TYPE'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashed_password123',
          userType: 'VOLUNTEER',
          status: 'ACTIVE',
          isVerified: true,
          volunteer: {
            create: {
              firstName: 'Test',
              lastName: 'User',
              city: 'São Paulo',
              state: 'SP',
              skills: ['Test'],
              volunteerTypes: ['PRESENTIAL']
            }
          }
        }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return error for invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify token successfully', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
