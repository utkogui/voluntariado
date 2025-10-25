const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotificationController');
const auth = require('../middleware/auth');
const { body, query } = require('express-validator');

// Middleware de validação
const validateNotificationData = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('body')
    .notEmpty()
    .withMessage('Corpo da mensagem é obrigatório')
    .isLength({ min: 1, max: 200 })
    .withMessage('Corpo da mensagem deve ter entre 1 e 200 caracteres'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Dados devem ser um objeto')
];

const validateUserId = [
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isMongoId()
    .withMessage('ID do usuário deve ser um ID válido')
];

const validateUserIds = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('IDs dos usuários devem ser um array com pelo menos 1 item'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Cada ID de usuário deve ser um ID válido')
];

const validateTopic = [
  body('topic')
    .notEmpty()
    .withMessage('Tópico é obrigatório')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tópico deve ter entre 1 e 50 caracteres')
];

const validateTokens = [
  body('tokens')
    .isArray({ min: 1 })
    .withMessage('Tokens devem ser um array com pelo menos 1 item'),
  body('tokens.*')
    .notEmpty()
    .withMessage('Cada token deve ser uma string não vazia')
];

const validateScheduleData = [
  body('notificationData')
    .isObject()
    .withMessage('Dados da notificação devem ser um objeto'),
  body('notificationData.title')
    .notEmpty()
    .withMessage('Título é obrigatório'),
  body('notificationData.body')
    .notEmpty()
    .withMessage('Corpo da mensagem é obrigatório'),
  body('scheduleTime')
    .notEmpty()
    .withMessage('Tempo de agendamento é obrigatório')
    .isISO8601()
    .withMessage('Tempo de agendamento deve estar no formato ISO 8601')
];

const validateNotificationStats = [
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
router.post('/send-to-user', auth, [
  ...validateUserId,
  ...validateNotificationData
], pushNotificationController.sendToUser);

router.post('/send-to-multiple-users', auth, [
  ...validateUserIds,
  ...validateNotificationData
], pushNotificationController.sendToMultipleUsers);

router.post('/send-to-topic', auth, [
  ...validateTopic,
  ...validateNotificationData
], pushNotificationController.sendToTopic);

router.post('/subscribe-to-topic', auth, [
  ...validateTokens,
  ...validateTopic
], pushNotificationController.subscribeToTopic);

router.post('/unsubscribe-from-topic', auth, [
  ...validateTokens,
  ...validateTopic
], pushNotificationController.unsubscribeFromTopic);

router.post('/schedule-notification', auth, validateScheduleData, pushNotificationController.scheduleNotification);

router.get('/stats', auth, validateNotificationStats, pushNotificationController.getNotificationStats);

// Rotas específicas de notificações
router.post('/send-new-opportunity', auth, [
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
], pushNotificationController.sendNewOpportunityNotification);

router.post('/send-application-status', auth, [
  body('applicationId')
    .notEmpty()
    .withMessage('ID da candidatura é obrigatório')
    .isMongoId()
    .withMessage('ID da candidatura deve ser um ID válido')
], pushNotificationController.sendApplicationStatusNotification);

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
], pushNotificationController.sendActivityReminder);

module.exports = router;