import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import useBackgroundCheck from '../../hooks/useBackgroundCheck';

const StatusContainer = styled.div`
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

const RefreshButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
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

const StatusCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
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

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const StatusDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  margin: ${props => props.theme.spacing.sm} 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const DetailValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
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

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BackgroundCheckStatus = ({ 
  checkId, 
  onViewReport, 
  onCancelCheck,
  autoRefresh = true 
}) => {
  const [status, setStatus] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  
  const {
    isLoading,
    error,
    getCheckStatus,
    checkVolunteerEligibility,
    clearError
  } = useBackgroundCheck();

  // Carregar status inicial
  useEffect(() => {
    if (checkId) {
      loadStatus();
    }
  }, [checkId]);

  // Auto-refresh se estiver em progresso
  useEffect(() => {
    if (autoRefresh && status?.status === 'in_progress') {
      const interval = setInterval(() => {
        loadStatus();
      }, 30000); // Atualizar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [status?.status, autoRefresh]);

  const loadStatus = async () => {
    try {
      const result = await getCheckStatus(checkId);
      if (result.success) {
        setStatus(result.data);
        
        // Se completado, verificar elegibilidade
        if (result.data.status === 'completed') {
          const eligibilityResult = await checkVolunteerEligibility(checkId);
          if (eligibilityResult.success) {
            setEligibility(eligibilityResult.data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon width={20} height={20} />;
      case 'in_progress':
        return <ClockIcon width={20} height={20} />;
      case 'failed':
        return <XCircleIcon width={20} height={20} />;
      case 'pending':
        return <ClockIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'completed': return 'A verificação foi concluída com sucesso';
      case 'in_progress': return 'A verificação está sendo processada';
      case 'failed': return 'Houve um erro durante a verificação';
      case 'pending': return 'A verificação está aguardando processamento';
      default: return 'Status desconhecido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !status) {
    return (
      <StatusContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
        </div>
      </StatusContainer>
    );
  }

  if (error) {
    return (
      <StatusContainer>
        <ErrorMessage>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </ErrorMessage>
      </StatusContainer>
    );
  }

  if (!status) {
    return (
      <StatusContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhuma verificação encontrada</p>
        </div>
      </StatusContainer>
    );
  }

  return (
    <StatusContainer>
      <Header>
        <Title>
          <ShieldCheckIcon width={24} height={24} />
          Status da Verificação
        </Title>
        <RefreshButton onClick={loadStatus} disabled={isLoading}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <RefreshIcon width={16} height={16} />
          )}
          Atualizar
        </RefreshButton>
      </Header>

      <StatusCard>
        <StatusHeader>
          <StatusIcon status={status.status}>
            {getStatusIcon(status.status)}
          </StatusIcon>
          <StatusInfo>
            <StatusTitle>{getStatusText(status.status)}</StatusTitle>
            <StatusDescription>{getStatusDescription(status.status)}</StatusDescription>
          </StatusInfo>
        </StatusHeader>

        {status.status === 'in_progress' && status.progress !== undefined && (
          <ProgressBar>
            <ProgressFill progress={status.progress} />
          </ProgressBar>
        )}

        <DetailsGrid>
          <DetailItem>
            <DetailLabel>ID da Verificação</DetailLabel>
            <DetailValue>{status.checkId}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Progresso</DetailLabel>
            <DetailValue>{status.progress || 0}%</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Iniciada em</DetailLabel>
            <DetailValue>{formatDate(status.createdAt)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Concluída em</DetailLabel>
            <DetailValue>{formatDate(status.completedAt)}</DetailValue>
          </DetailItem>
        </DetailsGrid>

        {eligibility && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: eligibility.eligible ? '#10b981' : '#ef4444' }}>
              Elegibilidade: {eligibility.eligible ? 'Aprovado' : 'Reprovado'}
            </h4>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Nível de Risco: {eligibility.riskLevel}
            </p>
            {eligibility.reasons && eligibility.reasons.length > 0 && (
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>Motivos:</p>
                <ul style={{ margin: '0', paddingLeft: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  {eligibility.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {status.status === 'completed' && onViewReport && (
            <ActionButton variant="primary" onClick={() => onViewReport(status.checkId)}>
              <EyeIcon width={16} height={16} />
              Ver Relatório
            </ActionButton>
          )}
          
          {(status.status === 'pending' || status.status === 'in_progress') && onCancelCheck && (
            <ActionButton variant="error" onClick={() => onCancelCheck(status.checkId)}>
              <XCircleIcon width={16} height={16} />
              Cancelar
            </ActionButton>
          )}
        </div>
      </StatusCard>
    </StatusContainer>
  );
};

export default BackgroundCheckStatus;
