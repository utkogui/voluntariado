import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BellIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import NotificationSettings from '../../components/PushNotifications/NotificationSettings';
import NotificationList from '../../components/PushNotifications/NotificationList';
import usePushNotifications from '../../hooks/usePushNotifications';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TabContainer = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: row;
  }
`;

const MainContent = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Sidebar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const StatsCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StatsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PushNotifications = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  
  const {
    isLoading,
    error,
    getNotificationStats,
    sendToUser,
    sendToMultipleUsers,
    sendToTopic,
    clearError
  } = usePushNotifications();

  // Carregar notificações e estatísticas
  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    // Aqui você implementaria a lógica para carregar notificações do backend
    // Por enquanto, vamos usar dados mockados
    const mockNotifications = [
      {
        id: '1',
        title: 'Nova oportunidade disponível',
        body: 'Uma nova oportunidade de voluntariado foi publicada na sua área',
        type: 'info',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        title: 'Candidatura aprovada',
        body: 'Sua candidatura para a oportunidade "Ajuda comunitária" foi aprovada',
        type: 'success',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        title: 'Lembrete de atividade',
        body: 'Você tem uma atividade agendada para amanhã às 14:00',
        type: 'warning',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const loadStats = async () => {
    try {
      const statsData = await getNotificationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading notification stats:', err);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const handleSendTestNotification = async () => {
    try {
      // Aqui você implementaria a lógica para enviar uma notificação de teste
      console.log('Sending test notification...');
    } catch (err) {
      console.error('Error sending test notification:', err);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notificações', icon: BellIcon },
    { id: 'settings', label: 'Configurações', icon: CogIcon },
    { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        );
      
      case 'settings':
        return <NotificationSettings />;
      
      case 'stats':
        return (
          <StatsCard>
            <StatsTitle>
              <ChartBarIcon width={24} height={24} />
              Estatísticas de Notificações
            </StatsTitle>
            
            {stats ? (
              <StatsGrid>
                <StatItem>
                  <StatValue>{stats.totalSent || 0}</StatValue>
                  <StatLabel>Total Enviadas</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.totalDelivered || 0}</StatValue>
                  <StatLabel>Entregues</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.totalOpened || 0}</StatValue>
                  <StatLabel>Abertas</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.openRate || '0%'}</StatValue>
                  <StatLabel>Taxa de Abertura</StatLabel>
                </StatItem>
              </StatsGrid>
            ) : (
              <LoadingSpinner />
            )}
          </StatsCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <BellIcon width={32} height={32} />
          Notificações Push
        </Title>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            ✕
          </button>
        </ErrorMessage>
      )}

      <TabContainer>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon width={20} height={20} />
              {tab.label}
            </Tab>
          );
        })}
      </TabContainer>

      <Content>
        <MainContent>
          {renderContent()}
        </MainContent>
        
        {activeTab === 'notifications' && (
          <Sidebar>
            <StatsCard>
              <StatsTitle>
                <ChartBarIcon width={20} height={20} />
                Resumo
              </StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>{notifications.length}</StatValue>
                  <StatLabel>Total</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{notifications.filter(n => !n.read).length}</StatValue>
                  <StatLabel>Não lidas</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{notifications.filter(n => n.read).length}</StatValue>
                  <StatLabel>Lidas</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsCard>
          </Sidebar>
        )}
      </Content>
    </PageContainer>
  );
};

export default PushNotifications;
