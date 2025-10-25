const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenv = require('dotenv');

dotenv.config();

const paymentService = {
  // Criar cliente no Stripe
  createCustomer: async (customerData) => {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        metadata: {
          userId: customerData.userId,
          companyId: customerData.companyId
        }
      });

      return {
        success: true,
        customerId: customer.id,
        customer: customer
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar produto no Stripe
  createProduct: async (productData) => {
    try {
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          type: productData.type,
          companyId: productData.companyId
        }
      });

      return {
        success: true,
        productId: product.id,
        product: product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar preço no Stripe
  createPrice: async (priceData) => {
    try {
      const price = await stripe.prices.create({
        unit_amount: priceData.amount, // em centavos
        currency: priceData.currency || 'brl',
        product: priceData.productId,
        recurring: priceData.recurring ? {
          interval: priceData.interval || 'month'
        } : undefined,
        metadata: {
          planId: priceData.planId,
          companyId: priceData.companyId
        }
      });

      return {
        success: true,
        priceId: price.id,
        price: price
      };
    } catch (error) {
      console.error('Error creating price:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar sessão de checkout
  createCheckoutSession: async (sessionData) => {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: sessionData.customerId,
        payment_method_types: ['card'],
        line_items: sessionData.lineItems.map(item => ({
          price: item.priceId,
          quantity: item.quantity || 1
        })),
        mode: sessionData.mode || 'payment', // 'payment' ou 'subscription'
        success_url: sessionData.successUrl,
        cancel_url: sessionData.cancelUrl,
        metadata: {
          companyId: sessionData.companyId,
          userId: sessionData.userId
        }
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
        session: session
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar intenção de pagamento
  createPaymentIntent: async (paymentData) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'brl',
        customer: paymentData.customerId,
        metadata: {
          companyId: paymentData.companyId,
          userId: paymentData.userId,
          description: paymentData.description
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Confirmar pagamento
  confirmPayment: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar assinatura
  createSubscription: async (subscriptionData) => {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [{
          price: subscriptionData.priceId
        }],
        metadata: {
          companyId: subscriptionData.companyId,
          planId: subscriptionData.planId
        }
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        subscription: subscription
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Cancelar assinatura
  cancelSubscription: async (subscriptionId) => {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      
      return {
        success: true,
        subscription: subscription
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter assinatura
  getSubscription: async (subscriptionId) => {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        success: true,
        subscription: subscription
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Listar assinaturas de um cliente
  getCustomerSubscriptions: async (customerId) => {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all'
      });
      
      return {
        success: true,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar webhook endpoint
  createWebhookEndpoint: async (webhookData) => {
    try {
      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookData.url,
        enabled_events: webhookData.events || [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed'
        ]
      });

      return {
        success: true,
        endpointId: endpoint.id,
        endpoint: endpoint
      };
    } catch (error) {
      console.error('Error creating webhook endpoint:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Processar webhook
  processWebhook: async (payload, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return {
        success: true,
        event: event
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter estatísticas de pagamentos
  getPaymentStats: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.created = { gte: Math.floor(new Date(startDate).getTime() / 1000) };
      if (endDate) params.created = { ...params.created, lte: Math.floor(new Date(endDate).getTime() / 1000) };

      const [charges, subscriptions] = await Promise.all([
        stripe.charges.list(params),
        stripe.subscriptions.list(params)
      ]);

      const totalRevenue = charges.data
        .filter(charge => charge.status === 'succeeded')
        .reduce((sum, charge) => sum + charge.amount, 0);

      const activeSubscriptions = subscriptions.data
        .filter(sub => sub.status === 'active').length;

      return {
        success: true,
        stats: {
          totalRevenue,
          totalCharges: charges.data.length,
          successfulCharges: charges.data.filter(c => c.status === 'succeeded').length,
          failedCharges: charges.data.filter(c => c.status === 'failed').length,
          totalSubscriptions: subscriptions.data.length,
          activeSubscriptions,
          cancelledSubscriptions: subscriptions.data.filter(s => s.status === 'canceled').length
        }
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Criar reembolso
  createRefund: async (chargeId, amount = null) => {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount
      });

      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter métodos de pagamento de um cliente
  getCustomerPaymentMethods: async (customerId) => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      console.error('Error getting customer payment methods:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = paymentService;
