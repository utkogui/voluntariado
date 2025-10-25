import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import notificationService from '../services/notificationService';
import { 
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  updateNotificationSettings
} from '../store/slices/notificationsSlice';

const useNotifications = () => {
  const dispatch = useDispatch();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    settings 
  } = useSelector(state => state.notifications);
  
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messageListenerRef = useRef(null);
  const visibilityListenerRef = useRef(null);
  const focusListenerRef = useRef(null);

  // Verificar suporte e permissões
  useEffect(() => {
    const checkSupport = () => {
      const supported = notificationService.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Inicializar notificações
  const initialize = useCallback(async () => {
    if (!isSupported || isInitialized) return;

    try {
      // Solicitar permissão
      const granted = await notificationService.requestPermission();
      if (!granted) {
        console.warn('Permissão para notificações negada');
        return;
      }

      setPermission('granted');

      // Registrar service worker
      await notificationService.registerServiceWorker();

      // Obter token FCM (se Firebase estiver configurado)
      try {
        const token = await notificationService.getFCMToken();
        setFcmToken(token);
      } catch (error) {
        console.warn('Erro ao obter token FCM:', error);
      }

      // Configurar listeners
      setupMessageListeners();
      setupVisibilityListeners();

      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }, [isSupported, isInitialized]);

  // Configurar listeners de mensagens
  const setupMessageListeners = useCallback(() => {
    if (messageListenerRef.current) return;

    notificationService.setupMessageListener((payload) => {
      // Adicionar notificação ao estado
      const notification = {
        id: payload.data?.id || Date.now(),
        title: payload.notification?.title || 'Nova notificação',
        body: payload.notification?.body || '',
        type: payload.data?.type || 'info',
        data: payload.data,
        createdAt: new Date().toISOString(),
        read: false
      };

      dispatch(addNotification(notification));

      // Mostrar notificação local se a página estiver visível
      if (notificationService.isPageVisible()) {
        notificationService.createLocalNotification(notification.title, {
          body: notification.body,
          icon: payload.notification?.icon || '/logo192.png',
          tag: notification.type,
          data: notification.data
        });
      }
    });

    messageListenerRef.current = true;
  }, [dispatch]);

  // Configurar listeners de visibilidade
  const setupVisibilityListeners = useCallback(() => {
    if (visibilityListenerRef.current) return;

    const cleanup = notificationService.onVisibilityChange((isVisible) => {
      if (isVisible) {
        // Página ficou visível - marcar notificações como lidas
        dispatch(markAllAsRead());
      }
    });

    visibilityListenerRef.current = cleanup;
  }, [dispatch]);

  // Configurar listeners de foco
  const setupFocusListeners = useCallback(() => {
    if (focusListenerRef.current) return;

    const cleanup = notificationService.onWindowFocus((isFocused) => {
      if (isFocused) {
        // Janela ganhou foco - atualizar notificações
        dispatch(fetchNotificationsStart());
        notificationService.getNotifications()
          .then(response => {
            dispatch(fetchNotificationsSuccess(response));
          })
          .catch(error => {
            dispatch(fetchNotificationsFailure(error.message));
          });
      }
    });

    focusListenerRef.current = cleanup;
  }, [dispatch]);

  // Carregar notificações
  const loadNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      dispatch(fetchNotificationsStart());
      const response = await notificationService.getNotifications(page, limit);
      dispatch(fetchNotificationsSuccess(response));
    } catch (error) {
      dispatch(fetchNotificationsFailure(error.message));
    }
  }, [dispatch]);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      const response = await notificationService.getSettings();
      dispatch(updateNotificationSettings(response));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, [dispatch]);

  // Marcar como lida
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [dispatch]);

  // Marcar todas como lidas
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [dispatch]);

  // Deletar notificação
  const deleteNotificationById = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [dispatch]);

  // Deletar todas as notificações
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();
      dispatch(clearNotifications());
    } catch (error) {
      console.error('Erro ao deletar todas as notificações:', error);
    }
  }, [dispatch]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings) => {
    try {
      await notificationService.updateSettings(newSettings);
      dispatch(updateNotificationSettings(newSettings));
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  }, [dispatch]);

  // Criar notificação local
  const createLocalNotification = useCallback((title, options = {}) => {
    return notificationService.createLocalNotification(title, options);
  }, []);

  // Solicitar permissão manualmente
  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestPermission();
      setPermission(Notification.permission);
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }, []);

  // Inicializar automaticamente
  useEffect(() => {
    if (isSupported && !isInitialized) {
      initialize();
    }
  }, [isSupported, isInitialized, initialize]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isInitialized) {
      loadNotifications();
      loadSettings();
      setupFocusListeners();
    }
  }, [isInitialized, loadNotifications, loadSettings, setupFocusListeners]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (visibilityListenerRef.current) {
        visibilityListenerRef.current();
      }
      if (focusListenerRef.current) {
        focusListenerRef.current();
      }
    };
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    isSupported,
    permission,
    fcmToken,
    isInitialized,

    // Ações
    initialize,
    loadNotifications,
    loadSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    deleteAllNotifications,
    updateSettings,
    createLocalNotification,
    requestPermission
  };
};

export default useNotifications;
