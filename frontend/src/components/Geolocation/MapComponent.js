import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  LocationMarkerIcon
} from '@heroicons/react/24/outline';

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '400px'};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.colors.gray200};
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  z-index: 1000;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SearchContainer = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  left: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  z-index: 1000;
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SearchButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1001;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SuggestionItem = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Marker = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: ${props => props.theme.colors.primary};
  border: 3px solid white;
  border-radius: 50%;
  transform: translate(-50%, -100%);
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  
  &:hover {
    transform: translate(-50%, -100%) scale(1.1);
  }
`;

const InfoWindow = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1002;
  min-width: 200px;
  max-width: 300px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const InfoTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const InfoContent = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const InfoActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.variant === 'primary' ? 'white' : props.theme.colors.gray700};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.gray100};
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const LoadingText = styled.div`
  color: ${props => props.theme.colors.gray600};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const MapComponent = ({
  height = '400px',
  center = { lat: -23.5505, lng: -46.6333 }, // São Paulo
  zoom = 10,
  markers = [],
  onMapClick = null,
  onMarkerClick = null,
  onSearch = null,
  searchable = true,
  showControls = true,
  className = ''
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Inicializar mapa
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: currentZoom,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Adicionar listener de clique no mapa
    if (onMapClick) {
      mapInstance.addListener('click', (event) => {
        onMapClick({
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        });
      });
    }

    // Adicionar controles de zoom
    if (showControls) {
      mapInstance.addListener('zoom_changed', () => {
        setCurrentZoom(mapInstance.getZoom());
      });
    }
  };

  // Atualizar marcadores
  useEffect(() => {
    if (!map || !markers.length) return;

    // Limpar marcadores existentes
    const existingMarkers = map.markers || [];
    existingMarkers.forEach(marker => marker.setMap(null));

    // Adicionar novos marcadores
    const newMarkers = markers.map((marker, index) => {
      const mapMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map,
        title: marker.title || `Marcador ${index + 1}`,
        icon: marker.icon || null
      });

      if (onMarkerClick) {
        mapMarker.addListener('click', () => {
          onMarkerClick(marker, index);
          setSelectedMarker(marker);
        });
      }

      return mapMarker;
    });

    map.markers = newMarkers;
  }, [map, markers, onMarkerClick]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      if (onSearch) {
        const results = await onSearch(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    
    if (map && suggestion.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          map.setZoom(15);
        }
      });
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  const handleCloseInfoWindow = () => {
    setSelectedMarker(null);
  };

  return (
    <MapContainer height={height} className={className}>
      <MapElement ref={mapRef} />
      
      {isLoading && (
        <LoadingOverlay>
          <LoadingText>Carregando...</LoadingText>
        </LoadingOverlay>
      )}

      {searchable && (
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar localização..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
          />
          <SearchButton onClick={handleSearch}>
            <MagnifyingGlassIcon width={16} height={16} />
          </SearchButton>
          
          <SuggestionsList isOpen={showSuggestions}>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.description}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </SearchContainer>
      )}

      {showControls && (
        <MapControls>
          <ControlButton onClick={handleZoomIn} title="Aumentar zoom">
            <PlusIcon width={16} height={16} />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} title="Diminuir zoom">
            <MinusIcon width={16} height={16} />
          </ControlButton>
        </MapControls>
      )}

      {selectedMarker && (
        <InfoWindow isOpen={true}>
          <InfoTitle>{selectedMarker.title}</InfoTitle>
          <InfoContent>{selectedMarker.description}</InfoContent>
          <InfoActions>
            <ActionButton onClick={handleCloseInfoWindow}>
              Fechar
            </ActionButton>
            {selectedMarker.onSelect && (
              <ActionButton 
                variant="primary" 
                onClick={() => selectedMarker.onSelect(selectedMarker)}
              >
                Selecionar
              </ActionButton>
            )}
          </InfoActions>
        </InfoWindow>
      )}
    </MapContainer>
  );
};

export default MapComponent;
