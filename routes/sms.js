const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Middleware de validação
const validateSMSData = [
  body('to')
    .notEmpty()
    .withMessage('Número de telefone de destino é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('message')
    .notEmpty()
    .withMessage('Mensagem é obrigatória')
    .isLength({ min: 1, max: 1600 })
    .withMessage('Mensagem deve ter entre 1 e 1600 caracteres'),
  body('from')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone remetente deve estar no formato internacional')
];

const validateBulkSMSData = [
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('Lista de destinatários deve ser um array com pelo menos 1 item'),
  body('recipients.*')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Cada número de telefone deve estar no formato internacional'),
  body('message')
    .notEmpty()
    .withMessage('Mensagem é obrigatória')
    .isLength({ min: 1, max: 1600 })
    .withMessage('Mensagem deve ter entre 1 e 1600 caracteres'),
  body('from')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone remetente deve estar no formato internacional')
];

const validateVerificationSMSData = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('verificationCode')
    .notEmpty()
    .withMessage('Código de verificação é obrigatório')
    .isLength({ min: 4, max: 8 })
    .withMessage('Código de verificação deve ter entre 4 e 8 caracteres')
];

const validateActivityReminderData = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('activityName')
    .notEmpty()
    .withMessage('Nome da atividade é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da atividade deve ter entre 1 e 100 caracteres'),
  body('activityDate')
    .notEmpty()
    .withMessage('Data da atividade é obrigatória')
    .isISO8601()
    .withMessage('Data da atividade deve estar no formato ISO 8601'),
  body('activityTime')
    .notEmpty()
    .withMessage('Horário da atividade é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário da atividade deve estar no formato HH:MM')
];

const validateApplicationConfirmationData = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('opportunityName')
    .notEmpty()
    .withMessage('Nome da oportunidade é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da oportunidade deve ter entre 1 e 100 caracteres'),
  body('status')
    .notEmpty()
    .withMessage('Status da candidatura é obrigatório')
    .isIn(['approved', 'rejected', 'pending'])
    .withMessage('Status deve ser: approved, rejected ou pending')
];

const validateEmergencySMSData = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional'),
  body('message')
    .notEmpty()
    .withMessage('Mensagem de emergência é obrigatória')
    .isLength({ min: 1, max: 1600 })
    .withMessage('Mensagem deve ter entre 1 e 1600 caracteres')
];

const validateMessageId = [
  param('messageId')
    .notEmpty()
    .withMessage('ID da mensagem é obrigatório')
    .matches(/^SM[a-f0-9]{32}$/)
    .withMessage('ID da mensagem deve ser um SID válido do Twilio')
];

const validatePhoneNumber = [
  param('phoneNumber')
    .notEmpty()
    .withMessage('Número de telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Número de telefone deve estar no formato internacional')
];

const validateQueryParams = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limite deve ser um número entre 1 e 1000'),
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
router.post('/send', auth, validateSMSData, smsController.sendSMS);
router.post('/send-bulk', auth, validateBulkSMSData, smsController.sendBulkSMS);
router.post('/send-verification', auth, validateVerificationSMSData, smsController.sendVerificationSMS);
router.post('/send-activity-reminder', auth, validateActivityReminderData, smsController.sendActivityReminderSMS);
router.post('/send-application-confirmation', auth, validateApplicationConfirmationData, smsController.sendApplicationConfirmationSMS);
router.post('/send-emergency', auth, validateEmergencySMSData, smsController.sendEmergencySMS);

// Rotas de consulta
router.get('/message/:messageId/status', auth, validateMessageId, smsController.getMessageStatus);
router.get('/history', auth, validateQueryParams, smsController.getMessageHistory);
router.get('/validate/:phoneNumber', auth, validatePhoneNumber, smsController.validatePhoneNumber);
router.get('/stats', auth, validateQueryParams, smsController.getSMSStats);

module.exports = router;