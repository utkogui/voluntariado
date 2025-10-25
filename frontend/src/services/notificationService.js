import api from './api';

const notificationService = {
  // Solicitar permissão para notificações
  requestPermission: async () => {
    if (!('Notification' in window)) {
      throw new Error('Este navegador não suporta notificações');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notificações foram negadas pelo usuário');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Verificar se as notificações estão disponíveis
  isSupported: () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Registrar service worker
  registerServiceWorker: async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker não suportado');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      throw error;
    }
  },

  // Obter token FCM
  getFCMToken: async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const messaging = firebase.messaging();
      
      const token = await messaging.getToken({
        vapidKey: process.env.REACT_APP_FCM_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        // Salvar token no backend
        await api.post('/notifications/token', { token });
        return token;
      } else {
        throw new Error('Não foi possível obter o token FCM');
      }
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      throw error;
    }
  },

  // Configurar listeners de mensagens FCM
  setupMessageListener: (onMessage) => {
    if (!firebase.messaging) {
      console.warn('Firebase Messaging não está disponível');
      return;
    }

    const messaging = firebase.messaging();
    
    messaging.onMessage((payload) => {
      console.log('Mensagem recebida:', payload);
      onMessage(payload);
    });

    // Listener para quando a app está em background
    messaging.onBackgroundMessage((payload) => {
      console.log('Mensagem em background:', payload);
      
      const notificationTitle = payload.notification?.title || 'Nova notificação';
      const notificationOptions = {
        body: payload.notification?.body || 'Você tem uma nova notificação',
        icon: payload.notification?.icon || '/logo192.png',
        badge: payload.notification?.badge || '/logo192.png',
        tag: payload.data?.type || 'default',
        data: payload.data,
        actions: payload.data?.actions || [],
        requireInteraction: payload.data?.requireInteraction || false,
        silent: payload.data?.silent || false
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  },

  // Buscar notificações do usuário
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar notificações');
    }
  },

  // Marcar notificação como lida
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar notificação como lida');
    }
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar todas as notificações como lidas');
    }
  },

  // Deletar notificação
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar notificação');
    }
  },

  // Deletar todas as notificações
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar todas as notificações');
    }
  },

  // Atualizar configurações de notificação
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar configurações');
    }
  },

  // Buscar configurações de notificação
  getSettings: async () => {
    try {
      const response = await api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar configurações');
    }
  },

  // Criar notificação local
  createLocalNotification: (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Notificações não estão disponíveis ou não foram permitidas');
      return;
    }

    const defaultOptions = {
      body: '',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'default',
      requireInteraction: false,
      silent: false,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    // Auto-close após 5 segundos se não for requireInteraction
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return notification;
  },

  // Verificar se a página está visível
  isPageVisible: () => {
    return !document.hidden;
  },

  // Configurar listener de visibilidade da página
  onVisibilityChange: (callback) => {
    const handleVisibilityChange = () => {
      callback(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  },

  // Configurar listener de foco da janela
  onWindowFocus: (callback) => {
    const handleFocus = () => callback(true);
    const handleBlur = () => callback(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }
};

export default notificationService;
