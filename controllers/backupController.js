import backupService from '../services/backupService.js';

const createFullBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const backup = await backupService.createFullBackup(description);
    
    res.status(201).json({
      message: 'Full backup created successfully',
      backup
    });
  } catch (error) {
    console.error('Error creating full backup:', error);
    res.status(500).json({
      message: 'Failed to create full backup',
      error: error.message
    });
  }
};

const createIncrementalBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const backup = await backupService.createIncrementalBackup(description);
    
    res.status(201).json({
      message: 'Incremental backup created successfully',
      backup
    });
  } catch (error) {
    console.error('Error creating incremental backup:', error);
    res.status(500).json({
      message: 'Failed to create incremental backup',
      error: error.message
    });
  }
};

const createTableBackup = async (req, res) => {
  try {
    const { tableNames, description } = req.body;
    
    if (!tableNames || !Array.isArray(tableNames) || tableNames.length === 0) {
      return res.status(400).json({
        message: 'Table names array is required'
      });
    }
    
    const backup = await backupService.createTableBackup(tableNames, description);
    
    res.status(201).json({
      message: 'Table backup created successfully',
      backup
    });
  } catch (error) {
    console.error('Error creating table backup:', error);
    res.status(500).json({
      message: 'Failed to create table backup',
      error: error.message
    });
  }
};

const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    
    if (!backupId) {
      return res.status(400).json({
        message: 'Backup ID is required'
      });
    }
    
    const result = await backupService.restoreBackup(backupId);
    
    res.status(200).json({
      message: 'Backup restored successfully',
      result
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      message: 'Failed to restore backup',
      error: error.message
    });
  }
};

const listBackups = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const backups = await backupService.listBackups(
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json({
      backups,
      count: backups.length
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      message: 'Failed to list backups',
      error: error.message
    });
  }
};

const getBackupById = async (req, res) => {
  try {
    const { backupId } = req.params;
    
    if (!backupId) {
      return res.status(400).json({
        message: 'Backup ID is required'
      });
    }
    
    const backup = await backupService.getBackupById(backupId);
    
    if (!backup) {
      return res.status(404).json({
        message: 'Backup not found'
      });
    }
    
    res.status(200).json({ backup });
  } catch (error) {
    console.error('Error getting backup:', error);
    res.status(500).json({
      message: 'Failed to get backup',
      error: error.message
    });
  }
};

const verifyBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    
    if (!backupId) {
      return res.status(400).json({
        message: 'Backup ID is required'
      });
    }
    
    const result = await backupService.verifyBackup(backupId);
    
    res.status(200).json({
      message: 'Backup verification completed',
      result
    });
  } catch (error) {
    console.error('Error verifying backup:', error);
    res.status(500).json({
      message: 'Failed to verify backup',
      error: error.message
    });
  }
};

const getBackupStats = async (req, res) => {
  try {
    const stats = await backupService.getBackupStats();
    
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting backup stats:', error);
    res.status(500).json({
      message: 'Failed to get backup stats',
      error: error.message
    });
  }
};

const scheduleAutomaticBackup = async (req, res) => {
  try {
    const { intervalHours = 24 } = req.body;
    
    if (intervalHours < 1 || intervalHours > 168) {
      return res.status(400).json({
        message: 'Interval must be between 1 and 168 hours'
      });
    }
    
    backupService.scheduleAutomaticBackup(intervalHours);
    
    res.status(200).json({
      message: 'Automatic backup scheduled successfully',
      intervalHours
    });
  } catch (error) {
    console.error('Error scheduling automatic backup:', error);
    res.status(500).json({
      message: 'Failed to schedule automatic backup',
      error: error.message
    });
  }
};

export {
  createFullBackup,
  createIncrementalBackup,
  createTableBackup,
  restoreBackup,
  listBackups,
  getBackupById,
  verifyBackup,
  getBackupStats,
  scheduleAutomaticBackup
};
