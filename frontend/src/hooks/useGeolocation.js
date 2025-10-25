import { useState, useEffect, useCallback } from 'react';
import geolocationService from '../services/geolocationService';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState('prompt');

  // Verificar suporte do navegador
  const isSupported = 'geolocation' in navigator;

  // Obter localização atual
  const getCurrentPosition = useCallback(async (options = {}) => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return null;
    }

    setIsLoading(true);
    setError(null);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutos
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, finalOptions);
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(newLocation);
      setPermission('granted');
      return newLocation;
    } catch (err) {
      let errorMessage = 'Erro ao obter localização';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permissão de localização negada';
          setPermission('denied');
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível';
          break;
        case err.TIMEOUT:
          errorMessage = 'Timeout ao obter localização';
          break;
        default:
          errorMessage = 'Erro desconhecido ao obter localização';
          break;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Observar mudanças de localização
  const watchPosition = useCallback((options = {}) => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(newLocation);
        },
        (err) => {
          let errorMessage = 'Erro ao observar localização';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              setPermission('denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case err.TIMEOUT:
              errorMessage = 'Timeout ao obter localização';
              break;
            default:
              errorMessage = 'Erro desconhecido ao obter localização';
              break;
          }
          setError(errorMessage);
        },
        finalOptions
      );

      return watchId;
    } catch (err) {
      setError('Erro ao iniciar observação de localização');
      return null;
    }
  }, [isSupported]);

  // Parar observação de localização
  const clearWatch = useCallback((watchId) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Geocodificar endereço
  const geocodeAddress = useCallback(async (address) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.geocodeAddress(address);
      return result;
    } catch (err) {
      setError('Erro ao geocodificar endereço');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Geocodificação reversa
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.reverseGeocode(latitude, longitude);
      return result;
    } catch (err) {
      setError('Erro na geocodificação reversa');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calcular distância
  const calculateDistance = useCallback((point1, point2) => {
    try {
      const result = geolocationService.calculateDistance(point1, point2);
      return result;
    } catch (err) {
      setError('Erro ao calcular distância');
      return null;
    }
  }, []);

  // Buscar lugares próximos
  const findNearbyPlaces = useCallback(async (latitude, longitude, radius = 5000, type = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.findNearbyPlaces(latitude, longitude, radius, type);
      return result;
    } catch (err) {
      setError('Erro ao buscar lugares próximos');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter direções
  const getDirections = useCallback(async (origin, destination, mode = 'driving') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.getDirections(origin, destination, mode);
      return result;
    } catch (err) {
      setError('Erro ao obter direções');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validar endereço
  const validateAddress = useCallback(async (address) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.validateAddress(address);
      return result;
    } catch (err) {
      setError('Erro ao validar endereço');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter sugestões de endereço
  const getAddressSuggestions = useCallback(async (input) => {
    if (!input || input.length < 2) return [];

    try {
      const suggestions = await geolocationService.getAddressSuggestions(input);
      return suggestions;
    } catch (err) {
      console.error('Erro ao obter sugestões de endereço:', err);
      return [];
    }
  }, []);

  // Obter detalhes de um lugar
  const getPlaceDetails = useCallback(async (placeId) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.getPlaceDetails(placeId);
      return result;
    } catch (err) {
      setError('Erro ao obter detalhes do lugar');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter timezone
  const getTimezone = useCallback(async (latitude, longitude) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.getTimezone(latitude, longitude);
      return result;
    } catch (err) {
      setError('Erro ao obter timezone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar oportunidades próximas
  const findNearbyOpportunities = useCallback(async (latitude, longitude, radius = 10000, category = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.findNearbyOpportunities(latitude, longitude, radius, category);
      return result;
    } catch (err) {
      setError('Erro ao buscar oportunidades próximas');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter estatísticas de localização
  const getLocationStats = useCallback(async (latitude, longitude, radius = 5000) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geolocationService.getLocationStats(latitude, longitude, radius);
      return result;
    } catch (err) {
      setError('Erro ao obter estatísticas de localização');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar permissão
  const checkPermission = useCallback(async () => {
    if (!isSupported) {
      setPermission('denied');
      return 'denied';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(permission.state);
      return permission.state;
    } catch (err) {
      console.warn('Não foi possível verificar permissão de geolocalização');
      return 'prompt';
    }
  }, [isSupported]);

  // Solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return false;
    }

    try {
      const position = await getCurrentPosition();
      return position !== null;
    } catch (err) {
      return false;
    }
  }, [isSupported, getCurrentPosition]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Resetar localização
  const resetLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Verificar permissão na inicialização
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    // Estado
    location,
    error,
    isLoading,
    permission,
    isSupported,
    
    // Ações
    getCurrentPosition,
    watchPosition,
    clearWatch,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    findNearbyPlaces,
    getDirections,
    validateAddress,
    getAddressSuggestions,
    getPlaceDetails,
    getTimezone,
    findNearbyOpportunities,
    getLocationStats,
    checkPermission,
    requestPermission,
    clearError,
    resetLocation
  };
};

export default useGeolocation;
