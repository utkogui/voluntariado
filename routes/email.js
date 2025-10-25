const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');
const { body, query } = require('express-validator');

// Middleware de validação
const validateUserId = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validateEmail = [
  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
];

const validateApplicationId = [
  body('applicationId')
    .notEmpty()
    .withMessage('ID da candidatura é obrigatório')
    .isMongoId()
    .withMessage('ID da candidatura deve ser um ID válido')
];

const validateBulkEmail = [
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('Recipients deve ser um array com pelo menos 1 item'),
  body('recipients.*.email')
    .isEmail()
    .withMessage('Cada recipient deve ter um email válido'),
  body('subject')
    .notEmpty()
    .withMessage('Assunto é obrigatório')
    .isLength({ min: 1, max: 200 })
    .withMessage('Assunto deve ter entre 1 e 200 caracteres'),
  body('html')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('HTML deve ter entre 1 e 10000 caracteres'),
  body('text')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Texto deve ter entre 1 e 5000 caracteres')
];

const validateEmailStats = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601')
];

// Rotas públicas
router.post('/send-welcome', validateUserId, emailController.sendWelcomeEmail);
router.post('/send-verification', validateUserId, emailController.sendVerificationEmail);
router.post('/send-password-reset', validateEmail, emailController.sendPasswordResetEmail);
router.post('/validate-email', validateEmail, emailController.validateEmail);

// Rotas protegidas
router.post('/send-opportunity-notification', auth, [
  body('volunteerId')
    .notEmpty()
    .withMessage('ID do voluntário é obrigatório')
    .isMongoId()
    .withMessage('ID do voluntário deve ser um ID válido'),
  body('opportunityId')
    .notEmpty()
    .withMessage('ID da oportunidade é obrigatório')
    .isMongoId()
    .withMessage('ID da oportunidade deve ser um ID válido')
], emailController.sendNewOpportunityNotification);

router.post('/send-application-notification', auth, validateApplicationId, emailController.sendApplicationNotification);

router.post('/send-application-status-notification', auth, validateApplicationId, emailController.sendApplicationStatusNotification);

router.post('/send-activity-reminder', auth, [
  body('participantId')
    .notEmpty()
    .withMessage('ID do participante é obrigatório')
    .isMongoId()
    .withMessage('ID do participante deve ser um ID válido'),
  body('activityId')
    .notEmpty()
    .withMessage('ID da atividade é obrigatório')
    .isMongoId()
    .withMessage('ID da atividade deve ser um ID válido')
], emailController.sendActivityReminder);

router.post('/send-bulk-email', auth, validateBulkEmail, emailController.sendBulkEmail);

router.get('/stats', auth, validateEmailStats, emailController.getEmailStats);

module.exports = router;