import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${props => props.theme.colors.error}20;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.error};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const AccessDeniedTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const AccessDeniedMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  max-width: 500px;
`;

const LoginButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const PrivateRoute = ({ children, requiredRoles = [], requireAuth = true }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const location = useLocation();

  // Se não requer autenticação, renderiza o componente
  if (!requireAuth) {
    return children;
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não há roles específicos requeridos, renderiza o componente
  if (requiredRoles.length === 0) {
    return children;
  }

  // Verifica se o usuário tem um dos roles necessários
  const hasRequiredRole = requiredRoles.includes(user?.userType);

  if (!hasRequiredRole) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedIcon>
          <ShieldExclamationIcon width={40} height={40} />
        </AccessDeniedIcon>
        <AccessDeniedTitle>Acesso Negado</AccessDeniedTitle>
        <AccessDeniedMessage>
          Você não tem permissão para acessar esta página. 
          Esta área é restrita para usuários com perfil específico.
        </AccessDeniedMessage>
        <LoginButton onClick={() => window.history.back()}>
          Voltar
        </LoginButton>
      </AccessDeniedContainer>
    );
  }

  return children;
};

export default PrivateRoute;
