import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import usePushNotifications from '../../hooks/usePushNotifications';

const SettingsContainer = styled.div`
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

const StatusCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.status === 'granted' ? props.theme.colors.success : 
           props.status === 'denied' ? props.theme.colors.error : 
           props.theme.colors.textSecondary};
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

const TopicsSection = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const TopicsTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TopicItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const TopicInfo = styled.div`
  flex: 1;
`;

const TopicName = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TopicDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
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

const NotificationSettings = () => {
  const {
    isSupported,
    permission,
    token,
    isLoading,
    error,
    requestNotificationPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    clearError
  } = usePushNotifications();

  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const [topicLoading, setTopicLoading] = useState({});

  const availableTopics = [
    {
      id: 'new-opportunities',
      name: 'Novas Oportunidades',
      description: 'Receba notificações sobre novas oportunidades de voluntariado'
    },
    {
      id: 'application-updates',
      name: 'Atualizações de Candidaturas',
      description: 'Receba notificações sobre o status das suas candidaturas'
    },
    {
      id: 'activity-reminders',
      name: 'Lembretes de Atividades',
      description: 'Receba lembretes sobre atividades agendadas'
    },
    {
      id: 'general-announcements',
      name: 'Anúncios Gerais',
      description: 'Receba notificações sobre anúncios importantes da plataforma'
    }
  ];

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleRequestPermission = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      // Atualizar lista de tópicos inscritos
      // Aqui você pode implementar a lógica para buscar tópicos inscritos do backend
    }
  };

  const handleTopicToggle = async (topicId, isSubscribed) => {
    setTopicLoading(prev => ({ ...prev, [topicId]: true }));
    
    try {
      if (isSubscribed) {
        await unsubscribeFromTopic(topicId);
        setSubscribedTopics(prev => prev.filter(id => id !== topicId));
      } else {
        await subscribeToTopic(topicId);
        setSubscribedTopics(prev => [...prev, topicId]);
      }
    } catch (err) {
      console.error('Error toggling topic subscription:', err);
    } finally {
      setTopicLoading(prev => ({ ...prev, [topicId]: false }));
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Permitido', status: 'granted' };
      case 'denied':
        return { text: 'Negado', status: 'denied' };
      default:
        return { text: 'Não solicitado', status: 'default' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <SettingsContainer>
      <Header>
        <BellIcon width={24} height={24} />
        <Title>Configurações de Notificações</Title>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <StatusCard>
        <StatusRow>
          <StatusLabel>Suporte do navegador:</StatusLabel>
          <StatusValue status={isSupported ? 'granted' : 'denied'}>
            {isSupported ? 'Suportado' : 'Não suportado'}
          </StatusValue>
        </StatusRow>
        
        <StatusRow>
          <StatusLabel>Permissão:</StatusLabel>
          <StatusValue status={permissionStatus.status}>
            {permissionStatus.text}
          </StatusValue>
        </StatusRow>
        
        {token && (
          <StatusRow>
            <StatusLabel>Token:</StatusLabel>
            <StatusValue status="granted">
              Configurado
            </StatusValue>
          </StatusRow>
        )}
      </StatusCard>

      {!isSupported && (
        <ActionButton disabled>
          <XMarkIcon width={16} height={16} />
          Notificações não suportadas
        </ActionButton>
      )}

      {isSupported && permission !== 'granted' && (
        <ActionButton 
          variant="primary" 
          onClick={handleRequestPermission}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <BellIcon width={16} height={16} />
          )}
          {isLoading ? 'Solicitando permissão...' : 'Ativar notificações'}
        </ActionButton>
      )}

      {isSupported && permission === 'granted' && (
        <>
          <ActionButton variant="success" disabled>
            <CheckIcon width={16} height={16} />
            Notificações ativadas
          </ActionButton>

          <TopicsSection>
            <TopicsTitle>Tópicos de Notificação</TopicsTitle>
            {availableTopics.map(topic => {
              const isSubscribed = subscribedTopics.includes(topic.id);
              const loading = topicLoading[topic.id];

              return (
                <TopicItem key={topic.id}>
                  <TopicInfo>
                    <TopicName>{topic.name}</TopicName>
                    <TopicDescription>{topic.description}</TopicDescription>
                  </TopicInfo>
                  <ActionButton
                    variant={isSubscribed ? 'success' : 'primary'}
                    onClick={() => handleTopicToggle(topic.id, isSubscribed)}
                    disabled={loading}
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : isSubscribed ? (
                      <>
                        <CheckIcon width={16} height={16} />
                        Inscrito
                      </>
                    ) : (
                      'Inscrever'
                    )}
                  </ActionButton>
                </TopicItem>
              );
            })}
          </TopicsSection>
        </>
      )}
    </SettingsContainer>
  );
};

export default NotificationSettings;
