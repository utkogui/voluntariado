import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, updateMessageStatus, addConversation, updateConversation } from '../store/slices/chatSlice';

const useWebSocket = (url) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket conectado');
        reconnectAttempts.current = 0;
        
        // Enviar token de autenticação
        if (user?.token) {
          ws.current.send(JSON.stringify({
            type: 'AUTH',
            token: user.token
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        
        // Tentar reconectar se não foi fechado intencionalmente
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            console.log(`Tentativa de reconexão ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('Erro WebSocket:', error);
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [url, user?.token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Desconexão intencional');
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'MESSAGE_RECEIVED':
        dispatch(addMessage(data.message));
        break;
        
      case 'MESSAGE_SENT':
        dispatch(addMessage(data.message));
        break;
        
      case 'MESSAGE_STATUS_UPDATE':
        dispatch(updateMessageStatus({
          messageId: data.messageId,
          status: data.status,
          timestamp: data.timestamp
        }));
        break;
        
      case 'CONVERSATION_CREATED':
        dispatch(addConversation(data.conversation));
        break;
        
      case 'CONVERSATION_UPDATED':
        dispatch(updateConversation(data.conversation));
        break;
        
      case 'USER_TYPING':
        // Implementar indicador de digitação
        console.log('Usuário digitando:', data.userId);
        break;
        
      case 'USER_STOPPED_TYPING':
        // Remover indicador de digitação
        console.log('Usuário parou de digitar:', data.userId);
        break;
        
      case 'USER_ONLINE':
        // Atualizar status online do usuário
        console.log('Usuário online:', data.userId);
        break;
        
      case 'USER_OFFLINE':
        // Atualizar status offline do usuário
        console.log('Usuário offline:', data.userId);
        break;
        
      case 'ERROR':
        console.error('Erro do servidor:', data.message);
        break;
        
      default:
        console.log('Tipo de mensagem desconhecido:', data.type);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user?.token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    reconnect: connect
  };
};

export default useWebSocket;
