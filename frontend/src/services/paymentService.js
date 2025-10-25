import api from './api';

const PAYMENT_API_BASE_URL = '/api/payments';

const paymentService = {
  // Criar cliente
  createCustomer: async (customerData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/customers`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Criar produto
  createProduct: async (productData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/products`, productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Criar preço
  createPrice: async (priceData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/prices`, priceData);
      return response.data;
    } catch (error) {
      console.error('Error creating price:', error);
      throw error;
    }
  },

  // Criar sessão de checkout
  createCheckoutSession: async (sessionData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/checkout-sessions`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Criar intenção de pagamento
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/payment-intents`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirmar pagamento
  confirmPayment: async (paymentIntentId) => {
    try {
      const response = await api.get(`${PAYMENT_API_BASE_URL}/payment-intents/${paymentIntentId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Criar assinatura
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/subscriptions`, subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Cancelar assinatura
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Obter assinatura
  getSubscription: async (subscriptionId) => {
    try {
      const response = await api.get(`${PAYMENT_API_BASE_URL}/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  },

  // Obter assinaturas de um cliente
  getCustomerSubscriptions: async (customerId) => {
    try {
      const response = await api.get(`${PAYMENT_API_BASE_URL}/customers/${customerId}/subscriptions`);
      return response.data;
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      throw error;
    }
  },

  // Obter estatísticas de pagamentos
  getPaymentStats: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${PAYMENT_API_BASE_URL}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  },

  // Criar reembolso
  createRefund: async (chargeId, amount = null) => {
    try {
      const response = await api.post(`${PAYMENT_API_BASE_URL}/refunds/${chargeId}`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  },

  // Obter métodos de pagamento de um cliente
  getCustomerPaymentMethods: async (customerId) => {
    try {
      const response = await api.get(`${PAYMENT_API_BASE_URL}/customers/${customerId}/payment-methods`);
      return response.data;
    } catch (error) {
      console.error('Error getting customer payment methods:', error);
      throw error;
    }
  }
};

export default paymentService;
