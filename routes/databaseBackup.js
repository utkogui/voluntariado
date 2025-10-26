const express = require('express');
const DatabaseBackupService = require('../services/databaseBackupService');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const backupService = new DatabaseBackupService();

// Create backup
router.post('/create', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await backupService.createBackup();
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: result
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup',
      details: error.message
    });
  }
});

// List backups
router.get('/list', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Failed to list backups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list backups',
      details: error.message
    });
  }
});

// Restore backup
router.post('/restore/:fileName', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: 'Backup file name is required'
      });
    }
    
    const result = await backupService.restoreBackup(fileName);
    
    res.json({
      success: true,
      message: 'Backup restored successfully',
      data: result
    });
  } catch (error) {
    console.error('Backup restore failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore backup',
      details: error.message
    });
  }
});

// Cleanup old backups
router.post('/cleanup', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await backupService.cleanupOldBackups();
    
    res.json({
      success: true,
      message: 'Old backups cleaned up successfully',
      data: result
    });
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old backups',
      details: error.message
    });
  }
});

// Test database connection
router.get('/test-connection', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await backupService.testConnection();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    });
  }
});

// Get database statistics
router.get('/stats', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const stats = await backupService.getDatabaseStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to get database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database statistics',
      details: error.message
    });
  }
});

// Schedule backups
router.post('/schedule', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    backupService.scheduleBackups();
    
    res.json({
      success: true,
      message: 'Backups scheduled successfully'
    });
  } catch (error) {
    console.error('Failed to schedule backups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule backups',
      details: error.message
    });
  }
});

module.exports = router;
