const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { body, query } = require('express-validator');

// Middleware de validação
const validateEventData = [
  body('eventName')
    .notEmpty()
    .withMessage('Nome do evento é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do evento deve ter entre 1 e 100 caracteres'),
  body('properties')
    .optional()
    .isObject()
    .withMessage('Propriedades devem ser um objeto'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validateUserProperties = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('properties')
    .notEmpty()
    .withMessage('Propriedades são obrigatórias')
    .isObject()
    .withMessage('Propriedades devem ser um objeto')
];

const validateUserRegistration = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('userType')
    .notEmpty()
    .withMessage('Tipo de usuário é obrigatório')
    .isIn(['volunteer', 'institution', 'company'])
    .withMessage('Tipo de usuário deve ser: volunteer, institution ou company'),
  body('registrationMethod')
    .optional()
    .isIn(['email', 'google', 'facebook', 'linkedin'])
    .withMessage('Método de registro deve ser: email, google, facebook ou linkedin')
];

const validateOpportunityView = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('opportunityId')
    .notEmpty()
    .withMessage('ID da oportunidade é obrigatório')
    .isMongoId()
    .withMessage('ID da oportunidade deve ser um ID válido'),
  body('opportunityType')
    .notEmpty()
    .withMessage('Tipo da oportunidade é obrigatório')
    .isIn(['volunteer', 'donation', 'sponsorship'])
    .withMessage('Tipo da oportunidade deve ser: volunteer, donation ou sponsorship')
];

const validateApplicationSubmission = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('opportunityId')
    .notEmpty()
    .withMessage('ID da oportunidade é obrigatório')
    .isMongoId()
    .withMessage('ID da oportunidade deve ser um ID válido'),
  body('applicationId')
    .notEmpty()
    .withMessage('ID da candidatura é obrigatório')
    .isMongoId()
    .withMessage('ID da candidatura deve ser um ID válido')
];

const validateVolunteerActivity = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('activityId')
    .notEmpty()
    .withMessage('ID da atividade é obrigatório')
    .isMongoId()
    .withMessage('ID da atividade deve ser um ID válido'),
  body('activityType')
    .notEmpty()
    .withMessage('Tipo da atividade é obrigatório')
    .isIn(['volunteer', 'training', 'meeting', 'event'])
    .withMessage('Tipo da atividade deve ser: volunteer, training, meeting ou event'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duração deve ser um número inteiro positivo')
];

const validateDonation = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido'),
  body('amount')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser um número positivo'),
  body('donationType')
    .notEmpty()
    .withMessage('Tipo da doação é obrigatório')
    .isIn(['money', 'goods', 'services'])
    .withMessage('Tipo da doação deve ser: money, goods ou services'),
  body('organizationId')
    .notEmpty()
    .withMessage('ID da organização é obrigatório')
    .isMongoId()
    .withMessage('ID da organização deve ser um ID válido')
];

const validateQueryParams = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601'),
  query('metrics')
    .optional()
    .isArray()
    .withMessage('Métricas devem ser um array'),
  query('dimensions')
    .optional()
    .isArray()
    .withMessage('Dimensões devem ser um array'),
  query('event')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Evento deve ter entre 1 e 100 caracteres'),
  query('unit')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Unidade deve ser: day, week, month ou year')
];

// Rotas protegidas
router.get('/ga/report', auth, validateQueryParams, analyticsController.getGAReport);
router.get('/ga/realtime', auth, analyticsController.getGARealtime);
router.post('/mixpanel/track', auth, validateEventData, analyticsController.trackMixpanelEvent);
router.post('/mixpanel/user-properties', auth, validateUserProperties, analyticsController.setMixpanelUserProperties);
router.get('/mixpanel/insights', auth, validateQueryParams, analyticsController.getMixpanelInsights);

// Rotas de eventos específicos
router.post('/events/user-registration', auth, validateUserRegistration, analyticsController.trackUserRegistration);
router.post('/events/opportunity-view', auth, validateOpportunityView, analyticsController.trackOpportunityView);
router.post('/events/application-submission', auth, validateApplicationSubmission, analyticsController.trackApplicationSubmission);
router.post('/events/volunteer-activity', auth, validateVolunteerActivity, analyticsController.trackVolunteerActivity);
router.post('/events/donation', auth, validateDonation, analyticsController.trackDonation);

// Rotas de métricas e relatórios
router.get('/metrics/consolidated', auth, validateQueryParams, analyticsController.getConsolidatedMetrics);
router.get('/metrics/conversion-funnel', auth, validateQueryParams, analyticsController.getConversionFunnel);
router.get('/metrics/user-segmentation', auth, validateQueryParams, analyticsController.getUserSegmentation);

module.exports = router;