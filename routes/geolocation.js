const express = require('express');
const router = express.Router();
const geolocationController = require('../controllers/geolocationController');
const auth = require('../middleware/auth');
const { body, query, param } = require('express-validator');

// Middleware de validação
const validateGeocode = [
  body('address')
    .notEmpty()
    .withMessage('Endereço é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Endereço deve ter entre 3 e 200 caracteres')
];

const validateReverseGeocode = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180')
];

const validateDistance = [
  body('point1.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude do ponto 1 deve ser um número entre -90 e 90'),
  body('point1.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude do ponto 1 deve ser um número entre -180 e 180'),
  body('point2.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude do ponto 2 deve ser um número entre -90 e 90'),
  body('point2.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude do ponto 2 deve ser um número entre -180 e 180')
];

const validateDirections = [
  body('origin.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude de origem deve ser um número entre -90 e 90'),
  body('origin.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude de origem deve ser um número entre -180 e 180'),
  body('destination.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude de destino deve ser um número entre -90 e 90'),
  body('destination.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude de destino deve ser um número entre -180 e 180'),
  body('mode')
    .optional()
    .isIn(['driving', 'walking', 'bicycling', 'transit'])
    .withMessage('Modo de transporte deve ser: driving, walking, bicycling ou transit')
];

const validateAddress = [
  body('address')
    .notEmpty()
    .withMessage('Endereço é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Endereço deve ter entre 3 e 200 caracteres')
];

const validateNearbyPlaces = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage('Raio deve ser um número entre 1 e 50000 metros'),
  query('type')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tipo deve ter entre 1 e 50 caracteres')
];

const validateAddressSuggestions = [
  query('input')
    .notEmpty()
    .withMessage('Input é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Input deve ter entre 2 e 100 caracteres')
];

const validatePlaceId = [
  param('placeId')
    .notEmpty()
    .withMessage('Place ID é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Place ID deve ter entre 1 e 100 caracteres')
];

const validateTimezone = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180')
];

const validateNearbyOpportunities = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180'),
  query('radius')
    .optional()
    .isInt({ min: 1000, max: 100000 })
    .withMessage('Raio deve ser um número entre 1000 e 100000 metros'),
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Categoria deve ter entre 1 e 50 caracteres')
];

const validateLocationStats = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180'),
  query('radius')
    .optional()
    .isInt({ min: 1000, max: 50000 })
    .withMessage('Raio deve ser um número entre 1000 e 50000 metros')
];

// Rotas públicas
router.post('/geocode', validateGeocode, geolocationController.geocodeAddress);
router.post('/reverse-geocode', validateReverseGeocode, geolocationController.reverseGeocode);
router.post('/distance', validateDistance, geolocationController.calculateDistance);
router.get('/nearby-places', validateNearbyPlaces, geolocationController.findNearbyPlaces);
router.post('/directions', validateDirections, geolocationController.getDirections);
router.post('/validate-address', validateAddress, geolocationController.validateAddress);
router.get('/address-suggestions', validateAddressSuggestions, geolocationController.getAddressSuggestions);
router.get('/place-details/:placeId', validatePlaceId, geolocationController.getPlaceDetails);
router.get('/timezone', validateTimezone, geolocationController.getTimezone);

// Rotas protegidas
router.get('/nearby-opportunities', auth, validateNearbyOpportunities, geolocationController.findNearbyOpportunities);
router.get('/location-stats', auth, validateLocationStats, geolocationController.getLocationStats);

module.exports = router;
