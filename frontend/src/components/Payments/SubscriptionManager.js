import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import usePayments from '../../hooks/usePayments';

const ManagerContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SubscriptionCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubscriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const SubscriptionInfo = styled.div`
  flex: 1;
`;

const SubscriptionName = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const SubscriptionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const SubscriptionStatus = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.status) {
      case 'active': return props.theme.colors.successBackground;
      case 'canceled': return props.theme.colors.errorBackground;
      case 'past_due': return props.theme.colors.warningBackground;
      case 'unpaid': return props.theme.colors.errorBackground;
      default: return props.theme.colors.background;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return props.theme.colors.success;
      case 'canceled': return props.theme.colors.error;
      case 'past_due': return props.theme.colors.warning;
      case 'unpaid': return props.theme.colors.error;
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const SubscriptionDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const DetailValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const ActionButton = styled.button`
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
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
  margin-bottom: ${props => props.theme.spacing.md};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SubscriptionManager = ({ 
  customerId, 
  onSubscriptionUpdate,
  onError 
}) => {
  const [subscriptions, setSubscriptions] = useState([]);
  
  const {
    isLoading,
    error,
    getCustomerSubscriptions,
    cancelSubscription,
    clearError
  } = usePayments();

  // Carregar assinaturas
  useEffect(() => {
    if (customerId) {
      loadSubscriptions();
    }
  }, [customerId]);

  const loadSubscriptions = async () => {
    try {
      const result = await getCustomerSubscriptions(customerId);
      if (result.success) {
        setSubscriptions(result.data.subscriptions);
      }
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      return;
    }

    try {
      const result = await cancelSubscription(subscriptionId);
      if (result.success) {
        loadSubscriptions();
        if (onSubscriptionUpdate) {
          onSubscriptionUpdate('canceled', subscriptionId);
        }
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'canceled': return 'Cancelada';
      case 'past_due': return 'Vencida';
      case 'unpaid': return 'Não Paga';
      case 'incomplete': return 'Incompleta';
      case 'incomplete_expired': return 'Expirada';
      case 'trialing': return 'Período de Teste';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon width={16} height={16} />;
      case 'canceled':
        return <XCircleIcon width={16} height={16} />;
      case 'past_due':
      case 'unpaid':
        return <ExclamationTriangleIcon width={16} height={16} />;
      default:
        return <ClockIcon width={16} height={16} />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'brl') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <ManagerContainer>
        <LoadingSpinner />
      </ManagerContainer>
    );
  }

  if (error) {
    return (
      <ManagerContainer>
        <ErrorMessage>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </ErrorMessage>
      </ManagerContainer>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <ManagerContainer>
        <EmptyState>
          <EmptyIcon>
            <CreditCardIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma assinatura encontrada</EmptyTitle>
          <EmptyDescription>
            Você não possui assinaturas ativas no momento.
          </EmptyDescription>
        </EmptyState>
      </ManagerContainer>
    );
  }

  return (
    <ManagerContainer>
      <Header>
        <Title>
          <CreditCardIcon width={24} height={24} />
          Minhas Assinaturas
        </Title>
      </Header>

      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id}>
          <SubscriptionHeader>
            <SubscriptionInfo>
              <SubscriptionName>
                {subscription.items?.data?.[0]?.price?.product?.name || 'Assinatura'}
              </SubscriptionName>
              <SubscriptionDescription>
                {subscription.items?.data?.[0]?.price?.product?.description || 'Sem descrição'}
              </SubscriptionDescription>
            </SubscriptionInfo>
            <SubscriptionStatus status={subscription.status}>
              {getStatusIcon(subscription.status)}
              {getStatusText(subscription.status)}
            </SubscriptionStatus>
          </SubscriptionHeader>

          <SubscriptionDetails>
            <DetailItem>
              <DetailLabel>Valor</DetailLabel>
              <DetailValue>
                {formatCurrency(subscription.items?.data?.[0]?.price?.unit_amount || 0)}
                {subscription.items?.data?.[0]?.price?.recurring && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    /{subscription.items.data[0].price.recurring.interval === 'month' ? 'mês' : 'ano'}
                  </span>
                )}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Próximo Pagamento</DetailLabel>
              <DetailValue>
                {formatDate(subscription.current_period_end)}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Criada em</DetailLabel>
              <DetailValue>
                {formatDate(subscription.created)}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>
                {getStatusText(subscription.status)}
              </DetailValue>
            </DetailItem>
          </SubscriptionDetails>

          {subscription.status === 'active' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <ActionButton
                variant="error"
                onClick={() => handleCancelSubscription(subscription.id)}
              >
                <XCircleIcon width={16} height={16} />
                Cancelar Assinatura
              </ActionButton>
            </div>
          )}
        </SubscriptionCard>
      ))}
    </ManagerContainer>
  );
};

export default SubscriptionManager;
