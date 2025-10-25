import React from 'react';
import styled from 'styled-components';
import useBackup from '../../hooks/useBackup';
import BackupList from '../../components/Backup/BackupList';
import BackupActions from '../../components/Backup/BackupActions';

const BackupContainer = styled.div`
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

const Backup = () => {
  const {
    backups,
    stats,
    isLoading,
    error,
    createFullBackup,
    createIncrementalBackup,
    createTableBackup,
    restoreBackup,
    verifyBackup,
    scheduleAutomaticBackup
  } = useBackup();

  return (
    <BackupContainer>
      <Header>
        <Title>Gerenciamento de Backup</Title>
        <Subtitle>
          Crie, gerencie e restaure backups do banco de dados
        </Subtitle>
      </Header>

      <Content>
        <MainColumn>
          <BackupList
            backups={backups}
            onRestore={restoreBackup}
            onVerify={verifyBackup}
            isLoading={isLoading}
          />
        </MainColumn>
        
        <SidebarColumn>
          <BackupActions
            onCreateFullBackup={createFullBackup}
            onCreateIncrementalBackup={createIncrementalBackup}
            onCreateTableBackup={createTableBackup}
            onScheduleAutomaticBackup={scheduleAutomaticBackup}
            isLoading={isLoading}
            error={error}
          />
        </SidebarColumn>
      </Content>
    </BackupContainer>
  );
};

export default Backup;
