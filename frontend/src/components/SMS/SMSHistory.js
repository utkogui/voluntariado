import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import useSMS from '../../hooks/useSMS';

const HistoryContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.background};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Filters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  width: 200px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const MessageItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'delivered': return props.theme.colors.successBackground;
      case 'sent': return props.theme.colors.primaryBackground;
      case 'failed': return props.theme.colors.errorBackground;
      case 'undelivered': return props.theme.colors.warningBackground;
      default: return props.theme.colors.background;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return props.theme.colors.success;
      case 'sent': return props.theme.colors.primary;
      case 'failed': return props.theme.colors.error;
      case 'undelivered': return props.theme.colors.warning;
      default: return props.theme.colors.textSecondary;
    }
  }};
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MessageTo = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MessageTime = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MessageBody = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing.xs};
  word-break: break-word;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => {
    switch (props.status) {
      case 'delivered': return props.theme.colors.successBackground;
      case 'sent': return props.theme.colors.primaryBackground;
      case 'failed': return props.theme.colors.errorBackground;
      case 'undelivered': return props.theme.colors.warningBackground;
      default: return props.theme.colors.background;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return props.theme.colors.success;
      case 'sent': return props.theme.colors.primary;
      case 'failed': return props.theme.colors.error;
      case 'undelivered': return props.theme.colors.warning;
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const MessageId = styled.span`
  font-family: ${props => props.theme.typography.fontFamilies.mono};
  background-color: ${props => props.theme.colors.background};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: ${props => props.theme.typography.fontSizes.xs};
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

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.errorBackground};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SMSHistory = ({ 
  messages = [], 
  onRefresh, 
  isLoading = false, 
  error = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredMessages, setFilteredMessages] = useState(messages);

  useEffect(() => {
    let filtered = messages;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(message => 
        message.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon width={16} height={16} />;
      case 'sent':
        return <ClockIcon width={16} height={16} />;
      case 'failed':
        return <XCircleIcon width={16} height={16} />;
      case 'undelivered':
        return <ExclamationTriangleIcon width={16} height={16} />;
      default:
        return <ClockIcon width={16} height={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'sent': return 'Enviado';
      case 'failed': return 'Falhou';
      case 'undelivered': return 'Não entregue';
      case 'queued': return 'Na fila';
      case 'sending': return 'Enviando';
      case 'received': return 'Recebido';
      default: return status;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <HistoryContainer>
        <Header>
          <Title>
            <ChatBubbleLeftRightIcon width={24} height={24} />
            Histórico de SMS
          </Title>
        </Header>
        <LoadingSpinner />
      </HistoryContainer>
    );
  }

  if (error) {
    return (
      <HistoryContainer>
        <Header>
          <Title>
            <ChatBubbleLeftRightIcon width={24} height={24} />
            Histórico de SMS
          </Title>
        </Header>
        <ErrorMessage>
          <ExclamationTriangleIcon width={20} height={20} />
          {error}
        </ErrorMessage>
      </HistoryContainer>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <HistoryContainer>
        <Header>
          <Title>
            <ChatBubbleLeftRightIcon width={24} height={24} />
            Histórico de SMS
          </Title>
        </Header>
        <EmptyState>
          <EmptyIcon>
            <ChatBubbleLeftRightIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma mensagem encontrada</EmptyTitle>
          <EmptyDescription>
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhuma mensagem corresponde aos filtros aplicados.'
              : 'Você ainda não enviou nenhuma mensagem SMS.'
            }
          </EmptyDescription>
        </EmptyState>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <Header>
        <Title>
          <ChatBubbleLeftRightIcon width={24} height={24} />
          Histórico de SMS
        </Title>
        <Filters>
          <SearchInput
            type="text"
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="delivered">Entregue</option>
            <option value="sent">Enviado</option>
            <option value="failed">Falhou</option>
            <option value="undelivered">Não entregue</option>
            <option value="queued">Na fila</option>
            <option value="sending">Enviando</option>
          </Select>
        </Filters>
      </Header>

      <div>
        {filteredMessages.map((message) => (
          <MessageItem key={message.messageId}>
            <StatusIcon status={message.status}>
              {getStatusIcon(message.status)}
            </StatusIcon>
            
            <MessageContent>
              <MessageHeader>
                <MessageTo>
                  <PhoneIcon width={16} height={16} />
                  {message.to}
                </MessageTo>
                <MessageTime>
                  <CalendarIcon width={14} height={14} />
                  {formatTimestamp(message.dateCreated)}
                </MessageTime>
              </MessageHeader>
              
              <MessageBody>{message.body}</MessageBody>
              
              <MessageMeta>
                <StatusBadge status={message.status}>
                  {getStatusText(message.status)}
                </StatusBadge>
                <MessageId>{message.messageId}</MessageId>
                {message.from && (
                  <span>De: {message.from}</span>
                )}
                {message.errorMessage && (
                  <span style={{ color: '#ef4444' }}>
                    Erro: {message.errorMessage}
                  </span>
                )}
              </MessageMeta>
            </MessageContent>
          </MessageItem>
        ))}
      </div>
    </HistoryContainer>
  );
};

export default SMSHistory;
