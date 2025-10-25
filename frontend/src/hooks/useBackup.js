import { useState, useCallback, useEffect } from 'react';
import backupService from '../services/backupService';

const useBackup = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (fetchFunction, setterFunction) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setterFunction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(() => {
    return fetchData(backupService.listBackups, (data) => setBackups(data.backups));
  }, [fetchData]);

  const fetchStats = useCallback(() => {
    return fetchData(backupService.getBackupStats, (data) => setStats(data.stats));
  }, [fetchData]);

  const createFullBackup = useCallback(async (description) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.createFullBackup(description);
      await fetchBackups(); // Refresh list
      await fetchStats(); // Refresh stats
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups, fetchStats]);

  const createIncrementalBackup = useCallback(async (description) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.createIncrementalBackup(description);
      await fetchBackups();
      await fetchStats();
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups, fetchStats]);

  const createTableBackup = useCallback(async (tableNames, description) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.createTableBackup(tableNames, description);
      await fetchBackups();
      await fetchStats();
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups, fetchStats]);

  const restoreBackup = useCallback(async (backupId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.restoreBackup(backupId);
      await fetchBackups();
      await fetchStats();
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups, fetchStats]);

  const verifyBackup = useCallback(async (backupId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.verifyBackup(backupId);
      await fetchBackups(); // Refresh to update status
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBackups]);

  const scheduleAutomaticBackup = useCallback(async (intervalHours) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupService.scheduleAutomaticBackup(intervalHours);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchBackups(),
      fetchStats()
    ]);
  }, [fetchBackups, fetchStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    backups,
    stats,
    isLoading,
    error,
    fetchBackups,
    fetchStats,
    createFullBackup,
    createIncrementalBackup,
    createTableBackup,
    restoreBackup,
    verifyBackup,
    scheduleAutomaticBackup,
    fetchAllData
  };
};

export default useBackup;
