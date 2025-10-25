import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChartBarIcon, 
  UsersIcon, 
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';
import useAnalytics from '../../hooks/useAnalytics';

const DashboardContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetricCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MetricTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const MetricIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primaryBackground};
  color: ${props => props.theme.colors.primary};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const ChartCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
`;

const ChartTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background-color: ${props => props.theme.colors.background};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
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

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
`;

const AnalyticsDashboard = ({ 
  startDate = null, 
  endDate = null,
  onDateRangeChange 
}) => {
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  
  const {
    isLoading,
    error,
    getConsolidatedMetrics,
    getGARealtime,
    clearError
  } = useAnalytics();

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
    loadRealtimeData();
  }, [dateRange]);

  const loadMetrics = async () => {
    try {
      const result = await getConsolidatedMetrics(startDate, endDate);
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const result = await getGARealtime();
      if (result.success) {
        setRealtimeData(result.data);
      }
    } catch (err) {
      console.error('Error loading realtime data:', err);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  };

  const getDateRangeLabel = (range) => {
    switch (range) {
      case '1d': return 'Último dia';
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '1y': return 'Último ano';
      default: return 'Personalizado';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (isLoading && !metrics) {
    return (
      <DashboardContainer>
        <LoadingSpinner />
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            ✕
          </button>
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>
          <ChartBarIcon width={24} height={24} />
          Dashboard de Analytics
        </Title>
        <DateRangeSelector>
          <Select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="1d">Último dia</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </Select>
        </DateRangeSelector>
      </Header>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricTitle>Usuários Ativos</MetricTitle>
            <MetricIcon>
              <UsersIcon width={16} height={16} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>
            {realtimeData?.activeUsers || '0'}
          </MetricValue>
          <MetricChange positive>
            <TrendingUpIcon width={14} height={14} />
            +12% vs ontem
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Visualizações</MetricTitle>
            <MetricIcon>
              <EyeIcon width={16} height={16} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>
            {formatNumber(metrics?.googleAnalytics?.totals?.[0]?.values?.[2] || 0)}
          </MetricValue>
          <MetricChange positive>
            <TrendingUpIcon width={14} height={14} />
            +8% vs período anterior
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Receita</MetricTitle>
            <MetricIcon>
              <CurrencyDollarIcon width={16} height={16} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>
            {formatCurrency(125000)}
          </MetricValue>
          <MetricChange positive>
            <TrendingUpIcon width={14} height={14} />
            +15% vs período anterior
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Tempo Médio</MetricTitle>
            <MetricIcon>
              <ClockIcon width={16} height={16} />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>
            3m 24s
          </MetricValue>
          <MetricChange positive>
            <TrendingUpIcon width={14} height={14} />
            +5% vs período anterior
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Usuários por Período</ChartTitle>
          <ChartPlaceholder>
            Gráfico de linha - Usuários ao longo do tempo
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Conversões por Fonte</ChartTitle>
          <ChartPlaceholder>
            Gráfico de pizza - Distribuição de conversões
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Funil de Conversão</ChartTitle>
          <ChartPlaceholder>
            Gráfico de funil - Etapas de conversão
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Segmentação de Usuários</ChartTitle>
          <ChartPlaceholder>
            Gráfico de barras - Usuários por tipo
          </ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
