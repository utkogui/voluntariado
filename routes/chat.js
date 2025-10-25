const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createConversation,
  getUserConversations,
  getConversation,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  addParticipant,
  removeParticipant,
  getChatStats,
  findDirectConversation,
  createDirectConversation
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/chat/conversations
 * @desc Criar uma nova conversa
 * @access Private
 */
router.post(
  '/conversations',
  [
    body('title')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Título deve ser uma string entre 1 e 255 caracteres'),
    body('type')
      .optional()
      .isIn(['DIRECT', 'GROUP', 'OPPORTUNITY'])
      .withMessage('Tipo de conversa deve ser DIRECT, GROUP ou OPPORTUNITY'),
    body('participants')
      .isArray({ min: 1 })
      .withMessage('Participantes devem ser um array com pelo menos 1 item'),
    body('participants.*')
      .isUUID()
      .withMessage('ID do participante deve ser um UUID válido'),
    body('opportunityId')
      .optional()
      .isUUID()
      .withMessage('ID da oportunidade deve ser um UUID válido')
  ],
  validateRequest,
  createConversation
);

/**
 * @route GET /api/chat/conversations/user/:userId
 * @desc Obter conversas do usuário
 * @access Private
 */
router.get(
  '/conversations/user/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('type')
      .optional()
      .isIn(['DIRECT', 'GROUP', 'OPPORTUNITY'])
      .withMessage('Tipo de conversa inválido'),
    query('status')
      .optional()
      .isIn(['ACTIVE', 'ARCHIVED', 'DELETED'])
      .withMessage('Status da conversa inválido')
  ],
  validateRequest,
  getUserConversations
);

/**
 * @route GET /api/chat/conversations/:conversationId
 * @desc Obter uma conversa específica
 * @access Private
 */
router.get(
  '/conversations/:conversationId',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido')
  ],
  validateRequest,
  getConversation
);

/**
 * @route POST /api/chat/conversations/direct
 * @desc Criar conversa direta entre dois usuários
 * @access Private
 */
router.post(
  '/conversations/direct',
  [
    body('otherUserId')
      .isUUID()
      .withMessage('ID do outro usuário deve ser um UUID válido')
  ],
  validateRequest,
  createDirectConversation
);

/**
 * @route GET /api/chat/conversations/direct/:userId1/:userId2
 * @desc Buscar conversa direta entre dois usuários
 * @access Private
 */
router.get(
  '/conversations/direct/:userId1/:userId2',
  [
    param('userId1').isUUID().withMessage('ID do primeiro usuário inválido'),
    param('userId2').isUUID().withMessage('ID do segundo usuário inválido')
  ],
  validateRequest,
  findDirectConversation
);

/**
 * @route POST /api/chat/conversations/:conversationId/messages
 * @desc Enviar mensagem
 * @access Private
 */
router.post(
  '/conversations/:conversationId/messages',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido'),
    body('content')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Conteúdo deve ser uma string entre 1 e 2000 caracteres'),
    body('type')
      .optional()
      .isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'OPPORTUNITY_SHARE'])
      .withMessage('Tipo de mensagem inválido'),
    body('parentId')
      .optional()
      .isUUID()
      .withMessage('ID da mensagem pai deve ser um UUID válido'),
    body('attachments')
      .optional()
      .isArray()
      .withMessage('Anexos devem ser um array'),
    body('attachments.*.fileName')
      .optional()
      .isString()
      .withMessage('Nome do arquivo deve ser uma string'),
    body('attachments.*.fileUrl')
      .optional()
      .isURL()
      .withMessage('URL do arquivo deve ser válida'),
    body('attachments.*.fileType')
      .optional()
      .isString()
      .withMessage('Tipo do arquivo deve ser uma string'),
    body('attachments.*.fileSize')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Tamanho do arquivo deve ser um número inteiro positivo'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadados devem ser um objeto')
  ],
  validateRequest,
  sendMessage
);

/**
 * @route GET /api/chat/conversations/:conversationId/messages
 * @desc Obter mensagens de uma conversa
 * @access Private
 */
router.get(
  '/conversations/:conversationId/messages',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('before')
      .optional()
      .isISO8601()
      .withMessage('Data anterior deve ser válida'),
    query('after')
      .optional()
      .isISO8601()
      .withMessage('Data posterior deve ser válida')
  ],
  validateRequest,
  getConversationMessages
);

/**
 * @route PUT /api/chat/conversations/:conversationId/read
 * @desc Marcar mensagens como lidas
 * @access Private
 */
router.put(
  '/conversations/:conversationId/read',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido')
  ],
  validateRequest,
  markMessagesAsRead
);

/**
 * @route PUT /api/chat/messages/:messageId
 * @desc Editar mensagem
 * @access Private
 */
router.put(
  '/messages/:messageId',
  [
    param('messageId').isUUID().withMessage('ID da mensagem inválido'),
    body('content')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Conteúdo deve ser uma string entre 1 e 2000 caracteres')
  ],
  validateRequest,
  editMessage
);

/**
 * @route DELETE /api/chat/messages/:messageId
 * @desc Deletar mensagem
 * @access Private
 */
router.delete(
  '/messages/:messageId',
  [
    param('messageId').isUUID().withMessage('ID da mensagem inválido')
  ],
  validateRequest,
  deleteMessage
);

/**
 * @route POST /api/chat/conversations/:conversationId/participants
 * @desc Adicionar participante à conversa
 * @access Private
 */
router.post(
  '/conversations/:conversationId/participants',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido'),
    body('userId')
      .isUUID()
      .withMessage('ID do usuário deve ser um UUID válido')
  ],
  validateRequest,
  addParticipant
);

/**
 * @route DELETE /api/chat/conversations/:conversationId/participants/:userId
 * @desc Remover participante da conversa
 * @access Private
 */
router.delete(
  '/conversations/:conversationId/participants/:userId',
  [
    param('conversationId').isUUID().withMessage('ID da conversa inválido'),
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  removeParticipant
);

/**
 * @route GET /api/chat/stats/:userId
 * @desc Obter estatísticas de chat
 * @access Private
 */
router.get(
  '/stats/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getChatStats
);

module.exports = router;
