const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createActivity,
  getActivity,
  getUserActivities,
  registerUser,
  unregisterUser,
  confirmAttendance,
  updateActivityStatus,
  getActivityStats,
  getUpcomingActivities,
  getActivitiesByOpportunity
} = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/activities
 * @desc Criar nova atividade
 * @access Private
 */
router.post(
  '/',
  [
    body('title')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Título deve ser uma string entre 1 e 255 caracteres'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Descrição deve ser uma string com no máximo 2000 caracteres'),
    body('type')
      .isIn(['VOLUNTEER_WORK', 'TRAINING', 'MEETING', 'EVENT', 'WORKSHOP', 'ORIENTATION', 'CLEANUP', 'FUNDRAISING', 'AWARENESS', 'OTHER'])
      .withMessage('Tipo de atividade inválido'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Número máximo de participantes deve ser um número inteiro positivo'),
    body('isRecurring')
      .optional()
      .isBoolean()
      .withMessage('isRecurring deve ser um valor booleano'),
    body('recurrenceRule')
      .optional()
      .isString()
      .withMessage('Regra de recorrência deve ser uma string'),
    body('address')
      .optional()
      .isString()
      .withMessage('Endereço deve ser uma string'),
    body('city')
      .optional()
      .isString()
      .withMessage('Cidade deve ser uma string'),
    body('state')
      .optional()
      .isString()
      .withMessage('Estado deve ser uma string'),
    body('zipCode')
      .optional()
      .isString()
      .withMessage('CEP deve ser uma string'),
    body('country')
      .optional()
      .isString()
      .withMessage('País deve ser uma string'),
    body('latitude')
      .optional()
      .isFloat()
      .withMessage('Latitude deve ser um número'),
    body('longitude')
      .optional()
      .isFloat()
      .withMessage('Longitude deve ser um número'),
    body('isOnline')
      .optional()
      .isBoolean()
      .withMessage('isOnline deve ser um valor booleano'),
    body('meetingUrl')
      .optional()
      .isURL()
      .withMessage('URL da reunião deve ser válida'),
    body('startDate')
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    body('endDate')
      .isISO8601()
      .withMessage('Data de fim deve ser válida'),
    body('timezone')
      .optional()
      .isString()
      .withMessage('Fuso horário deve ser uma string'),
    body('opportunityId')
      .optional()
      .isUUID()
      .withMessage('ID da oportunidade deve ser um UUID válido'),
    body('materials')
      .optional()
      .isArray()
      .withMessage('Materiais devem ser um array'),
    body('materials.*.name')
      .optional()
      .isString()
      .withMessage('Nome do material deve ser uma string'),
    body('materials.*.quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantidade deve ser um número inteiro positivo'),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requisitos devem ser um array'),
    body('requirements.*.title')
      .optional()
      .isString()
      .withMessage('Título do requisito deve ser uma string'),
    body('requirements.*.requirementType')
      .optional()
      .isIn(['AGE', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'LANGUAGE', 'AVAILABILITY', 'LOCATION', 'DOCUMENT', 'BACKGROUND_CHECK', 'CUSTOM'])
      .withMessage('Tipo de requisito inválido')
  ],
  validateRequest,
  createActivity
);

/**
 * @route GET /api/activities/:activityId
 * @desc Obter atividade por ID
 * @access Private
 */
router.get(
  '/:activityId',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  getActivity
);

/**
 * @route GET /api/activities/user/:userId
 * @desc Obter atividades do usuário
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
    query('type')
      .optional()
      .isIn(['VOLUNTEER_WORK', 'TRAINING', 'MEETING', 'EVENT', 'WORKSHOP', 'ORIENTATION', 'CLEANUP', 'FUNDRAISING', 'AWARENESS', 'OTHER'])
      .withMessage('Tipo de atividade inválido'),
    query('status')
      .optional()
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido'),
    query('fromDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida'),
    query('role')
      .optional()
      .isIn(['all', 'created', 'participating'])
      .withMessage('Papel deve ser all, created ou participating')
  ],
  validateRequest,
  getUserActivities
);

/**
 * @route POST /api/activities/:activityId/register
 * @desc Inscrever usuário em atividade
 * @access Private
 */
router.post(
  '/:activityId/register',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('role')
      .optional()
      .isIn(['ORGANIZER', 'COORDINATOR', 'FACILITATOR', 'PARTICIPANT', 'OBSERVER'])
      .withMessage('Papel deve ser ORGANIZER, COORDINATOR, FACILITATOR, PARTICIPANT ou OBSERVER')
  ],
  validateRequest,
  registerUser
);

/**
 * @route DELETE /api/activities/:activityId/register
 * @desc Cancelar inscrição em atividade
 * @access Private
 */
router.delete(
  '/:activityId/register',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido')
  ],
  validateRequest,
  unregisterUser
);

/**
 * @route POST /api/activities/:activityId/confirm
 * @desc Confirmar presença em atividade
 * @access Private
 */
router.post(
  '/:activityId/confirm',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('status')
      .isIn(['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'])
      .withMessage('Status deve ser PENDING, CONFIRMED, DECLINED ou MAYBE'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observações devem ter no máximo 500 caracteres')
  ],
  validateRequest,
  confirmAttendance
);

/**
 * @route PUT /api/activities/:activityId/status
 * @desc Atualizar status da atividade
 * @access Private
 */
router.put(
  '/:activityId/status',
  [
    param('activityId').isUUID().withMessage('ID da atividade inválido'),
    body('status')
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status deve ser DRAFT, SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED ou POSTPONED')
  ],
  validateRequest,
  updateActivityStatus
);

/**
 * @route GET /api/activities/stats/:userId
 * @desc Obter estatísticas de atividades
 * @access Private
 */
router.get(
  '/stats/:userId',
  [
    param('userId').isUUID().withMessage('ID do usuário inválido')
  ],
  validateRequest,
  getActivityStats
);

/**
 * @route GET /api/activities/upcoming
 * @desc Buscar atividades próximas
 * @access Private
 */
router.get(
  '/upcoming',
  [
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
      .isIn(['VOLUNTEER_WORK', 'TRAINING', 'MEETING', 'EVENT', 'WORKSHOP', 'ORIENTATION', 'CLEANUP', 'FUNDRAISING', 'AWARENESS', 'OTHER'])
      .withMessage('Tipo de atividade inválido'),
    query('city')
      .optional()
      .isString()
      .withMessage('Cidade deve ser uma string'),
    query('radius')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Raio deve ser um número entre 1 e 500'),
    query('fromDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início deve ser válida'),
    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('Data de fim deve ser válida')
  ],
  validateRequest,
  getUpcomingActivities
);

/**
 * @route GET /api/activities/opportunity/:opportunityId
 * @desc Buscar atividades por oportunidade
 * @access Private
 */
router.get(
  '/opportunity/:opportunityId',
  [
    param('opportunityId').isUUID().withMessage('ID da oportunidade inválido'),
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
      .isIn(['DRAFT', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
      .withMessage('Status da atividade inválido')
  ],
  validateRequest,
  getActivitiesByOpportunity
);

module.exports = router;
