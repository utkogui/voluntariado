import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/auth.js';
import { authenticateToken } from '../../middleware/auth.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Test route that requires authentication
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

let prisma;

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/volunteer_app_test'
        }
      }
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;
  });

  describe('POST /api/auth/register', () => {
    test('should register a new volunteer successfully', async () => {
      const userData = {
        email: 'volunteer@example.com',
        password: 'password123',
        name: 'John Doe',
        type: 'VOLUNTEER'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: userData.email,
        name: userData.name,
        type: userData.type
      });
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    test('should register a new institution successfully', async () => {
      const institutionData = {
        email: 'institution@example.com',
        password: 'password123',
        name: 'Test NGO',
        type: 'INSTITUTION'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(institutionData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user.type).toBe('INSTITUTION');
    });

    test('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'John Doe',
        type: 'VOLUNTEER'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists with this email');
    });

    test('should return error for invalid input data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: '',
        type: 'INVALID_TYPE'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid input data');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          name: 'Test User',
          type: 'VOLUNTEER',
          isEmailVerified: true
        }
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(typeof response.body.token).toBe('string');
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('should return error for unverified email', async () => {
      // Create user with unverified email
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Unverified User',
          type: 'VOLUNTEER',
          isEmailVerified: false
        }
      });

      const loginData = {
        email: 'unverified@example.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Please verify your email before logging in');
    });

    test('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh token with valid token', async () => {
      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: 'refresh@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Refresh User',
          type: 'VOLUNTEER',
          isEmailVerified: true
        }
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'password'
        });

      const token = loginResponse.body.token;

      // Refresh token
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(token); // Should be a new token
    });

    test('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    test('should return error for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for existing user', async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          email: 'forgot@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Forgot User',
          type: 'VOLUNTEER',
          isEmailVerified: true
        }
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset email sent');

      // Verify reset token was created
      const user = await prisma.user.findUnique({
        where: { email: 'forgot@example.com' }
      });
      expect(user.resetPasswordToken).toBeTruthy();
      expect(user.resetPasswordExpires).toBeTruthy();
    });

    test('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      // Create user with reset token
      const user = await prisma.user.create({
        data: {
          email: 'reset@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Reset User',
          type: 'VOLUNTEER',
          isEmailVerified: true,
          resetPasswordToken: 'valid-reset-token',
          resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          password: 'newpassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset successfully');

      // Verify password was updated and reset token cleared
      const updatedUser = await prisma.user.findUnique({
        where: { email: 'reset@example.com' }
      });
      expect(updatedUser.resetPasswordToken).toBeNull();
      expect(updatedUser.resetPasswordExpires).toBeNull();
    });

    test('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
    });

    test('should return error for expired token', async () => {
      // Create user with expired reset token
      await prisma.user.create({
        data: {
          email: 'expired@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Expired User',
          type: 'VOLUNTEER',
          isEmailVerified: true,
          resetPasswordToken: 'expired-token',
          resetPasswordExpires: new Date(Date.now() - 3600000) // 1 hour ago
        }
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-token',
          password: 'newpassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
    });
  });

  describe('Authentication Middleware', () => {
    test('should access protected route with valid token', async () => {
      // Create and login user
      await prisma.user.create({
        data: {
          email: 'protected@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          name: 'Protected User',
          type: 'VOLUNTEER',
          isEmailVerified: true
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'password'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Protected route accessed');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('protected@example.com');
    });

    test('should return error for protected route without token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    test('should return error for protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
  });
});
