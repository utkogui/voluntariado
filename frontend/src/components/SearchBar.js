import React, { useState } from 'react';
import styled from 'styled-components';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-right: ${props => props.theme.spacing['2xl']};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
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

const SearchButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing['2xl']};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.gray400};
  cursor: pointer;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.gray600};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SearchBar = ({ onSearch, placeholder = "Buscar...", value: controlledValue, onChange: controlledOnChange }) => {
  const [internalValue, setInternalValue] = useState('');
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue = isControlled ? controlledOnChange : setInternalValue;

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          aria-label="Buscar"
        />
        {value && (
          <ClearButton
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
          >
            <XMarkIcon width={16} height={16} />
          </ClearButton>
        )}
        <SearchButton
          type="submit"
          aria-label="Buscar"
        >
          <MagnifyingGlassIcon width={20} height={20} />
        </SearchButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar;
