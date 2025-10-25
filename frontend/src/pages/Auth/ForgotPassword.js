import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { setAlert } from '../../store/slices/uiSlice';

const ForgotPasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  padding: ${props => props.theme.spacing.lg};
`;

const ForgotPasswordCard = styled.div`
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

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
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

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email é obrigatório');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simular chamada à API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        dispatch(setAlert({
          message: 'Email de recuperação enviado com sucesso!',
          type: 'success'
        }));
      } else {
        setError(data.message || 'Erro ao enviar email de recuperação');
        dispatch(setAlert({
          message: data.message || 'Erro ao enviar email de recuperação',
          type: 'error'
        }));
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
      dispatch(setAlert({
        message: 'Erro de conexão. Tente novamente.',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <ForgotPasswordContainer>
        <ForgotPasswordCard>
          <BackButton to="/login">
            <ArrowLeftIcon width={16} height={16} />
            Voltar ao login
          </BackButton>

          <Logo>
            <LogoIcon>V</LogoIcon>
            <LogoText>Voluntariado</LogoText>
          </Logo>

          <SuccessMessage>
            <SuccessIcon>
              <EnvelopeIcon width={24} height={24} />
            </SuccessIcon>
            <SuccessTitle>Email enviado!</SuccessTitle>
            <SuccessDescription>
              Enviamos um link de recuperação para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </SuccessDescription>
          </SuccessMessage>

          <LinkContainer>
            <LinkText>
              Não recebeu o email?{' '}
              <StyledLink to="/forgot-password">
                Tentar novamente
              </StyledLink>
            </LinkText>
          </LinkContainer>
        </ForgotPasswordCard>
      </ForgotPasswordContainer>
    );
  }

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <BackButton to="/login">
          <ArrowLeftIcon width={16} height={16} />
          Voltar ao login
        </BackButton>

        <Logo>
          <LogoIcon>V</LogoIcon>
          <LogoText>Voluntariado</LogoText>
        </Logo>

        <Title>Esqueceu sua senha?</Title>
        <Description>
          Digite seu email e enviaremos um link para redefinir sua senha.
        </Description>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              placeholder="seu@email.com"
              error={!!error}
              disabled={isLoading}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Enviar link de recuperação'}
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
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
