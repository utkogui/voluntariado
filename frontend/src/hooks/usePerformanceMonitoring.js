import { useState, useCallback, useEffect } from 'react';
import performanceMonitoringService from '../services/performanceMonitoringService';

const usePerformanceMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
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

  const fetchHealthStatus = useCallback(() => {
    return fetchData(performanceMonitoringService.getHealthStatus, setHealthStatus);
  }, [fetchData]);

  const fetchMetrics = useCallback(() => {
    return fetchData(performanceMonitoringService.getMetrics, setMetrics);
  }, [fetchData]);

  const fetchSummaryMetrics = useCallback(() => {
    return fetchData(performanceMonitoringService.getSummaryMetrics, setSummaryMetrics);
  }, [fetchData]);

  const fetchAlerts = useCallback(() => {
    return fetchData(performanceMonitoringService.getAlerts, setAlerts);
  }, [fetchData]);

  const updateAlertThresholds = useCallback(async (thresholds) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await performanceMonitoringService.updateAlertThresholds(thresholds);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await performanceMonitoringService.resetMetrics();
      // Refresh all data after reset
      await Promise.all([
        fetchHealthStatus(),
        fetchMetrics(),
        fetchSummaryMetrics(),
        fetchAlerts()
      ]);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchHealthStatus, fetchMetrics, fetchSummaryMetrics, fetchAlerts]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchHealthStatus(),
      fetchMetrics(),
      fetchSummaryMetrics(),
      fetchAlerts()
    ]);
  }, [fetchHealthStatus, fetchMetrics, fetchSummaryMetrics, fetchAlerts]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(fetchAllData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    healthStatus,
    metrics,
    summaryMetrics,
    alerts,
    isLoading,
    error,
    fetchHealthStatus,
    fetchMetrics,
    fetchSummaryMetrics,
    fetchAlerts,
    updateAlertThresholds,
    resetMetrics,
    fetchAllData
  };
};

export default usePerformanceMonitoring;
