import { useState, useCallback } from 'react';
import analyticsService from '../services/analyticsService';

const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google Analytics
  const getGAReport = useCallback(async (startDate = null, endDate = null, metrics = [], dimensions = []) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getGAReport(startDate, endDate, metrics, dimensions);
      return result;
    } catch (err) {
      setError('Erro ao obter relatório do Google Analytics: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGARealtime = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getGARealtime();
      return result;
    } catch (err) {
      setError('Erro ao obter dados em tempo real: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mixpanel
  const trackMixpanelEvent = useCallback(async (eventName, properties = {}, userId = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackMixpanelEvent(eventName, properties, userId);
      return result;
    } catch (err) {
      setError('Erro ao rastrear evento no Mixpanel: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setMixpanelUserProperties = useCallback(async (userId, properties = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.setMixpanelUserProperties(userId, properties);
      return result;
    } catch (err) {
      setError('Erro ao definir propriedades do usuário: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMixpanelInsights = useCallback(async (event, fromDate = null, toDate = null, unit = 'day') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getMixpanelInsights(event, fromDate, toDate, unit);
      return result;
    } catch (err) {
      setError('Erro ao obter insights do Mixpanel: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eventos específicos
  const trackUserRegistration = useCallback(async (userId, userType, registrationMethod = 'email') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackUserRegistration(userId, userType, registrationMethod);
      return result;
    } catch (err) {
      setError('Erro ao rastrear registro de usuário: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackOpportunityView = useCallback(async (userId, opportunityId, opportunityType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackOpportunityView(userId, opportunityId, opportunityType);
      return result;
    } catch (err) {
      setError('Erro ao rastrear visualização de oportunidade: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackApplicationSubmission = useCallback(async (userId, opportunityId, applicationId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackApplicationSubmission(userId, opportunityId, applicationId);
      return result;
    } catch (err) {
      setError('Erro ao rastrear submissão de candidatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackVolunteerActivity = useCallback(async (userId, activityId, activityType, duration = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackVolunteerActivity(userId, activityId, activityType, duration);
      return result;
    } catch (err) {
      setError('Erro ao rastrear atividade de voluntário: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackDonation = useCallback(async (userId, amount, donationType, organizationId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.trackDonation(userId, amount, donationType, organizationId);
      return result;
    } catch (err) {
      setError('Erro ao rastrear doação: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Métricas e relatórios
  const getConsolidatedMetrics = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getConsolidatedMetrics(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter métricas consolidadas: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getConversionFunnel = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getConversionFunnel(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter funil de conversão: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserSegmentation = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyticsService.getUserSegmentation(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter segmentação de usuários: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    
    // Google Analytics
    getGAReport,
    getGARealtime,
    
    // Mixpanel
    trackMixpanelEvent,
    setMixpanelUserProperties,
    getMixpanelInsights,
    
    // Eventos específicos
    trackUserRegistration,
    trackOpportunityView,
    trackApplicationSubmission,
    trackVolunteerActivity,
    trackDonation,
    
    // Métricas e relatórios
    getConsolidatedMetrics,
    getConversionFunnel,
    getUserSegmentation,
    
    // Utilitários
    clearError
  };
};

export default useAnalytics;