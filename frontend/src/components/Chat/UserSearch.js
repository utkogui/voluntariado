import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  UserPlusIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  searchUsersStart, 
  searchUsersSuccess, 
  searchUsersFailure,
  clearSearchResults 
} from '../../store/slices/chatSlice';
import chatService from '../../services/chatService';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-left: ${props => props.theme.spacing['2xl']};
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

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray500};
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  padding: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  max-height: 300px;
  overflow-y: auto;
  z-index: ${props => props.theme.zIndex.dropdown};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.borderRadius.full};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const ErrorState = styled.div`
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  color: ${props => props.theme.colors.error};
`;

const UserSearch = ({ onUserSelect, placeholder = "Buscar usuários..." }) => {
  const dispatch = useDispatch();
  const { searchResults, isSearching, error } = useSelector(state => state.chat);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      dispatch(clearSearchResults());
      setShowResults(false);
      return;
    }

    dispatch(searchUsersStart());
    setShowResults(true);

    try {
      const response = await chatService.searchUsers(searchQuery);
      dispatch(searchUsersSuccess(response));
    } catch (err) {
      dispatch(searchUsersFailure(err.message));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleUserSelect = (user) => {
    onUserSelect(user);
    setQuery('');
    setShowResults(false);
    dispatch(clearSearchResults());
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    dispatch(clearSearchResults());
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchIcon>
        <MagnifyingGlassIcon width={16} height={16} />
      </SearchIcon>
      
      <SearchInput
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setShowResults(true)}
        placeholder={placeholder}
      />
      
      {query && (
        <ClearButton onClick={handleClear}>
          <XMarkIcon width={16} height={16} />
        </ClearButton>
      )}

      <SearchResults isOpen={showResults}>
        {isSearching ? (
          <LoadingState>Buscando usuários...</LoadingState>
        ) : error ? (
          <ErrorState>Erro ao buscar usuários: {error}</ErrorState>
        ) : searchResults.length === 0 ? (
          <EmptyState>
            {query.length < 2 
              ? 'Digite pelo menos 2 caracteres para buscar'
              : 'Nenhum usuário encontrado'
            }
          </EmptyState>
        ) : (
          searchResults.map((user) => (
            <SearchResultItem
              key={user.id}
              onClick={() => handleUserSelect(user)}
            >
              <UserAvatar>
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(user.name)
                )}
              </UserAvatar>
              
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
              
              {user.isOnline && <OnlineIndicator />}
            </SearchResultItem>
          ))
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default UserSearch;
