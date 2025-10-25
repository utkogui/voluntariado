import React from 'react';
import styled from 'styled-components';
import usePerformanceMonitoring from '../../hooks/usePerformanceMonitoring';
import HealthStatus from '../../components/PerformanceMonitoring/HealthStatus';
import MetricsDashboard from '../../components/PerformanceMonitoring/MetricsDashboard';
import AlertSettings from '../../components/PerformanceMonitoring/AlertSettings';

const PerformanceMonitoringContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const MainColumn = styled.div`
  flex: 2;
`;

const SidebarColumn = styled.div`
  flex: 1;
`;

const PerformanceMonitoring = () => {
  const {
    healthStatus,
    summaryMetrics,
    alerts,
    isLoading,
    error,
    updateAlertThresholds,
    resetMetrics,
    fetchAllData
  } = usePerformanceMonitoring();

  return (
    <PerformanceMonitoringContainer>
      <Header>
        <Title>Monitoramento de Performance</Title>
        <Subtitle>
          Acompanhe a saúde e performance do sistema em tempo real
        </Subtitle>
      </Header>

      <Content>
        <MainColumn>
          <HealthStatus 
            healthStatus={healthStatus} 
            isLoading={isLoading} 
          />
          <MetricsDashboard 
            summaryMetrics={summaryMetrics} 
            isLoading={isLoading} 
          />
        </MainColumn>
        
        <SidebarColumn>
          <AlertSettings
            onUpdateThresholds={updateAlertThresholds}
            onResetMetrics={resetMetrics}
            isLoading={isLoading}
            error={error}
          />
        </SidebarColumn>
      </Content>
    </PerformanceMonitoringContainer>
  );
};

export default PerformanceMonitoring;
