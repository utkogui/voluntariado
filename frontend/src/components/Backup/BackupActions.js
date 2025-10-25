import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  CloudArrowDownIcon, 
  ArrowPathIcon, 
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ActionsContainer = styled.div`
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

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const ActionCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ActionIcon = styled.div`
  color: ${props => props.theme.colors.primary};
`;

const ActionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin: 0;
`;

const ActionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(${props => props.theme.colors.primaryRGB}, 0.2);
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(${props => props.theme.colors.primaryRGB}, 0.2);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin: 0;
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.success ? props.theme.colors.successLight : props.theme.colors.errorLight};
  color: ${props => props.success ? props.theme.colors.successDark : props.theme.colors.errorDark};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const BackupActions = ({ 
  onCreateFullBackup,
  onCreateIncrementalBackup,
  onCreateTableBackup,
  onScheduleAutomaticBackup,
  isLoading,
  error
}) => {
  const [fullBackupDesc, setFullBackupDesc] = useState('');
  const [incrementalBackupDesc, setIncrementalBackupDesc] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [tableBackupDesc, setTableBackupDesc] = useState('');
  const [intervalHours, setIntervalHours] = useState(24);
  const [message, setMessage] = useState(null);

  // Tabelas disponíveis para backup
  const availableTables = [
    'User', 'Institution', 'Opportunity', 'Activity', 'Participation',
    'Evaluation', 'Message', 'Conversation', 'Donation', 'Report'
  ];

  const handleTableChange = (tableName, checked) => {
    if (checked) {
      setSelectedTables([...selectedTables, tableName]);
    } else {
      setSelectedTables(selectedTables.filter(t => t !== tableName));
    }
  };

  const handleFullBackup = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      await onCreateFullBackup(fullBackupDesc || 'Backup completo manual');
      setMessage({ text: 'Backup completo criado com sucesso!', success: true });
      setFullBackupDesc('');
    } catch (error) {
      setMessage({ text: `Erro ao criar backup: ${error.message}`, success: false });
    }
  };

  const handleIncrementalBackup = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      await onCreateIncrementalBackup(incrementalBackupDesc || 'Backup incremental manual');
      setMessage({ text: 'Backup incremental criado com sucesso!', success: true });
      setIncrementalBackupDesc('');
    } catch (error) {
      setMessage({ text: `Erro ao criar backup: ${error.message}`, success: false });
    }
  };

  const handleTableBackup = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (selectedTables.length === 0) {
      setMessage({ text: 'Selecione pelo menos uma tabela', success: false });
      return;
    }
    
    try {
      await onCreateTableBackup(selectedTables, tableBackupDesc || 'Backup de tabelas');
      setMessage({ text: 'Backup de tabelas criado com sucesso!', success: true });
      setTableBackupDesc('');
      setSelectedTables([]);
    } catch (error) {
      setMessage({ text: `Erro ao criar backup: ${error.message}`, success: false });
    }
  };

  const handleScheduleAutomatic = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      await onScheduleAutomaticBackup(intervalHours);
      setMessage({ text: 'Backup automático agendado com sucesso!', success: true });
    } catch (error) {
      setMessage({ text: `Erro ao agendar backup: ${error.message}`, success: false });
    }
  };

  return (
    <ActionsContainer>
      <Title>Ações de Backup</Title>
      
      <ActionsGrid>
        {/* Backup Completo */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <CloudArrowDownIcon width={20} height={20} />
            </ActionIcon>
            <ActionTitle>Backup Completo</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Cria um backup completo de todo o banco de dados.
          </ActionDescription>
          <Form onSubmit={handleFullBackup}>
            <Input
              type="text"
              placeholder="Descrição do backup (opcional)"
              value={fullBackupDesc}
              onChange={(e) => setFullBackupDesc(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Backup Completo'}
              {!isLoading && <CloudArrowDownIcon width={16} height={16} />}
            </Button>
          </Form>
        </ActionCard>

        {/* Backup Incremental */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <ArrowPathIcon width={20} height={20} />
            </ActionIcon>
            <ActionTitle>Backup Incremental</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Cria um backup apenas dos dados modificados desde o último backup.
          </ActionDescription>
          <Form onSubmit={handleIncrementalBackup}>
            <Input
              type="text"
              placeholder="Descrição do backup (opcional)"
              value={incrementalBackupDesc}
              onChange={(e) => setIncrementalBackupDesc(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Backup Incremental'}
              {!isLoading && <ArrowPathIcon width={16} height={16} />}
            </Button>
          </Form>
        </ActionCard>

        {/* Backup de Tabelas */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <DocumentIcon width={20} height={20} />
            </ActionIcon>
            <ActionTitle>Backup de Tabelas</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Cria um backup de tabelas específicas.
          </ActionDescription>
          <Form onSubmit={handleTableBackup}>
            <CheckboxGroup>
              {availableTables.map(table => (
                <CheckboxItem key={table}>
                  <Checkbox
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={(e) => handleTableChange(table, e.target.checked)}
                  />
                  {table}
                </CheckboxItem>
              ))}
            </CheckboxGroup>
            <Input
              type="text"
              placeholder="Descrição do backup (opcional)"
              value={tableBackupDesc}
              onChange={(e) => setTableBackupDesc(e.target.value)}
            />
            <Button type="submit" disabled={isLoading || selectedTables.length === 0}>
              {isLoading ? 'Criando...' : 'Criar Backup de Tabelas'}
              {!isLoading && <DocumentIcon width={16} height={16} />}
            </Button>
          </Form>
        </ActionCard>

        {/* Agendamento Automático */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon>
              <ClockIcon width={20} height={20} />
            </ActionIcon>
            <ActionTitle>Backup Automático</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Agenda backups incrementais automáticos.
          </ActionDescription>
          <Form onSubmit={handleScheduleAutomatic}>
            <Select
              value={intervalHours}
              onChange={(e) => setIntervalHours(parseInt(e.target.value))}
            >
              <option value={1}>A cada 1 hora</option>
              <option value={6}>A cada 6 horas</option>
              <option value={12}>A cada 12 horas</option>
              <option value={24}>A cada 24 horas</option>
              <option value={168}>A cada semana</option>
            </Select>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Agendando...' : 'Agendar Backup Automático'}
              {!isLoading && <ClockIcon width={16} height={16} />}
            </Button>
          </Form>
        </ActionCard>
      </ActionsGrid>

      {message && (
        <Message success={message.success}>
          {message.success ? (
            <CheckCircleIcon width={16} height={16} />
          ) : (
            <ArrowPathIcon width={16} height={16} />
          )}
          {message.text}
        </Message>
      )}

      {error && (
        <Message success={false}>
          <ArrowPathIcon width={16} height={16} />
          {error}
        </Message>
      )}
    </ActionsContainer>
  );
};

export default BackupActions;
