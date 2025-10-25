const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  reserveDonation,
  confirmCollection,
  cancelReservation,
  getUserDonations
} = require('../controllers/donationController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/donations
 * @desc Criar uma nova doação
 * @access Private
 */
router.post(
  '/',
  [
    body('title')
      .notEmpty()
      .withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('category')
      .isIn(['FOOD', 'CLOTHING', 'BOOKS', 'TOYS', 'MEDICINE', 'EQUIPMENT', 'FURNITURE', 'ELECTRONICS', 'HYGIENE', 'SCHOOL_SUPPLIES', 'OTHER'])
      .withMessage('Categoria inválida'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Prioridade inválida'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantidade deve ser um número inteiro maior que 0'),
    body('unit')
      .notEmpty()
      .withMessage('Unidade é obrigatória')
      .isLength({ max: 20 })
      .withMessage('Unidade deve ter no máximo 20 caracteres'),
    body('condition')
      .optional()
      .isIn(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'])
      .withMessage('Condição inválida'),
    body('estimatedValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor estimado deve ser um número positivo'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Imagens devem ser um array'),
    body('address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Endereço deve ter no máximo 200 caracteres'),
    body('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    body('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres'),
    body('zipCode')
      .optional()
      .isLength({ max: 10 })
      .withMessage('CEP deve ter no máximo 10 caracteres'),
    body('country')
      .optional()
      .isLength({ max: 50 })
      .withMessage('País deve ter no máximo 50 caracteres'),
    body('latitude')
      .optional()
      .isFloat()
      .withMessage('Latitude deve ser um número'),
    body('longitude')
      .optional()
      .isFloat()
      .withMessage('Longitude deve ser um número'),
    body('isPickup')
      .optional()
      .isBoolean()
      .withMessage('isPickup deve ser um valor booleano'),
    body('availableFrom')
      .optional()
      .isISO8601()
      .withMessage('Data de disponibilidade deve ser válida'),
    body('availableUntil')
      .optional()
      .isISO8601()
      .withMessage('Data de expiração deve ser válida'),
    body('opportunityId')
      .optional()
      .isUUID()
      .withMessage('ID da oportunidade deve ser válido')
  ],
  validateRequest,
  createDonation
);

/**
 * @route GET /api/donations
 * @desc Listar doações com filtros
 * @access Private
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100'),
    query('category')
      .optional()
      .isIn(['FOOD', 'CLOTHING', 'BOOKS', 'TOYS', 'MEDICINE', 'EQUIPMENT', 'FURNITURE', 'ELECTRONICS', 'HYGIENE', 'SCHOOL_SUPPLIES', 'OTHER'])
      .withMessage('Categoria inválida'),
    query('status')
      .optional()
      .isIn(['PENDING', 'AVAILABLE', 'RESERVED', 'COLLECTED', 'CANCELLED', 'EXPIRED'])
      .withMessage('Status inválido'),
    query('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Prioridade inválida'),
    query('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    query('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres'),
    query('isPickup')
      .optional()
      .isBoolean()
      .withMessage('isPickup deve ser um valor booleano'),
    query('minValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor mínimo deve ser um número positivo'),
    query('maxValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor máximo deve ser um número positivo'),
    query('search')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Busca deve ter no máximo 100 caracteres')
  ],
  validateRequest,
  getDonations
);

/**
 * @route GET /api/donations/:donationId
 * @desc Obter uma doação específica
 * @access Private
 */
router.get(
  '/:donationId',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido')
  ],
  validateRequest,
  getDonationById
);

/**
 * @route PUT /api/donations/:donationId
 * @desc Atualizar uma doação
 * @access Private
 */
router.put(
  '/:donationId',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido'),
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('category')
      .optional()
      .isIn(['FOOD', 'CLOTHING', 'BOOKS', 'TOYS', 'MEDICINE', 'EQUIPMENT', 'FURNITURE', 'ELECTRONICS', 'HYGIENE', 'SCHOOL_SUPPLIES', 'OTHER'])
      .withMessage('Categoria inválida'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Prioridade inválida'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantidade deve ser um número inteiro maior que 0'),
    body('unit')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Unidade deve ter no máximo 20 caracteres'),
    body('condition')
      .optional()
      .isIn(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'])
      .withMessage('Condição inválida'),
    body('estimatedValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Valor estimado deve ser um número positivo'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Imagens devem ser um array'),
    body('address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Endereço deve ter no máximo 200 caracteres'),
    body('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    body('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres'),
    body('zipCode')
      .optional()
      .isLength({ max: 10 })
      .withMessage('CEP deve ter no máximo 10 caracteres'),
    body('country')
      .optional()
      .isLength({ max: 50 })
      .withMessage('País deve ter no máximo 50 caracteres'),
    body('latitude')
      .optional()
      .isFloat()
      .withMessage('Latitude deve ser um número'),
    body('longitude')
      .optional()
      .isFloat()
      .withMessage('Longitude deve ser um número'),
    body('isPickup')
      .optional()
      .isBoolean()
      .withMessage('isPickup deve ser um valor booleano'),
    body('availableFrom')
      .optional()
      .isISO8601()
      .withMessage('Data de disponibilidade deve ser válida'),
    body('availableUntil')
      .optional()
      .isISO8601()
      .withMessage('Data de expiração deve ser válida')
  ],
  validateRequest,
  updateDonation
);

/**
 * @route DELETE /api/donations/:donationId
 * @desc Deletar uma doação
 * @access Private
 */
router.delete(
  '/:donationId',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido')
  ],
  validateRequest,
  deleteDonation
);

/**
 * @route POST /api/donations/:donationId/reserve
 * @desc Reservar uma doação
 * @access Private
 */
router.post(
  '/:donationId/reserve',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido')
  ],
  validateRequest,
  reserveDonation
);

/**
 * @route POST /api/donations/:donationId/confirm-collection
 * @desc Confirmar coleta de uma doação
 * @access Private
 */
router.post(
  '/:donationId/confirm-collection',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido')
  ],
  validateRequest,
  confirmCollection
);

/**
 * @route POST /api/donations/:donationId/cancel-reservation
 * @desc Cancelar reserva de uma doação
 * @access Private
 */
router.post(
  '/:donationId/cancel-reservation',
  [
    param('donationId').isUUID().withMessage('ID da doação inválido')
  ],
  validateRequest,
  cancelReservation
);

/**
 * @route GET /api/donations/user/:userId
 * @desc Obter doações do usuário
 * @access Private
 */
router.get(
  '/user/:userId',
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
    query('status')
      .optional()
      .isIn(['PENDING', 'AVAILABLE', 'RESERVED', 'COLLECTED', 'CANCELLED', 'EXPIRED'])
      .withMessage('Status inválido')
  ],
  validateRequest,
  getUserDonations
);

module.exports = router;
