const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');
const { catchAsync } = require('../middleware/errorHandler');
const { authLimiter, registerLimiter } = require('../middleware/security');
const Joi = require('joi');

// Schemas específicos para cada tipo de cadastro
const volunteerRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().length(2).optional(),
  skills: Joi.array().items(Joi.string().min(2).max(50)).optional(),
  volunteerTypes: Joi.array().items(Joi.string().valid('PRESENTIAL', 'ONLINE', 'HYBRID')).optional()
});

const institutionRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().min(10).max(200).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().length(2).required(),
  zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).required(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  website: Joi.string().uri().optional()
});

const companyRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().min(10).max(200).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().length(2).required(),
  zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).required(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  website: Joi.string().uri().optional(),
  companySize: Joi.string().valid('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE').optional(),
  industry: Joi.string().max(100).optional()
});

const universityRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().min(10).max(200).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().length(2).required(),
  zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  website: Joi.string().uri().optional(),
  universityType: Joi.string().valid('PUBLIC', 'PRIVATE').optional(),
  accreditation: Joi.string().max(100).optional()
});

// Rotas de autenticação
router.post('/register', registerLimiter, validate(authSchemas.register), catchAsync(authController.register));
router.post('/register/volunteer', registerLimiter, validate(volunteerRegisterSchema), catchAsync(authController.registerVolunteer));
router.post('/register/institution', registerLimiter, validate(institutionRegisterSchema), catchAsync(authController.registerInstitution));
router.post('/register/company', registerLimiter, validate(companyRegisterSchema), catchAsync(authController.registerCompany));
router.post('/register/university', registerLimiter, validate(universityRegisterSchema), catchAsync(authController.registerUniversity));
router.post('/login', authLimiter, validate(authSchemas.login), catchAsync(authController.login));
router.post('/logout', authenticate, catchAsync(authController.logout));
router.post('/refresh', authLimiter, validate(authSchemas.refreshToken), catchAsync(authController.refreshToken));
router.get('/verify', authenticate, catchAsync(authController.verifyToken));

module.exports = router;
