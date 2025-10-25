const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return healthy status by default', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return metrics in development', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/metrics/report', () => {
    it('should return metrics report in development', async () => {
      const response = await request(app)
        .get('/api/metrics/report')
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('topRoutes');
      expect(response.body).toHaveProperty('topErrors');
      expect(response.body).toHaveProperty('statusCodes');
      expect(response.body).toHaveProperty('recentErrors');
    });
  });
});
