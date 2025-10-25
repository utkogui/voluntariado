import { useState, useCallback } from 'react';
import backgroundCheckService from '../services/backgroundCheckService';

const useBackgroundCheck = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Iniciar verificação de antecedentes
  const initiateBackgroundCheck = useCallback(async (userId, personalData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.initiateBackgroundCheck(userId, personalData);
      return result;
    } catch (err) {
      setError('Erro ao iniciar verificação de antecedentes: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar status da verificação
  const getCheckStatus = useCallback(async (checkId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.getCheckStatus(checkId);
      return result;
    } catch (err) {
      setError('Erro ao verificar status: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter relatório completo
  const getCheckReport = useCallback(async (checkId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.getCheckReport(checkId);
      return result;
    } catch (err) {
      setError('Erro ao obter relatório: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listar verificações de um usuário
  const getUserChecks = useCallback(async (userId, limit = 10, offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.getUserChecks(userId, limit, offset);
      return result;
    } catch (err) {
      setError('Erro ao obter verificações do usuário: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar verificação
  const cancelCheck = useCallback(async (checkId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.cancelCheck(checkId);
      return result;
    } catch (err) {
      setError('Erro ao cancelar verificação: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar elegibilidade para voluntariado
  const checkVolunteerEligibility = useCallback(async (checkId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.checkVolunteerEligibility(checkId);
      return result;
    } catch (err) {
      setError('Erro ao verificar elegibilidade: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter estatísticas de verificações
  const getCheckStats = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await backgroundCheckService.getCheckStats(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter estatísticas: ' + err.message);
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
    
    // Ações
    initiateBackgroundCheck,
    getCheckStatus,
    getCheckReport,
    getUserChecks,
    cancelCheck,
    checkVolunteerEligibility,
    getCheckStats,
    clearError
  };
};

export default useBackgroundCheck;
