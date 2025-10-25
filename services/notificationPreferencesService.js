const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de preferências de notificação
 */
class NotificationPreferencesService {
  
  /**
   * Obter preferências de notificação do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Preferências do usuário
   */
  static async getUserPreferences(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          notificationPreferences: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Retornar preferências padrão se não existirem
      const defaultPreferences = this.getDefaultPreferences();
      const preferences = user.notificationPreferences || defaultPreferences;

      return {
        success: true,
        data: preferences
      };

    } catch (error) {
      console.error('Erro ao obter preferências de notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar preferências de notificação do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} preferences - Novas preferências
   * @returns {Object} Resultado da operação
   */
  static async updateUserPreferences(userId, preferences) {
    try {
      // Validar preferências
      const validatedPreferences = this.validatePreferences(preferences);

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPreferences: validatedPreferences
        },
        select: {
          id: true,
          email: true,
          notificationPreferences: true
        }
      });

      return {
        success: true,
        data: user.notificationPreferences
      };

    } catch (error) {
      console.error('Erro ao atualizar preferências de notificação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter preferências padrão
   * @returns {Object} Preferências padrão
   */
  static getDefaultPreferences() {
    return {
      // Canais de notificação
      channels: {
        email: {
          enabled: true,
          frequency: 'IMMEDIATE'
        },
        push: {
          enabled: true,
          frequency: 'IMMEDIATE'
        },
        sms: {
          enabled: false,
          frequency: 'NEVER'
        }
      },
      
      // Tipos de notificação
      types: {
        NEW_OPPORTUNITY: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE',
          minRelevanceScore: 70
        },
        APPLICATION_UPDATE: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE'
        },
        MESSAGE: {
          enabled: true,
          channels: ['push'],
          frequency: 'IMMEDIATE'
        },
        REMINDER: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE'
        },
        EVALUATION: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE'
        },
        SYSTEM: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE'
        },
        OPPORTUNITY_DEADLINE: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE',
          daysBefore: 3
        },
        VOLUNTEER_ACTIVITY: {
          enabled: true,
          channels: ['email', 'push'],
          frequency: 'IMMEDIATE',
          hoursBefore: 24
        }
      },
      
      // Filtros
      filters: {
        categories: [], // Todas as categorias
        skills: [], // Todas as habilidades
        maxDistance: 50, // km
        minRelevanceScore: 70,
        timezone: 'America/Sao_Paulo',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      },
      
      // Configurações avançadas
      advanced: {
        digest: {
          enabled: true,
          frequency: 'DAILY',
          time: '09:00'
        },
        batchNotifications: true,
        maxNotificationsPerDay: 50,
        priorityThreshold: 'NORMAL'
      }
    };
  }

  /**
   * Validar preferências
   * @param {Object} preferences - Preferências para validar
   * @returns {Object} Preferências validadas
   */
  static validatePreferences(preferences) {
    const defaultPrefs = this.getDefaultPreferences();
    const validated = { ...defaultPrefs };

    // Validar canais
    if (preferences.channels) {
      Object.keys(preferences.channels).forEach(channel => {
        if (validated.channels[channel]) {
          if (preferences.channels[channel].enabled !== undefined) {
            validated.channels[channel].enabled = Boolean(preferences.channels[channel].enabled);
          }
          if (preferences.channels[channel].frequency) {
            const validFrequencies = ['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'];
            if (validFrequencies.includes(preferences.channels[channel].frequency)) {
              validated.channels[channel].frequency = preferences.channels[channel].frequency;
            }
          }
        }
      });
    }

    // Validar tipos de notificação
    if (preferences.types) {
      Object.keys(preferences.types).forEach(type => {
        if (validated.types[type]) {
          if (preferences.types[type].enabled !== undefined) {
            validated.types[type].enabled = Boolean(preferences.types[type].enabled);
          }
          if (preferences.types[type].channels) {
            const validChannels = ['email', 'push', 'sms'];
            validated.types[type].channels = preferences.types[type].channels.filter(
              channel => validChannels.includes(channel)
            );
          }
          if (preferences.types[type].frequency) {
            const validFrequencies = ['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER'];
            if (validFrequencies.includes(preferences.types[type].frequency)) {
              validated.types[type].frequency = preferences.types[type].frequency;
            }
          }
          if (preferences.types[type].minRelevanceScore !== undefined) {
            const score = parseInt(preferences.types[type].minRelevanceScore);
            if (score >= 0 && score <= 100) {
              validated.types[type].minRelevanceScore = score;
            }
          }
        }
      });
    }

    // Validar filtros
    if (preferences.filters) {
      if (preferences.filters.categories) {
        validated.filters.categories = Array.isArray(preferences.filters.categories) 
          ? preferences.filters.categories 
          : [];
      }
      if (preferences.filters.skills) {
        validated.filters.skills = Array.isArray(preferences.filters.skills) 
          ? preferences.filters.skills 
          : [];
      }
      if (preferences.filters.maxDistance !== undefined) {
        const distance = parseInt(preferences.filters.maxDistance);
        if (distance >= 1 && distance <= 500) {
          validated.filters.maxDistance = distance;
        }
      }
      if (preferences.filters.minRelevanceScore !== undefined) {
        const score = parseInt(preferences.filters.minRelevanceScore);
        if (score >= 0 && score <= 100) {
          validated.filters.minRelevanceScore = score;
        }
      }
      if (preferences.filters.timezone) {
        validated.filters.timezone = preferences.filters.timezone;
      }
      if (preferences.filters.quietHours) {
        if (preferences.filters.quietHours.enabled !== undefined) {
          validated.filters.quietHours.enabled = Boolean(preferences.filters.quietHours.enabled);
        }
        if (preferences.filters.quietHours.start) {
          validated.filters.quietHours.start = preferences.filters.quietHours.start;
        }
        if (preferences.filters.quietHours.end) {
          validated.filters.quietHours.end = preferences.filters.quietHours.end;
        }
      }
    }

    // Validar configurações avançadas
    if (preferences.advanced) {
      if (preferences.advanced.digest) {
        if (preferences.advanced.digest.enabled !== undefined) {
          validated.advanced.digest.enabled = Boolean(preferences.advanced.digest.enabled);
        }
        if (preferences.advanced.digest.frequency) {
          const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
          if (validFrequencies.includes(preferences.advanced.digest.frequency)) {
            validated.advanced.digest.frequency = preferences.advanced.digest.frequency;
          }
        }
        if (preferences.advanced.digest.time) {
          validated.advanced.digest.time = preferences.advanced.digest.time;
        }
      }
      if (preferences.advanced.batchNotifications !== undefined) {
        validated.advanced.batchNotifications = Boolean(preferences.advanced.batchNotifications);
      }
      if (preferences.advanced.maxNotificationsPerDay !== undefined) {
        const max = parseInt(preferences.advanced.maxNotificationsPerDay);
        if (max >= 1 && max <= 1000) {
          validated.advanced.maxNotificationsPerDay = max;
        }
      }
      if (preferences.advanced.priorityThreshold) {
        const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
        if (validPriorities.includes(preferences.advanced.priorityThreshold)) {
          validated.advanced.priorityThreshold = preferences.advanced.priorityThreshold;
        }
      }
    }

    return validated;
  }

  /**
   * Verificar se usuário deve receber notificação
   * @param {string} userId - ID do usuário
   * @param {string} type - Tipo de notificação
   * @param {Object} data - Dados da notificação
   * @returns {Object} Resultado da verificação
   */
  static async shouldSendNotification(userId, type, data = {}) {
    try {
      const preferencesResult = await this.getUserPreferences(userId);
      
      if (!preferencesResult.success) {
        return {
          shouldSend: false,
          reason: 'Erro ao obter preferências'
        };
      }

      const preferences = preferencesResult.data;

      // Verificar se o tipo de notificação está habilitado
      if (!preferences.types[type] || !preferences.types[type].enabled) {
        return {
          shouldSend: false,
          reason: 'Tipo de notificação desabilitado'
        };
      }

      // Verificar score de relevância
      if (preferences.types[type].minRelevanceScore && data.relevanceScore) {
        if (data.relevanceScore < preferences.types[type].minRelevanceScore) {
          return {
            shouldSend: false,
            reason: 'Score de relevância insuficiente'
          };
        }
      }

      // Verificar filtros de categoria
      if (preferences.filters.categories.length > 0 && data.opportunity) {
        const hasMatchingCategory = data.opportunity.categories?.some(category => 
          preferences.filters.categories.includes(category)
        );
        if (!hasMatchingCategory) {
          return {
            shouldSend: false,
            reason: 'Categoria não permitida'
          };
        }
      }

      // Verificar filtros de habilidade
      if (preferences.filters.skills.length > 0 && data.volunteer) {
        const hasMatchingSkill = data.volunteer.skills?.some(skill => 
          preferences.filters.skills.includes(skill)
        );
        if (!hasMatchingSkill) {
          return {
            shouldSend: false,
            reason: 'Habilidade não permitida'
          };
        }
      }

      // Verificar distância
      if (preferences.filters.maxDistance && data.distance) {
        if (data.distance > preferences.filters.maxDistance) {
          return {
            shouldSend: false,
            reason: 'Distância muito grande'
          };
        }
      }

      // Verificar horário silencioso
      if (preferences.filters.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const startTime = preferences.filters.quietHours.start;
        const endTime = preferences.filters.quietHours.end;
        
        if (this.isInQuietHours(currentTime, startTime, endTime)) {
          return {
            shouldSend: false,
            reason: 'Horário silencioso ativo'
          };
        }
      }

      // Verificar limite diário
      if (preferences.advanced.maxNotificationsPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const notificationCount = await prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: today
            }
          }
        });

        if (notificationCount >= preferences.advanced.maxNotificationsPerDay) {
          return {
            shouldSend: false,
            reason: 'Limite diário de notificações atingido'
          };
        }
      }

      return {
        shouldSend: true,
        channels: preferences.types[type].channels,
        frequency: preferences.types[type].frequency
      };

    } catch (error) {
      console.error('Erro ao verificar se deve enviar notificação:', error);
      return {
        shouldSend: false,
        reason: 'Erro interno'
      };
    }
  }

  /**
   * Verificar se está em horário silencioso
   * @param {string} currentTime - Hora atual (HH:MM)
   * @param {string} startTime - Hora de início (HH:MM)
   * @param {string} endTime - Hora de fim (HH:MM)
   * @returns {boolean} Se está em horário silencioso
   */
  static isInQuietHours(currentTime, startTime, endTime) {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Horário silencioso cruza a meia-noite
      return current >= start || current <= end;
    }
  }

  /**
   * Converter tempo para minutos
   * @param {string} time - Tempo no formato HH:MM
   * @returns {number} Minutos desde meia-noite
   */
  static timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Obter estatísticas de preferências
   * @returns {Object} Estatísticas
   */
  static async getPreferencesStats() {
    try {
      const users = await prisma.user.findMany({
        select: {
          notificationPreferences: true
        }
      });

      const stats = {
        totalUsers: users.length,
        usersWithPreferences: 0,
        channelStats: {
          email: { enabled: 0, disabled: 0 },
          push: { enabled: 0, disabled: 0 },
          sms: { enabled: 0, disabled: 0 }
        },
        typeStats: {},
        filterStats: {
          withCategoryFilter: 0,
          withSkillFilter: 0,
          withDistanceFilter: 0,
          withQuietHours: 0
        }
      };

      users.forEach(user => {
        const prefs = user.notificationPreferences;
        if (prefs) {
          stats.usersWithPreferences++;

          // Estatísticas de canais
          if (prefs.channels) {
            Object.keys(prefs.channels).forEach(channel => {
              if (stats.channelStats[channel]) {
                if (prefs.channels[channel].enabled) {
                  stats.channelStats[channel].enabled++;
                } else {
                  stats.channelStats[channel].disabled++;
                }
              }
            });
          }

          // Estatísticas de tipos
          if (prefs.types) {
            Object.keys(prefs.types).forEach(type => {
              if (!stats.typeStats[type]) {
                stats.typeStats[type] = { enabled: 0, disabled: 0 };
              }
              if (prefs.types[type].enabled) {
                stats.typeStats[type].enabled++;
              } else {
                stats.typeStats[type].disabled++;
              }
            });
          }

          // Estatísticas de filtros
          if (prefs.filters) {
            if (prefs.filters.categories && prefs.filters.categories.length > 0) {
              stats.filterStats.withCategoryFilter++;
            }
            if (prefs.filters.skills && prefs.filters.skills.length > 0) {
              stats.filterStats.withSkillFilter++;
            }
            if (prefs.filters.maxDistance && prefs.filters.maxDistance < 50) {
              stats.filterStats.withDistanceFilter++;
            }
            if (prefs.filters.quietHours && prefs.filters.quietHours.enabled) {
              stats.filterStats.withQuietHours++;
            }
          }
        }
      });

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de preferências:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = NotificationPreferencesService;
