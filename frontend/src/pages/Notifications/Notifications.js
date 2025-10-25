import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BellIcon, 
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import useNotifications from '../../hooks/useNotifications';
import NotificationList from '../../components/Notifications/NotificationList';
import NotificationSettings from '../../components/Notifications/NotificationSettings';

const NotificationsContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const PageHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const PageDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    color: ${props => props.theme.colors.gray900};
    background-color: ${props => props.theme.colors.gray50};
  }
  
  ${props => props.active && `
    color: ${props.theme.colors.primary};
    border-bottom-color: ${props.theme.colors.primary};
    background-color: ${props.theme.colors.primary}05;
  `}
`;

const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const StatusCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const StatusItem = styled.div`
  text-align: center;
`;

const StatusValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatusLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const PermissionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  ${props => {
    switch (props.status) {
      case 'granted':
        return `
          background-color: ${props.theme.colors.success}20;
          color: ${props.theme.colors.success};
          border: 1px solid ${props.theme.colors.success}40;
        `;
      case 'denied':
        return `
          background-color: ${props.theme.colors.error}20;
          color: ${props.theme.colors.error};
          border: 1px solid ${props.theme.colors.error}40;
        `;
      default:
        return `
          background-color: ${props.theme.colors.warning}20;
          color: ${props.theme.colors.warning};
          border: 1px solid ${props.theme.colors.warning}40;
        `;
    }
  }}
`;

const PermissionText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const RequestPermissionButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray300};
    cursor: not-allowed;
  }
`;

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(state => state.notifications);
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    isSupported,
    permission,
    isInitialized,
    initialize,
    requestPermission,
    createLocalNotification
  } = useNotifications();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (isSupported && !isInitialized) {
      initialize();
    }
  }, [isSupported, isInitialized, initialize]);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        createLocalNotification('Permissão concedida!', {
          body: 'Agora você receberá notificações do VolunteerApp.',
          icon: '/logo192.png',
          tag: 'permission-granted'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  const handleTestNotification = () => {
    createLocalNotification('Teste de Notificação', {
      body: 'Esta é uma notificação de teste para verificar se tudo está funcionando corretamente.',
      icon: '/logo192.png',
      tag: 'test',
      requireInteraction: true
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { status: 'granted', text: 'Permitido', icon: CheckIcon };
      case 'denied':
        return { status: 'denied', text: 'Negado', icon: XMarkIcon };
      default:
        return { status: 'default', text: 'Não solicitado', icon: XMarkIcon };
    }
  };

  const permissionInfo = getPermissionStatus();
  const PermissionIcon = permissionInfo.icon;

  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter(n => n.read).length;

  return (
    <NotificationsContainer>
      <PageHeader>
        <PageTitle>
          <BellIcon width={32} height={32} />
          Notificações
        </PageTitle>
        <PageDescription>
          Gerencie suas notificações e configurações de alerta
        </PageDescription>
      </PageHeader>

      {/* Status das notificações */}
      <StatusCard>
        <StatusGrid>
          <StatusItem>
            <StatusValue>{totalNotifications}</StatusValue>
            <StatusLabel>Total</StatusLabel>
          </StatusItem>
          <StatusItem>
            <StatusValue>{unreadCount}</StatusValue>
            <StatusLabel>Não lidas</StatusLabel>
          </StatusItem>
          <StatusItem>
            <StatusValue>{readNotifications}</StatusValue>
            <StatusLabel>Lidas</StatusLabel>
          </StatusItem>
          <StatusItem>
            <StatusValue>{isSupported ? 'Sim' : 'Não'}</StatusValue>
            <StatusLabel>Suportado</StatusLabel>
          </StatusItem>
        </StatusGrid>
      </StatusCard>

      {/* Status da permissão */}
      <PermissionStatus status={permissionInfo.status}>
        <PermissionIcon width={20} height={20} />
        <PermissionText>
          Permissão: {permissionInfo.text}
        </PermissionText>
        {permissionInfo.status !== 'granted' && (
          <RequestPermissionButton onClick={handleRequestPermission}>
            Solicitar Permissão
          </RequestPermissionButton>
        )}
        {permissionInfo.status === 'granted' && (
          <RequestPermissionButton onClick={handleTestNotification}>
            Testar Notificação
          </RequestPermissionButton>
        )}
      </PermissionStatus>

      {/* Abas */}
      <TabsContainer>
        <Tab
          active={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
        >
          <BellIcon width={16} height={16} />
          Lista de Notificações
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
        </Tab>
        <Tab
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        >
          <CogIcon width={16} height={16} />
          Configurações
        </Tab>
      </TabsContainer>

      {/* Conteúdo das abas */}
      <TabContent active={activeTab === 'list'}>
        <NotificationList />
      </TabContent>

      <TabContent active={activeTab === 'settings'}>
        <NotificationSettings />
      </TabContent>
    </NotificationsContainer>
  );
};

export default Notifications;
