import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const SettingsContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.base};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(${props => props.theme.colors.primaryRGB}, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  grid-column: 1 / -1;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.base};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.secondaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-top: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.success ? props.theme.colors.successLight : props.theme.colors.errorLight};
  color: ${props => props.success ? props.theme.colors.successDark : props.theme.colors.errorDark};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const AlertSettings = ({ 
  onUpdateThresholds, 
  onResetMetrics, 
  isLoading, 
  error 
}) => {
  const [thresholds, setThresholds] = useState({
    responseTime: 5000,
    cpuUsage: 80,
    memoryUsage: 85,
    errorRate: 5
  });

  const [message, setMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setThresholds(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      await onUpdateThresholds(thresholds);
      setMessage({ text: 'Limites de alerta atualizados com sucesso!', success: true });
    } catch (error) {
      setMessage({ text: `Erro ao atualizar limites: ${error.message}`, success: false });
    }
  };

  const handleReset = async () => {
    setMessage(null);
    
    try {
      await onResetMetrics();
      setMessage({ text: 'Métricas resetadas com sucesso!', success: true });
    } catch (error) {
      setMessage({ text: `Erro ao resetar métricas: ${error.message}`, success: false });
    }
  };

  return (
    <SettingsContainer>
      <Title>
        <ExclamationTriangleIcon width={24} height={24} />
        Configurações de Alertas
      </Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="responseTime">Tempo de Resposta (ms)</Label>
          <Input
            id="responseTime"
            type="number"
            value={thresholds.responseTime}
            onChange={(e) => handleInputChange('responseTime', e.target.value)}
            min="1000"
            max="30000"
            step="500"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="cpuUsage">Uso de CPU (%)</Label>
          <Input
            id="cpuUsage"
            type="number"
            value={thresholds.cpuUsage}
            onChange={(e) => handleInputChange('cpuUsage', e.target.value)}
            min="50"
            max="100"
            step="5"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="memoryUsage">Uso de Memória (%)</Label>
          <Input
            id="memoryUsage"
            type="number"
            value={thresholds.memoryUsage}
            onChange={(e) => handleInputChange('memoryUsage', e.target.value)}
            min="50"
            max="100"
            step="5"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="errorRate">Taxa de Erro (%)</Label>
          <Input
            id="errorRate"
            type="number"
            value={thresholds.errorRate}
            onChange={(e) => handleInputChange('errorRate', e.target.value)}
            min="1"
            max="50"
            step="1"
          />
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" primary disabled={isLoading}>
            {isLoading ? 'Atualizando...' : 'Atualizar Limites'}
            {!isLoading && <CheckCircleIcon width={20} height={20} />}
          </Button>
          
          <Button type="button" onClick={handleReset} disabled={isLoading}>
            {isLoading ? 'Resetando...' : 'Resetar Métricas'}
            {!isLoading && <ArrowPathIcon width={20} height={20} />}
          </Button>
        </ButtonGroup>
      </Form>

      {message && (
        <Message success={message.success}>
          {message.success ? (
            <CheckCircleIcon width={16} height={16} />
          ) : (
            <ExclamationTriangleIcon width={16} height={16} />
          )}
          {message.text}
        </Message>
      )}

      {error && (
        <Message success={false}>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </Message>
      )}
    </SettingsContainer>
  );
};

export default AlertSettings;
