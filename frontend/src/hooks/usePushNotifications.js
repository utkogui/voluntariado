import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import pushNotificationService from '../services/pushNotificationService';
import { 
  requestPermission, 
  getToken, 
  onMessage, 
  onBackgroundMessage 
} from 'firebase/messaging';
import { messaging } from '../config/firebase';

const usePushNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar se o navegador suporta notificações push
  useEffect(() => {
    const checkSupport = () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        setIsSupported(true);
        setPermission(Notification.permission);
      } else {
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notificações push não são suportadas neste navegador');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permissionResult = await requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          setToken(token);
          // Salvar token no backend
          await pushNotificationService.saveUserToken(user.id, token);
          return true;
        }
      }
      
      return false;
    } catch (err) {
      setError('Erro ao solicitar permissão para notificações: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, user?.id]);

  // Configurar listener para mensagens em primeiro plano
  useEffect(() => {
    if (!token || !user) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      
      // Mostrar notificação personalizada
      if (payload.notification) {
        const notification = new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/logo192.png',
          badge: payload.notification.badge || '/logo192.png',
          tag: payload.data?.tag || 'default',
          data: payload.data
        });

        notification.onclick = () => {
          window.focus();
          // Navegar para a página relevante baseada nos dados
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }
          notification.close();
        };
      }
    });

    return () => unsubscribe();
  }, [token, user]);

  // Enviar notificação para um usuário
  const sendToUser = useCallback(async (userId, title, body, data = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendToUser(userId, {
        title,
        body,
        data
      });
      
      return result;
    } catch (err) {
      setError('Erro ao enviar notificação: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificação para múltiplos usuários
  const sendToMultipleUsers = useCallback(async (userIds, title, body, data = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendToMultipleUsers(userIds, {
        title,
        body,
        data
      });
      
      return result;
    } catch (err) {
      setError('Erro ao enviar notificações: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificação para um tópico
  const sendToTopic = useCallback(async (topic, title, body, data = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendToTopic(topic, {
        title,
        body,
        data
      });
      
      return result;
    } catch (err) {
      setError('Erro ao enviar notificação para tópico: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inscrever em um tópico
  const subscribeToTopic = useCallback(async (topic) => {
    if (!token) {
      setError('Token de notificação não disponível');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await pushNotificationService.subscribeToTopic([token], topic);
      return true;
    } catch (err) {
      setError('Erro ao inscrever no tópico: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Cancelar inscrição de um tópico
  const unsubscribeFromTopic = useCallback(async (topic) => {
    if (!token) {
      setError('Token de notificação não disponível');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await pushNotificationService.unsubscribeFromTopic([token], topic);
      return true;
    } catch (err) {
      setError('Erro ao cancelar inscrição do tópico: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Agendar notificação
  const scheduleNotification = useCallback(async (notificationData, scheduleTime) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.scheduleNotification(notificationData, scheduleTime);
      return result;
    } catch (err) {
      setError('Erro ao agendar notificação: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter estatísticas de notificações
  const getNotificationStats = useCallback(async (startDate, endDate) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.getNotificationStats(startDate, endDate);
      return result;
    } catch (err) {
      setError('Erro ao obter estatísticas: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Notificações específicas
  const sendNewOpportunityNotification = useCallback(async (volunteerId, opportunityId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendNewOpportunityNotification(volunteerId, opportunityId);
      return result;
    } catch (err) {
      setError('Erro ao enviar notificação de nova oportunidade: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendApplicationStatusNotification = useCallback(async (applicationId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendApplicationStatusNotification(applicationId);
      return result;
    } catch (err) {
      setError('Erro ao enviar notificação de status da candidatura: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendActivityReminder = useCallback(async (participantId, activityId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await pushNotificationService.sendActivityReminder(participantId, activityId);
      return result;
    } catch (err) {
      setError('Erro ao enviar lembrete de atividade: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Estado
    isSupported,
    permission,
    token,
    isLoading,
    error,
    
    // Ações
    requestNotificationPermission,
    sendToUser,
    sendToMultipleUsers,
    sendToTopic,
    subscribeToTopic,
    unsubscribeFromTopic,
    scheduleNotification,
    getNotificationStats,
    sendNewOpportunityNotification,
    sendApplicationStatusNotification,
    sendActivityReminder,
    
    // Utilitários
    clearError: () => setError(null)
  };
};

export default usePushNotifications;
