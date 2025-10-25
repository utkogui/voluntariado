import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { EyeIcon, EyeSlashIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { setAlert } from '../../store/slices/uiSlice';

const ResetPasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  padding: ${props => props.theme.spacing.lg};
`;

const ResetPasswordCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing['2xl']};
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.gray600};
  text-decoration: none;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
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

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  text-align: center;
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing['2xl']} 0;
  text-align: center;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
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

const FieldError = styled.span`
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

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.success}10;
  border: 1px solid ${props => props.theme.colors.success}30;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${props => props.theme.colors.success}20;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.success};
  margin: 0 auto ${props => props.theme.spacing.md} auto;
`;

const SuccessTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const SuccessDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
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

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenError, setTokenError] = useState('');

  const passwordRequirements = [
    { text: 'Pelo menos 8 caracteres', valid: formData.password.length >= 8 },
    { text: 'Pelo menos uma letra maiúscula', valid: /[A-Z]/.test(formData.password) },
    { text: 'Pelo menos uma letra minúscula', valid: /[a-z]/.test(formData.password) },
    { text: 'Pelo menos um número', valid: /\d/.test(formData.password) },
    { text: 'Pelo menos um caractere especial', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(req => req.valid);

  useEffect(() => {
    // Verificar se o token é válido
    if (!token) {
      setTokenError('Token de redefinição inválido ou expirado');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular chamada à API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        dispatch(setAlert({
          message: 'Senha redefinida com sucesso!',
          type: 'success'
        }));
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setTokenError(data.message || 'Erro ao redefinir senha');
        }
        dispatch(setAlert({
          message: data.message || 'Erro ao redefinir senha',
          type: 'error'
        }));
      }
    } catch (error) {
      setTokenError('Erro de conexão. Tente novamente.');
      dispatch(setAlert({
        message: 'Erro de conexão. Tente novamente.',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isSuccess) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <Logo>
            <LogoIcon>V</LogoIcon>
            <LogoText>Voluntariado</LogoText>
          </Logo>

          <SuccessMessage>
            <SuccessIcon>
              <CheckIcon width={24} height={24} />
            </SuccessIcon>
            <SuccessTitle>Senha redefinida!</SuccessTitle>
            <SuccessDescription>
              Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
            </SuccessDescription>
          </SuccessMessage>

          <LinkContainer>
            <LinkText>
              <StyledLink to="/login">
                Fazer login
              </StyledLink>
            </LinkText>
          </LinkContainer>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  if (tokenError) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <Logo>
            <LogoIcon>V</LogoIcon>
            <LogoText>Voluntariado</LogoText>
          </Logo>

          <ErrorMessage>
            <ExclamationTriangleIcon width={20} height={20} />
            {tokenError}
          </ErrorMessage>

          <LinkContainer>
            <LinkText>
              <StyledLink to="/forgot-password">
                Solicitar novo link de recuperação
              </StyledLink>
            </LinkText>
          </LinkContainer>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <BackButton to="/login">
          Voltar ao login
        </BackButton>

        <Logo>
          <LogoIcon>V</LogoIcon>
          <LogoText>Voluntariado</LogoText>
        </Logo>

        <Title>Redefinir senha</Title>
        <Description>
          Digite sua nova senha abaixo.
        </Description>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="password">Nova senha</Label>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Sua nova senha"
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
            {errors.password && <FieldError>{errors.password}</FieldError>}
            
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
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <InputContainer>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme sua nova senha"
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
            {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading || !allPasswordRequirementsMet}>
            {isLoading ? <LoadingSpinner /> : 'Redefinir senha'}
          </SubmitButton>
        </Form>

        <LinkContainer>
          <LinkText>
            Lembrou da senha?{' '}
            <StyledLink to="/login">
              Fazer login
            </StyledLink>
          </LinkText>
        </LinkContainer>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;
