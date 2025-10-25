import api from './api';

const BACKUP_API_BASE_URL = '/api/backup';

const backupService = {
  createFullBackup: async (description) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/full`, { description });
      return response.data;
    } catch (error) {
      console.error('Error creating full backup:', error);
      throw error;
    }
  },

  createIncrementalBackup: async (description) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/incremental`, { description });
      return response.data;
    } catch (error) {
      console.error('Error creating incremental backup:', error);
      throw error;
    }
  },

  createTableBackup: async (tableNames, description) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/table`, { 
        tableNames, 
        description 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating table backup:', error);
      throw error;
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/${backupId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  },

  listBackups: async (limit = 50, offset = 0) => {
    try {
      const response = await api.get(`${BACKUP_API_BASE_URL}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  },

  getBackupById: async (backupId) => {
    try {
      const response = await api.get(`${BACKUP_API_BASE_URL}/${backupId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting backup:', error);
      throw error;
    }
  },

  verifyBackup: async (backupId) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/${backupId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error verifying backup:', error);
      throw error;
    }
  },

  getBackupStats: async () => {
    try {
      const response = await api.get(`${BACKUP_API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting backup stats:', error);
      throw error;
    }
  },

  scheduleAutomaticBackup: async (intervalHours) => {
    try {
      const response = await api.post(`${BACKUP_API_BASE_URL}/schedule/automatic`, {
        intervalHours
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling automatic backup:', error);
      throw error;
    }
  }
};

export default backupService;
