import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
`;

const MetricCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ChartCard = styled(MetricCard)`
  grid-column: span 2;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-column: span 1;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const Value = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const Label = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const MetricsDashboard = ({ summaryMetrics, isLoading }) => {
  if (isLoading) {
    return (
      <DashboardContainer>
        <MetricCard>
          <CardTitle>Carregando Métricas...</CardTitle>
        </MetricCard>
      </DashboardContainer>
    );
  }

  if (!summaryMetrics) {
    return (
      <DashboardContainer>
        <MetricCard>
          <CardTitle>Erro ao Carregar Métricas</CardTitle>
        </MetricCard>
      </DashboardContainer>
    );
  }

  const { requests, system, database, errors } = summaryMetrics;

  // Dados para gráfico de tempo de resposta
  const responseTimeData = {
    labels: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m'],
    datasets: [
      {
        label: 'Tempo de Resposta (ms)',
        data: Array.from({ length: 10 }, () => Math.random() * requests.averageResponseTime * 1.5),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Dados para gráfico de uso de recursos
  const resourceUsageData = {
    labels: ['CPU', 'Memória'],
    datasets: [
      {
        label: 'Uso de Recursos (%)',
        data: [system.cpuUsage, system.memoryUsage],
        backgroundColor: [
          system.cpuUsage > 80 ? '#EF4444' : system.cpuUsage > 60 ? '#F59E0B' : '#10B981',
          system.memoryUsage > 80 ? '#EF4444' : system.memoryUsage > 60 ? '#F59E0B' : '#10B981',
        ],
        borderColor: [
          system.cpuUsage > 80 ? '#DC2626' : system.cpuUsage > 60 ? '#D97706' : '#059669',
          system.memoryUsage > 80 ? '#DC2626' : system.memoryUsage > 60 ? '#D97706' : '#059669',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <DashboardContainer>
      {/* Métricas de Requisições */}
      <MetricCard>
        <CardTitle>Requisições</CardTitle>
        <MetricsGrid>
          <MetricItem>
            <Value>{requests.total}</Value>
            <Label>Total</Label>
          </MetricItem>
          <MetricItem>
            <Value>{requests.successRate}%</Value>
            <Label>Taxa de Sucesso</Label>
          </MetricItem>
          <MetricItem>
            <Value>{requests.averageResponseTime}ms</Value>
            <Label>Tempo Médio</Label>
          </MetricItem>
          <MetricItem>
            <Value>{requests.errorRate}%</Value>
            <Label>Taxa de Erro</Label>
          </MetricItem>
        </MetricsGrid>
      </MetricCard>

      {/* Métricas do Sistema */}
      <MetricCard>
        <CardTitle>Sistema</CardTitle>
        <MetricsGrid>
          <MetricItem>
            <Value>{system.cpuUsage}%</Value>
            <Label>CPU</Label>
          </MetricItem>
          <MetricItem>
            <Value>{system.memoryUsage}%</Value>
            <Label>Memória</Label>
          </MetricItem>
          <MetricItem>
            <Value>{Math.floor(system.uptime / 3600)}h</Value>
            <Label>Uptime</Label>
          </MetricItem>
        </MetricsGrid>
      </MetricCard>

      {/* Métricas do Banco de Dados */}
      <MetricCard>
        <CardTitle>Banco de Dados</CardTitle>
        <MetricsGrid>
          <MetricItem>
            <Value>{database.queryCount}</Value>
            <Label>Queries</Label>
          </MetricItem>
          <MetricItem>
            <Value>{database.averageQueryTime}ms</Value>
            <Label>Tempo Médio</Label>
          </MetricItem>
          <MetricItem>
            <Value>{database.slowQueries}</Value>
            <Label>Queries Lentas</Label>
          </MetricItem>
        </MetricsGrid>
      </MetricCard>

      {/* Métricas de Erros */}
      <MetricCard>
        <CardTitle>Erros</CardTitle>
        <MetricsGrid>
          <MetricItem>
            <Value>{errors.total}</Value>
            <Label>Total</Label>
          </MetricItem>
          <MetricItem>
            <Value>{errors.recentCount}</Value>
            <Label>Recentes</Label>
          </MetricItem>
        </MetricsGrid>
      </MetricCard>

      {/* Gráfico de Tempo de Resposta */}
      <ChartCard>
        <CardTitle>Tempo de Resposta</CardTitle>
        <Line data={responseTimeData} options={chartOptions} />
      </ChartCard>

      {/* Gráfico de Uso de Recursos */}
      <ChartCard>
        <CardTitle>Uso de Recursos do Sistema</CardTitle>
        <Bar data={resourceUsageData} options={chartOptions} />
      </ChartCard>
    </DashboardContainer>
  );
};

export default MetricsDashboard;
