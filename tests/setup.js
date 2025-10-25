import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external services
jest.mock('../services/emailService.js', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendBulkEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/smsService.js', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/pushNotificationService.js', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/paymentService.js', () => ({
  createCheckoutSession: jest.fn().mockResolvedValue({ id: 'test_session' }),
  createSubscription: jest.fn().mockResolvedValue({ id: 'test_subscription' })
}));

jest.mock('../services/analyticsService.js', () => ({
  trackEvent: jest.fn().mockResolvedValue({ success: true })
}));

// Global test database setup
let prisma;

beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/volunteer_app_test'
      }
    }
  });
  
  // Clean database before tests
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity", "Activity", "Participation" RESTART IDENTITY CASCADE;`;
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity", "Activity", "Participation" RESTART IDENTITY CASCADE;`;
});

// Global test utilities
global.testUtils = {
  createTestUser: async (userData = {}) => {
    return await prisma.user.create({
      data: {
        email: userData.email || 'test@example.com',
        password: userData.password || 'hashedpassword',
        name: userData.name || 'Test User',
        type: userData.type || 'VOLUNTEER',
        ...userData
      }
    });
  },

  createTestInstitution: async (institutionData = {}) => {
    return await prisma.institution.create({
      data: {
        name: institutionData.name || 'Test Institution',
        email: institutionData.email || 'institution@example.com',
        password: institutionData.password || 'hashedpassword',
        type: institutionData.type || 'NGO',
        ...institutionData
      }
    });
  },

  createTestOpportunity: async (opportunityData = {}) => {
    const institution = await global.testUtils.createTestInstitution();
    return await prisma.opportunity.create({
      data: {
        title: opportunityData.title || 'Test Opportunity',
        description: opportunityData.description || 'Test Description',
        institutionId: opportunityData.institutionId || institution.id,
        status: opportunityData.status || 'ACTIVE',
        ...opportunityData
      }
    });
  },

  createTestActivity: async (activityData = {}) => {
    const opportunity = await global.testUtils.createTestOpportunity();
    return await prisma.activity.create({
      data: {
        title: activityData.title || 'Test Activity',
        description: activityData.description || 'Test Activity Description',
        opportunityId: activityData.opportunityId || opportunity.id,
        startDate: activityData.startDate || new Date(),
        endDate: activityData.endDate || new Date(Date.now() + 86400000),
        status: activityData.status || 'SCHEDULED',
        ...activityData
      }
    });
  },

  generateJWT: (payload) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  },

  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  }),

  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  mockNext: () => jest.fn()
};

// Test timeout
jest.setTimeout(30000);