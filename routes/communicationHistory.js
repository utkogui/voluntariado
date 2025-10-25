const express = require('express');
const router = express.Router();
const communicationHistoryController = require('../controllers/communicationHistoryController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { param, query } = require('express-validator');

// Middleware de validação para parâmetros
const validateCommunicationId = [
  param('communicationId')
    .isUUID()
    .withMessage('ID da comunicação inválido')
];

const validateCampaignId = [
  param('campaignId')
    .isUUID()
    .withMessage('ID da campanha inválido')
];

const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário inválido')
];

// Middleware de validação para query parameters
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
  query('sortBy')
    .optional()
    .isIn(['sentAt', 'type', 'channel', 'status'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação inválida'),
  query('type')
    .optional()
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'CHAT'])
    .withMessage('Tipo de comunicação inválido'),
  query('channel')
    .optional()
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'CHAT'])
    .withMessage('Canal de comunicação inválido'),
  query('status')
    .optional()
    .isIn(['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED'])
    .withMessage('Status de comunicação inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser válida'),
  query('groupBy')
    .optional()
    .isIn(['day', 'hour', 'week', 'month'])
    .withMessage('Agrupamento temporal inválido'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Número de dias deve ser entre 1 e 365')
];

// Rotas para histórico de comunicações do usuário
router.get('/user',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  communicationHistoryController.getUserCommunicationHistory
);

// Rotas para histórico de comunicações de campanha
router.get('/campaigns/:campaignId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  validateQueryParams,
  communicationHistoryController.getCampaignCommunicationHistory
);

// Rotas para estatísticas de comunicação
router.get('/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateQueryParams,
  communicationHistoryController.getCommunicationStats
);

router.get('/stats/engagement',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateQueryParams,
  communicationHistoryController.getEngagementStats
);

router.get('/stats/channels',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateQueryParams,
  communicationHistoryController.getChannelStats
);

router.get('/stats/temporal',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateQueryParams,
  communicationHistoryController.getTemporalStats
);

// Rotas para histórico de conversa
router.get('/conversations/:userId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateUserId,
  validateQueryParams,
  communicationHistoryController.getConversationHistory
);

// Rotas para marcar status de comunicação
router.post('/:communicationId/delivered',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCommunicationId,
  communicationHistoryController.markAsDelivered
);

router.post('/:communicationId/opened',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateCommunicationId,
  communicationHistoryController.markAsOpened
);

router.post('/:communicationId/clicked',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateCommunicationId,
  communicationHistoryController.markAsClicked
);

router.post('/:communicationId/failed',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCommunicationId,
  communicationHistoryController.markAsFailed
);

// Rotas para obter comunicação específica
router.get('/:communicationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateCommunicationId,
  communicationHistoryController.getCommunication
);

// Rotas para excluir comunicação
router.delete('/:communicationId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateCommunicationId,
  communicationHistoryController.deleteCommunication
);

// Rotas para resumo de comunicações
router.get('/user/summary',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateQueryParams,
  communicationHistoryController.getRecentCommunicationsSummary
);

module.exports = router;
