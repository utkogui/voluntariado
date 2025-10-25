import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import usePushNotifications from '../../hooks/usePushNotifications';

const ListContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.background};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  background-color: ${props => props.variant === 'primary' ? props.theme.colors.primary : 
                     props.variant === 'success' ? props.theme.colors.success :
                     props.variant === 'error' ? props.theme.colors.error :
                     props.theme.colors.background};
  color: ${props => props.variant === 'primary' || props.variant === 'success' || props.variant === 'error' ? 
           props.theme.colors.white : props.theme.colors.text};
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.colors.primary : 
                        props.variant === 'success' ? props.theme.colors.success :
                        props.variant === 'error' ? props.theme.colors.error :
                        props.theme.colors.border};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.unread ? props.theme.colors.primaryBackground : 'transparent'};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return props.theme.colors.successBackground;
      case 'error': return props.theme.colors.errorBackground;
      case 'warning': return props.theme.colors.warningBackground;
      default: return props.theme.colors.primaryBackground;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      default: return props.theme.colors.primary;
    }
  }};
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const NotificationBody = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: 1.4;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const Timestamp = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const UnreadBadge = styled.span`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NotificationList = ({ notifications = [], onMarkAsRead, onMarkAllAsRead, onDelete, isLoading }) => {
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckIcon width={20} height={20} />;
      case 'error':
        return <XMarkIcon width={20} height={20} />;
      case 'warning':
        return <ExclamationTriangleIcon width={20} height={20} />;
      default:
        return <InformationCircleIcon width={20} height={20} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleDelete = (notificationId) => {
    if (onDelete) {
      onDelete(notificationId);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      if (onMarkAsRead) {
        onMarkAsRead(id);
      }
    });
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => {
      if (onDelete) {
        onDelete(id);
      }
    });
    setSelectedNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <ListContainer>
        <Header>
          <Title>
            <BellIcon width={24} height={24} />
            Notificações
          </Title>
        </Header>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      </ListContainer>
    );
  }

  if (notifications.length === 0) {
    return (
      <ListContainer>
        <Header>
          <Title>
            <BellIcon width={24} height={24} />
            Notificações
          </Title>
        </Header>
        <EmptyState>
          <EmptyIcon>
            <BellIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma notificação</EmptyTitle>
          <EmptyDescription>
            Você não tem notificações no momento. Quando houver atualizações importantes, elas aparecerão aqui.
          </EmptyDescription>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <Header>
        <Title>
          <BellIcon width={24} height={24} />
          Notificações
          {unreadCount > 0 && (
            <UnreadBadge>{unreadCount}</UnreadBadge>
          )}
        </Title>
        <Actions>
          {notifications.length > 0 && (
            <>
              <ActionButton
                variant="primary"
                onClick={handleSelectAll}
              >
                {selectedNotifications.length === notifications.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </ActionButton>
              
              {selectedNotifications.length > 0 && (
                <>
                  <ActionButton
                    variant="success"
                    onClick={handleBulkMarkAsRead}
                  >
                    <CheckIcon width={16} height={16} />
                    Marcar como lidas
                  </ActionButton>
                  
                  <ActionButton
                    variant="error"
                    onClick={handleBulkDelete}
                  >
                    <XMarkIcon width={16} height={16} />
                    Excluir
                  </ActionButton>
                </>
              )}
              
              <ActionButton
                variant="primary"
                onClick={onMarkAllAsRead}
              >
                <CheckIcon width={16} height={16} />
                Marcar todas como lidas
              </ActionButton>
            </>
          )}
        </Actions>
      </Header>

      <div>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} unread={!notification.read}>
            <IconContainer type={notification.type}>
              {getNotificationIcon(notification.type)}
            </IconContainer>
            
            <Content>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationBody>{notification.body}</NotificationBody>
              <NotificationMeta>
                <Timestamp>
                  <ClockIcon width={14} height={14} />
                  {formatTimestamp(notification.timestamp)}
                </Timestamp>
                {!notification.read && (
                  <UnreadBadge>Nova</UnreadBadge>
                )}
              </NotificationMeta>
            </Content>
            
            <ItemActions>
              {!notification.read && (
                <ActionButton
                  variant="success"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CheckIcon width={16} height={16} />
                </ActionButton>
              )}
              
              <ActionButton
                variant="error"
                onClick={() => handleDelete(notification.id)}
              >
                <XMarkIcon width={16} height={16} />
              </ActionButton>
            </ItemActions>
          </NotificationItem>
        ))}
      </div>
    </ListContainer>
  );
};

export default NotificationList;
