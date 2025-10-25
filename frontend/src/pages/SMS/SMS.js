import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import SMSForm from '../../components/SMS/SMSForm';
import SMSHistory from '../../components/SMS/SMSHistory';
import useSMS from '../../hooks/useSMS';

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

const QuickActions = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const QuickActionsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.normal};
  margin-bottom: ${props => props.theme.spacing.sm};

  &:hover {
    background-color: ${props => props.theme.colors.primaryBackground};
    border-color: ${props => props.theme.colors.primary};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.successBackground};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
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

const SMS = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    isLoading,
    error,
    getMessageHistory,
    getSMSStats,
    clearError
  } = useSMS();

  // Carregar dados iniciais
  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadMessages = async () => {
    try {
      const result = await getMessageHistory();
      if (result.success) {
        setMessages(result.data.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getSMSStats();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSMSuccess = (result) => {
    setSuccessMessage('SMS enviado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 5000);
    loadMessages();
    loadStats();
  };

  const handleSMSError = (error) => {
    console.error('SMS error:', error);
  };

  const handleRefresh = () => {
    loadMessages();
    loadStats();
  };

  const tabs = [
    { id: 'send', label: 'Enviar SMS', icon: PlusIcon },
    { id: 'history', label: 'Histórico', icon: ClockIcon },
    { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'send':
        return (
          <SMSForm
            type="single"
            onSuccess={handleSMSuccess}
            onError={handleSMSError}
          />
        );
      
      case 'history':
        return (
          <SMSHistory
            messages={messages}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case 'stats':
        return (
          <StatsCard>
            <StatsTitle>
              <ChartBarIcon width={24} height={24} />
              Estatísticas de SMS
            </StatsTitle>
            
            {stats ? (
              <StatsGrid>
                <StatItem>
                  <StatValue>{stats.total || 0}</StatValue>
                  <StatLabel>Total Enviadas</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.delivered || 0}</StatValue>
                  <StatLabel>Entregues</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.failed || 0}</StatValue>
                  <StatLabel>Falharam</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.deliveryRate || '0%'}</StatValue>
                  <StatLabel>Taxa de Entrega</StatLabel>
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
          <ChatBubbleLeftRightIcon width={32} height={32} />
          SMS
        </Title>
      </Header>

      {error && (
        <ErrorMessage>
          <ExclamationTriangleIcon width={20} height={20} />
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            ✕
          </button>
        </ErrorMessage>
      )}

      {successMessage && (
        <SuccessMessage>
          <CheckCircleIcon width={20} height={20} />
          {successMessage}
        </SuccessMessage>
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
        
        {activeTab === 'send' && (
          <Sidebar>
            <QuickActions>
              <QuickActionsTitle>Ações Rápidas</QuickActionsTitle>
              
              <ActionButton onClick={() => setActiveTab('history')}>
                <ClockIcon width={16} height={16} />
                Ver Histórico
              </ActionButton>
              
              <ActionButton onClick={() => setActiveTab('stats')}>
                <ChartBarIcon width={16} height={16} />
                Ver Estatísticas
              </ActionButton>
              
              <ActionButton onClick={handleRefresh}>
                <ClockIcon width={16} height={16} />
                Atualizar Dados
              </ActionButton>
            </QuickActions>

            {stats && (
              <StatsCard>
                <StatsTitle>Resumo</StatsTitle>
                <StatsGrid>
                  <StatItem>
                    <StatValue>{messages.length}</StatValue>
                    <StatLabel>Mensagens</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{messages.filter(m => m.status === 'delivered').length}</StatValue>
                    <StatLabel>Entregues</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{messages.filter(m => m.status === 'failed').length}</StatValue>
                    <StatLabel>Falharam</StatLabel>
                  </StatItem>
                </StatsGrid>
              </StatsCard>
            )}
          </Sidebar>
        )}
      </Content>
    </PageContainer>
  );
};

export default SMS;
