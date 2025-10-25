import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/auth.js';
import opportunityRoutes from '../../routes/opportunity.js';
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
app.use('/api/opportunities', opportunityRoutes);

let prisma;
let authToken;
let institutionToken;

describe('Opportunities API Integration Tests', () => {
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
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Institution", "Opportunity" RESTART IDENTITY CASCADE;`;

    // Create test users
    const volunteer = await prisma.user.create({
      data: {
        email: 'volunteer@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        name: 'Test Volunteer',
        type: 'VOLUNTEER',
        isEmailVerified: true
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

    authToken = volunteerLogin.body.token;
    institutionToken = institutionLogin.body.token;
  });

  describe('POST /api/opportunities', () => {
    test('should create opportunity as institution', async () => {
      const opportunityData = {
        title: 'Environmental Cleanup',
        description: 'Help clean up the local park',
        category: 'ENVIRONMENTAL',
        location: 'Central Park',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        maxVolunteers: 20,
        requirements: ['Physical fitness', 'Environmental awareness'],
        benefits: ['Community service hours', 'Environmental impact'],
        status: 'ACTIVE'
      };

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send(opportunityData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Opportunity created successfully');
      expect(response.body).toHaveProperty('opportunity');
      expect(response.body.opportunity).toMatchObject({
        title: opportunityData.title,
        description: opportunityData.description,
        category: opportunityData.category,
        location: opportunityData.location,
        maxVolunteers: opportunityData.maxVolunteers,
        status: opportunityData.status
      });

      // Verify opportunity was created in database
      const opportunity = await prisma.opportunity.findFirst({
        where: { title: opportunityData.title }
      });
      expect(opportunity).toBeTruthy();
      expect(opportunity.title).toBe(opportunityData.title);
    });

    test('should return error for volunteer trying to create opportunity', async () => {
      const opportunityData = {
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(opportunityData)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Only institutions can create opportunities');
    });

    test('should return error for invalid input data', async () => {
      const invalidData = {
        title: '',
        description: '',
        category: 'INVALID',
        status: 'INVALID'
      };

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid input data');
      expect(response.body).toHaveProperty('errors');
    });

    test('should return error without authentication', async () => {
      const opportunityData = {
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .post('/api/opportunities')
        .send(opportunityData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('GET /api/opportunities', () => {
    beforeEach(async () => {
      // Create test opportunities
      const institution = await prisma.institution.findFirst();
      
      await prisma.opportunity.createMany({
        data: [
          {
            title: 'Environmental Cleanup',
            description: 'Clean up local park',
            category: 'ENVIRONMENTAL',
            location: 'Central Park',
            institutionId: institution.id,
            status: 'ACTIVE',
            maxVolunteers: 20
          },
          {
            title: 'Social Support',
            description: 'Help elderly people',
            category: 'SOCIAL',
            location: 'Community Center',
            institutionId: institution.id,
            status: 'ACTIVE',
            maxVolunteers: 15
          },
          {
            title: 'Educational Workshop',
            description: 'Teach children programming',
            category: 'EDUCATIONAL',
            location: 'School',
            institutionId: institution.id,
            status: 'INACTIVE',
            maxVolunteers: 10
          }
        ]
      });
    });

    test('should get all active opportunities', async () => {
      const response = await request(app)
        .get('/api/opportunities')
        .expect(200);

      expect(response.body).toHaveProperty('opportunities');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.opportunities)).toBe(true);
      expect(response.body.opportunities.length).toBe(2); // Only active opportunities
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      });
    });

    test('should filter opportunities by category', async () => {
      const response = await request(app)
        .get('/api/opportunities?category=ENVIRONMENTAL')
        .expect(200);

      expect(response.body.opportunities.length).toBe(1);
      expect(response.body.opportunities[0].category).toBe('ENVIRONMENTAL');
    });

    test('should filter opportunities by location', async () => {
      const response = await request(app)
        .get('/api/opportunities?location=Central Park')
        .expect(200);

      expect(response.body.opportunities.length).toBe(1);
      expect(response.body.opportunities[0].location).toBe('Central Park');
    });

    test('should paginate opportunities', async () => {
      const response = await request(app)
        .get('/api/opportunities?page=1&limit=1')
        .expect(200);

      expect(response.body.opportunities.length).toBe(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        pages: 2
      });
    });

    test('should include institution information', async () => {
      const response = await request(app)
        .get('/api/opportunities')
        .expect(200);

      expect(response.body.opportunities[0]).toHaveProperty('institution');
      expect(response.body.opportunities[0].institution).toHaveProperty('id');
      expect(response.body.opportunities[0].institution).toHaveProperty('name');
      expect(response.body.opportunities[0].institution).toHaveProperty('email');
    });
  });

  describe('GET /api/opportunities/:id', () => {
    let opportunityId;

    beforeEach(async () => {
      const institution = await prisma.institution.findFirst();
      
      const opportunity = await prisma.opportunity.create({
        data: {
          title: 'Test Opportunity',
          description: 'Test Description',
          category: 'ENVIRONMENTAL',
          location: 'Test Location',
          institutionId: institution.id,
          status: 'ACTIVE',
          maxVolunteers: 10
        }
      });

      opportunityId = opportunity.id;
    });

    test('should get opportunity by id', async () => {
      const response = await request(app)
        .get(`/api/opportunities/${opportunityId}`)
        .expect(200);

      expect(response.body).toHaveProperty('opportunity');
      expect(response.body.opportunity).toMatchObject({
        id: opportunityId,
        title: 'Test Opportunity',
        description: 'Test Description',
        category: 'ENVIRONMENTAL',
        location: 'Test Location',
        status: 'ACTIVE',
        maxVolunteers: 10
      });
      expect(response.body.opportunity).toHaveProperty('institution');
    });

    test('should return error for non-existent opportunity', async () => {
      const response = await request(app)
        .get('/api/opportunities/999')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Opportunity not found');
    });

    test('should return error for invalid id format', async () => {
      const response = await request(app)
        .get('/api/opportunities/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid opportunity ID');
    });
  });

  describe('PUT /api/opportunities/:id', () => {
    let opportunityId;

    beforeEach(async () => {
      const institution = await prisma.institution.findFirst();
      
      const opportunity = await prisma.opportunity.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          category: 'ENVIRONMENTAL',
          institutionId: institution.id,
          status: 'ACTIVE',
          maxVolunteers: 10
        }
      });

      opportunityId = opportunity.id;
    });

    test('should update opportunity as owner institution', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        maxVolunteers: 20
      };

      const response = await request(app)
        .put(`/api/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Opportunity updated successfully');
      expect(response.body).toHaveProperty('opportunity');
      expect(response.body.opportunity).toMatchObject(updateData);

      // Verify update in database
      const updatedOpportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId }
      });
      expect(updatedOpportunity.title).toBe(updateData.title);
      expect(updatedOpportunity.description).toBe(updateData.description);
      expect(updatedOpportunity.maxVolunteers).toBe(updateData.maxVolunteers);
    });

    test('should return error for volunteer trying to update', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Only institutions can update opportunities');
    });

    test('should return error for non-existent opportunity', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/opportunities/999')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Opportunity not found');
    });
  });

  describe('DELETE /api/opportunities/:id', () => {
    let opportunityId;

    beforeEach(async () => {
      const institution = await prisma.institution.findFirst();
      
      const opportunity = await prisma.opportunity.create({
        data: {
          title: 'To Be Deleted',
          description: 'This will be deleted',
          category: 'ENVIRONMENTAL',
          institutionId: institution.id,
          status: 'ACTIVE',
          maxVolunteers: 10
        }
      });

      opportunityId = opportunity.id;
    });

    test('should delete opportunity as owner institution', async () => {
      const response = await request(app)
        .delete(`/api/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Opportunity deleted successfully');

      // Verify deletion in database
      const deletedOpportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId }
      });
      expect(deletedOpportunity).toBeNull();
    });

    test('should return error for volunteer trying to delete', async () => {
      const response = await request(app)
        .delete(`/api/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Only institutions can delete opportunities');
    });

    test('should return error for non-existent opportunity', async () => {
      const response = await request(app)
        .delete('/api/opportunities/999')
        .set('Authorization', `Bearer ${institutionToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Opportunity not found');
    });
  });

  describe('GET /api/opportunities/search', () => {
    beforeEach(async () => {
      const institution = await prisma.institution.findFirst();
      
      await prisma.opportunity.createMany({
        data: [
          {
            title: 'Environmental Cleanup',
            description: 'Help clean up the environment',
            category: 'ENVIRONMENTAL',
            institutionId: institution.id,
            status: 'ACTIVE'
          },
          {
            title: 'Social Support',
            description: 'Support local community',
            category: 'SOCIAL',
            institutionId: institution.id,
            status: 'ACTIVE'
          },
          {
            title: 'Educational Program',
            description: 'Teach environmental awareness',
            category: 'EDUCATIONAL',
            institutionId: institution.id,
            status: 'ACTIVE'
          }
        ]
      });
    });

    test('should search opportunities by keyword', async () => {
      const response = await request(app)
        .get('/api/opportunities/search?q=environmental')
        .expect(200);

      expect(response.body).toHaveProperty('opportunities');
      expect(response.body.opportunities.length).toBe(2); // Environmental Cleanup and Educational Program
      expect(response.body.opportunities[0].title.toLowerCase()).toContain('environmental');
    });

    test('should search opportunities by description', async () => {
      const response = await request(app)
        .get('/api/opportunities/search?q=community')
        .expect(200);

      expect(response.body.opportunities.length).toBe(1);
      expect(response.body.opportunities[0].description.toLowerCase()).toContain('community');
    });

    test('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/opportunities/search?q=nonexistent')
        .expect(200);

      expect(response.body.opportunities.length).toBe(0);
    });
  });
});
