import { useState, useCallback } from 'react';
import smsService from '../services/smsService';

const useSMS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enviar SMS para um número específico
  const sendSMS = useCallback(async (to, message, from = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendSMS(to, message, from);
      return result;
    } catch (err) {
      setError('Erro ao enviar SMS: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar SMS em massa
  const sendBulkSMS = useCallback(async (recipients, message, from = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendBulkSMS(recipients, message, from);
      return result;
    } catch (err) {
      setError('Erro ao enviar SMS em massa: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar SMS de verificação
  const sendVerificationSMS = useCallback(async (phoneNumber, verificationCode) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendVerificationSMS(phoneNumber, verificationCode);
      return result;
    } catch (err) {
      setError('Erro ao enviar SMS de verificação: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar lembrete de atividade
  const sendActivityReminderSMS = useCallback(async (phoneNumber, activityName, activityDate, activityTime) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendActivityReminderSMS(phoneNumber, activityName, activityDate, activityTime);
      return result;
    } catch (err) {
      setError('Erro ao enviar lembrete de atividade: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar confirmação de candidatura
  const sendApplicationConfirmationSMS = useCallback(async (phoneNumber, opportunityName, status) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendApplicationConfirmationSMS(phoneNumber, opportunityName, status);
      return result;
    } catch (err) {
      setError('Erro ao enviar confirmação de candidatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar SMS de emergência
  const sendEmergencySMS = useCallback(async (phoneNumber, message) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.sendEmergencySMS(phoneNumber, message);
      return result;
    } catch (err) {
      setError('Erro ao enviar SMS de emergência: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar status de uma mensagem
  const getMessageStatus = useCallback(async (messageId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.getMessageStatus(messageId);
      return result;
    } catch (err) {
      setError('Erro ao verificar status da mensagem: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter histórico de mensagens
  const getMessageHistory = useCallback(async (limit = 50, startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.getMessageHistory(limit, startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter histórico de mensagens: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validar número de telefone
  const validatePhoneNumber = useCallback(async (phoneNumber) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.validatePhoneNumber(phoneNumber);
      return result;
    } catch (err) {
      setError('Erro ao validar número de telefone: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter estatísticas de SMS
  const getSMSStats = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await smsService.getSMSStats(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter estatísticas de SMS: ' + err.message);
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
    sendSMS,
    sendBulkSMS,
    sendVerificationSMS,
    sendActivityReminderSMS,
    sendApplicationConfirmationSMS,
    sendEmergencySMS,
    getMessageStatus,
    getMessageHistory,
    validatePhoneNumber,
    getSMSStats,
    clearError
  };
};

export default useSMS;
