import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftIcon,
  BriefcaseIcon,
  StarIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { 
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications
} from '../../store/slices/notificationsSlice';

const NotificationsContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const NotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const HeaderTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.gray100};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => !props.read && `
    background-color: ${props.theme.colors.primary}05;
    border-left: 3px solid ${props.theme.colors.primary};
  `}
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    switch (props.type) {
      case 'message':
        return `
          background-color: ${props.theme.colors.primary}20;
          color: ${props.theme.colors.primary};
        `;
      case 'opportunity':
        return `
          background-color: ${props.theme.colors.secondary}20;
          color: ${props.theme.colors.secondary};
        `;
      case 'evaluation':
        return `
          background-color: ${props.theme.colors.accent}20;
          color: ${props.theme.colors.accent};
        `;
      case 'schedule':
        return `
          background-color: ${props.theme.colors.info}20;
          color: ${props.theme.colors.info};
        `;
      case 'system':
        return `
          background-color: ${props.theme.colors.gray500}20;
          color: ${props.theme.colors.gray500};
        `;
      default:
        return `
          background-color: ${props.theme.colors.gray200};
          color: ${props.theme.colors.gray600};
        `;
    }
  }}
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: 1.4;
`;

const NotificationBody = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  
  ${NotificationItem}:hover & {
    opacity: 1;
  }
`;

const NotificationActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
  
  &.delete:hover {
    background-color: ${props => props.theme.colors.error}20;
    color: ${props => props.theme.colors.error};
  }
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
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

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(state => state.notifications);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <ChatBubbleLeftIcon width={20} height={20} />;
      case 'opportunity':
        return <BriefcaseIcon width={20} height={20} />;
      case 'evaluation':
        return <StarIcon width={20} height={20} />;
      case 'schedule':
        return <CalendarIcon width={20} height={20} />;
      case 'system':
        return <CogIcon width={20} height={20} />;
      default:
        return <BellIcon width={20} height={20} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await dispatch(markAsRead(notification.id));
    }
    
    // Navegar para a página relevante baseada no tipo
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleDeleteNotification = async (notificationId) => {
    await dispatch(deleteNotification(notificationId));
  };

  const handleClearAll = async () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      await dispatch(clearNotifications());
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <NotificationsContainer>
        <LoadingState>Carregando notificações...</LoadingState>
      </NotificationsContainer>
    );
  }

  if (notifications.length === 0) {
    return (
      <NotificationsContainer>
        <EmptyState>
          <EmptyIcon>
            <BellIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma notificação</EmptyTitle>
          <EmptyMessage>
            Você não tem notificações no momento
          </EmptyMessage>
        </EmptyState>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <NotificationsHeader>
        <HeaderTitle>
          <BellIcon width={20} height={20} />
          Notificações
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#EF4444',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </HeaderTitle>
        
        <HeaderActions>
          {unreadCount > 0 && (
            <ActionButton onClick={handleMarkAllAsRead}>
              <CheckIcon width={16} height={16} />
              Marcar todas como lidas
            </ActionButton>
          )}
          <ActionButton onClick={handleClearAll}>
            <TrashIcon width={16} height={16} />
            Limpar todas
          </ActionButton>
        </HeaderActions>
      </NotificationsHeader>

      <NotificationsList>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            read={notification.read}
            onClick={() => handleNotificationClick(notification)}
          >
            <NotificationIcon type={notification.type}>
              {getNotificationIcon(notification.type)}
            </NotificationIcon>
            
            <NotificationContent>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationBody>{notification.body}</NotificationBody>
              <NotificationTime>
                {formatTime(notification.createdAt)}
              </NotificationTime>
            </NotificationContent>
            
            <NotificationActions>
              {!notification.read && (
                <NotificationActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  title="Marcar como lida"
                >
                  <EyeIcon width={16} height={16} />
                </NotificationActionButton>
              )}
              <NotificationActionButton
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(notification.id);
                }}
                title="Deletar notificação"
              >
                <TrashIcon width={16} height={16} />
              </NotificationActionButton>
            </NotificationActions>
          </NotificationItem>
        ))}
      </NotificationsList>
    </NotificationsContainer>
  );
};

export default NotificationList;
