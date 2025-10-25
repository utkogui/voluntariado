import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.dropdown};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 260px;
    right: -20px;
  }
`;

const UserInfo = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const UserName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const UserEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const UserRole = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.full};
  text-transform: capitalize;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: ${props => props.theme.spacing.sm} 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin: 0;
`;

const MenuLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray700};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: -2px;
  }
`;

const MenuIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MenuText = styled.span`
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const LogoutButton = styled(MenuLink)`
  color: ${props => props.theme.colors.error};
  
  &:hover {
    background-color: ${props => props.theme.colors.error}10;
    color: ${props => props.theme.colors.error};
  }
`;

const getRoleSpecificMenuItems = (userType) => {
  const baseItems = [
    { path: '/profile', icon: UserIcon, label: 'Meu Perfil' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Configurações' },
  ];

  let roleItems = [];

  switch (userType) {
    case 'VOLUNTEER':
      roleItems = [
        { path: '/my-applications', icon: HeartIcon, label: 'Minhas Candidaturas' },
        { path: '/my-participations', icon: CalendarIcon, label: 'Minhas Participações' },
        { path: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Chat' },
        { path: '/notifications', icon: BellIcon, label: 'Notificações' },
      ];
      break;
    case 'INSTITUTION':
      roleItems = [
        { path: '/my-opportunities', icon: HeartIcon, label: 'Minhas Oportunidades' },
        { path: '/my-activities', icon: CalendarIcon, label: 'Minhas Atividades' },
        { path: '/volunteers', icon: UserGroupIcon, label: 'Voluntários' },
        { path: '/reports', icon: ChartBarIcon, label: 'Relatórios' },
      ];
      break;
    case 'COMPANY':
      roleItems = [
        { path: '/impact-reports', icon: ChartBarIcon, label: 'Relatórios de Impacto' },
        { path: '/partnerships', icon: BuildingOfficeIcon, label: 'Parcerias' },
      ];
      break;
    case 'UNIVERSITY':
      roleItems = [
        { path: '/student-engagement', icon: AcademicCapIcon, label: 'Engajamento Estudantil' },
        { path: '/partnerships', icon: BuildingOfficeIcon, label: 'Parcerias' },
      ];
      break;
    case 'ADMIN':
      roleItems = [
        { path: '/admin/users', icon: UserGroupIcon, label: 'Gerenciar Usuários' },
        { path: '/admin/opportunities', icon: HeartIcon, label: 'Gerenciar Oportunidades' },
        { path: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
        { path: '/admin/moderation', icon: Cog6ToothIcon, label: 'Moderação' },
      ];
      break;
    default:
      roleItems = [];
  }

  return [...baseItems, ...roleItems];
};

const UserDropdown = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const menuItems = getRoleSpecificMenuItems(user?.userType);

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (userType) => {
    const labels = {
      VOLUNTEER: 'Voluntário',
      INSTITUTION: 'Instituição',
      COMPANY: 'Empresa',
      UNIVERSITY: 'Universidade',
      ADMIN: 'Administrador'
    };
    return labels[userType] || 'Usuário';
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <UserInfo>
        <UserAvatar>
          {getUserInitials(user?.name)}
        </UserAvatar>
        <UserName>{user?.name || 'Usuário'}</UserName>
        <UserEmail>{user?.email || 'usuario@exemplo.com'}</UserEmail>
        <UserRole>{getRoleLabel(user?.userType)}</UserRole>
      </UserInfo>

      <MenuList>
        {menuItems.map((item, index) => (
          <MenuItem key={item.path}>
            <MenuLink onClick={() => handleMenuClick(item.path)}>
              <MenuIcon>
                <item.icon width={20} height={20} />
              </MenuIcon>
              <MenuText>{item.label}</MenuText>
            </MenuLink>
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem>
          <LogoutButton onClick={handleLogout}>
            <MenuIcon>
              <ArrowRightOnRectangleIcon width={20} height={20} />
            </MenuIcon>
            <MenuText>Sair</MenuText>
          </LogoutButton>
        </MenuItem>
      </MenuList>
    </DropdownContainer>
  );
};

export default UserDropdown;
