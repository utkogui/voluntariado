const geolocationService = require('../services/geolocationService');
const { validationResult } = require('express-validator');

class GeolocationController {
  /**
   * Geocodificar endereço
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async geocodeAddress(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { address } = req.body;

      const result = await geolocationService.geocodeAddress(address);

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de geocodificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Geocodificação reversa
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reverseGeocode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { latitude, longitude } = req.body;

      const result = await geolocationService.reverseGeocode(latitude, longitude);

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de geocodificação reversa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcular distância entre dois pontos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async calculateDistance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { point1, point2 } = req.body;

      const distance = geolocationService.calculateDistance(point1, point2);

      res.json({
        success: true,
        data: distance
      });
    } catch (error) {
      console.error('Erro no controlador de cálculo de distância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar lugares próximos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async findNearbyPlaces(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { latitude, longitude, radius, type } = req.query;

      const result = await geolocationService.findNearbyPlaces(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 5000,
        type
      );

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de lugares próximos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter direções entre dois pontos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDirections(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { origin, destination, mode } = req.body;

      const result = await geolocationService.getDirections(origin, destination, mode);

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de direções:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Validar endereço
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async validateAddress(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { address } = req.body;

      const result = await geolocationService.validateAddress(address);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro no controlador de validação de endereço:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter sugestões de endereço
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAddressSuggestions(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { input } = req.query;

      const suggestions = await geolocationService.getAddressSuggestions(input);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Erro no controlador de sugestões de endereço:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter detalhes de um lugar
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPlaceDetails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { placeId } = req.params;

      const result = await geolocationService.getPlaceDetails(placeId);

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de detalhes do lugar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter timezone de uma localização
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getTimezone(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { latitude, longitude } = req.query;

      const result = await geolocationService.getTimezone(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      if (result.success) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erro no controlador de timezone:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar oportunidades próximas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async findNearbyOpportunities(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { latitude, longitude, radius, category } = req.query;
      const userId = req.user.id;

      // Buscar oportunidades próximas usando o serviço de matching
      const matchingService = require('../services/matchingService');
      const opportunities = await matchingService.findNearbyOpportunities(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 10000,
        category,
        userId
      );

      res.json({
        success: true,
        data: opportunities
      });
    } catch (error) {
      console.error('Erro no controlador de oportunidades próximas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de localização
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLocationStats(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;

      // Buscar estatísticas da área
      const nearbyPlaces = await geolocationService.findNearbyPlaces(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 5000
      );

      // Buscar oportunidades na área
      const matchingService = require('../services/matchingService');
      const opportunities = await matchingService.findNearbyOpportunities(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius) || 10000
      );

      const stats = {
        nearbyPlaces: nearbyPlaces.success ? nearbyPlaces.places.length : 0,
        opportunities: opportunities.length,
        radius: parseInt(radius) || 5000
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro no controlador de estatísticas de localização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new GeolocationController();
