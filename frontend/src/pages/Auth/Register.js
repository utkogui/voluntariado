import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { setAlert } from '../../store/slices/uiSlice';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  padding: ${props => props.theme.spacing.lg};
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing['2xl']};
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: ${props => props.theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  margin: 0 auto ${props => props.theme.spacing.md} auto;
`;

const LogoText = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const WelcomeText = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: ${props => props.theme.spacing.sm} 0 0 0;
`;

const UserTypeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.gray100};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const UserTypeButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.selected ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.selected ? 'white' : props.theme.colors.gray700};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.selected ? props.theme.colors.primaryDark : props.theme.colors.gray200};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.fullWidth && 'grid-column: 1 / -1;'}
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-right: ${props => props.hasIcon ? props.theme.spacing['2xl'] : props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? props.theme.colors.error : props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.gray700};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const PasswordRequirements = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.valid ? props.theme.colors.success : props.theme.colors.gray500};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CheckIconStyled = styled(CheckIcon)`
  width: 12px;
  height: 12px;
  flex-shrink: 0;
`;

const ErrorMessage = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.error};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.disabled ? props.theme.colors.gray300 : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${props => props.theme.colors.border};
  }
`;

const DividerText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray500};
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const LinkText = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-decoration: none;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: searchParams.get('type') || 'VOLUNTEER',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const userTypes = [
    { value: 'VOLUNTEER', label: 'Voluntário' },
    { value: 'INSTITUTION', label: 'Instituição' },
    { value: 'COMPANY', label: 'Empresa' },
    { value: 'UNIVERSITY', label: 'Universidade' }
  ];

  const passwordRequirements = [
    { text: 'Pelo menos 8 caracteres', valid: formData.password.length >= 8 },
    { text: 'Pelo menos uma letra maiúscula', valid: /[A-Z]/.test(formData.password) },
    { text: 'Pelo menos uma letra minúscula', valid: /[a-z]/.test(formData.password) },
    { text: 'Pelo menos um número', valid: /\d/.test(formData.password) },
    { text: 'Pelo menos um caractere especial', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(req => req.valid);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!allPasswordRequirementsMet) {
      newErrors.password = 'Senha não atende aos requisitos';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(loginStart());
    
    try {
      // Simular chamada à API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess(data));
        dispatch(setAlert({
          message: 'Conta criada com sucesso!',
          type: 'success'
        }));
        navigate('/');
      } else {
        dispatch(loginFailure(data.message || 'Erro ao criar conta'));
        dispatch(setAlert({
          message: data.message || 'Erro ao criar conta',
          type: 'error'
        }));
      }
    } catch (error) {
      dispatch(loginFailure('Erro de conexão'));
      dispatch(setAlert({
        message: 'Erro de conexão. Tente novamente.',
        type: 'error'
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <LogoIcon>V</LogoIcon>
          <LogoText>Voluntariado</LogoText>
          <WelcomeText>Crie sua conta</WelcomeText>
        </Logo>

        <UserTypeSelector>
          {userTypes.map((type) => (
            <UserTypeButton
              key={type.value}
              type="button"
              selected={formData.userType === type.value}
              onClick={() => handleChange({ target: { name: 'userType', value: type.value } })}
              disabled={isLoading}
            >
              {type.label}
            </UserTypeButton>
          ))}
        </UserTypeSelector>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                error={!!errors.name}
                disabled={isLoading}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                error={!!errors.phone}
                disabled={isLoading}
              />
              {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              error={!!errors.email}
              disabled={isLoading}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="password">Senha</Label>
              <InputContainer>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Sua senha"
                  hasIcon
                  error={!!errors.password}
                  disabled={isLoading}
                />
                <PasswordToggle
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeSlashIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </PasswordToggle>
              </InputContainer>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              
              {formData.password && (
                <PasswordRequirements>
                  {passwordRequirements.map((req, index) => (
                    <RequirementItem key={index} valid={req.valid}>
                      <CheckIconStyled />
                      {req.text}
                    </RequirementItem>
                  ))}
                </PasswordRequirements>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <InputContainer>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme sua senha"
                  hasIcon
                  error={!!errors.confirmPassword}
                  disabled={isLoading}
                />
                <PasswordToggle
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </PasswordToggle>
              </InputContainer>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>
                Eu aceito os{' '}
                <StyledLink to="/terms" target="_blank">
                  Termos de Uso
                </StyledLink>
                {' '}e a{' '}
                <StyledLink to="/privacy" target="_blank">
                  Política de Privacidade
                </StyledLink>
              </span>
            </label>
            {errors.acceptTerms && <ErrorMessage>{errors.acceptTerms}</ErrorMessage>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading || !allPasswordRequirementsMet}>
            {isLoading ? <LoadingSpinner /> : 'Criar conta'}
          </SubmitButton>
        </Form>

        <Divider>
          <DividerText>ou</DividerText>
        </Divider>

        <LinkContainer>
          <LinkText>
            Já tem uma conta?{' '}
            <StyledLink to="/login">
              Faça login aqui
            </StyledLink>
          </LinkText>
        </LinkContainer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
