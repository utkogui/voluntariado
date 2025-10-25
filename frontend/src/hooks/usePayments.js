import { useState, useCallback } from 'react';
import paymentService from '../services/paymentService';

const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Criar cliente
  const createCustomer = useCallback(async (customerData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createCustomer(customerData);
      return result;
    } catch (err) {
      setError('Erro ao criar cliente: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar produto
  const createProduct = useCallback(async (productData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createProduct(productData);
      return result;
    } catch (err) {
      setError('Erro ao criar produto: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar preço
  const createPrice = useCallback(async (priceData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createPrice(priceData);
      return result;
    } catch (err) {
      setError('Erro ao criar preço: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar sessão de checkout
  const createCheckoutSession = useCallback(async (sessionData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createCheckoutSession(sessionData);
      return result;
    } catch (err) {
      setError('Erro ao criar sessão de checkout: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar intenção de pagamento
  const createPaymentIntent = useCallback(async (paymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createPaymentIntent(paymentData);
      return result;
    } catch (err) {
      setError('Erro ao criar intenção de pagamento: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Confirmar pagamento
  const confirmPayment = useCallback(async (paymentIntentId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.confirmPayment(paymentIntentId);
      return result;
    } catch (err) {
      setError('Erro ao confirmar pagamento: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar assinatura
  const createSubscription = useCallback(async (subscriptionData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createSubscription(subscriptionData);
      return result;
    } catch (err) {
      setError('Erro ao criar assinatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar assinatura
  const cancelSubscription = useCallback(async (subscriptionId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.cancelSubscription(subscriptionId);
      return result;
    } catch (err) {
      setError('Erro ao cancelar assinatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter assinatura
  const getSubscription = useCallback(async (subscriptionId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.getSubscription(subscriptionId);
      return result;
    } catch (err) {
      setError('Erro ao obter assinatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter assinaturas de um cliente
  const getCustomerSubscriptions = useCallback(async (customerId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.getCustomerSubscriptions(customerId);
      return result;
    } catch (err) {
      setError('Erro ao obter assinaturas do cliente: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter estatísticas de pagamentos
  const getPaymentStats = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.getPaymentStats(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter estatísticas: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar reembolso
  const createRefund = useCallback(async (chargeId, amount = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.createRefund(chargeId, amount);
      return result;
    } catch (err) {
      setError('Erro ao criar reembolso: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter métodos de pagamento de um cliente
  const getCustomerPaymentMethods = useCallback(async (customerId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await paymentService.getCustomerPaymentMethods(customerId);
      return result;
    } catch (err) {
      setError('Erro ao obter métodos de pagamento: ' + err.message);
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
    createCustomer,
    createProduct,
    createPrice,
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    createSubscription,
    cancelSubscription,
    getSubscription,
    getCustomerSubscriptions,
    getPaymentStats,
    createRefund,
    getCustomerPaymentMethods,
    clearError
  };
};

export default usePayments;
