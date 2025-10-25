import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Cloud Messaging
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging não está disponível:', error);
  }
}

// Função para obter token FCM
export const getFCMToken = async () => {
  if (!messaging) {
    throw new Error('Firebase Messaging não está disponível');
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FCM_VAPID_KEY
    });

    if (token) {
      console.log('Token FCM obtido:', token);
      return token;
    } else {
      throw new Error('Não foi possível obter o token FCM');
    }
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
    throw error;
  }
};

// Função para configurar listener de mensagens
export const setupMessageListener = (onMessageCallback) => {
  if (!messaging) {
    console.warn('Firebase Messaging não está disponível');
    return;
  }

  try {
    onMessage(messaging, (payload) => {
      console.log('Mensagem recebida:', payload);
      onMessageCallback(payload);
    });
  } catch (error) {
    console.error('Erro ao configurar listener de mensagens:', error);
  }
};

// Função para verificar se o Firebase está disponível
export const isFirebaseAvailable = () => {
  return messaging !== null;
};

// Função para verificar se as notificações são suportadas
export const isNotificationSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

// Função para solicitar permissão de notificação
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Notificações não são suportadas neste navegador');
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    throw new Error('Permissão para notificações foi negada');
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Função para criar notificação local
export const createLocalNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Notificações não estão disponíveis ou não foram permitidas');
    return null;
  }

  const defaultOptions = {
    body: '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'default',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Auto-close após 5 segundos se não for requireInteraction
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação local:', error);
    return null;
  }
};

// Função para verificar se a página está visível
export const isPageVisible = () => {
  return typeof document !== 'undefined' && !document.hidden;
};

// Função para configurar listener de visibilidade
export const onVisibilityChange = (callback) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const handleVisibilityChange = () => {
    callback(!document.hidden);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Função para configurar listener de foco da janela
export const onWindowFocus = (callback) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleFocus = () => callback(true);
  const handleBlur = () => callback(false);

  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);

  return () => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
  };
};

export default app;
export { messaging };
