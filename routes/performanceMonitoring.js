import express from 'express';
import {
  getHealthStatus,
  getMetrics,
  getSummaryMetrics,
  resetMetrics,
  getAlerts,
  updateAlertThresholds
} from '../controllers/performanceMonitoringController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', getHealthStatus);

// Metrics endpoints
router.get('/metrics', getMetrics);
router.get('/metrics/summary', getSummaryMetrics);

// Alerts endpoints
router.get('/alerts', getAlerts);
router.put('/alerts/thresholds', updateAlertThresholds);

// Management endpoints
router.post('/metrics/reset', resetMetrics);

export default router;
