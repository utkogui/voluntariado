const express = require('express');
const { body, param, query } = require('express-validator');
const {
  findHybridMatches,
  findHybridVolunteersForOpportunity,
  getMatchingStatsByType,
  findMatchesByLocationPreference,
  getHybridMatchingReport,
  optimizeHybridMatching,
  getHybridMatchingInsights
} = require('../controllers/hybridMatchingController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/hybrid-matching/volunteer/:volunteerId
 * @desc Encontrar matches híbridos para um voluntário
 * @access Private
 */
router.get(
  '/volunteer/:volunteerId',
  [
    param('volunteerId').isUUID().withMessage('ID do voluntário inválido'),
    query('volunteerTypes')
      .optional()
      .isArray()
      .withMessage('Tipos de voluntariado devem ser um array'),
    query('maxDistance')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Distância máxima deve ser entre 1 e 500 km'),
    query('minScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Pontuação mínima deve ser entre 0 e 100'),
    query('categories')
      .optional()
      .isArray()
      .withMessage('Categorias devem ser um array'),
    query('skills')
      .optional()
      .isArray()
      .withMessage('Habilidades devem ser um array'),
    query('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    query('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres'),
    query('isRemote')
      .optional()
      .isBoolean()
      .withMessage('isRemote deve ser um valor booleano')
  ],
  validateRequest,
  findHybridMatches
);

/**
 * @route GET /api/hybrid-matching/opportunity/:opportunityId
 * @desc Encontrar voluntários híbridos para uma oportunidade
 * @access Private
 */
router.get(
  '/opportunity/:opportunityId',
  [
    param('opportunityId').isUUID().withMessage('ID da oportunidade inválido'),
    query('minScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Pontuação mínima deve ser entre 0 e 100'),
    query('maxDistance')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Distância máxima deve ser entre 1 e 500 km'),
    query('skills')
      .optional()
      .isArray()
      .withMessage('Habilidades devem ser um array'),
    query('categories')
      .optional()
      .isArray()
      .withMessage('Categorias devem ser um array'),
    query('volunteerTypes')
      .optional()
      .isArray()
      .withMessage('Tipos de voluntariado devem ser um array')
  ],
  validateRequest,
  findHybridVolunteersForOpportunity
);

/**
 * @route GET /api/hybrid-matching/stats
 * @desc Obter estatísticas de matching por tipo
 * @access Private
 */
router.get(
  '/stats',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida'),
    query('volunteerType')
      .optional()
      .isIn(['PRESENTIAL', 'ONLINE', 'HYBRID'])
      .withMessage('Tipo de voluntariado inválido'),
    query('category')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Categoria deve ter no máximo 50 caracteres'),
    query('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    query('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres')
  ],
  validateRequest,
  getMatchingStatsByType
);

/**
 * @route POST /api/hybrid-matching/location-preference/:volunteerId
 * @desc Encontrar matches por preferência de localização
 * @access Private
 */
router.post(
  '/location-preference/:volunteerId',
  [
    param('volunteerId').isUUID().withMessage('ID do voluntário inválido'),
    body('maxDistance')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Distância máxima deve ser entre 1 e 500 km'),
    body('preferredCities')
      .optional()
      .isArray()
      .withMessage('Cidades preferidas devem ser um array'),
    body('preferredStates')
      .optional()
      .isArray()
      .withMessage('Estados preferidos devem ser um array'),
    body('allowRemote')
      .optional()
      .isBoolean()
      .withMessage('allowRemote deve ser um valor booleano'),
    body('minScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Pontuação mínima deve ser entre 0 e 100')
  ],
  validateRequest,
  findMatchesByLocationPreference
);

/**
 * @route GET /api/hybrid-matching/report
 * @desc Obter relatório de matching híbrido
 * @access Private
 */
router.get(
  '/report',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida'),
    query('volunteerType')
      .optional()
      .isIn(['PRESENTIAL', 'ONLINE', 'HYBRID'])
      .withMessage('Tipo de voluntariado inválido'),
    query('category')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Categoria deve ter no máximo 50 caracteres'),
    query('city')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Cidade deve ter no máximo 50 caracteres'),
    query('state')
      .optional()
      .isLength({ max: 2 })
      .withMessage('Estado deve ter no máximo 2 caracteres'),
    query('format')
      .optional()
      .isIn(['json', 'csv', 'pdf'])
      .withMessage('Formato deve ser json, csv ou pdf')
  ],
  validateRequest,
  getHybridMatchingReport
);

/**
 * @route POST /api/hybrid-matching/optimize/:volunteerId
 * @desc Otimizar matching híbrido
 * @access Private
 */
router.post(
  '/optimize/:volunteerId',
  [
    param('volunteerId').isUUID().withMessage('ID do voluntário inválido'),
    body('preferredTypes')
      .optional()
      .isArray()
      .withMessage('Tipos preferidos devem ser um array'),
    body('maxDistance')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Distância máxima deve ser entre 1 e 500 km'),
    body('minScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Pontuação mínima deve ser entre 0 e 100'),
    body('categories')
      .optional()
      .isArray()
      .withMessage('Categorias devem ser um array'),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Habilidades devem ser um array')
  ],
  validateRequest,
  optimizeHybridMatching
);

/**
 * @route GET /api/hybrid-matching/insights
 * @desc Obter insights de matching híbrido
 * @access Private
 */
router.get(
  '/insights',
  [
    query('volunteerId')
      .optional()
      .isUUID()
      .withMessage('ID do voluntário inválido'),
    query('opportunityId')
      .optional()
      .isUUID()
      .withMessage('ID da oportunidade inválido'),
    query('timeRange')
      .optional()
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Período deve ser 7d, 30d, 90d ou 1y')
  ],
  validateRequest,
  getHybridMatchingInsights
);

module.exports = router;
