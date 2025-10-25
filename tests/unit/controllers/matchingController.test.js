import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import {
  findMatches,
  getMatchScore,
  getRecommendedOpportunities,
  getMatchingHistory,
  updateMatchPreferences
} from '../../controllers/matchingController.js';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    opportunity: {
      findMany: jest.fn()
    },
    participation: {
      findMany: jest.fn()
    },
    match: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

describe('Matching Controller - Unit Tests', () => {
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

  describe('findMatches', () => {
    test('should find matches for volunteer successfully', async () => {
      const volunteer = {
        id: 1,
        type: 'VOLUNTEER',
        preferences: {
          categories: ['ENVIRONMENTAL', 'SOCIAL'],
          maxDistance: 50,
          availableDays: ['MONDAY', 'TUESDAY'],
          timeSlots: ['MORNING', 'AFTERNOON']
        },
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      };

      const opportunities = [
        {
          id: 1,
          title: 'Environmental Cleanup',
          category: 'ENVIRONMENTAL',
          location: {
            latitude: -23.5505,
            longitude: -46.6333
          },
          requirements: ['Physical fitness'],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          maxVolunteers: 10,
          currentVolunteers: 5
        },
        {
          id: 2,
          title: 'Social Support',
          category: 'SOCIAL',
          location: {
            latitude: -23.5505,
            longitude: -46.6333
          },
          requirements: ['Communication skills'],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          maxVolunteers: 15,
          currentVolunteers: 8
        }
      ];

      mockReq.user = volunteer;
      mockPrisma.user.findUnique.mockResolvedValue(volunteer);
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);

      await findMatches(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: volunteer.id },
        include: {
          preferences: true,
          location: true
        }
      });
      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          category: {
            in: volunteer.preferences.categories
          },
          startDate: {
            gte: expect.any(Date)
          }
        },
        include: {
          institution: true,
          requirements: true
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        matches: expect.arrayContaining([
          expect.objectContaining({
            opportunity: expect.any(Object),
            score: expect.any(Number),
            reasons: expect.any(Array)
          })
        ])
      });
    });

    test('should return error if user not found', async () => {
      mockReq.user = { id: 999 };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await findMatches(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });

    test('should return error if user is not a volunteer', async () => {
      const institution = {
        id: 1,
        type: 'INSTITUTION'
      };

      mockReq.user = institution;
      mockPrisma.user.findUnique.mockResolvedValue(institution);

      await findMatches(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only volunteers can find matches'
      });
    });
  });

  describe('getMatchScore', () => {
    test('should calculate match score correctly', async () => {
      const volunteer = {
        id: 1,
        preferences: {
          categories: ['ENVIRONMENTAL'],
          maxDistance: 50,
          availableDays: ['MONDAY'],
          timeSlots: ['MORNING']
        },
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      };

      const opportunity = {
        id: 1,
        category: 'ENVIRONMENTAL',
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        requirements: ['Physical fitness'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        maxVolunteers: 10,
        currentVolunteers: 5
      };

      mockReq.body = { volunteerId: 1, opportunityId: 1 };
      mockPrisma.user.findUnique.mockResolvedValue(volunteer);
      mockPrisma.opportunity.findUnique.mockResolvedValue(opportunity);

      await getMatchScore(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          preferences: true,
          location: true
        }
      });
      expect(mockPrisma.opportunity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          requirements: true
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        score: expect.any(Number),
        reasons: expect.any(Array)
      });
    });

    test('should return error if volunteer not found', async () => {
      mockReq.body = { volunteerId: 999, opportunityId: 1 };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await getMatchScore(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Volunteer not found'
      });
    });

    test('should return error if opportunity not found', async () => {
      const volunteer = { id: 1, type: 'VOLUNTEER' };
      mockReq.body = { volunteerId: 1, opportunityId: 999 };
      mockPrisma.user.findUnique.mockResolvedValue(volunteer);
      mockPrisma.opportunity.findUnique.mockResolvedValue(null);

      await getMatchScore(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Opportunity not found'
      });
    });
  });

  describe('getRecommendedOpportunities', () => {
    test('should get recommended opportunities for volunteer', async () => {
      const volunteer = {
        id: 1,
        type: 'VOLUNTEER',
        preferences: {
          categories: ['ENVIRONMENTAL', 'SOCIAL']
        }
      };

      const opportunities = [
        {
          id: 1,
          title: 'Environmental Cleanup',
          category: 'ENVIRONMENTAL',
          score: 95
        },
        {
          id: 2,
          title: 'Social Support',
          category: 'SOCIAL',
          score: 88
        }
      ];

      mockReq.user = volunteer;
      mockPrisma.user.findUnique.mockResolvedValue(volunteer);
      mockPrisma.opportunity.findMany.mockResolvedValue(opportunities);

      await getRecommendedOpportunities(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: volunteer.id },
        include: {
          preferences: true,
          location: true
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            opportunity: expect.any(Object),
            score: expect.any(Number)
          })
        ])
      });
    });

    test('should return error if user not found', async () => {
      mockReq.user = { id: 999 };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await getRecommendedOpportunities(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });
  });

  describe('getMatchingHistory', () => {
    test('should get matching history for user', async () => {
      const user = { id: 1, type: 'VOLUNTEER' };
      const matches = [
        {
          id: 1,
          opportunity: {
            id: 1,
            title: 'Environmental Cleanup'
          },
          score: 95,
          status: 'MATCHED',
          createdAt: new Date()
        }
      ];

      mockReq.user = user;
      mockPrisma.match.findMany.mockResolvedValue(matches);

      await getMatchingHistory(mockReq, mockRes, mockNext);

      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true,
              institution: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ matches });
    });

    test('should return error if user not found', async () => {
      mockReq.user = { id: 999 };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await getMatchingHistory(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });
  });

  describe('updateMatchPreferences', () => {
    test('should update match preferences successfully', async () => {
      const user = { id: 1, type: 'VOLUNTEER' };
      const preferences = {
        categories: ['ENVIRONMENTAL', 'SOCIAL'],
        maxDistance: 50,
        availableDays: ['MONDAY', 'TUESDAY'],
        timeSlots: ['MORNING', 'AFTERNOON']
      };

      const updatedUser = {
        id: 1,
        preferences
      };

      mockReq.user = user;
      mockReq.body = preferences;
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      await updateMatchPreferences(mockReq, mockRes, mockNext);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { preferences },
        include: {
          preferences: true
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Match preferences updated successfully',
        preferences
      });
    });

    test('should return error for invalid preferences', async () => {
      const user = { id: 1, type: 'VOLUNTEER' };
      const invalidPreferences = {
        categories: ['INVALID_CATEGORY'],
        maxDistance: -10,
        availableDays: ['INVALID_DAY']
      };

      mockReq.user = user;
      mockReq.body = invalidPreferences;

      await updateMatchPreferences(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid preferences data',
        errors: expect.any(Array)
      });
    });

    test('should return error if user not found', async () => {
      mockReq.user = { id: 999 };
      mockReq.body = { categories: ['ENVIRONMENTAL'] };
      mockPrisma.user.update.mockRejectedValue(new Error('User not found'));

      await updateMatchPreferences(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });
  });
});
