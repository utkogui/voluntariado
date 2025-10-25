const express = require('express');
const router = express.Router();
const massMessageController = require('../controllers/massMessageController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body, param, query } = require('express-validator');

// Middleware de validação para grupos
const validateMessageGroup = [
  body('name')
    .notEmpty()
    .withMessage('Nome do grupo é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('type')
    .isIn(['MANUAL', 'DYNAMIC', 'SEGMENTED', 'ACTIVITY_PARTICIPANTS', 'VOLUNTEERS', 'INSTITUTIONS'])
    .withMessage('Tipo de grupo inválido'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Configurações devem ser um objeto')
];

const validateMemberRole = [
  body('newRole')
    .isIn(['ADMIN', 'MODERATOR', 'MEMBER'])
    .withMessage('Função inválida')
];

// Middleware de validação para campanhas
const validateCampaign = [
  body('name')
    .notEmpty()
    .withMessage('Nome da campanha é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('type')
    .isIn(['ANNOUNCEMENT', 'REMINDER', 'NEWSLETTER', 'PROMOTIONAL', 'URGENT', 'CUSTOM'])
    .withMessage('Tipo de campanha inválido'),
  body('content')
    .notEmpty()
    .withMessage('Conteúdo da mensagem é obrigatório')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Conteúdo deve ter entre 10 e 10000 caracteres'),
  body('contentType')
    .isIn(['TEXT', 'HTML', 'MARKDOWN'])
    .withMessage('Tipo de conteúdo inválido'),
  body('channels')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um canal deve ser selecionado'),
  body('channels.*')
    .isIn(['EMAIL', 'PUSH', 'SMS', 'IN_APP'])
    .withMessage('Canal inválido'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Assunto deve ter no máximo 200 caracteres'),
  body('groupId')
    .optional()
    .isUUID()
    .withMessage('ID do grupo inválido'),
  body('templateId')
    .optional()
    .isUUID()
    .withMessage('ID do template inválido'),
  body('sendAt')
    .optional()
    .isISO8601()
    .withMessage('Data de envio deve ser válida'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Fuso horário deve ser uma string'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filtros devem ser um objeto'),
  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Usuários alvo devem ser um array')
];

const validateSchedule = [
  body('sendAt')
    .notEmpty()
    .withMessage('Data de envio é obrigatória')
    .isISO8601()
    .withMessage('Data de envio deve ser válida'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Fuso horário deve ser uma string')
];

const validateReschedule = [
  body('sendAt')
    .notEmpty()
    .withMessage('Nova data de envio é obrigatória')
    .isISO8601()
    .withMessage('Nova data de envio deve ser válida'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Fuso horário deve ser uma string')
];

// Middleware de validação para segmentação
const validateCustomSegment = [
  body('name')
    .notEmpty()
    .withMessage('Nome do segmento é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('filters')
    .notEmpty()
    .withMessage('Filtros são obrigatórios')
    .isObject()
    .withMessage('Filtros devem ser um objeto')
];

// Middleware de validação para parâmetros
const validateGroupId = [
  param('groupId')
    .isUUID()
    .withMessage('ID do grupo inválido')
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

// Rotas para grupos de mensagens
router.post('/groups',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateMessageGroup,
  massMessageController.createMessageGroup
);

router.put('/groups/:groupId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  validateMessageGroup,
  massMessageController.updateMessageGroup
);

router.post('/groups/:groupId/members',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  [body('userId').isUUID().withMessage('ID do usuário inválido')],
  massMessageController.addMemberToGroup
);

router.delete('/groups/:groupId/members/:userId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  validateUserId,
  massMessageController.removeMemberFromGroup
);

router.get('/groups',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  massMessageController.getUserGroups
);

router.get('/groups/:groupId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateGroupId,
  massMessageController.getMessageGroup
);

router.get('/groups/:groupId/members',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION', 'VOLUNTEER']),
  validateGroupId,
  massMessageController.getGroupMembers
);

router.put('/groups/:groupId/members/:userId/role',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  validateUserId,
  validateMemberRole,
  massMessageController.updateMemberRole
);

router.delete('/groups/:groupId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  massMessageController.deleteMessageGroup
);

router.get('/groups/:groupId/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  massMessageController.getGroupStats
);

router.get('/groups/:groupId/search-users',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateGroupId,
  massMessageController.searchUsersForGroup
);

// Rotas para campanhas de mensagem em massa
router.post('/campaigns',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaign,
  massMessageController.createCampaign
);

router.post('/campaigns/:campaignId/execute',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  massMessageController.executeCampaign
);

router.get('/campaigns',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getUserCampaigns
);

router.get('/campaigns/:campaignId',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  massMessageController.getCampaign
);

router.post('/campaigns/:campaignId/cancel',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  massMessageController.cancelCampaign
);

router.get('/campaigns/:campaignId/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  massMessageController.getCampaignStats
);

// Rotas para segmentação de usuários
router.get('/segmentation/users',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getSegmentedUsers
);

router.get('/segmentation/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getSegmentationStats
);

router.post('/segmentation/custom-segments',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCustomSegment,
  massMessageController.saveCustomSegment
);

router.get('/segmentation/custom-segments',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getCustomSegments
);

// Rotas para agendamento de mensagens
router.post('/campaigns/:campaignId/schedule',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  validateSchedule,
  massMessageController.scheduleCampaign
);

router.post('/campaigns/:campaignId/cancel-schedule',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  massMessageController.cancelScheduledCampaign
);

router.post('/campaigns/:campaignId/reschedule',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  validateCampaignId,
  validateReschedule,
  massMessageController.rescheduleCampaign
);

router.get('/campaigns/scheduled',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getScheduledCampaigns
);

router.get('/campaigns/scheduling/stats',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getSchedulingStats
);

router.get('/campaigns/upcoming',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getUpcomingCampaigns
);

router.get('/campaigns/scheduling/history',
  authMiddleware,
  authorize(['ADMIN', 'INSTITUTION']),
  massMessageController.getSchedulingHistory
);

module.exports = router;
