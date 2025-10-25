import express from 'express';
import {
  createFullBackup,
  createIncrementalBackup,
  createTableBackup,
  restoreBackup,
  listBackups,
  getBackupById,
  verifyBackup,
  getBackupStats,
  scheduleAutomaticBackup
} from '../controllers/backupController.js';

const router = express.Router();

// Backup creation endpoints
router.post('/full', createFullBackup);
router.post('/incremental', createIncrementalBackup);
router.post('/table', createTableBackup);

// Backup management endpoints
router.get('/', listBackups);
router.get('/stats', getBackupStats);
router.get('/:backupId', getBackupById);
router.post('/:backupId/restore', restoreBackup);
router.post('/:backupId/verify', verifyBackup);

// Scheduling endpoints
router.post('/schedule/automatic', scheduleAutomaticBackup);

export default router;
