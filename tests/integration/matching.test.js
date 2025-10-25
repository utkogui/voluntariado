import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/auth.js';
import matchingRoutes from '../../routes/matching.js';
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
app.use('/api/matching', matchingRoutes);

let prisma;
let volunteerToken;
let institutionToken;
let volunteerId;
let institutionId;

describe('Matching API Integration Tests', () => {
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
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity", "Match", "Participation" RESTART IDENTITY CASCADE;`;

    // Create test users
    const volunteer = await prisma.user.create({
      data: {
        email: 'volunteer@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Volunteer',
        type: 'VOLUNTEER',
        isEmailVerified: true,
        preferences: {
          categories: ['ENVIRONMENTAL', 'SOCIAL'],
          maxDistance: 50,
          availableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
          timeSlots: ['MORNING', 'AFTERNOON']
        },
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'São Paulo, SP, Brazil'
        }
      }
    });

    const institution = await prisma.institution.create({
      data: {
        email: 'institution@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Institution',
        type: 'NGO',
        isEmailVerified: true
      }
    });

    volunteerId = volunteer.id;
    institutionId = institution.id;

    // Get auth tokens
    const volunteerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'volunteer@example.com',
        password: 'password'
      });

    const institutionLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'institution@example.com',
        password: 'password'
      });

    volunteerToken = volunteerLogin.body.token;
    institutionToken = institutionLogin.body.token;
  });

  describe('POST /api/matching/find-matches', () => {
    beforeEach(async () => {
      // Create test opportunities
      await prisma.opportunity.createMany({
        data: [
          {
            title: 'Environmental Cleanup',
            description: 'Help clean up the local park',
            category: 'ENVIRONMENTAL',
            location: 'Central Park, São Paulo',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 20,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            requirements: ['Physical fitness', 'Environmental awareness'],
            benefits: ['Community service hours', 'Environmental impact']
          },
          {
            title: 'Social Support',
            description: 'Help elderly people in the community',
            category: 'SOCIAL',
            location: 'Community Center, São Paulo',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 15,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            requirements: ['Communication skills', 'Empathy'],
            benefits: ['Personal growth', 'Community impact']
          },
          {
            title: 'Educational Workshop',
            description: 'Teach children about environmental protection',
            category: 'EDUCATIONAL',
            location: 'School, São Paulo',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 10,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            requirements: ['Teaching skills', 'Environmental knowledge'],
            benefits: ['Teaching experience', 'Environmental education']
          },
          {
            title: 'Distant Opportunity',
            description: 'Opportunity far from volunteer location',
            category: 'ENVIRONMENTAL',
            location: 'Rio de Janeiro, RJ',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 5,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            requirements: ['Physical fitness'],
            benefits: ['Environmental impact']
          }
        ]
      });
    });

    test('should find matches for volunteer', async () => {
      const response = await request(app)
        .post('/api/matching/find-matches')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.matches.length).toBeGreaterThan(0);

      // Check match structure
      const match = response.body.matches[0];
      expect(match).toHaveProperty('opportunity');
      expect(match).toHaveProperty('score');
      expect(match).toHaveProperty('reasons');
      expect(typeof match.score).toBe('number');
      expect(match.score).toBeGreaterThan(0);
      expect(match.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(match.reasons)).toBe(true);

      // Check opportunity structure
      expect(match.opportunity).toHaveProperty('id');
      expect(match.opportunity).toHaveProperty('title');
      expect(match.opportunity).toHaveProperty('description');
      expect(match.opportunity).toHaveProperty('category');
      expect(match.opportunity).toHaveProperty('institution');
    });

    test('should prioritize opportunities by match score', async () => {
      const response = await request(app)
        .post('/api/matching/find-matches')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      const matches = response.body.matches;
      expect(matches.length).toBeGreaterThan(1);

      // Check that matches are sorted by score (highest first)
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score);
      }
    });

    test('should filter out distant opportunities', async () => {
      const response = await request(app)
        .post('/api/matching/find-matches')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      const matches = response.body.matches;
      const distantOpportunity = matches.find(match => 
        match.opportunity.title === 'Distant Opportunity'
      );
      expect(distantOpportunity).toBeUndefined();
    });

    test('should return error for institution trying to find matches', async () => {
      const response = await request(app)
        .post('/api/matching/find-matches')
        .set('Authorization', `Bearer ${institutionToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Only volunteers can find matches');
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/matching/find-matches')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('POST /api/matching/score', () => {
    let opportunityId;

    beforeEach(async () => {
      const opportunity = await prisma.opportunity.create({
        data: {
          title: 'Test Opportunity',
          description: 'Test Description',
          category: 'ENVIRONMENTAL',
          location: 'Test Location, São Paulo',
          institutionId: institutionId,
          status: 'ACTIVE',
          maxVolunteers: 10,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          requirements: ['Physical fitness'],
          benefits: ['Environmental impact']
        }
      });

      opportunityId = opportunity.id;
    });

    test('should calculate match score for volunteer and opportunity', async () => {
      const response = await request(app)
        .post('/api/matching/score')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          volunteerId: volunteerId,
          opportunityId: opportunityId
        })
        .expect(200);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('reasons');
      expect(typeof response.body.score).toBe('number');
      expect(response.body.score).toBeGreaterThan(0);
      expect(response.body.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(response.body.reasons)).toBe(true);
    });

    test('should return error for non-existent volunteer', async () => {
      const response = await request(app)
        .post('/api/matching/score')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          volunteerId: 999,
          opportunityId: opportunityId
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Volunteer not found');
    });

    test('should return error for non-existent opportunity', async () => {
      const response = await request(app)
        .post('/api/matching/score')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          volunteerId: volunteerId,
          opportunityId: 999
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Opportunity not found');
    });

    test('should return error for missing parameters', async () => {
      const response = await request(app)
        .post('/api/matching/score')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          volunteerId: volunteerId
          // Missing opportunityId
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Volunteer ID and Opportunity ID are required');
    });
  });

  describe('GET /api/matching/recommendations', () => {
    beforeEach(async () => {
      // Create test opportunities
      await prisma.opportunity.createMany({
        data: [
          {
            title: 'High Match Opportunity',
            description: 'Perfect match for volunteer',
            category: 'ENVIRONMENTAL',
            location: 'São Paulo, SP',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 10,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31')
          },
          {
            title: 'Medium Match Opportunity',
            description: 'Good match for volunteer',
            category: 'SOCIAL',
            location: 'São Paulo, SP',
            institutionId: institutionId,
            status: 'ACTIVE',
            maxVolunteers: 15,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31')
          }
        ]
      });
    });

    test('should get recommended opportunities for volunteer', async () => {
      const response = await request(app)
        .get('/api/matching/recommendations')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(response.body.recommendations.length).toBeGreaterThan(0);

      // Check recommendation structure
      const recommendation = response.body.recommendations[0];
      expect(recommendation).toHaveProperty('opportunity');
      expect(recommendation).toHaveProperty('score');
      expect(typeof recommendation.score).toBe('number');
    });

    test('should return error for institution trying to get recommendations', async () => {
      const response = await request(app)
        .get('/api/matching/recommendations')
        .set('Authorization', `Bearer ${institutionToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Only volunteers can get recommendations');
    });
  });

  describe('GET /api/matching/history', () => {
    beforeEach(async () => {
      // Create test matches
      const opportunity = await prisma.opportunity.create({
        data: {
          title: 'Historical Opportunity',
          description: 'Past opportunity',
          category: 'ENVIRONMENTAL',
          institutionId: institutionId,
          status: 'ACTIVE',
          maxVolunteers: 10
        }
      });

      await prisma.match.create({
        data: {
          userId: volunteerId,
          opportunityId: opportunity.id,
          score: 85,
          status: 'MATCHED',
          reasons: ['Category match', 'Location match']
        }
      });
    });

    test('should get matching history for volunteer', async () => {
      const response = await request(app)
        .get('/api/matching/history')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.matches.length).toBe(1);

      const match = response.body.matches[0];
      expect(match).toHaveProperty('id');
      expect(match).toHaveProperty('score');
      expect(match).toHaveProperty('status');
      expect(match).toHaveProperty('opportunity');
      expect(match.opportunity).toHaveProperty('title');
    });

    test('should return error for institution trying to get history', async () => {
      const response = await request(app)
        .get('/api/matching/history')
        .set('Authorization', `Bearer ${institutionToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Only volunteers can get matching history');
    });
  });

  describe('PUT /api/matching/preferences', () => {
    test('should update match preferences for volunteer', async () => {
      const newPreferences = {
        categories: ['ENVIRONMENTAL', 'EDUCATIONAL'],
        maxDistance: 100,
        availableDays: ['MONDAY', 'FRIDAY'],
        timeSlots: ['EVENING']
      };

      const response = await request(app)
        .put('/api/matching/preferences')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(newPreferences)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Match preferences updated successfully');
      expect(response.body).toHaveProperty('preferences');
      expect(response.body.preferences).toMatchObject(newPreferences);

      // Verify update in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: volunteerId }
      });
      expect(updatedUser.preferences).toMatchObject(newPreferences);
    });

    test('should return error for invalid preferences', async () => {
      const invalidPreferences = {
        categories: ['INVALID_CATEGORY'],
        maxDistance: -10,
        availableDays: ['INVALID_DAY']
      };

      const response = await request(app)
        .put('/api/matching/preferences')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(invalidPreferences)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid preferences data');
      expect(response.body).toHaveProperty('errors');
    });

    test('should return error for institution trying to update preferences', async () => {
      const preferences = {
        categories: ['ENVIRONMENTAL']
      };

      const response = await request(app)
        .put('/api/matching/preferences')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send(preferences)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Only volunteers can update match preferences');
    });
  });
});
