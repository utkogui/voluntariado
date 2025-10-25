const { GoogleAnalytics } = require('@google-analytics/data');
const mixpanel = require('mixpanel');
const dotenv = require('dotenv');

dotenv.config();

// Configuração do Google Analytics
const analytics = new GoogleAnalytics({
  propertyId: process.env.GA_PROPERTY_ID,
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n')
  }
});

// Configuração do Mixpanel
const mixpanelClient = mixpanel.init(process.env.MIXPANEL_TOKEN);

const analyticsService = {
  // Google Analytics - Obter relatórios
  getGAReport: async (startDate, endDate, metrics = [], dimensions = []) => {
    try {
      const [response] = await analytics.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '7daysAgo',
            endDate: endDate || 'today'
          }
        ],
        metrics: metrics.length > 0 ? metrics : [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'pageviews' },
          { name: 'bounceRate' }
        ],
        dimensions: dimensions.length > 0 ? dimensions : [
          { name: 'date' }
        ]
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting GA report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Google Analytics - Obter dados em tempo real
  getGARealtime: async () => {
    try {
      const [response] = await analytics.runRealtimeReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ],
        dimensions: [
          { name: 'country' },
          { name: 'deviceCategory' }
        ]
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting GA realtime data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Mixpanel - Rastrear evento
  trackMixpanelEvent: async (eventName, properties = {}, userId = null) => {
    try {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      };

      if (userId) {
        eventData.distinct_id = userId;
      }

      mixpanelClient.track(eventName, eventData.properties, eventData.distinct_id);

      return {
        success: true,
        message: 'Event tracked successfully'
      };
    } catch (error) {
      console.error('Error tracking Mixpanel event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Mixpanel - Definir propriedades do usuário
  setMixpanelUserProperties: async (userId, properties = {}) => {
    try {
      mixpanelClient.people.set(userId, properties);

      return {
        success: true,
        message: 'User properties set successfully'
      };
    } catch (error) {
      console.error('Error setting Mixpanel user properties:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Mixpanel - Obter insights
  getMixpanelInsights: async (event, fromDate, toDate, unit = 'day') => {
    try {
      // Esta é uma implementação simplificada
      // Em produção, você usaria a API do Mixpanel para obter insights
      const insights = {
        event,
        fromDate,
        toDate,
        unit,
        data: [] // Dados simulados
      };

      return {
        success: true,
        data: insights
      };
    } catch (error) {
      console.error('Error getting Mixpanel insights:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Eventos personalizados do sistema
  trackUserRegistration: async (userId, userType, registrationMethod = 'email') => {
    try {
      const eventData = {
        user_id: userId,
        user_type: userType,
        registration_method: registrationMethod,
        timestamp: new Date().toISOString()
      };

      // Enviar para ambos os serviços
      await Promise.all([
        analyticsService.trackMixpanelEvent('user_registration', eventData, userId),
        // Aqui você também pode enviar para Google Analytics via Measurement Protocol
      ]);

      return {
        success: true,
        message: 'User registration tracked'
      };
    } catch (error) {
      console.error('Error tracking user registration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  trackOpportunityView: async (userId, opportunityId, opportunityType) => {
    try {
      const eventData = {
        user_id: userId,
        opportunity_id: opportunityId,
        opportunity_type: opportunityType,
        timestamp: new Date().toISOString()
      };

      await analyticsService.trackMixpanelEvent('opportunity_viewed', eventData, userId);

      return {
        success: true,
        message: 'Opportunity view tracked'
      };
    } catch (error) {
      console.error('Error tracking opportunity view:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  trackApplicationSubmission: async (userId, opportunityId, applicationId) => {
    try {
      const eventData = {
        user_id: userId,
        opportunity_id: opportunityId,
        application_id: applicationId,
        timestamp: new Date().toISOString()
      };

      await analyticsService.trackMixpanelEvent('application_submitted', eventData, userId);

      return {
        success: true,
        message: 'Application submission tracked'
      };
    } catch (error) {
      console.error('Error tracking application submission:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  trackVolunteerActivity: async (userId, activityId, activityType, duration) => {
    try {
      const eventData = {
        user_id: userId,
        activity_id: activityId,
        activity_type: activityType,
        duration: duration,
        timestamp: new Date().toISOString()
      };

      await analyticsService.trackMixpanelEvent('volunteer_activity', eventData, userId);

      return {
        success: true,
        message: 'Volunteer activity tracked'
      };
    } catch (error) {
      console.error('Error tracking volunteer activity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  trackDonation: async (userId, amount, donationType, organizationId) => {
    try {
      const eventData = {
        user_id: userId,
        amount: amount,
        donation_type: donationType,
        organization_id: organizationId,
        timestamp: new Date().toISOString()
      };

      await analyticsService.trackMixpanelEvent('donation_made', eventData, userId);

      return {
        success: true,
        message: 'Donation tracked'
      };
    } catch (error) {
      console.error('Error tracking donation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter métricas consolidadas
  getConsolidatedMetrics: async (startDate, endDate) => {
    try {
      const [gaReport, gaRealtime] = await Promise.all([
        analyticsService.getGAReport(startDate, endDate),
        analyticsService.getGARealtime()
      ]);

      const metrics = {
        googleAnalytics: gaReport.success ? gaReport.data : null,
        realtime: gaRealtime.success ? gaRealtime.data : null,
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      console.error('Error getting consolidated metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter funil de conversão
  getConversionFunnel: async (startDate, endDate) => {
    try {
      const funnelSteps = [
        'page_view',
        'opportunity_view',
        'application_start',
        'application_submit',
        'activity_participation'
      ];

      const funnelData = {
        steps: funnelSteps,
        conversions: [],
        startDate,
        endDate
      };

      // Aqui você implementaria a lógica para calcular as conversões
      // Por enquanto, retornamos dados simulados
      for (let i = 0; i < funnelSteps.length; i++) {
        funnelData.conversions.push({
          step: funnelSteps[i],
          users: Math.floor(Math.random() * 1000) + 100,
          conversion_rate: i > 0 ? Math.random() * 0.8 : 1
        });
      }

      return {
        success: true,
        data: funnelData
      };
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obter segmentação de usuários
  getUserSegmentation: async (startDate, endDate) => {
    try {
      const segments = {
        by_user_type: {
          volunteers: Math.floor(Math.random() * 500) + 100,
          institutions: Math.floor(Math.random() * 100) + 20,
          companies: Math.floor(Math.random() * 50) + 10
        },
        by_activity: {
          active: Math.floor(Math.random() * 300) + 50,
          inactive: Math.floor(Math.random() * 200) + 30,
          new_users: Math.floor(Math.random() * 100) + 20
        },
        by_location: {
          'São Paulo': Math.floor(Math.random() * 200) + 50,
          'Rio de Janeiro': Math.floor(Math.random() * 150) + 30,
          'Belo Horizonte': Math.floor(Math.random() * 100) + 20,
          'Outros': Math.floor(Math.random() * 300) + 50
        }
      };

      return {
        success: true,
        data: segments
      };
    } catch (error) {
      console.error('Error getting user segmentation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = analyticsService;