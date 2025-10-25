import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HeartIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SidebarContainer = styled.aside`
  width: 280px;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  z-index: ${props => props.theme.zIndex.fixed};
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform ${props => props.theme.transitions.normal};
  overflow-y: auto;
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    position: static;
    transform: translateX(0);
    height: calc(100vh - 64px);
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const CloseButton = styled.button`
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
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray700};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeights.medium : props.theme.typography.fontWeights.normal};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
    color: ${props => props.theme.colors.primary};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: -2px;
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary}10;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${props.theme.colors.primary};
    }
  `}
`;

const NavIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  background-color: ${props => props.theme.colors.primary};
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

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', icon: HomeIcon, label: 'Início', exact: true },
      { path: '/opportunities', icon: HeartIcon, label: 'Oportunidades' },
      { path: '/activities', icon: CalendarIcon, label: 'Atividades' },
      { path: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Chat', badge: unreadCount },
      { path: '/notifications', icon: BellIcon, label: 'Notificações' },
    ];

    const profileItems = [
      { path: '/profile', icon: UserIcon, label: 'Meu Perfil' },
      { path: '/settings', icon: Cog6ToothIcon, label: 'Configurações' },
    ];

    let roleSpecificItems = [];

    if (user?.userType === 'VOLUNTEER') {
      roleSpecificItems = [
        { path: '/my-applications', icon: DocumentTextIcon, label: 'Minhas Candidaturas' },
        { path: '/my-participations', icon: UserGroupIcon, label: 'Minhas Participações' },
      ];
    } else if (user?.userType === 'INSTITUTION') {
      roleSpecificItems = [
        { path: '/my-opportunities', icon: HeartIcon, label: 'Minhas Oportunidades' },
        { path: '/my-activities', icon: CalendarIcon, label: 'Minhas Atividades' },
        { path: '/volunteers', icon: UserGroupIcon, label: 'Voluntários' },
        { path: '/reports', icon: ChartBarIcon, label: 'Relatórios' },
      ];
    } else if (user?.userType === 'COMPANY') {
      roleSpecificItems = [
        { path: '/impact-reports', icon: ChartBarIcon, label: 'Relatórios de Impacto' },
        { path: '/partnerships', icon: BuildingOfficeIcon, label: 'Parcerias' },
      ];
    } else if (user?.userType === 'UNIVERSITY') {
      roleSpecificItems = [
        { path: '/student-engagement', icon: AcademicCapIcon, label: 'Engajamento Estudantil' },
        { path: '/partnerships', icon: BuildingOfficeIcon, label: 'Parcerias' },
      ];
    } else if (user?.userType === 'ADMIN') {
      roleSpecificItems = [
        { path: '/admin/users', icon: UserGroupIcon, label: 'Usuários' },
        { path: '/admin/opportunities', icon: HeartIcon, label: 'Oportunidades' },
        { path: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
        { path: '/admin/moderation', icon: Cog6ToothIcon, label: 'Moderação' },
      ];
    }

    return { baseItems, profileItems, roleSpecificItems };
  };

  const { baseItems, profileItems, roleSpecificItems } = getNavigationItems();

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <span>Menu</span>
        <CloseButton onClick={onClose} aria-label="Fechar menu">
          <XMarkIcon width={20} height={20} />
        </CloseButton>
      </SidebarHeader>

      <Navigation>
        <NavSection>
          <NavList>
            {baseItems.map((item) => (
              <NavItem key={item.path}>
                <NavLink
                  onClick={() => handleNavigation(item.path)}
                  active={isActive(item.path)}
                >
                  <NavIcon>
                    <item.icon width={20} height={20} />
                  </NavIcon>
                  <NavText>{item.label}</NavText>
                  {item.badge && item.badge > 0 && (
                    <Badge>{item.badge > 99 ? '99+' : item.badge}</Badge>
                  )}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </NavSection>

        {roleSpecificItems.length > 0 && (
          <NavSection>
            <SectionTitle>Área do {user?.userType || 'Usuário'}</SectionTitle>
            <NavList>
              {roleSpecificItems.map((item) => (
                <NavItem key={item.path}>
                  <NavLink
                    onClick={() => handleNavigation(item.path)}
                    active={isActive(item.path)}
                  >
                    <NavIcon>
                      <item.icon width={20} height={20} />
                    </NavIcon>
                    <NavText>{item.label}</NavText>
                    {item.badge && item.badge > 0 && (
                      <Badge>{item.badge > 99 ? '99+' : item.badge}</Badge>
                    )}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </NavSection>
        )}

        <NavSection>
          <SectionTitle>Conta</SectionTitle>
          <NavList>
            {profileItems.map((item) => (
              <NavItem key={item.path}>
                <NavLink
                  onClick={() => handleNavigation(item.path)}
                  active={isActive(item.path)}
                >
                  <NavIcon>
                    <item.icon width={20} height={20} />
                  </NavIcon>
                  <NavText>{item.label}</NavText>
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </NavSection>
      </Navigation>
    </SidebarContainer>
  );
};

export default Sidebar;
