const express = require('express');
const router = express.Router();
const backgroundCheckController = require('../controllers/backgroundCheckController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Middleware de validação
const validatePersonalData = [
  body('fullName')
    .notEmpty()
    .withMessage('Nome completo é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome completo deve ter entre 2 e 100 caracteres'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Data de nascimento é obrigatória')
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato ISO 8601'),
  body('socialSecurityNumber')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  body('address')
    .notEmpty()
    .withMessage('Endereço é obrigatório')
    .isLength({ min: 10, max: 200 })
    .withMessage('Endereço deve ter entre 10 e 200 caracteres'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido'),
  body('checkTypes')
    .optional()
    .isArray()
    .withMessage('Tipos de verificação devem ser um array'),
  body('checkTypes.*')
    .optional()
    .isIn(['criminal', 'identity', 'employment', 'education', 'reference'])
    .withMessage('Tipo de verificação inválido')
];

const validateCheckId = [
  param('checkId')
    .notEmpty()
    .withMessage('ID da verificação é obrigatório')
    .matches(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
    .withMessage('ID da verificação deve ser um UUID válido')
];

const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validateQueryParams = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser um número maior ou igual a 0'),
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
router.post('/users/:userId/checks', auth, [
  ...validateUserId,
  ...validatePersonalData
], backgroundCheckController.initiateBackgroundCheck);

router.get('/checks/:checkId/status', auth, [
  ...validateCheckId
], backgroundCheckController.getCheckStatus);

router.get('/checks/:checkId/report', auth, [
  ...validateCheckId
], backgroundCheckController.getCheckReport);

router.get('/users/:userId/checks', auth, [
  ...validateUserId,
  ...validateQueryParams
], backgroundCheckController.getUserChecks);

router.post('/checks/:checkId/cancel', auth, [
  ...validateCheckId
], backgroundCheckController.cancelCheck);

router.get('/checks/:checkId/eligibility', auth, [
  ...validateCheckId
], backgroundCheckController.checkVolunteerEligibility);

router.get('/stats', auth, [
  ...validateQueryParams
], backgroundCheckController.getCheckStats);

// Webhook (não protegido por auth, mas deve ter validação de assinatura)
router.post('/webhook/status-update', backgroundCheckController.processStatusUpdate);

module.exports = router;