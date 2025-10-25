const axios = require('axios');
const config = require('../config/config');

class GeolocationService {
  constructor() {
    this.googleMapsApiKey = config.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Obter coordenadas de um endereço
   * @param {string} address - Endereço para geocodificar
   * @returns {Promise<Object>} Coordenadas e informações do endereço
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: address,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        return {
          success: true,
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          formattedAddress: result.formatted_address,
          addressComponents: this.parseAddressComponents(result.address_components),
          placeId: result.place_id,
          types: result.types
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Endereço não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter endereço a partir de coordenadas
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>} Endereço e informações da localização
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        
        return {
          success: true,
          formattedAddress: result.formatted_address,
          addressComponents: this.parseAddressComponents(result.address_components),
          placeId: result.place_id,
          types: result.types
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Localização não encontrada'
        };
      }
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Calcular distância entre duas coordenadas
   * @param {Object} point1 - Primeira coordenada {latitude, longitude}
   * @param {Object} point2 - Segunda coordenada {latitude, longitude}
   * @returns {Object} Distância em metros e quilômetros
   */
  calculateDistance(point1, point2) {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // Distância em metros

    return {
      meters: Math.round(distance),
      kilometers: Math.round(distance / 1000 * 100) / 100
    };
  }

  /**
   * Buscar lugares próximos
   * @param {number} latitude - Latitude central
   * @param {number} longitude - Longitude central
   * @param {number} radius - Raio em metros
   * @param {string} type - Tipo de lugar (opcional)
   * @returns {Promise<Object>} Lista de lugares próximos
   */
  async findNearbyPlaces(latitude, longitude, radius = 5000, type = null) {
    try {
      const params = {
        location: `${latitude},${longitude}`,
        radius: radius,
        key: this.googleMapsApiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params
      });

      if (response.data.status === 'OK') {
        return {
          success: true,
          places: response.data.results.map(place => ({
            placeId: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            rating: place.rating,
            priceLevel: place.price_level,
            types: place.types,
            geometry: place.geometry,
            photos: place.photos
          }))
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Nenhum lugar encontrado'
        };
      }
    } catch (error) {
      console.error('Erro na busca de lugares próximos:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter direções entre dois pontos
   * @param {Object} origin - Ponto de origem {latitude, longitude}
   * @param {Object} destination - Ponto de destino {latitude, longitude}
   * @param {string} mode - Modo de transporte (driving, walking, bicycling, transit)
   * @returns {Promise<Object>} Direções e informações da rota
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode: mode,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        return {
          success: true,
          distance: {
            text: leg.distance.text,
            value: leg.distance.value
          },
          duration: {
            text: leg.duration.text,
            value: leg.duration.value
          },
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance,
            duration: step.duration,
            startLocation: step.start_location,
            endLocation: step.end_location
          })),
          overviewPolyline: route.overview_polyline.points
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Rota não encontrada'
        };
      }
    } catch (error) {
      console.error('Erro ao obter direções:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Validar endereço
   * @param {string} address - Endereço para validar
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateAddress(address) {
    try {
      const geocodeResult = await this.geocodeAddress(address);
      
      if (geocodeResult.success) {
        return {
          valid: true,
          confidence: this.calculateAddressConfidence(geocodeResult),
          suggestions: await this.getAddressSuggestions(address)
        };
      } else {
        return {
          valid: false,
          error: geocodeResult.error,
          suggestions: await this.getAddressSuggestions(address)
        };
      }
    } catch (error) {
      console.error('Erro na validação de endereço:', error);
      return {
        valid: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obter sugestões de endereço
   * @param {string} input - Texto de entrada
   * @returns {Promise<Array>} Lista de sugestões
   */
  async getAddressSuggestions(input) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, {
        params: {
          input: input,
          key: this.googleMapsApiKey,
          types: 'address'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.predictions.map(prediction => ({
          description: prediction.description,
          placeId: prediction.place_id,
          types: prediction.types
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erro ao obter sugestões de endereço:', error);
      return [];
    }
  }

  /**
   * Obter informações detalhadas de um lugar
   * @param {string} placeId - ID do lugar
   * @returns {Promise<Object>} Informações detalhadas do lugar
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,formatted_phone_number,website,rating,reviews,photos,opening_hours,types',
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        const result = response.data.result;
        return {
          success: true,
          place: {
            name: result.name,
            formattedAddress: result.formatted_address,
            geometry: result.geometry,
            phoneNumber: result.formatted_phone_number,
            website: result.website,
            rating: result.rating,
            reviews: result.reviews,
            photos: result.photos,
            openingHours: result.opening_hours,
            types: result.types
          }
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Lugar não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro ao obter detalhes do lugar:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Parsear componentes do endereço
   * @param {Array} components - Componentes do endereço
   * @returns {Object} Componentes parseados
   */
  parseAddressComponents(components) {
    const parsed = {};
    
    components.forEach(component => {
      const types = component.types;
      const longName = component.long_name;
      const shortName = component.short_name;
      
      if (types.includes('street_number')) {
        parsed.streetNumber = longName;
      } else if (types.includes('route')) {
        parsed.route = longName;
      } else if (types.includes('locality')) {
        parsed.city = longName;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = longName;
        parsed.stateCode = shortName;
      } else if (types.includes('country')) {
        parsed.country = longName;
        parsed.countryCode = shortName;
      } else if (types.includes('postal_code')) {
        parsed.postalCode = longName;
      } else if (types.includes('neighborhood')) {
        parsed.neighborhood = longName;
      }
    });
    
    return parsed;
  }

  /**
   * Calcular confiança do endereço
   * @param {Object} geocodeResult - Resultado da geocodificação
   * @returns {number} Nível de confiança (0-1)
   */
  calculateAddressConfidence(geocodeResult) {
    let confidence = 0.5; // Base
    
    // Aumentar confiança baseado nos tipos
    if (geocodeResult.types.includes('street_address')) {
      confidence += 0.3;
    } else if (geocodeResult.types.includes('route')) {
      confidence += 0.2;
    }
    
    // Aumentar confiança se tem componentes específicos
    if (geocodeResult.addressComponents.streetNumber) {
      confidence += 0.1;
    }
    if (geocodeResult.addressComponents.city) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1);
  }

  /**
   * Obter timezone de uma localização
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>} Informações do timezone
   */
  async getTimezone(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/timezone/json`, {
        params: {
          location: `${latitude},${longitude}`,
          timestamp: Math.floor(Date.now() / 1000),
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        return {
          success: true,
          timezoneId: response.data.timeZoneId,
          timezoneName: response.data.timeZoneName,
          rawOffset: response.data.rawOffset,
          dstOffset: response.data.dstOffset
        };
      } else {
        return {
          success: false,
          error: response.data.error_message || 'Timezone não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro ao obter timezone:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new GeolocationService();
