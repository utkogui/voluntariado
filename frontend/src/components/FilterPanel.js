import React from 'react';
import styled from 'styled-components';
import { 
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const FilterPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.gray700};
  cursor: pointer;
  transition: border-color ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray700};
  cursor: pointer;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.gray900};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
  cursor: pointer;
`;

const CheckboxText = styled.span`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  ${props => props.primary ? `
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${props.theme.colors.primaryDark};
    }
  ` : `
    background-color: ${props.theme.colors.surface};
    color: ${props.theme.colors.gray700};
    
    &:hover {
      background-color: ${props.theme.colors.gray50};
    }
  `}
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const FilterPanel = ({ filters, onFilterChange, onApplyFilters, onClearFilters }) => {
  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'ASSISTENCIA_SOCIAL', label: 'Assistência Social' },
    { value: 'EDUCACAO', label: 'Educação' },
    { value: 'MEIO_AMBIENTE', label: 'Meio Ambiente' },
    { value: 'SAUDE', label: 'Saúde' },
    { value: 'CULTURA', label: 'Cultura' },
    { value: 'ESPORTE', label: 'Esporte' },
    { value: 'TECNOLOGIA', label: 'Tecnologia' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  const durations = [
    { value: '', label: 'Qualquer duração' },
    { value: '1', label: 'Até 1 hora' },
    { value: '2', label: 'Até 2 horas' },
    { value: '4', label: 'Até 4 horas' },
    { value: '8', label: 'Até 8 horas' },
    { value: '24', label: 'Mais de 8 horas' }
  ];

  const types = [
    { value: '', label: 'Qualquer tipo' },
    { value: 'PRESENCIAL', label: 'Presencial' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'HIBRIDO', label: 'Híbrido' }
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Ativas' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'COMPLETED', label: 'Concluídas' }
  ];

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleCheckboxChange = (field, value, checked) => {
    if (checked) {
      onFilterChange({ [field]: value });
    } else {
      onFilterChange({ [field]: '' });
    }
  };

  return (
    <FilterPanelContainer>
      <FilterGroup>
        <FilterLabel>
          <TagIcon width={16} height={16} />
          Categoria
        </FilterLabel>
        <FilterSelect
          value={filters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>
          <MapPinIcon width={16} height={16} />
          Localização
        </FilterLabel>
        <FilterInput
          type="text"
          placeholder="Cidade, estado..."
          value={filters.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>
          <ClockIcon width={16} height={16} />
          Duração
        </FilterLabel>
        <FilterSelect
          value={filters.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
        >
          {durations.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>
          <CalendarIcon width={16} height={16} />
          Tipo
        </FilterLabel>
        <FilterSelect
          value={filters.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
        >
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Status</FilterLabel>
        <CheckboxGroup>
          {statuses.map((status) => (
            <CheckboxItem key={status.value}>
              <Checkbox
                type="checkbox"
                checked={filters.status === status.value}
                onChange={(e) => handleCheckboxChange('status', status.value, e.target.checked)}
              />
              <CheckboxText>{status.label}</CheckboxText>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterGroup>

      <ButtonGroup>
        <Button primary onClick={onApplyFilters}>
          Aplicar Filtros
        </Button>
      </ButtonGroup>

      <ClearButton onClick={onClearFilters}>
        Limpar Filtros
      </ClearButton>
    </FilterPanelContainer>
  );
};

export default FilterPanel;
