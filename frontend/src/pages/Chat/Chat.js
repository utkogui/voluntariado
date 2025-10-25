import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EmojiHappyIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  fetchConversations,
  setCurrentConversation,
  addMessage,
  fetchMessages,
  sendMessage,
  markAsRead,
  setConnectionStatus,
  addSelectedFile,
  removeSelectedFile,
  clearSelectedFiles,
  toggleEmojiPicker,
  setEmojiPicker,
  addTypingUser,
  removeTypingUser
} from '../../store/slices/chatSlice';
import useWebSocket from '../../hooks/useWebSocket';
import TypingIndicator from '../../components/Chat/TypingIndicator';
import EmojiPicker from '../../components/Chat/EmojiPicker';
import FileUpload from '../../components/Chat/FileUpload';
import UserSearch from '../../components/Chat/UserSearch';

const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const Sidebar = styled.div`
  width: 350px;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    width: 100%;
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: ${props => props.theme.zIndex.modal};
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const SidebarTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-left: ${props => props.theme.spacing['2xl']};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray500};
  pointer-events: none;
`;

const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.sm};
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  margin-bottom: ${props => props.theme.spacing.xs};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary}10;
    border: 1px solid ${props.theme.colors.primary}30;
  `}
`;

const ConversationAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  flex-shrink: 0;
  position: relative;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: ${props => props.theme.colors.success};
  border: 2px solid white;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const ConversationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
`;

const MessageTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const UnreadBadge = styled.div`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.surface};
`;

const ChatHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ChatUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const ChatUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatUserName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const ChatUserStatus = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const ChatActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Message = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.isOwn && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const MessageBubble = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  line-height: ${props => props.theme.typography.lineHeights.normal};
  word-wrap: break-word;
  
  ${props => props.isOwn ? `
    background-color: ${props.theme.colors.primary};
    color: white;
    border-bottom-right-radius: ${props.theme.borderRadius.sm};
  ` : `
    background-color: ${props.theme.colors.gray100};
    color: ${props.theme.colors.gray900};
    border-bottom-left-radius: ${props.theme.borderRadius.sm};
  `}
`;

const MessageTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  ${props => props.isOwn && 'text-align: right;'}
`;

const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  ${props => props.isOwn && 'justify-content: flex-end;'}
`;

const MessageInputArea = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
`;

const MessageInputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.sm};
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: none;
  resize: none;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  min-height: 20px;
  max-height: 120px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const InputActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SendButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray300};
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray500};
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray400};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 80px;
  left: ${props => props.theme.spacing.md};
  z-index: ${props => props.theme.zIndex.fixed};
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    conversations, 
    currentConversation, 
    messages, 
    isLoading, 
    error, 
    isConnected,
    selectedFiles,
    showEmojiPicker,
    typingUsers
  } = useSelector(state => state.chat);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // WebSocket connection
  const { sendMessage: sendWebSocketMessage, isConnected: wsConnected } = useWebSocket(
    process.env.REACT_APP_WS_URL || 'ws://localhost:5000/chat'
  );

  useEffect(() => {
    dispatch(setConnectionStatus(wsConnected));
  }, [wsConnected, dispatch]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConversationSelect = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    dispatch(markAsRead(conversation.id));
    setShowSidebar(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentConversation) {
      const messageData = {
        content: newMessage.trim(),
        messageType: 'TEXT'
      };
      
      try {
        await dispatch(sendMessage({ 
          conversationId: currentConversation.id, 
          messageData 
        })).unwrap();
        setNewMessage('');
        
        // Enviar via WebSocket se conectado
        if (isConnected) {
          sendWebSocketMessage({
            type: 'SEND_MESSAGE',
            conversationId: currentConversation.id,
            content: newMessage.trim(),
            messageType: 'TEXT'
          });
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    }
  };

  const handleFileSelect = (file) => {
    dispatch(addSelectedFile(file));
  };

  const handleFileRemove = (index) => {
    dispatch(removeSelectedFile(index));
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (currentConversation && isConnected) {
      // Enviar indicador de digitação
      sendWebSocketMessage({
        type: 'TYPING',
        conversationId: currentConversation.id
      });

      // Limpar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Parar indicador de digitação após 3 segundos
      typingTimeoutRef.current = setTimeout(() => {
        sendWebSocketMessage({
          type: 'STOP_TYPING',
          conversationId: currentConversation.id
        });
      }, 3000);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      const conversationData = {
        participantIds: [selectedUser.id],
        conversationType: 'DIRECT'
      };
      
      const newConversation = await dispatch(createConversation(conversationData)).unwrap();
      dispatch(setCurrentConversation(newConversation));
      setShowNewChat(false);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <ClockIcon width={12} height={12} />;
      case 'delivered':
        return <CheckIcon width={12} height={12} />;
      case 'read':
        return <CheckCircleIcon width={12} height={12} />;
      default:
        return null;
    }
  };

  return (
    <>
      <MobileToggle onClick={() => setShowSidebar(!showSidebar)}>
        <EllipsisVerticalIcon width={20} height={20} />
      </MobileToggle>
      
      <ChatContainer>
        <Sidebar isOpen={showSidebar}>
          <SidebarHeader>
            <SidebarTitle>Conversas</SidebarTitle>
            <SearchContainer>
              <SearchIcon>
                <MagnifyingGlassIcon width={16} height={16} />
              </SearchIcon>
              <SearchInput placeholder="Buscar conversas..." />
            </SearchContainer>
          </SidebarHeader>
          
          <ConversationsList>
            {/* Botão Nova Conversa */}
            <ConversationItem
              onClick={() => setShowNewChat(!showNewChat)}
              style={{ 
                background: showNewChat ? '#e3f2fd' : 'transparent',
                border: showNewChat ? '1px solid #2196f3' : 'none'
              }}
            >
              <ConversationAvatar>
                <PlusIcon width={20} height={20} />
              </ConversationAvatar>
              <ConversationContent>
                <ConversationName>Nova Conversa</ConversationName>
                <LastMessage>Iniciar uma nova conversa</LastMessage>
              </ConversationContent>
            </ConversationItem>

            {/* Busca de usuários para nova conversa */}
            {showNewChat && (
              <div style={{ padding: '0 16px 16px 16px' }}>
                <UserSearch
                  onUserSelect={handleUserSelect}
                  placeholder="Buscar usuário para conversar..."
                />
              </div>
            )}

            {/* Lista de conversas existentes */}
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                active={currentConversation?.id === conversation.id}
                onClick={() => handleConversationSelect(conversation)}
              >
                <ConversationAvatar>
                  {conversation.avatar || conversation.name?.charAt(0) || 'U'}
                  {conversation.isOnline && <OnlineIndicator />}
                </ConversationAvatar>
                
                <ConversationContent>
                  <ConversationName>{conversation.name}</ConversationName>
                  <LastMessage>{conversation.lastMessage}</LastMessage>
                </ConversationContent>
                
                <ConversationMeta>
                  <MessageTime>{conversation.lastMessageTime}</MessageTime>
                  {conversation.unreadCount > 0 && (
                    <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                  )}
                </ConversationMeta>
              </ConversationItem>
            ))}
          </ConversationsList>
        </Sidebar>

        <ChatArea>
          {currentConversation ? (
            <>
              <ChatHeader>
                <ChatUserInfo>
                  <ChatUserAvatar>
                    {currentConversation.avatar || currentConversation.name?.charAt(0) || 'U'}
                  </ChatUserAvatar>
                  <ChatUserDetails>
                    <ChatUserName>{currentConversation.name}</ChatUserName>
                    <ChatUserStatus>
                      {currentConversation.isOnline ? 'Online' : 'Offline'}
                    </ChatUserStatus>
                  </ChatUserDetails>
                </ChatUserInfo>
                
                <ChatActions>
                  <ActionButton>
                    <PhoneIcon width={20} height={20} />
                  </ActionButton>
                  <ActionButton>
                    <VideoCameraIcon width={20} height={20} />
                  </ActionButton>
                  <ActionButton>
                    <EllipsisVerticalIcon width={20} height={20} />
                  </ActionButton>
                </ChatActions>
              </ChatHeader>

              <MessagesArea>
                {messages.map((message) => (
                  <Message key={message.id} isOwn={message.senderId === user.id}>
                    <MessageAvatar>
                      {message.senderName?.charAt(0) || 'U'}
                    </MessageAvatar>
                    <MessageContent>
                      <MessageBubble isOwn={message.senderId === user.id}>
                        {message.content}
                      </MessageBubble>
                      <MessageTime isOwn={message.senderId === user.id}>
                        {formatMessageTime(message.timestamp)}
                      </MessageTime>
                      {message.senderId === user.id && (
                        <MessageStatus isOwn={true}>
                          {getMessageStatusIcon(message.status)}
                        </MessageStatus>
                      )}
                    </MessageContent>
                  </Message>
                ))}
                
                {/* Indicador de digitação */}
                {typingUsers.length > 0 && (
                  <TypingIndicator 
                    isVisible={true} 
                    userName={typingUsers[0].name} 
                  />
                )}
                
                <div ref={messagesEndRef} />
              </MessagesArea>

              <MessageInputArea>
                <form onSubmit={handleSendMessage}>
                  <MessageInputContainer>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      selectedFiles={selectedFiles}
                    />
                    <MessageInput
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      rows={1}
                    />
                    <ActionButton 
                      type="button"
                      onClick={() => dispatch(toggleEmojiPicker())}
                    >
                      <EmojiHappyIcon width={20} height={20} />
                    </ActionButton>
                    <SendButton type="submit" disabled={!newMessage.trim()}>
                      <PaperAirplaneIcon width={16} height={16} />
                    </SendButton>
                  </MessageInputContainer>
                </form>
                
                {/* Seletor de emoji */}
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => dispatch(setEmojiPicker(false))}
                  onEmojiSelect={handleEmojiSelect}
                />
              </MessageInputArea>
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <EllipsisVerticalIcon width={40} height={40} />
              </EmptyIcon>
              <EmptyTitle>Selecione uma conversa</EmptyTitle>
              <EmptyMessage>
                Escolha uma conversa para começar a trocar mensagens
              </EmptyMessage>
            </EmptyState>
          )}
        </ChatArea>
      </ChatContainer>
    </>
  );
};

export default Chat;
