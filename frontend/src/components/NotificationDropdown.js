import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { markAsRead } from '../store/slices/notificationsSlice';

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.dropdown};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 320px;
    right: -50px;
  }
`;

const DropdownHeader = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.colors.gray50};
`;

const HeaderTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}10;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const NotificationsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => !props.read && `
    background-color: ${props.theme.colors.primary}05;
    
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

const NotificationContent = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: flex-start;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.iconColor || props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.iconColor || props.theme.colors.primary};
`;

const NotificationText = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeights.tight};
`;

const NotificationMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotificationTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.md} auto;
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray400};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const getNotificationIcon = (type) => {
  switch (type) {
    case 'OPPORTUNITY':
      return HeartIcon;
    case 'ACTIVITY':
      return CalendarIcon;
    case 'MESSAGE':
      return ChatBubbleLeftRightIcon;
    case 'EVALUATION':
      return UserGroupIcon;
    default:
      return BellIcon;
  }
};

const getNotificationIconColor = (type) => {
  switch (type) {
    case 'OPPORTUNITY':
      return '#10B981';
    case 'ACTIVITY':
      return '#3B82F6';
    case 'MESSAGE':
      return '#8B5CF6';
    case 'EVALUATION':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  }
};

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const { list: notifications, isLoading } = useSelector(state => state.notifications);
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

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    // Aqui você pode adicionar navegação para a notificação específica
    onClose();
  };

  const handleMarkAllAsRead = () => {
    notifications
      .filter(notif => !notif.read)
      .forEach(notif => dispatch(markAsRead(notif.id)));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (isLoading) {
    return (
      <DropdownContainer ref={dropdownRef}>
        <DropdownHeader>
          <HeaderTitle>Notificações</HeaderTitle>
        </DropdownHeader>
        <EmptyState>
          <EmptyMessage>Carregando notificações...</EmptyMessage>
        </EmptyState>
      </DropdownContainer>
    );
  }

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownHeader>
        <HeaderTitle>Notificações</HeaderTitle>
        {unreadCount > 0 && (
          <MarkAllButton onClick={handleMarkAllAsRead}>
            Marcar todas como lidas
          </MarkAllButton>
        )}
      </DropdownHeader>

      <NotificationsList>
        {notifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <BellIcon width={32} height={32} />
            </EmptyIcon>
            <EmptyTitle>Nenhuma notificação</EmptyTitle>
            <EmptyMessage>
              Você não tem notificações no momento.
            </EmptyMessage>
          </EmptyState>
        ) : (
          notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationIconColor(notification.type);
            
            return (
              <NotificationItem
                key={notification.id}
                read={notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationContent>
                  <NotificationIcon iconColor={iconColor}>
                    <IconComponent width={20} height={20} />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>
                      {formatTimeAgo(notification.createdAt)}
                    </NotificationTime>
                  </NotificationText>
                </NotificationContent>
              </NotificationItem>
            );
          })
        )}
      </NotificationsList>
    </DropdownContainer>
  );
};

export default NotificationDropdown;
