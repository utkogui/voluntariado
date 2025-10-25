import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChartBarIcon, 
  PlusIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import AnalyticsDashboard from '../../components/Analytics/AnalyticsDashboard';
import useAnalytics from '../../hooks/useAnalytics';

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

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    isLoading,
    error,
    getConsolidatedMetrics,
    clearError
  } = useAnalytics();

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    try {
      const result = await getConsolidatedMetrics();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleExportData = () => {
    setSuccessMessage('Dados exportados com sucesso!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleRefreshData = () => {
    loadMetrics();
    setSuccessMessage('Dados atualizados com sucesso!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'reports', label: 'Relatórios', icon: PlusIcon },
    { id: 'realtime', label: 'Tempo Real', icon: ClockIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AnalyticsDashboard
            startDate={null}
            endDate={null}
            onDateRangeChange={handleDateRangeChange}
          />
        );
      
      case 'reports':
        return (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '2rem', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <ChartBarIcon width={48} height={48} style={{ margin: '0 auto 1rem' }} />
            <h3>Relatórios Personalizados</h3>
            <p>Em breve você poderá criar relatórios personalizados com os dados de analytics.</p>
          </div>
        );
      
      case 'realtime':
        return (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '2rem', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <ClockIcon width={48} height={48} style={{ margin: '0 auto 1rem' }} />
            <h3>Dados em Tempo Real</h3>
            <p>Visualize dados em tempo real sobre usuários ativos e atividades.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <ChartBarIcon width={32} height={32} />
          Analytics
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
        
        <Sidebar>
          <QuickActions>
            <QuickActionsTitle>Ações Rápidas</QuickActionsTitle>
            
            <ActionButton onClick={handleRefreshData}>
              <ClockIcon width={16} height={16} />
              Atualizar Dados
            </ActionButton>
            
            <ActionButton onClick={handleExportData}>
              <ChartBarIcon width={16} height={16} />
              Exportar Dados
            </ActionButton>
            
            <ActionButton onClick={() => setActiveTab('reports')}>
              <PlusIcon width={16} height={16} />
              Criar Relatório
            </ActionButton>
          </QuickActions>

          {metrics && (
            <StatsCard>
              <StatsTitle>Resumo</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>1.2K</StatValue>
                  <StatLabel>Usuários</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>5.4K</StatValue>
                  <StatLabel>Visualizações</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>89%</StatValue>
                  <StatLabel>Taxa de Conversão</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>2.3m</StatValue>
                  <StatLabel>Tempo Médio</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsCard>
          )}
        </Sidebar>
      </Content>
    </PageContainer>
  );
};

export default Analytics;