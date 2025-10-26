const prisma = require('../config/database');
const emailService = require('./emailService');
const pushNotificationService = require('./pushNotificationService');

class SecurityService {
  // Registrar evento de segurança
  async logSecurityEvent(eventType, eventData, userId = null) {
    try {
      const event = await prisma.securityEvent.create({
        data: {
          eventType,
          eventData: JSON.stringify(eventData),
          userId,
          timestamp: new Date(),
          ipAddress: eventData.ipAddress || null,
          userAgent: eventData.userAgent || null
        }
      });
      
      // Verificar se é um evento crítico
      if (this.isCriticalEvent(eventType)) {
        await this.handleCriticalEvent(event);
      }
      
      return event;
    } catch (error) {
      console.error('Error logging security event:', error);
      throw new Error('Failed to log security event');
    }
  }
  
  // Verificar se é um evento crítico
  isCriticalEvent(eventType) {
    const criticalEvents = [
      'LOGIN_FAILURE',
      'UNAUTHORIZED_ACCESS',
      'DATA_BREACH',
      'SUSPICIOUS_ACTIVITY',
      'MALWARE_DETECTED',
      'DDOS_ATTACK',
      'SQL_INJECTION',
      'XSS_ATTACK'
    ];
    
    return criticalEvents.includes(eventType);
  }
  
  // Lidar com evento crítico
  async handleCriticalEvent(event) {
    try {
      // Notificar administradores
      await this.notifyAdmins(event);
      
      // Ativar medidas de segurança adicionais
      await this.activateSecurityMeasures(event);
      
      // Registrar em log de segurança
      console.log(`CRITICAL SECURITY EVENT: ${event.eventType}`, event);
    } catch (error) {
      console.error('Error handling critical event:', error);
    }
  }
  
  // Notificar administradores
  async notifyAdmins(event) {
    try {
      const admins = await prisma.user.findMany({
        where: { type: 'ADMIN' },
        select: { id: true, email: true, name: true }
      });
      
      for (const admin of admins) {
        // Enviar notificação por email
        await emailService.sendTemplate(admin.email, 'security-alert', {
          subject: `ALERTA DE SEGURANÇA: ${event.eventType}`,
          data: {
            event,
            adminName: admin.name
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(admin.id, {
          title: 'Alerta de Segurança',
          body: `Evento crítico detectado: ${event.eventType}`,
          data: { eventId: event.id }
        });
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
  
  // Ativar medidas de segurança
  async activateSecurityMeasures(event) {
    try {
      // Bloquear IP se necessário
      if (event.eventData.ipAddress) {
        await this.blockIP(event.eventData.ipAddress);
      }
      
      // Bloquear usuário se necessário
      if (event.userId) {
        await this.blockUser(event.userId);
      }
      
      // Ativar modo de segurança
      await this.activateSecurityMode();
    } catch (error) {
      console.error('Error activating security measures:', error);
    }
  }
  
  // Bloquear IP
  async blockIP(ipAddress) {
    try {
      await prisma.blockedIP.create({
        data: {
          ipAddress,
          reason: 'Security threat detected',
          blockedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        }
      });
      
      console.log(`IP blocked: ${ipAddress}`);
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  }
  
  // Bloquear usuário
  async blockUser(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
          blockReason: 'Security threat detected'
        }
      });
      
      console.log(`User blocked: ${userId}`);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }
  
  // Ativar modo de segurança
  async activateSecurityMode() {
    try {
      // Implementar medidas de segurança adicionais
      // Por exemplo: aumentar rate limiting, ativar captcha, etc.
      console.log('Security mode activated');
    } catch (error) {
      console.error('Error activating security mode:', error);
    }
  }
  
  // Verificar se IP está bloqueado
  async isIPBlocked(ipAddress) {
    try {
      const blockedIP = await prisma.blockedIP.findFirst({
        where: {
          ipAddress,
          expiresAt: {
            gt: new Date()
          }
        }
      });
      
      return !!blockedIP;
    } catch (error) {
      console.error('Error checking IP block:', error);
      return false;
    }
  }
  
  // Verificar se usuário está bloqueado
  async isUserBlocked(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true, blockedAt: true, blockReason: true }
      });
      
      return user?.isBlocked || false;
    } catch (error) {
      console.error('Error checking user block:', error);
      return false;
    }
  }
  
  // Obter eventos de segurança
  async getSecurityEvents(options = {}) {
    const { page = 1, limit = 10, eventType, userId, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (eventType) where.eventType = eventType;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }
    
    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          }
        }
      }),
      prisma.securityEvent.count({ where })
    ]);
    
    return {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter estatísticas de segurança
  async getSecurityStats(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      totalEvents,
      criticalEvents,
      blockedIPs,
      blockedUsers,
      eventsByType,
      eventsByUser,
      topThreats
    ] = await Promise.all([
      prisma.securityEvent.count({
        where: { timestamp: { gte: startDate } }
      }),
      prisma.securityEvent.count({
        where: {
          timestamp: { gte: startDate },
          eventType: {
            in: ['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'SUSPICIOUS_ACTIVITY']
          }
        }
      }),
      prisma.blockedIP.count({
        where: { blockedAt: { gte: startDate } }
      }),
      prisma.user.count({
        where: { blockedAt: { gte: startDate } }
      }),
      prisma.securityEvent.groupBy({
        by: ['eventType'],
        _count: { eventType: true },
        where: { timestamp: { gte: startDate } }
      }),
      prisma.securityEvent.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: { timestamp: { gte: startDate } }
      }),
      prisma.securityEvent.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          }
        }
      })
    ]);
    
    return {
      total: totalEvents,
      critical: criticalEvents,
      blockedIPs,
      blockedUsers,
      byType: eventsByType,
      byUser: eventsByUser,
      topThreats
    };
  }
  
  // Obter relatório de segurança
  async getSecurityReport(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      stats,
      events,
      threats,
      recommendations
    ] = await Promise.all([
      this.getSecurityStats(period),
      this.getSecurityEvents({ startDate, limit: 100 }),
      this.getTopThreats(period),
      this.getSecurityRecommendations(period)
    ]);
    
    return {
      period,
      stats,
      events: events.events,
      threats,
      recommendations,
      generatedAt: new Date()
    };
  }
  
  // Obter principais ameaças
  async getTopThreats(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const threats = await prisma.securityEvent.findMany({
      where: {
        timestamp: { gte: startDate },
        eventType: {
          in: ['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'SUSPICIOUS_ACTIVITY']
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        }
      }
    });
    
    return threats;
  }
  
  // Obter recomendações de segurança
  async getSecurityRecommendations(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const recommendations = [];
    
    // Verificar falhas de login
    const loginFailures = await prisma.securityEvent.count({
      where: {
        eventType: 'LOGIN_FAILURE',
        timestamp: { gte: startDate }
      }
    });
    
    if (loginFailures > 100) {
      recommendations.push({
        type: 'HIGH',
        title: 'Muitas falhas de login detectadas',
        description: `${loginFailures} falhas de login foram detectadas. Considere implementar captcha ou bloqueio temporário.`,
        action: 'Implementar medidas de proteção contra força bruta'
      });
    }
    
    // Verificar acessos não autorizados
    const unauthorizedAccess = await prisma.securityEvent.count({
      where: {
        eventType: 'UNAUTHORIZED_ACCESS',
        timestamp: { gte: startDate }
      }
    });
    
    if (unauthorizedAccess > 10) {
      recommendations.push({
        type: 'CRITICAL',
        title: 'Acessos não autorizados detectados',
        description: `${unauthorizedAccess} tentativas de acesso não autorizado foram detectadas.`,
        action: 'Revisar logs e implementar medidas de segurança adicionais'
      });
    }
    
    // Verificar IPs bloqueados
    const blockedIPs = await prisma.blockedIP.count({
      where: { blockedAt: { gte: startDate } }
    });
    
    if (blockedIPs > 50) {
      recommendations.push({
        type: 'MEDIUM',
        title: 'Muitos IPs bloqueados',
        description: `${blockedIPs} IPs foram bloqueados. Considere implementar um sistema de whitelist.`,
        action: 'Revisar política de bloqueio de IPs'
      });
    }
    
    return recommendations;
  }
  
  // Obter data de início baseada no período
  getStartDate(period) {
    const now = new Date();
    
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
  
  // Verificar força da senha
  async checkPasswordStrength(password) {
    const strength = {
      score: 0,
      feedback: []
    };
    
    // Verificar comprimento
    if (password.length >= 8) {
      strength.score += 1;
    } else {
      strength.feedback.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    // Verificar maiúsculas
    if (/[A-Z]/.test(password)) {
      strength.score += 1;
    } else {
      strength.feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    // Verificar minúsculas
    if (/[a-z]/.test(password)) {
      strength.score += 1;
    } else {
      strength.feedback.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    // Verificar números
    if (/[0-9]/.test(password)) {
      strength.score += 1;
    } else {
      strength.feedback.push('Senha deve conter pelo menos um número');
    }
    
    // Verificar caracteres especiais
    if (/[^A-Za-z0-9]/.test(password)) {
      strength.score += 1;
    } else {
      strength.feedback.push('Senha deve conter pelo menos um caractere especial');
    }
    
    return strength;
  }
  
  // Verificar se senha foi comprometida
  async isPasswordCompromised(password) {
    // Implementar verificação contra listas de senhas comprometidas
    // Por exemplo: Have I Been Pwned API
    return false;
  }
  
  // Gerar senha segura
  async generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
  
  // Verificar se email foi comprometido
  async isEmailCompromised(email) {
    // Implementar verificação contra listas de emails comprometidos
    // Por exemplo: Have I Been Pwned API
    return false;
  }
  
  // Obter score de segurança do usuário
  async getUserSecurityScore(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          lastLoginAt: true,
          createdAt: true,
          securityEvents: {
            where: {
              eventType: {
                in: ['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ACTIVITY']
              }
            }
          }
        }
      });
      
      if (!user) {
        return { score: 0, feedback: ['Usuário não encontrado'] };
      }
      
      let score = 100;
      const feedback = [];
      
      // Verificar falhas de login
      if (user.securityEvents.length > 0) {
        score -= user.securityEvents.length * 5;
        feedback.push(`${user.securityEvents.length} eventos de segurança detectados`);
      }
      
      // Verificar última atividade
      const daysSinceLastLogin = user.lastLoginAt ? 
        Math.floor((new Date() - new Date(user.lastLoginAt)) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysSinceLastLogin > 30) {
        score -= 10;
        feedback.push('Usuário inativo há mais de 30 dias');
      }
      
      // Verificar idade da conta
      const accountAge = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
      if (accountAge < 7) {
        score -= 5;
        feedback.push('Conta muito nova');
      }
      
      return {
        score: Math.max(0, score),
        feedback
      };
    } catch (error) {
      console.error('Error calculating user security score:', error);
      return { score: 0, feedback: ['Erro ao calcular score'] };
    }
  }
}

module.exports = new SecurityService();
