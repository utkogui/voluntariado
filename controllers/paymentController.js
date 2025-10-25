const paymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');

// Criar cliente
const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const customerData = req.body;
    const result = await paymentService.createCustomer(customerData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar cliente',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar produto
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const productData = req.body;
    const result = await paymentService.createProduct(productData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar produto',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar preço
const createPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const priceData = req.body;
    const result = await paymentService.createPrice(priceData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Preço criado com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar preço',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating price:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar sessão de checkout
const createCheckoutSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const sessionData = req.body;
    const result = await paymentService.createCheckoutSession(sessionData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Sessão de checkout criada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar sessão de checkout',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar intenção de pagamento
const createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const paymentData = req.body;
    const result = await paymentService.createPaymentIntent(paymentData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Intenção de pagamento criada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar intenção de pagamento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Confirmar pagamento
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'ID da intenção de pagamento é obrigatório'
      });
    }

    const result = await paymentService.confirmPayment(paymentIntentId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao confirmar pagamento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar assinatura
const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const subscriptionData = req.body;
    const result = await paymentService.createSubscription(subscriptionData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Assinatura criada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar assinatura',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Cancelar assinatura
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'ID da assinatura é obrigatório'
      });
    }

    const result = await paymentService.cancelSubscription(subscriptionId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao cancelar assinatura',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter assinatura
const getSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'ID da assinatura é obrigatório'
      });
    }

    const result = await paymentService.getSubscription(subscriptionId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Assinatura não encontrada',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter assinaturas de um cliente
const getCustomerSubscriptions = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'ID do cliente é obrigatório'
      });
    }

    const result = await paymentService.getCustomerSubscriptions(customerId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting customer subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Processar webhook
const processWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    const result = await paymentService.processWebhook(payload, signature);
    
    if (result.success) {
      // Aqui você processaria o evento do webhook
      console.log('Webhook processed:', result.event.type);
      
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao processar webhook',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter estatísticas de pagamentos
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await paymentService.getPaymentStats(startDate, endDate);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter estatísticas',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar reembolso
const createRefund = async (req, res) => {
  try {
    const { chargeId } = req.params;
    const { amount } = req.body;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        message: 'ID da cobrança é obrigatório'
      });
    }

    const result = await paymentService.createRefund(chargeId, amount);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Reembolso criado com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar reembolso',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter métodos de pagamento de um cliente
const getCustomerPaymentMethods = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'ID do cliente é obrigatório'
      });
    }

    const result = await paymentService.getCustomerPaymentMethods(customerId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
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
  processWebhook,
  getPaymentStats,
  createRefund,
  getCustomerPaymentMethods
};
