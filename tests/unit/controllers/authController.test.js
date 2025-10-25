import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} from '../../controllers/authController.js';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

describe('Auth Controller - Unit Tests', () => {
  let mockPrisma;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = global.testUtils.mockRequest();
    mockRes = global.testUtils.mockResponse();
    mockNext = global.testUtils.mockNext();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        type: 'VOLUNTEER'
      };

      mockReq.body = userData;
      bcrypt.hash.mockResolvedValue('hashedpassword');
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashedpassword'
      });

      await register(mockReq, mockRes, mockNext);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: 'hashedpassword',
          name: userData.name,
          type: userData.type
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.objectContaining({
          id: 1,
          email: userData.email,
          name: userData.name,
          type: userData.type
        })
      });
    });

    test('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        type: 'VOLUNTEER'
      };

      mockReq.body = userData;
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: userData.email });

      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User already exists with this email'
      });
    });

    test('should return error for invalid input data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: '',
        type: 'INVALID'
      };

      mockReq.body = invalidData;

      await register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid input data',
        errors: expect.any(Array)
      });
    });
  });

  describe('login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = {
        id: 1,
        email: loginData.email,
        password: 'hashedpassword',
        name: 'Test User',
        type: 'VOLUNTEER',
        isEmailVerified: true
      };

      mockReq.body = loginData;
      mockPrisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      await login(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: expect.objectContaining({
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type
        })
      });
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const user = {
        id: 1,
        email: loginData.email,
        password: 'hashedpassword',
        name: 'Test User',
        type: 'VOLUNTEER'
      };

      mockReq.body = loginData;
      mockPrisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    test('should return error for unverified email', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = {
        id: 1,
        email: loginData.email,
        password: 'hashedpassword',
        name: 'Test User',
        type: 'VOLUNTEER',
        isEmailVerified: false
      };

      mockReq.body = loginData;
      mockPrisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please verify your email before logging in'
      });
    });
  });

  describe('logout', () => {
    test('should logout user successfully', async () => {
      await logout(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
    });
  });

  describe('refreshToken', () => {
    test('should refresh token successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        type: 'VOLUNTEER'
      };

      mockReq.user = user;
      jwt.sign.mockReturnValue('new-mock-jwt-token');

      await refreshToken(mockReq, mockRes, mockNext);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        token: 'new-mock-jwt-token'
      });
    });
  });

  describe('forgotPassword', () => {
    test('should send password reset email successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      mockReq.body = { email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        resetPasswordToken: 'mock-reset-token'
      });

      await forgotPassword(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          resetPasswordToken: expect.any(String),
          resetPasswordExpires: expect.any(Date)
        })
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password reset email sent'
      });
    });

    test('should return error if user not found', async () => {
      mockReq.body = { email: 'nonexistent@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await forgotPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour from now
      };

      mockReq.body = {
        token: 'valid-token',
        password: 'newpassword123'
      };

      mockPrisma.user.findFirst.mockResolvedValue(user);
      bcrypt.hash.mockResolvedValue('new-hashed-password');
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        password: 'new-hashed-password',
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      await resetPassword(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: {
            gt: expect.any(Date)
          }
        }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          password: 'new-hashed-password',
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password reset successfully'
      });
    });

    test('should return error for invalid or expired token', async () => {
      mockReq.body = {
        token: 'invalid-token',
        password: 'newpassword123'
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);

      await resetPassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid or expired reset token'
      });
    });
  });

  describe('verifyEmail', () => {
    test('should verify email successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        emailVerificationToken: 'valid-token',
        isEmailVerified: false
      };

      mockReq.params = { token: 'valid-token' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        isEmailVerified: true,
        emailVerificationToken: null
      });

      await verifyEmail(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: 'valid-token' }
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email verified successfully'
      });
    });

    test('should return error for invalid token', async () => {
      mockReq.params = { token: 'invalid-token' };
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await verifyEmail(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid verification token'
      });
    });
  });

  describe('resendVerification', () => {
    test('should resend verification email successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        isEmailVerified: false
      };

      mockReq.body = { email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        emailVerificationToken: 'new-verification-token'
      });

      await resendVerification(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          emailVerificationToken: expect.any(String)
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Verification email sent'
      });
    });

    test('should return error if email already verified', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        isEmailVerified: true
      };

      mockReq.body = { email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      await resendVerification(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already verified'
      });
    });
  });
});
