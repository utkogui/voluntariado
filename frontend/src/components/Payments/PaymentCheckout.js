import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import usePayments from '../../hooks/usePayments';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const PaymentForm = styled.form`
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
`;

const CardElementContainer = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:focus-within {
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
  width: 100%;

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

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.sm};
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

const PaymentCheckoutForm = ({ 
  amount, 
  currency = 'brl', 
  description, 
  onSuccess, 
  onError,
  customerId 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  
  const {
    createPaymentIntent,
    error,
    clearError
  } = usePayments();

  // Criar intenção de pagamento quando o componente monta
  useEffect(() => {
    const createIntent = async () => {
      try {
        const result = await createPaymentIntent({
          amount: Math.round(amount * 100), // Converter para centavos
          currency,
          description,
          customerId
        });
        
        if (result.success) {
          setClientSecret(result.data.clientSecret);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
      }
    };

    if (amount > 0) {
      createIntent();
    }
  }, [amount, currency, description, customerId, createPaymentIntent]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        if (onError) {
          onError(error);
        }
      } else if (paymentIntent.status === 'succeeded') {
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <CheckoutContainer>
      <Header>
        <Title>
          <CreditCardIcon width={24} height={24} />
          Pagamento Seguro
        </Title>
        <Subtitle>
          Complete seu pagamento de forma segura
        </Subtitle>
      </Header>

      {error && (
        <ErrorMessage>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </ErrorMessage>
      )}

      <PaymentForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Valor</Label>
          <Input
            type="text"
            value={`R$ ${amount.toFixed(2)}`}
            disabled
          />
        </FormGroup>

        <FormGroup>
          <Label>Dados do Cartão</Label>
          <CardElementContainer>
            <CardElement options={cardElementOptions} />
          </CardElementContainer>
        </FormGroup>

        <Button
          type="submit"
          variant="primary"
          disabled={!stripe || !clientSecret || isProcessing}
        >
          {isProcessing ? (
            <LoadingSpinner />
          ) : (
            <LockClosedIcon width={16} height={16} />
          )}
          {isProcessing ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
        </Button>

        <SecurityInfo>
          <ShieldCheckIcon width={16} height={16} />
          Seus dados estão protegidos com criptografia SSL
        </SecurityInfo>
      </PaymentForm>
    </CheckoutContainer>
  );
};

const PaymentCheckout = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentCheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentCheckout;
