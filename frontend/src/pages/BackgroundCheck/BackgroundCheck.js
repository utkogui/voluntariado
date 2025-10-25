import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import BackgroundCheckForm from '../../components/BackgroundCheck/BackgroundCheckForm';
import BackgroundCheckStatus from '../../components/BackgroundCheck/BackgroundCheckStatus';
import useBackgroundCheck from '../../hooks/useBackgroundCheck';
import { useSelector } from 'react-redux';

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

const ChecksList = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.theme.colors.background};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const CheckInfo = styled.div`
  flex: 1;
`;

const CheckTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const CheckDate = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const CheckStatus = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return props.theme.colors.successBackground;
      case 'in_progress': return props.theme.colors.primaryBackground;
      case 'failed': return props.theme.colors.errorBackground;
      case 'pending': return props.theme.colors.warningBackground;
      default: return props.theme.colors.background;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return props.theme.colors.success;
      case 'in_progress': return props.theme.colors.primary;
      case 'failed': return props.theme.colors.error;
      case 'pending': return props.theme.colors.warning;
      default: return props.theme.colors.textSecondary;
    }
  }};
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

const BackgroundCheck = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [checks, setChecks] = useState([]);
  const [stats, setStats] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCheckId, setSelectedCheckId] = useState(null);
  
  const { user } = useSelector((state) => state.auth);
  
  const {
    isLoading,
    error,
    getUserChecks,
    getCheckStats,
    clearError
  } = useBackgroundCheck();

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      loadChecks();
      loadStats();
    }
  }, [user?.id]);

  const loadChecks = async () => {
    try {
      const result = await getUserChecks(user.id);
      if (result.success) {
        setChecks(result.data.checks);
      }
    } catch (err) {
      console.error('Error loading checks:', err);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getCheckStats();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCheckSuccess = (result) => {
    setSuccessMessage('Verificação de antecedentes iniciada com sucesso!');
    setTimeout(() => setSuccessMessage(''), 5000);
    loadChecks();
    loadStats();
    setActiveTab('status');
    setSelectedCheckId(result.data.checkId);
  };

  const handleCheckError = (error) => {
    console.error('Background check error:', error);
  };

  const handleViewReport = (checkId) => {
    // Implementar visualização do relatório
    console.log('View report for check:', checkId);
  };

  const handleCancelCheck = async (checkId) => {
    // Implementar cancelamento da verificação
    console.log('Cancel check:', checkId);
  };

  const tabs = [
    { id: 'form', label: 'Nova Verificação', icon: PlusIcon },
    { id: 'status', label: 'Status', icon: ClockIcon },
    { id: 'history', label: 'Histórico', icon: ChartBarIcon }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'form':
        return (
          <BackgroundCheckForm
            userId={user?.id}
            onSuccess={handleCheckSuccess}
            onError={handleCheckError}
          />
        );
      
      case 'status':
        return (
          <BackgroundCheckStatus
            checkId={selectedCheckId}
            onViewReport={handleViewReport}
            onCancelCheck={handleCancelCheck}
          />
        );
      
      case 'history':
        return (
          <ChecksList>
            <h3>Histórico de Verificações</h3>
            {checks.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <ShieldCheckIcon width={32} height={32} />
                </EmptyIcon>
                <EmptyTitle>Nenhuma verificação encontrada</EmptyTitle>
                <EmptyDescription>
                  Você ainda não realizou nenhuma verificação de antecedentes.
                </EmptyDescription>
              </EmptyState>
            ) : (
              checks.map((check) => (
                <CheckItem key={check.checkId}>
                  <CheckInfo>
                    <CheckTitle>Verificação #{check.checkId.slice(-8)}</CheckTitle>
                    <CheckDate>{formatDate(check.createdAt)}</CheckDate>
                  </CheckInfo>
                  <CheckStatus status={check.status}>
                    {getStatusText(check.status)}
                  </CheckStatus>
                </CheckItem>
              ))
            )}
          </ChecksList>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <ShieldCheckIcon width={32} height={32} />
          Verificação de Antecedentes
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
          {stats && (
            <StatsCard>
              <StatsTitle>
                <ChartBarIcon width={20} height={20} />
                Estatísticas
              </StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>{stats.total || 0}</StatValue>
                  <StatLabel>Total</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.completed || 0}</StatValue>
                  <StatLabel>Concluídas</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.in_progress || 0}</StatValue>
                  <StatLabel>Em Andamento</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.failed || 0}</StatValue>
                  <StatLabel>Falharam</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsCard>
          )}

          {checks.length > 0 && (
            <StatsCard>
              <StatsTitle>Suas Verificações</StatsTitle>
              <div>
                {checks.slice(0, 3).map((check) => (
                  <div key={check.checkId} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '0.875rem' }}>
                      #{check.checkId.slice(-8)}
                    </span>
                    <CheckStatus status={check.status}>
                      {getStatusText(check.status)}
                    </CheckStatus>
                  </div>
                ))}
                {checks.length > 3 && (
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    textAlign: 'center',
                    margin: '0.5rem 0 0 0'
                  }}>
                    +{checks.length - 3} mais
                  </p>
                )}
              </div>
            </StatsCard>
          )}
        </Sidebar>
      </Content>
    </PageContainer>
  );
};

export default BackgroundCheck;
