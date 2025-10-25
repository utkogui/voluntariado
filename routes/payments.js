const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Middleware de validação
const validateCustomerData = [
  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido'),
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Telefone deve estar no formato internacional'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Endereço deve ser um objeto'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('companyId')
    .optional()
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido')
];

const validateProductData = [
  body('name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('type')
    .notEmpty()
    .withMessage('Tipo do produto é obrigatório')
    .isIn(['plan', 'service', 'donation'])
    .withMessage('Tipo deve ser: plan, service ou donation'),
  body('companyId')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido')
];

const validatePriceData = [
  body('amount')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isInt({ min: 1 })
    .withMessage('Valor deve ser um número inteiro positivo'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Moeda deve ter 3 caracteres'),
  body('productId')
    .notEmpty()
    .withMessage('ID do produto é obrigatório'),
  body('recurring')
    .optional()
    .isBoolean()
    .withMessage('Recorrente deve ser um booleano'),
  body('interval')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Intervalo deve ser: day, week, month ou year'),
  body('planId')
    .optional()
    .isMongoId()
    .withMessage('ID do plano deve ser um ID válido'),
  body('companyId')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido')
];

const validateCheckoutSessionData = [
  body('customerId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório'),
  body('lineItems')
    .isArray({ min: 1 })
    .withMessage('Itens da linha devem ser um array com pelo menos 1 item'),
  body('lineItems.*.priceId')
    .notEmpty()
    .withMessage('ID do preço é obrigatório para cada item'),
  body('lineItems.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),
  body('successUrl')
    .notEmpty()
    .withMessage('URL de sucesso é obrigatória')
    .isURL()
    .withMessage('URL de sucesso deve ser uma URL válida'),
  body('cancelUrl')
    .notEmpty()
    .withMessage('URL de cancelamento é obrigatória')
    .isURL()
    .withMessage('URL de cancelamento deve ser uma URL válida'),
  body('mode')
    .optional()
    .isIn(['payment', 'subscription'])
    .withMessage('Modo deve ser: payment ou subscription'),
  body('companyId')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validatePaymentIntentData = [
  body('amount')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isInt({ min: 1 })
    .withMessage('Valor deve ser um número inteiro positivo'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Moeda deve ter 3 caracteres'),
  body('customerId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Descrição deve ter no máximo 200 caracteres'),
  body('companyId')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validateSubscriptionData = [
  body('customerId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório'),
  body('priceId')
    .notEmpty()
    .withMessage('ID do preço é obrigatório'),
  body('planId')
    .optional()
    .isMongoId()
    .withMessage('ID do plano deve ser um ID válido'),
  body('companyId')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isMongoId()
    .withMessage('ID da empresa deve ser um ID válido')
];

const validatePaymentIntentId = [
  param('paymentIntentId')
    .notEmpty()
    .withMessage('ID da intenção de pagamento é obrigatório')
];

const validateSubscriptionId = [
  param('subscriptionId')
    .notEmpty()
    .withMessage('ID da assinatura é obrigatório')
];

const validateCustomerId = [
  param('customerId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório')
];

const validateChargeId = [
  param('chargeId')
    .notEmpty()
    .withMessage('ID da cobrança é obrigatório')
];

const validateQueryParams = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601')
];

// Rotas protegidas
router.post('/customers', auth, validateCustomerData, paymentController.createCustomer);
router.post('/products', auth, validateProductData, paymentController.createProduct);
router.post('/prices', auth, validatePriceData, paymentController.createPrice);
router.post('/checkout-sessions', auth, validateCheckoutSessionData, paymentController.createCheckoutSession);
router.post('/payment-intents', auth, validatePaymentIntentData, paymentController.createPaymentIntent);
router.get('/payment-intents/:paymentIntentId/confirm', auth, validatePaymentIntentId, paymentController.confirmPayment);
router.post('/subscriptions', auth, validateSubscriptionData, paymentController.createSubscription);
router.post('/subscriptions/:subscriptionId/cancel', auth, validateSubscriptionId, paymentController.cancelSubscription);
router.get('/subscriptions/:subscriptionId', auth, validateSubscriptionId, paymentController.getSubscription);
router.get('/customers/:customerId/subscriptions', auth, validateCustomerId, paymentController.getCustomerSubscriptions);
router.get('/customers/:customerId/payment-methods', auth, validateCustomerId, paymentController.getCustomerPaymentMethods);
router.get('/stats', auth, validateQueryParams, paymentController.getPaymentStats);
router.post('/refunds/:chargeId', auth, validateChargeId, paymentController.createRefund);

// Webhook (não protegido por auth, mas deve ter validação de assinatura)
router.post('/webhook', paymentController.processWebhook);

module.exports = router;
