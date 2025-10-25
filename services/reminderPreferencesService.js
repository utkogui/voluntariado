const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de preferências de lembretes
 */
class ReminderPreferencesService {
  
  /**
   * Obter preferências de lembretes do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Preferências do usuário
   */
  static async getUserReminderPreferences(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          reminderPreferences: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Retornar preferências padrão se não existirem
      const defaultPreferences = this.getDefaultReminderPreferences();
      const preferences = user.reminderPreferences || defaultPreferences;

      return {
        success: true,
        data: preferences
      };

    } catch (error) {
      console.error('Erro ao obter preferências de lembretes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar preferências de lembretes do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} preferences - Novas preferências
   * @returns {Object} Resultado da operação
   */
  static async updateUserReminderPreferences(userId, preferences) {
    try {
      // Validar preferências
      const validatedPreferences = this.validateReminderPreferences(preferences);

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          reminderPreferences: validatedPreferences
        },
        select: {
          id: true,
          email: true,
          reminderPreferences: true
        }
      });

      return {
        success: true,
        data: user.reminderPreferences
      };

    } catch (error) {
      console.error('Erro ao atualizar preferências de lembretes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter preferências padrão de lembretes
   * @returns {Object} Preferências padrão
   */
  static getDefaultReminderPreferences() {
    return {
      // Configurações gerais
      enabled: true,
      frequency: 'IMMEDIATE', // IMMEDIATE, DAILY, WEEKLY
      
      // Tipos de lembretes
      reminderTypes: {
        ACTIVITY_REMINDER_24H: {
          enabled: true,
          channels: ['email', 'push'],
          advanceTime: 24, // horas antes
          priority: 'NORMAL'
        },
        ACTIVITY_REMINDER_2H: {
          enabled: true,
          channels: ['push'],
          advanceTime: 2, // horas antes
          priority: 'HIGH'
        },
        ACTIVITY_REMINDER_30MIN: {
          enabled: true,
          channels: ['push'],
          advanceTime: 0.5, // horas antes
          priority: 'URGENT'
        },
        CONFIRMATION_REMINDER: {
          enabled: true,
          channels: ['email', 'push'],
          advanceTime: 24, // horas antes
          priority: 'NORMAL'
        },
        ACTIVITY_CANCELLED: {
          enabled: true,
          channels: ['email', 'push'],
          advanceTime: 0, // imediato
          priority: 'HIGH'
        }
      },
      
      // Canais de notificação
      channels: {
        email: {
          enabled: true,
          frequency: 'IMMEDIATE',
          templates: {
            useCustom: false,
            customTemplates: {}
          }
        },
        push: {
          enabled: true,
          frequency: 'IMMEDIATE',
          sounds: {
            enabled: true,
            customSounds: {}
          }
        },
        sms: {
          enabled: false,
          frequency: 'NEVER',
          phoneNumber: null
        }
      },
      
      // Filtros e restrições
      filters: {
        activityTypes: [], // Todos os tipos
        maxDistance: 50, // km
        minRelevanceScore: 70,
        timezone: 'America/Sao_Paulo',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        workingHours: {
          enabled: false,
          start: '09:00',
          end: '18:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      },
      
      // Configurações avançadas
      advanced: {
        maxRemindersPerDay: 10,
        maxRemindersPerWeek: 50,
        batchReminders: true,
        digestReminders: {
          enabled: false,
          frequency: 'DAILY',
          time: '09:00',
          includeTypes: ['ACTIVITY_REMINDER_24H', 'CONFIRMATION_REMINDER']
        },
        smartReminders: {
          enabled: true,
          learnFromBehavior: true,
          adjustTiming: true,
          skipIfConfirmed: true
        }
      }
    };
  }

  /**
   * Validar preferências de lembretes
   * @param {Object} preferences - Preferências para validar
   * @returns {Object} Preferências validadas
   */
  static validateReminderPreferences(preferences) {
    const defaultPrefs = this.getDefaultReminderPreferences();
    const validated = { ...defaultPrefs };

    // Validar configurações gerais
    if (preferences.enabled !== undefined) {
      validated.enabled = Boolean(preferences.enabled);
    }
    if (preferences.frequency) {
      const validFrequencies = ['IMMEDIATE', 'DAILY', 'WEEKLY'];
      if (validFrequencies.includes(preferences.frequency)) {
        validated.frequency = preferences.frequency;
      }
    }

    // Validar tipos de lembretes
    if (preferences.reminderTypes) {
      Object.keys(preferences.reminderTypes).forEach(type => {
        if (validated.reminderTypes[type]) {
          const typePrefs = preferences.reminderTypes[type];
          if (typePrefs.enabled !== undefined) {
            validated.reminderTypes[type].enabled = Boolean(typePrefs.enabled);
          }
          if (typePrefs.channels) {
            const validChannels = ['email', 'push', 'sms'];
            validated.reminderTypes[type].channels = typePrefs.channels.filter(
              channel => validChannels.includes(channel)
            );
          }
          if (typePrefs.advanceTime !== undefined) {
            const time = parseFloat(typePrefs.advanceTime);
            if (time >= 0 && time <= 168) { // 0 a 168 horas (1 semana)
              validated.reminderTypes[type].advanceTime = time;
            }
          }
          if (typePrefs.priority) {
            const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
            if (validPriorities.includes(typePrefs.priority)) {
              validated.reminderTypes[type].priority = typePrefs.priority;
            }
          }
        }
      });
    }

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

    // Validar filtros
    if (preferences.filters) {
      if (preferences.filters.activityTypes) {
        validated.filters.activityTypes = Array.isArray(preferences.filters.activityTypes) 
          ? preferences.filters.activityTypes 
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
        if (preferences.filters.quietHours.days) {
          const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          validated.filters.quietHours.days = preferences.filters.quietHours.days.filter(
            day => validDays.includes(day)
          );
        }
      }
    }

    // Validar configurações avançadas
    if (preferences.advanced) {
      if (preferences.advanced.maxRemindersPerDay !== undefined) {
        const max = parseInt(preferences.advanced.maxRemindersPerDay);
        if (max >= 1 && max <= 100) {
          validated.advanced.maxRemindersPerDay = max;
        }
      }
      if (preferences.advanced.maxRemindersPerWeek !== undefined) {
        const max = parseInt(preferences.advanced.maxRemindersPerWeek);
        if (max >= 1 && max <= 1000) {
          validated.advanced.maxRemindersPerWeek = max;
        }
      }
      if (preferences.advanced.batchReminders !== undefined) {
        validated.advanced.batchReminders = Boolean(preferences.advanced.batchReminders);
      }
      if (preferences.advanced.smartReminders) {
        if (preferences.advanced.smartReminders.enabled !== undefined) {
          validated.advanced.smartReminders.enabled = Boolean(preferences.advanced.smartReminders.enabled);
        }
        if (preferences.advanced.smartReminders.learnFromBehavior !== undefined) {
          validated.advanced.smartReminders.learnFromBehavior = Boolean(preferences.advanced.smartReminders.learnFromBehavior);
        }
        if (preferences.advanced.smartReminders.adjustTiming !== undefined) {
          validated.advanced.smartReminders.adjustTiming = Boolean(preferences.advanced.smartReminders.adjustTiming);
        }
        if (preferences.advanced.smartReminders.skipIfConfirmed !== undefined) {
          validated.advanced.smartReminders.skipIfConfirmed = Boolean(preferences.advanced.smartReminders.skipIfConfirmed);
        }
      }
    }

    return validated;
  }

  /**
   * Verificar se usuário deve receber lembrete
   * @param {string} userId - ID do usuário
   * @param {string} reminderType - Tipo do lembrete
   * @param {Object} data - Dados do lembrete
   * @returns {Object} Resultado da verificação
   */
  static async shouldSendReminder(userId, reminderType, data = {}) {
    try {
      const preferencesResult = await this.getUserReminderPreferences(userId);
      
      if (!preferencesResult.success) {
        return {
          shouldSend: false,
          reason: 'Erro ao obter preferências'
        };
      }

      const preferences = preferencesResult.data;

      // Verificar se lembretes estão habilitados
      if (!preferences.enabled) {
        return {
          shouldSend: false,
          reason: 'Lembretes desabilitados'
        };
      }

      // Verificar se o tipo de lembrete está habilitado
      const reminderSettings = preferences.reminderTypes[reminderType];
      if (!reminderSettings || !reminderSettings.enabled) {
        return {
          shouldSend: false,
          reason: 'Tipo de lembrete desabilitado'
        };
      }

      // Verificar filtros de tipo de atividade
      if (preferences.filters.activityTypes.length > 0 && data.activity) {
        if (!preferences.filters.activityTypes.includes(data.activity.type)) {
          return {
            shouldSend: false,
            reason: 'Tipo de atividade não permitido'
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

      // Verificar score de relevância
      if (preferences.filters.minRelevanceScore && data.relevanceScore) {
        if (data.relevanceScore < preferences.filters.minRelevanceScore) {
          return {
            shouldSend: false,
            reason: 'Score de relevância insuficiente'
          };
        }
      }

      // Verificar horário silencioso
      if (preferences.filters.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        
        if (preferences.filters.quietHours.days.includes(currentDay)) {
          if (this.isInQuietHours(currentTime, preferences.filters.quietHours.start, preferences.filters.quietHours.end)) {
            return {
              shouldSend: false,
              reason: 'Horário silencioso ativo'
            };
          }
        }
      }

      // Verificar limite diário
      if (preferences.advanced.maxRemindersPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const reminderCount = await prisma.scheduledNotification.count({
          where: {
            userId,
            type: { in: ['EMAIL_REMINDER', 'PUSH_REMINDER'] },
            createdAt: {
              gte: today
            }
          }
        });

        if (reminderCount >= preferences.advanced.maxRemindersPerDay) {
          return {
            shouldSend: false,
            reason: 'Limite diário de lembretes atingido'
          };
        }
      }

      return {
        shouldSend: true,
        channels: reminderSettings.channels,
        advanceTime: reminderSettings.advanceTime,
        priority: reminderSettings.priority
      };

    } catch (error) {
      console.error('Erro ao verificar se deve enviar lembrete:', error);
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
   * Obter estatísticas de preferências de lembretes
   * @returns {Object} Estatísticas
   */
  static async getReminderPreferencesStats() {
    try {
      const users = await prisma.user.findMany({
        select: {
          reminderPreferences: true
        }
      });

      const stats = {
        totalUsers: users.length,
        usersWithPreferences: 0,
        enabledReminders: 0,
        byChannel: {
          email: { enabled: 0, disabled: 0 },
          push: { enabled: 0, disabled: 0 },
          sms: { enabled: 0, disabled: 0 }
        },
        byReminderType: {},
        withQuietHours: 0,
        withSmartReminders: 0
      };

      users.forEach(user => {
        const prefs = user.reminderPreferences;
        if (prefs) {
          stats.usersWithPreferences++;

          if (prefs.enabled) {
            stats.enabledReminders++;
          }

          // Estatísticas de canais
          if (prefs.channels) {
            Object.keys(prefs.channels).forEach(channel => {
              if (stats.byChannel[channel]) {
                if (prefs.channels[channel].enabled) {
                  stats.byChannel[channel].enabled++;
                } else {
                  stats.byChannel[channel].disabled++;
                }
              }
            });
          }

          // Estatísticas de tipos de lembrete
          if (prefs.reminderTypes) {
            Object.keys(prefs.reminderTypes).forEach(type => {
              if (!stats.byReminderType[type]) {
                stats.byReminderType[type] = { enabled: 0, disabled: 0 };
              }
              if (prefs.reminderTypes[type].enabled) {
                stats.byReminderType[type].enabled++;
              } else {
                stats.byReminderType[type].disabled++;
              }
            });
          }

          // Estatísticas de configurações avançadas
          if (prefs.filters && prefs.filters.quietHours && prefs.filters.quietHours.enabled) {
            stats.withQuietHours++;
          }
          if (prefs.advanced && prefs.advanced.smartReminders && prefs.advanced.smartReminders.enabled) {
            stats.withSmartReminders++;
          }
        }
      });

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de preferências de lembretes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ReminderPreferencesService;
