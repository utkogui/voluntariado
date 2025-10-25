const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createRequirement,
  getRequirementsByOpportunity,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  validateVolunteerRequirements
} = require('../controllers/opportunityRequirementsController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/opportunity-requirements/:opportunityId
 * @desc Criar um novo requisito para uma oportunidade
 * @access Private (Institution, Company, University)
 */
router.post(
  '/:opportunityId',
  [
    param('opportunityId').isUUID().withMessage('ID da oportunidade inválido'),
    body('title')
      .notEmpty()
      .withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('requirementType')
      .isIn(['AGE', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'LANGUAGE', 'AVAILABILITY', 'LOCATION', 'DOCUMENT', 'BACKGROUND_CHECK', 'CUSTOM'])
      .withMessage('Tipo de requisito inválido'),
    body('isRequired')
      .optional()
      .isBoolean()
      .withMessage('isRequired deve ser um valor booleano'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Prioridade inválida'),
    body('minValue')
      .optional()
      .isNumeric()
      .withMessage('Valor mínimo deve ser numérico'),
    body('maxValue')
      .optional()
      .isNumeric()
      .withMessage('Valor máximo deve ser numérico'),
    body('allowedValues')
      .optional()
      .isArray()
      .withMessage('Valores permitidos devem ser um array'),
    body('validationRules')
      .optional()
      .isObject()
      .withMessage('Regras de validação devem ser um objeto')
  ],
  validateRequest,
  createRequirement
);

/**
 * @route GET /api/opportunity-requirements/opportunity/:opportunityId
 * @desc Listar todos os requisitos de uma oportunidade
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
    query('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Prioridade inválida'),
    query('requirementType')
      .optional()
      .isIn(['AGE', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'LANGUAGE', 'AVAILABILITY', 'LOCATION', 'DOCUMENT', 'BACKGROUND_CHECK', 'CUSTOM'])
      .withMessage('Tipo de requisito inválido')
  ],
  validateRequest,
  getRequirementsByOpportunity
);

/**
 * @route GET /api/opportunity-requirements/:requirementId
 * @desc Obter um requisito específico
 * @access Private
 */
router.get(
  '/:requirementId',
  [
    param('requirementId').isUUID().withMessage('ID do requisito inválido')
  ],
  validateRequest,
  getRequirementById
);

/**
 * @route PUT /api/opportunity-requirements/:requirementId
 * @desc Atualizar um requisito
 * @access Private (Institution, Company, University)
 */
router.put(
  '/:requirementId',
  [
    param('requirementId').isUUID().withMessage('ID do requisito inválido'),
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('requirementType')
      .optional()
      .isIn(['AGE', 'EXPERIENCE', 'EDUCATION', 'SKILL', 'LANGUAGE', 'AVAILABILITY', 'LOCATION', 'DOCUMENT', 'BACKGROUND_CHECK', 'CUSTOM'])
      .withMessage('Tipo de requisito inválido'),
    body('isRequired')
      .optional()
      .isBoolean()
      .withMessage('isRequired deve ser um valor booleano'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
      .withMessage('Prioridade inválida'),
    body('minValue')
      .optional()
      .isNumeric()
      .withMessage('Valor mínimo deve ser numérico'),
    body('maxValue')
      .optional()
      .isNumeric()
      .withMessage('Valor máximo deve ser numérico'),
    body('allowedValues')
      .optional()
      .isArray()
      .withMessage('Valores permitidos devem ser um array'),
    body('validationRules')
      .optional()
      .isObject()
      .withMessage('Regras de validação devem ser um objeto')
  ],
  validateRequest,
  updateRequirement
);

/**
 * @route DELETE /api/opportunity-requirements/:requirementId
 * @desc Deletar um requisito
 * @access Private (Institution, Company, University)
 */
router.delete(
  '/:requirementId',
  [
    param('requirementId').isUUID().withMessage('ID do requisito inválido')
  ],
  validateRequest,
  deleteRequirement
);

/**
 * @route POST /api/opportunity-requirements/validate/:opportunityId/:volunteerId
 * @desc Validar se um voluntário atende aos requisitos de uma oportunidade
 * @access Private
 */
router.post(
  '/validate/:opportunityId/:volunteerId',
  [
    param('opportunityId').isUUID().withMessage('ID da oportunidade inválido'),
    param('volunteerId').isUUID().withMessage('ID do voluntário inválido')
  ],
  validateRequest,
  validateVolunteerRequirements
);

module.exports = router;