import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  PaperAirplaneIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import useSMS from '../../hooks/useSMS';

const FormContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryBackground};
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryBackground};
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryBackground};
  }
`;

const Button = styled.button`
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
  justify-content: center;
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

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.successBackground};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
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

const CharacterCount = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: right;
`;

const SMSForm = ({ 
  type = 'single', 
  onSuccess, 
  onError,
  initialData = {},
  isEmergency = false 
}) => {
  const [formData, setFormData] = useState({
    to: initialData.to || '',
    message: initialData.message || '',
    from: initialData.from || '',
    ...initialData
  });
  
  const [recipients, setRecipients] = useState(initialData.recipients || ['']);
  const [messageType, setMessageType] = useState(initialData.messageType || 'custom');
  
  const {
    isLoading,
    error,
    sendSMS,
    sendBulkSMS,
    sendVerificationSMS,
    sendActivityReminderSMS,
    sendApplicationConfirmationSMS,
    sendEmergencySMS,
    clearError
  } = useSMS();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const addRecipient = () => {
    setRecipients(prev => [...prev, '']);
  };

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      setRecipients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (isEmergency) {
        result = await sendEmergencySMS(formData.to, formData.message);
      } else {
        switch (messageType) {
          case 'verification':
            result = await sendVerificationSMS(formData.to, formData.verificationCode);
            break;
          case 'activity-reminder':
            result = await sendActivityReminderSMS(
              formData.to, 
              formData.activityName, 
              formData.activityDate, 
              formData.activityTime
            );
            break;
          case 'application-confirmation':
            result = await sendApplicationConfirmationSMS(
              formData.to, 
              formData.opportunityName, 
              formData.status
            );
            break;
          default:
            if (type === 'bulk') {
              const validRecipients = recipients.filter(r => r.trim() !== '');
              result = await sendBulkSMS(validRecipients, formData.message, formData.from);
            } else {
              result = await sendSMS(formData.to, formData.message, formData.from);
            }
        }
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Limpar formulário após sucesso
        if (type === 'bulk') {
          setRecipients(['']);
        } else {
          setFormData({ to: '', message: '', from: '' });
        }
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  const getMessagePlaceholder = () => {
    switch (messageType) {
      case 'verification':
        return 'Digite o código de verificação...';
      case 'activity-reminder':
        return 'Digite o nome da atividade...';
      case 'application-confirmation':
        return 'Digite o nome da oportunidade...';
      default:
        return 'Digite sua mensagem...';
    }
  };

  const getCharacterLimit = () => {
    return messageType === 'verification' ? 8 : 1600;
  };

  const getCharacterCount = () => {
    if (messageType === 'verification') {
      return formData.verificationCode?.length || 0;
    }
    return formData.message?.length || 0;
  };

  const isOverLimit = () => {
    return getCharacterCount() > getCharacterLimit();
  };

  return (
    <FormContainer>
      <Header>
        {isEmergency ? (
          <ExclamationTriangleIcon width={24} height={24} />
        ) : (
          <ChatBubbleLeftRightIcon width={24} height={24} />
        )}
        <Title>
          {isEmergency ? 'SMS de Emergência' : 
           type === 'bulk' ? 'Enviar SMS em Massa' : 'Enviar SMS'}
        </Title>
      </Header>

      {error && (
        <ErrorMessage>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </ErrorMessage>
      )}

      <Form onSubmit={handleSubmit}>
        {type === 'bulk' ? (
          <FormGroup>
            <Label>Destinatários</Label>
            {recipients.map((recipient, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Input
                  type="tel"
                  value={recipient}
                  onChange={(e) => handleRecipientChange(index, e.target.value)}
                  placeholder="+5511999999999"
                  required
                />
                {recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="error"
                    onClick={() => removeRecipient(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="primary"
              onClick={addRecipient}
            >
              + Adicionar destinatário
            </Button>
          </FormGroup>
        ) : (
          <FormGroup>
            <Label>Número de telefone</Label>
            <Input
              type="tel"
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="+5511999999999"
              required
            />
          </FormGroup>
        )}

        {!isEmergency && (
          <FormGroup>
            <Label>Tipo de mensagem</Label>
            <Select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            >
              <option value="custom">Personalizada</option>
              <option value="verification">Verificação</option>
              <option value="activity-reminder">Lembrete de atividade</option>
              <option value="application-confirmation">Confirmação de candidatura</option>
            </Select>
          </FormGroup>
        )}

        {messageType === 'verification' && (
          <FormGroup>
            <Label>Código de verificação</Label>
            <Input
              type="text"
              value={formData.verificationCode || ''}
              onChange={(e) => handleInputChange('verificationCode', e.target.value)}
              placeholder="123456"
              maxLength={8}
              required
            />
          </FormGroup>
        )}

        {messageType === 'activity-reminder' && (
          <>
            <FormGroup>
              <Label>Nome da atividade</Label>
              <Input
                type="text"
                value={formData.activityName || ''}
                onChange={(e) => handleInputChange('activityName', e.target.value)}
                placeholder="Nome da atividade"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Data da atividade</Label>
              <Input
                type="date"
                value={formData.activityDate || ''}
                onChange={(e) => handleInputChange('activityDate', e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Horário da atividade</Label>
              <Input
                type="time"
                value={formData.activityTime || ''}
                onChange={(e) => handleInputChange('activityTime', e.target.value)}
                required
              />
            </FormGroup>
          </>
        )}

        {messageType === 'application-confirmation' && (
          <>
            <FormGroup>
              <Label>Nome da oportunidade</Label>
              <Input
                type="text"
                value={formData.opportunityName || ''}
                onChange={(e) => handleInputChange('opportunityName', e.target.value)}
                placeholder="Nome da oportunidade"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Status da candidatura</Label>
              <Select
                value={formData.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                required
              >
                <option value="">Selecione o status</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Rejeitada</option>
                <option value="pending">Pendente</option>
              </Select>
            </FormGroup>
          </>
        )}

        {(messageType === 'custom' || isEmergency) && (
          <FormGroup>
            <Label>Mensagem</Label>
            <TextArea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={getMessagePlaceholder()}
              maxLength={getCharacterLimit()}
              required
            />
            <CharacterCount style={{ color: isOverLimit() ? '#ef4444' : undefined }}>
              {getCharacterCount()}/{getCharacterLimit()}
            </CharacterCount>
          </FormGroup>
        )}

        <FormGroup>
          <Label>Número remetente (opcional)</Label>
          <Input
            type="tel"
            value={formData.from}
            onChange={(e) => handleInputChange('from', e.target.value)}
            placeholder="+5511888888888"
          />
        </FormGroup>

        <Button
          type="submit"
          variant={isEmergency ? 'error' : 'primary'}
          disabled={isLoading || isOverLimit()}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <PaperAirplaneIcon width={16} height={16} />
          )}
          {isLoading ? 'Enviando...' : 
           isEmergency ? 'Enviar SMS de Emergência' : 'Enviar SMS'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default SMSForm;
