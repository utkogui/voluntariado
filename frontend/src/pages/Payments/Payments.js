import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CreditCardIcon, 
  PlusIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import PaymentCheckout from '../../components/Payments/PaymentCheckout';
import SubscriptionManager from '../../components/Payments/SubscriptionManager';
import usePayments from '../../hooks/usePayments';
import { useSelector } from 'react-redux';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TabContainer = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: row;
  }
`;

const MainContent = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Sidebar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const StatsCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StatsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const PaymentForm = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const FormTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
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
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme.colors.successBackground};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
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

const Payments = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [stats, setStats] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  
  const {
    isLoading,
    error,
    createCustomer,
    getPaymentStats,
    clearError
  } = usePayments();

  // Carregar dados iniciais
  useEffect(() => {
    loadStats();
    if (user?.id) {
      loadOrCreateCustomer();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      const result = await getPaymentStats();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadOrCreateCustomer = async () => {
    try {
      // Aqui você implementaria a lógica para verificar se o cliente já existe
      // Por enquanto, vamos criar um novo cliente
      const result = await createCustomer({
        email: user.email,
        name: user.name,
        userId: user.id
      });
      
      if (result.success) {
        setCustomerId(result.data.customerId);
      }
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setSuccessMessage('Pagamento realizado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 5000);
    loadStats();
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleSubscriptionUpdate = (action, subscriptionId) => {
    console.log('Subscription updated:', action, subscriptionId);
    loadStats();
  };

  const tabs = [
    { id: 'checkout', label: 'Pagamento', icon: PlusIcon },
    { id: 'subscriptions', label: 'Assinaturas', icon: ClockIcon },
    { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'checkout':
        return (
          <PaymentForm>
            <FormTitle>Realizar Pagamento</FormTitle>
            
            <FormGroup>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </FormGroup>

            <FormGroup>
              <Label>Descrição</Label>
              <Input
                type="text"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                placeholder="Descrição do pagamento"
              />
            </FormGroup>

            {paymentAmount > 0 && customerId && (
              <PaymentCheckout
                amount={paymentAmount}
                currency="brl"
                description={paymentDescription}
                customerId={customerId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </PaymentForm>
        );
      
      case 'subscriptions':
        return (
          <SubscriptionManager
            customerId={customerId}
            onSubscriptionUpdate={handleSubscriptionUpdate}
            onError={handlePaymentError}
          />
        );
      
      case 'stats':
        return (
          <StatsCard>
            <StatsTitle>
              <ChartBarIcon width={24} height={24} />
              Estatísticas de Pagamentos
            </StatsTitle>
            
            {stats ? (
              <StatsGrid>
                <StatItem>
                  <StatValue>R$ {(stats.totalRevenue / 100).toFixed(2)}</StatValue>
                  <StatLabel>Receita Total</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.totalCharges}</StatValue>
                  <StatLabel>Total de Cobranças</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.successfulCharges}</StatValue>
                  <StatLabel>Pagamentos Aprovados</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.activeSubscriptions}</StatValue>
                  <StatLabel>Assinaturas Ativas</StatLabel>
                </StatItem>
              </StatsGrid>
            ) : (
              <LoadingSpinner />
            )}
          </StatsCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <CreditCardIcon width={32} height={32} />
          Pagamentos
        </Title>
      </Header>

      {error && (
        <ErrorMessage>
          <ExclamationTriangleIcon width={20} height={20} />
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            ✕
          </button>
        </ErrorMessage>
      )}

      {successMessage && (
        <SuccessMessage>
          <CheckCircleIcon width={20} height={20} />
          {successMessage}
        </SuccessMessage>
      )}

      <TabContainer>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon width={20} height={20} />
              {tab.label}
            </Tab>
          );
        })}
      </TabContainer>

      <Content>
        <MainContent>
          {renderContent()}
        </MainContent>
        
        <Sidebar>
          {stats && (
            <StatsCard>
              <StatsTitle>Resumo</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>{stats.totalCharges}</StatValue>
                  <StatLabel>Total</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.successfulCharges}</StatValue>
                  <StatLabel>Aprovados</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.failedCharges}</StatValue>
                  <StatLabel>Falharam</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{stats.activeSubscriptions}</StatValue>
                  <StatLabel>Ativas</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsCard>
          )}
        </Sidebar>
      </Content>
    </PageContainer>
  );
};

export default Payments;
