import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  MenuIcon, 
  BellIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../store/slices/authSlice';
import { clearNotifications } from '../../store/slices/notificationsSlice';
import SearchBar from '../SearchBar';
import NotificationDropdown from '../NotificationDropdown';
import UserDropdown from '../UserDropdown';

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 ${props => props.theme.spacing.lg};
  max-width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
  min-width: 0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchSection = styled.div`
  flex: 1;
  max-width: 600px;
  margin: 0 ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  position: relative;
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: ${props => props.theme.colors.error};
  color: white;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray700};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
`;

const UserRole = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const Header = ({ onMenuClick, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LeftSection>
          <MenuButton onClick={onMenuClick} aria-label="Toggle menu">
            {sidebarOpen ? (
              <XMarkIcon width={24} height={24} />
            ) : (
              <Bars3Icon width={24} height={24} />
            )}
          </MenuButton>
          
          <Logo onClick={handleLogoClick} role="button" tabIndex={0}>
            <LogoIcon>V</LogoIcon>
            <span>Voluntariado</span>
          </Logo>
          
          <SearchSection>
            <SearchBar onSearch={handleSearch} placeholder="Buscar oportunidades..." />
          </SearchSection>
        </LeftSection>

        <RightSection>
          {isAuthenticated ? (
            <>
              <ActionButton 
                onClick={handleNotificationClick}
                aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}`}
              >
                <BellIcon width={20} height={20} />
                {unreadCount > 0 && (
                  <NotificationBadge>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </NotificationBadge>
                )}
              </ActionButton>
              
              <UserButton onClick={handleUserClick}>
                <UserCircleIcon width={32} height={32} />
                <UserInfo>
                  <UserName>{user?.name || 'Usuário'}</UserName>
                  <UserRole>{user?.userType || 'Voluntário'}</UserRole>
                </UserInfo>
              </UserButton>
              
              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
              
              {showUserMenu && (
                <UserDropdown 
                  user={user}
                  onClose={() => setShowUserMenu(false)}
                  onLogout={handleLogout}
                />
              )}
            </>
          ) : (
            <ActionButton onClick={() => navigate('/login')}>
              Entrar
            </ActionButton>
          )}
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
