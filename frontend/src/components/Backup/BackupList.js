import React from 'react';
import styled from 'styled-components';
import { 
  CloudArrowDownIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const ListContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BackupItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const BackupIcon = styled.div`
  color: ${props => {
    switch (props.type) {
      case 'FULL': return props.theme.colors.primary;
      case 'INCREMENTAL': return props.theme.colors.secondary;
      case 'TABLE': return props.theme.colors.warning;
      default: return props.theme.colors.gray400;
    }
  }};
  flex-shrink: 0;
`;

const BackupInfo = styled.div`
  flex-grow: 1;
`;

const BackupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BackupName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin: 0;
`;

const BackupType = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.type) {
      case 'FULL': return props.theme.colors.primaryLight;
      case 'INCREMENTAL': return props.theme.colors.secondaryLight;
      case 'TABLE': return props.theme.colors.warningLight;
      default: return props.theme.colors.gray200;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'FULL': return props.theme.colors.primaryDark;
      case 'INCREMENTAL': return props.theme.colors.secondaryDark;
      case 'TABLE': return props.theme.colors.warningDark;
      default: return props.theme.colors.gray600;
    }
  }};
`;

const BackupDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const BackupDetails = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.status) {
      case 'COMPLETED': return props.theme.colors.successLight;
      case 'VERIFIED': return props.theme.colors.successLight;
      case 'RESTORED': return props.theme.colors.infoLight;
      case 'CORRUPTED': return props.theme.colors.errorLight;
      case 'IN_PROGRESS': return props.theme.colors.warningLight;
      default: return props.theme.colors.gray200;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'COMPLETED': return props.theme.colors.successDark;
      case 'VERIFIED': return props.theme.colors.successDark;
      case 'RESTORED': return props.theme.colors.infoDark;
      case 'CORRUPTED': return props.theme.colors.errorDark;
      case 'IN_PROGRESS': return props.theme.colors.warningDark;
      default: return props.theme.colors.gray600;
    }
  }};
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.secondaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  padding: ${props => props.theme.spacing.lg};
`;

const getTypeIcon = (type) => {
  switch (type) {
    case 'FULL': return <CloudArrowDownIcon width={24} height={24} />;
    case 'INCREMENTAL': return <ArrowPathIcon width={24} height={24} />;
    case 'TABLE': return <DocumentIcon width={24} height={24} />;
    default: return <DocumentIcon width={24} height={24} />;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircleIcon width={16} height={16} />;
    case 'VERIFIED': return <CheckCircleIcon width={16} height={16} />;
    case 'RESTORED': return <ArrowPathIcon width={16} height={16} />;
    case 'CORRUPTED': return <ExclamationTriangleIcon width={16} height={16} />;
    case 'IN_PROGRESS': return <ClockIcon width={16} height={16} />;
    default: return <ClockIcon width={16} height={16} />;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const BackupList = ({ 
  backups, 
  onRestore, 
  onVerify, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <ListContainer>
        <Title>Backups</Title>
        <EmptyState>Carregando backups...</EmptyState>
      </ListContainer>
    );
  }

  if (!backups || backups.length === 0) {
    return (
      <ListContainer>
        <Title>Backups</Title>
        <EmptyState>Nenhum backup encontrado.</EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <Title>Backups ({backups.length})</Title>
      {backups.map((backup) => (
        <BackupItem key={backup.id}>
          <BackupIcon type={backup.type}>
            {getTypeIcon(backup.type)}
          </BackupIcon>
          
          <BackupInfo>
            <BackupHeader>
              <BackupName>{backup.fileName}</BackupName>
              <BackupType type={backup.type}>{backup.type}</BackupType>
            </BackupHeader>
            
            <BackupDescription>{backup.description}</BackupDescription>
            
            <BackupDetails>
              <span>{formatFileSize(backup.size)}</span>
              <span>•</span>
              <span>{new Date(backup.createdAt).toLocaleString()}</span>
              {backup.tables && backup.tables.length > 0 && (
                <>
                  <span>•</span>
                  <span>Tabelas: {backup.tables.join(', ')}</span>
                </>
              )}
            </BackupDetails>
          </BackupInfo>
          
          <StatusBadge status={backup.status}>
            {getStatusIcon(backup.status)}
            {backup.status}
          </StatusBadge>
          
          <ActionButton
            onClick={() => onRestore(backup.id)}
            disabled={backup.status !== 'COMPLETED' && backup.status !== 'VERIFIED'}
            primary
          >
            Restaurar
          </ActionButton>
          
          <ActionButton
            onClick={() => onVerify(backup.id)}
            disabled={isLoading}
          >
            Verificar
          </ActionButton>
        </BackupItem>
      ))}
    </ListContainer>
  );
};

export default BackupList;
