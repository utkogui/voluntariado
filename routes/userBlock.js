const express = require('express');
const { body, param, query } = require('express-validator');
const userBlockController = require('../controllers/userBlockController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Validações
const blockUserValidation = [
  body('blockedUserId')
    .isUUID()
    .withMessage('ID do usuário a ser bloqueado deve ser um UUID válido'),
  body('reason')
    .isIn(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'FRAUD', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo do bloqueio inválido'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('duration')
    .optional()
    .isIn(['1h', '1d', '1w', '1m', '1y', 'permanent'])
    .withMessage('Duração do bloqueio inválida')
];

const unblockUserValidation = [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Motivo do desbloqueio deve ter no máximo 500 caracteres')
];

const blockIdValidation = [
  param('blockId')
    .isUUID()
    .withMessage('ID do bloqueio deve ser um UUID válido')
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido')
];

const statusValidation = [
  param('status')
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status do bloqueio inválido')
];

const reasonValidation = [
  param('reason')
    .isIn(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'FRAUD', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo do bloqueio inválido')
];

const dateValidation = [
  param('startDate')
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  param('endDate')
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
  query('blockedUserId')
    .optional()
    .isUUID()
    .withMessage('ID do usuário bloqueado deve ser um UUID válido'),
  query('blockedBy')
    .optional()
    .isUUID()
    .withMessage('ID do usuário que bloqueou deve ser um UUID válido'),
  query('reason')
    .optional()
    .isIn(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'FRAUD', 'VIOLATION_OF_TERMS', 'OTHER'])
    .withMessage('Motivo do bloqueio inválido'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status do bloqueio inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'expiresAt'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de classificação deve ser asc ou desc')
];

// Rotas públicas
router.get(
  '/stats',
  queryValidation,
  userBlockController.getBlockStats
);

// Rotas autenticadas
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  blockUserValidation,
  userBlockController.blockUser
);

router.put(
  '/:blockId/unblock',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  blockIdValidation,
  unblockUserValidation,
  userBlockController.unblockUser
);

router.get(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  queryValidation,
  userBlockController.getUserBlocks
);

router.get(
  '/status/:status',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  statusValidation,
  queryValidation,
  userBlockController.getBlocksByStatus
);

router.get(
  '/reason/:reason',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  reasonValidation,
  queryValidation,
  userBlockController.getBlocksByReason
);

router.get(
  '/period/:startDate/:endDate',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  dateValidation,
  queryValidation,
  userBlockController.getBlocksByPeriod
);

router.get(
  '/user/:userId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  userIdValidation,
  queryValidation,
  userBlockController.getBlocksByUser
);

router.get(
  '/check/:userId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  userIdValidation,
  userBlockController.isUserBlocked
);

router.get(
  '/:blockId',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  blockIdValidation,
  userBlockController.getUserBlock
);

router.post(
  '/process-expired',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  userBlockController.processExpiredBlocks
);

module.exports = router;
