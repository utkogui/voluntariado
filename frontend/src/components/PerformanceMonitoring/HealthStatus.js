import React from 'react';
import styled from 'styled-components';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const StatusContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatusIcon = styled.div`
  color: ${props => {
    switch (props.status) {
      case 'HEALTHY': return props.theme.colors.success;
      case 'DEGRADED': return props.theme.colors.warning;
      case 'UNHEALTHY': return props.theme.colors.error;
      default: return props.theme.colors.gray400;
    }
  }};
`;

const StatusText = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.status) {
      case 'HEALTHY': return props.theme.colors.successLight;
      case 'DEGRADED': return props.theme.colors.warningLight;
      case 'UNHEALTHY': return props.theme.colors.errorLight;
      default: return props.theme.colors.gray200;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'HEALTHY': return props.theme.colors.successDark;
      case 'DEGRADED': return props.theme.colors.warningDark;
      case 'UNHEALTHY': return props.theme.colors.errorDark;
      default: return props.theme.colors.gray600;
    }
  }};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const AlertsList = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => {
    switch (props.severity) {
      case 'CRITICAL': return props.theme.colors.errorLight;
      case 'WARNING': return props.theme.colors.warningLight;
      default: return props.theme.colors.infoLight;
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'CRITICAL': return props.theme.colors.errorDark;
      case 'WARNING': return props.theme.colors.warningDark;
      default: return props.theme.colors.infoDark;
    }
  }};
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'HEALTHY': return <CheckCircleIcon width={24} height={24} />;
    case 'DEGRADED': return <ExclamationTriangleIcon width={24} height={24} />;
    case 'UNHEALTHY': return <XCircleIcon width={24} height={24} />;
    default: return <ClockIcon width={24} height={24} />;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'HEALTHY': return 'Sistema Saudável';
    case 'DEGRADED': return 'Sistema Degradado';
    case 'UNHEALTHY': return 'Sistema Instável';
    default: return 'Status Desconhecido';
  }
};

const HealthStatus = ({ healthStatus, isLoading }) => {
  if (isLoading) {
    return (
      <StatusContainer>
        <StatusHeader>
          <StatusIcon>
            <ClockIcon width={24} height={24} />
          </StatusIcon>
          <StatusText>Verificando Status...</StatusText>
        </StatusHeader>
      </StatusContainer>
    );
  }

  if (!healthStatus) {
    return (
      <StatusContainer>
        <StatusHeader>
          <StatusIcon>
            <XCircleIcon width={24} height={24} />
          </StatusIcon>
          <StatusText>Erro ao Carregar Status</StatusText>
        </StatusHeader>
      </StatusContainer>
    );
  }

  const { status, uptime, alerts = [] } = healthStatus;

  return (
    <StatusContainer>
      <StatusHeader>
        <StatusIcon status={status}>
          {getStatusIcon(status)}
        </StatusIcon>
        <StatusText>{getStatusText(status)}</StatusText>
        <StatusBadge status={status}>{status}</StatusBadge>
      </StatusHeader>

      <MetricsGrid>
        <MetricItem>
          <MetricValue>{Math.floor(uptime / 3600)}h</MetricValue>
          <MetricLabel>Tempo de Atividade</MetricLabel>
        </MetricItem>
        <MetricItem>
          <MetricValue>{alerts.length}</MetricValue>
          <MetricLabel>Alertas Ativos</MetricLabel>
        </MetricItem>
        <MetricItem>
          <MetricValue>{new Date(healthStatus.timestamp).toLocaleTimeString()}</MetricValue>
          <MetricLabel>Última Verificação</MetricLabel>
        </MetricItem>
      </MetricsGrid>

      {alerts.length > 0 && (
        <AlertsList>
          <h3>Alertas Ativos:</h3>
          {alerts.map((alert, index) => (
            <AlertItem key={index} severity={alert.severity}>
              <StatusIcon status={alert.severity === 'CRITICAL' ? 'UNHEALTHY' : 'DEGRADED'}>
                {alert.severity === 'CRITICAL' ? 
                  <XCircleIcon width={16} height={16} /> : 
                  <ExclamationTriangleIcon width={16} height={16} />
                }
              </StatusIcon>
              <div>
                <div><strong>{alert.type}</strong></div>
                <div>{alert.message}</div>
                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </AlertItem>
          ))}
        </AlertsList>
      )}
    </StatusContainer>
  );
};

export default HealthStatus;
