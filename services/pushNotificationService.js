const admin = require('firebase-admin');
const config = require('../config/config');

class PushNotificationService {
  constructor() {
    this.provider = config.PUSH_PROVIDER || 'firebase';
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'firebase':
        this.initializeFirebase();
        break;
      case 'onesignal':
        this.initializeOneSignal();
        break;
      default:
        this.initializeFirebase();
        break;
    }
  }

  initializeFirebase() {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: 'service_account',
        project_id: config.FIREBASE_PROJECT_ID,
        private_key_id: config.FIREBASE_PRIVATE_KEY_ID,
        private_key: config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: config.FIREBASE_CLIENT_EMAIL,
        client_id: config.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${config.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.FIREBASE_PROJECT_ID
      });
    }
    this.sendNotification = this.sendFirebaseNotification;
  }

  initializeOneSignal() {
    this.oneSignalAppId = config.ONESIGNAL_APP_ID;
    this.oneSignalApiKey = config.ONESIGNAL_API_KEY;
    this.sendNotification = this.sendOneSignalNotification;
  }

  async sendFirebaseNotification(notificationData) {
    try {
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body
        },
        data: notificationData.data || {},
        token: notificationData.token,
        topic: notificationData.topic,
        condition: notificationData.condition,
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#3B82F6',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: notificationData.badge || 0
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      return {
        success: true,
        messageId: response,
        provider: 'firebase'
      };
    } catch (error) {
      console.error('Erro ao enviar notificação Firebase:', error);
      throw new Error('Erro ao enviar notificação push');
    }
  }

  async sendOneSignalNotification(notificationData) {
    try {
      const axios = require('axios');
      
      const payload = {
        app_id: this.oneSignalAppId,
        headings: { en: notificationData.title },
        contents: { en: notificationData.body },
        data: notificationData.data || {},
        include_player_ids: notificationData.tokens || [notificationData.token],
        included_segments: notificationData.segments || [],
        filters: notificationData.filters || []
      };

      const response = await axios.post('https://onesignal.com/api/v1/notifications', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.oneSignalApiKey}`
        }
      });

      return {
        success: true,
        messageId: response.data.id,
        provider: 'onesignal'
      };
    } catch (error) {
      console.error('Erro ao enviar notificação OneSignal:', error);
      throw new Error('Erro ao enviar notificação push');
    }
  }

  async sendToUser(userId, notificationData) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user || !user.fcmToken) {
        throw new Error('Usuário não encontrado ou sem token FCM');
      }

      return await this.sendNotification({
        ...notificationData,
        token: user.fcmToken
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para usuário:', error);
      throw error;
    }
  }

  async sendToMultipleUsers(userIds, notificationData) {
    try {
      const User = require('../models/User');
      const users = await User.find({ 
        _id: { $in: userIds },
        fcmToken: { $exists: true, $ne: null }
      });

      if (users.length === 0) {
        throw new Error('Nenhum usuário com token FCM encontrado');
      }

      const tokens = users.map(user => user.fcmToken);
      
      if (this.provider === 'firebase') {
        return await this.sendFirebaseMulticast(tokens, notificationData);
      } else {
        return await this.sendNotification({
          ...notificationData,
          tokens: tokens
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação para múltiplos usuários:', error);
      throw error;
    }
  }

  async sendFirebaseMulticast(tokens, notificationData) {
    try {
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body
        },
        data: notificationData.data || {},
        tokens: tokens,
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#3B82F6',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: notificationData.badge || 0
            }
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        provider: 'firebase'
      };
    } catch (error) {
      console.error('Erro ao enviar notificação multicast Firebase:', error);
      throw new Error('Erro ao enviar notificação push');
    }
  }

  async sendToTopic(topic, notificationData) {
    try {
      return await this.sendNotification({
        ...notificationData,
        topic: topic
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para tópico:', error);
      throw error;
    }
  }

  async subscribeToTopic(tokens, topic) {
    try {
      if (this.provider === 'firebase') {
        const response = await admin.messaging().subscribeToTopic(tokens, topic);
        return {
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
          errors: response.errors
        };
      } else {
        throw new Error('Subscrição de tópico não suportada para este provedor');
      }
    } catch (error) {
      console.error('Erro ao inscrever em tópico:', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (this.provider === 'firebase') {
        const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
        return {
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
          errors: response.errors
        };
      } else {
        throw new Error('Desinscrição de tópico não suportada para este provedor');
      }
    } catch (error) {
      console.error('Erro ao desinscrever de tópico:', error);
      throw error;
    }
  }

  async sendScheduledNotification(notificationData, scheduleTime) {
    try {
      // Implementar lógica de agendamento
      // Isso pode usar um job queue como Bull ou Agenda
      const scheduleTimeMs = new Date(scheduleTime).getTime();
      const now = Date.now();
      
      if (scheduleTimeMs <= now) {
        throw new Error('Tempo de agendamento deve ser no futuro');
      }

      // Aqui você implementaria a lógica de agendamento
      // Por exemplo, usando Bull Queue
      const Queue = require('bull');
      const notificationQueue = new Queue('notification', process.env.REDIS_URL);
      
      await notificationQueue.add('send-notification', notificationData, {
        delay: scheduleTimeMs - now
      });

      return {
        success: true,
        scheduledFor: scheduleTime,
        message: 'Notificação agendada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  async getNotificationStats(startDate, endDate) {
    try {
      // Implementar lógica para obter estatísticas
      // Isso varia dependendo do provedor usado
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de notificação:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();