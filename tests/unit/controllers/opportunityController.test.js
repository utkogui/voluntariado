import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  searchOpportunities,
  getOpportunitiesByInstitution,
  getOpportunityStats
} from '../../controllers/opportunityController.js';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    opportunity: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    institution: {
      findUnique: jest.fn()
    }
  }))
}));

describe('Opportunity Controller - Unit Tests', () => {
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

  describe('createOpportunity', () => {
    test('should create opportunity successfully', async () => {
      const opportunityData = {
        title: 'Test Opportunity',
        description: 'Test Description',
        institutionId: 1,
        requirements: ['Requirement 1', 'Requirement 2'],
        benefits: ['Benefit 1', 'Benefit 2'],
        location: 'Test Location',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        maxVolunteers: 10,
        status: 'ACTIVE'
      };

      const institution = {
        id: 1,
        name: 'Test Institution',
        email: 'test@institution.com'
      };

      const createdOpportunity = {
        id: 1,
        ...opportunityData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.body = opportunityData;
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.institution.findUnique.mockResolvedValue(institution);
      mockPrisma.opportunity.create.mockResolvedValue(createdOpportunity);

      await createOpportunity(mockReq, mockRes, mockNext);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: opportunityData.institutionId }
      });
      expect(mockPrisma.opportunity.create).toHaveBeenCalledWith({
        data: opportunityData
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity created successfully',
        opportunity: createdOpportunity
      });
    });

    test('should return error if institution not found', async () => {
      const opportunityData = {
        title: 'Test Opportunity',
        description: 'Test Description',
        institutionId: 999,
        status: 'ACTIVE'
      };

      mockReq.body = opportunityData;
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await createOpportunity(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Institution not found'
      });
    });

    test('should return error for invalid input data', async () => {
      const invalidData = {
        title: '',
        description: '',
        institutionId: 'invalid',
        status: 'INVALID'
      };

      mockReq.body = invalidData;
      mockReq.user = { id: 1, type: 'INSTITUTION' };

      await createOpportunity(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid input data',
        errors: expect.any(Array)
      });
    });
  });

  describe('getOpportunities', () => {
    test('should get opportunities with pagination', async () => {
      const opportunities = [
        {
          id: 1,
          title: 'Opportunity 1',
          description: 'Description 1',
          status: 'ACTIVE',
          institution: { name: 'Institution 1' }
        },
        {
          id: 2,
          title: 'Opportunity 2',
          description: 'Description 2',
          status: 'ACTIVE',
          institution: { name: 'Institution 2' }
        }
      ];

      mockReq.query = { page: 1, limit: 10, status: 'ACTIVE' };
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);
      mockPrisma.opportunity.count.mockResolvedValue(2);

      await getOpportunities(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        opportunities,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    test('should filter opportunities by location', async () => {
      const opportunities = [
        {
          id: 1,
          title: 'Opportunity 1',
          location: 'São Paulo',
          status: 'ACTIVE'
        }
      ];

      mockReq.query = { location: 'São Paulo' };
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);
      mockPrisma.opportunity.count.mockResolvedValue(1);

      await getOpportunities(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          status: undefined,
          location: {
            contains: 'São Paulo',
            mode: 'insensitive'
          }
        },
        include: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('getOpportunityById', () => {
    test('should get opportunity by id successfully', async () => {
      const opportunity = {
        id: 1,
        title: 'Test Opportunity',
        description: 'Test Description',
        status: 'ACTIVE',
        institution: {
          id: 1,
          name: 'Test Institution',
          email: 'test@institution.com'
        }
      };

      mockReq.params = { id: '1' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(opportunity);

      await getOpportunityById(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          }
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ opportunity });
    });

    test('should return error if opportunity not found', async () => {
      mockReq.params = { id: '999' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(null);

      await getOpportunityById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity not found'
      });
    });
  });

  describe('updateOpportunity', () => {
    test('should update opportunity successfully', async () => {
      const updateData = {
        title: 'Updated Opportunity',
        description: 'Updated Description',
        status: 'INACTIVE'
      };

      const existingOpportunity = {
        id: 1,
        title: 'Original Opportunity',
        institutionId: 1
      };

      const updatedOpportunity = {
        id: 1,
        ...existingOpportunity,
        ...updateData,
        updatedAt: new Date()
      };

      mockReq.params = { id: '1' };
      mockReq.body = updateData;
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(existingOpportunity);
      mockPrisma.opportunity.update.mockResolvedValue(updatedOpportunity);

      await updateOpportunity(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity updated successfully',
        opportunity: updatedOpportunity
      });
    });

    test('should return error if opportunity not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { title: 'Updated Title' };
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(null);

      await updateOpportunity(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity not found'
      });
    });

    test('should return error if user not authorized', async () => {
      const existingOpportunity = {
        id: 1,
        title: 'Original Opportunity',
        institutionId: 2 // Different institution
      };

      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated Title' };
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(existingOpportunity);

      await updateOpportunity(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Not authorized to update this opportunity'
      });
    });
  });

  describe('deleteOpportunity', () => {
    test('should delete opportunity successfully', async () => {
      const existingOpportunity = {
        id: 1,
        title: 'Test Opportunity',
        institutionId: 1
      };

      mockReq.params = { id: '1' };
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(existingOpportunity);
      mockPrisma.opportunity.delete.mockResolvedValue(existingOpportunity);

      await deleteOpportunity(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.opportunity.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity deleted successfully'
      });
    });

    test('should return error if opportunity not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.user = { id: 1, type: 'INSTITUTION' };
      mockPrisma.opportunity.findUnique.mockResolvedValue(null);

      await deleteOpportunity(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity not found'
      });
    });
  });

  describe('searchOpportunities', () => {
    test('should search opportunities by keyword', async () => {
      const opportunities = [
        {
          id: 1,
          title: 'Environmental Opportunity',
          description: 'Help the environment',
          status: 'ACTIVE'
        }
      ];

      mockReq.query = { q: 'environment', page: 1, limit: 10 };
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);
      mockPrisma.opportunity.count.mockResolvedValue(1);

      await searchOpportunities(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: 'environment', mode: 'insensitive' } },
            { description: { contains: 'environment', mode: 'insensitive' } }
          ]
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        opportunities,
        pagination: expect.any(Object)
      });
    });
  });

  describe('getOpportunitiesByInstitution', () => {
    test('should get opportunities by institution', async () => {
      const opportunities = [
        {
          id: 1,
          title: 'Opportunity 1',
          institutionId: 1,
          status: 'ACTIVE'
        }
      ];

      mockReq.params = { institutionId: '1' };
      mockReq.query = { page: 1, limit: 10 };
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);
      mockPrisma.opportunity.count.mockResolvedValue(1);

      await getOpportunitiesByInstitution(mockReq, mockRes, mockNext);

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: { institutionId: 1 },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        opportunities,
        pagination: expect.any(Object)
      });
    });
  });

  describe('getOpportunityStats', () => {
    test('should get opportunity statistics', async () => {
      const stats = {
        total: 100,
        active: 80,
        inactive: 20,
        byType: {
          ENVIRONMENTAL: 30,
          SOCIAL: 40,
          EDUCATIONAL: 30
        }
      };

      mockPrisma.opportunity.count.mockResolvedValueOnce(100);
      mockPrisma.opportunity.count.mockResolvedValueOnce(80);
      mockPrisma.opportunity.count.mockResolvedValueOnce(20);

      await getOpportunityStats(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          total: 100,
          active: 80,
          inactive: 20
        })
      });
    });
  });
});
