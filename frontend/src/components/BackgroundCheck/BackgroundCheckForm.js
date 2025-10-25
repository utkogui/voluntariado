import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  ShieldCheckIcon, 
  UserIcon, 
  CalendarIcon,
  IdentificationIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import useBackgroundCheck from '../../hooks/useBackgroundCheck';

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
  gap: ${props => props.theme.spacing.lg};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
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

const ConsentSection = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
`;

const ConsentText = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const BackgroundCheckForm = ({ 
  userId, 
  onSuccess, 
  onError,
  initialData = {} 
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    socialSecurityNumber: initialData.socialSecurityNumber || '',
    address: initialData.address || '',
    phoneNumber: initialData.phoneNumber || '',
    email: initialData.email || '',
    checkTypes: initialData.checkTypes || ['criminal', 'identity'],
    consent: false,
    ...initialData
  });
  
  const {
    isLoading,
    error,
    initiateBackgroundCheck,
    clearError
  } = useBackgroundCheck();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert('Você deve concordar com os termos para prosseguir');
      return;
    }
    
    try {
      const result = await initiateBackgroundCheck(userId, formData);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        if (onError) {
          onError(result);
        }
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  const checkTypes = [
    { value: 'criminal', label: 'Verificação Criminal' },
    { value: 'identity', label: 'Verificação de Identidade' },
    { value: 'employment', label: 'Histórico de Emprego' },
    { value: 'education', label: 'Verificação Educacional' },
    { value: 'reference', label: 'Verificação de Referências' }
  ];

  return (
    <FormContainer>
      <Header>
        <ShieldCheckIcon width={24} height={24} />
        <Title>Verificação de Antecedentes</Title>
      </Header>

      {error && (
        <ErrorMessage>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </ErrorMessage>
      )}

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>
            <UserIcon width={20} height={20} />
            Informações Pessoais
          </SectionTitle>
          
          <FormGrid>
            <FormGroup>
              <Label>
                <UserIcon width={16} height={16} />
                Nome Completo
              </Label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <CalendarIcon width={16} height={16} />
                Data de Nascimento
              </Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <IdentificationIcon width={16} height={16} />
                CPF
              </Label>
              <Input
                type="text"
                value={formData.socialSecurityNumber}
                onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
                placeholder="000.000.000-00"
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <EnvelopeIcon width={16} height={16} />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <PhoneIcon width={16} height={16} />
                Telefone
              </Label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+5511999999999"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <HomeIcon width={16} height={16} />
                Endereço
              </Label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade, estado"
                required
              />
            </FormGroup>
          </FormGrid>
        </Section>

        <Section>
          <SectionTitle>
            <ShieldCheckIcon width={20} height={20} />
            Tipos de Verificação
          </SectionTitle>
          
          <CheckboxGroup>
            {checkTypes.map(type => (
              <CheckboxItem key={type.value}>
                <Checkbox
                  type="checkbox"
                  checked={formData.checkTypes.includes(type.value)}
                  onChange={() => handleCheckboxChange('checkTypes', type.value)}
                />
                {type.label}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </Section>

        <ConsentSection>
          <ConsentText>
            <strong>Consentimento para Verificação de Antecedentes</strong>
            <br />
            Ao marcar esta opção, você concorda em permitir que nossa plataforma realize uma verificação de antecedentes 
            para fins de segurança e adequação para atividades de voluntariado. Suas informações pessoais serão tratadas 
            com confidencialidade e utilizadas exclusivamente para este propósito.
            <br />
            <br />
            A verificação pode incluir consulta a bases de dados criminais, verificação de identidade, histórico de 
            emprego e outras verificações necessárias conforme selecionado acima.
          </ConsentText>
          
          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => handleInputChange('consent', e.target.checked)}
              required
            />
            Eu concordo com os termos e autorizo a verificação de antecedentes
          </CheckboxItem>
        </ConsentSection>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !formData.consent}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ShieldCheckIcon width={16} height={16} />
          )}
          {isLoading ? 'Iniciando verificação...' : 'Iniciar Verificação'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default BackgroundCheckForm;
