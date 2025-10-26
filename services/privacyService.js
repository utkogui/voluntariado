const prisma = require('../config/database');
const emailService = require('./emailService');
const pushNotificationService = require('./pushNotificationService');

class PrivacyService {
  // Registrar consentimento do usuário
  async recordConsent(userId, consentType, consentData) {
    try {
      const consent = await prisma.userConsent.create({
        data: {
          userId,
          consentType,
          consentData: JSON.stringify(consentData),
          grantedAt: new Date(),
          expiresAt: consentData.expiresAt ? new Date(consentData.expiresAt) : null
        }
      });
      
      // Notificar sobre mudança de consentimento
      await this.notifyConsentChange(userId, consentType, 'GRANTED');
      
      return consent;
    } catch (error) {
      console.error('Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }
  
  // Revogar consentimento do usuário
  async revokeConsent(userId, consentType) {
    try {
      const consent = await prisma.userConsent.updateMany({
        where: {
          userId,
          consentType,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });
      
      // Notificar sobre mudança de consentimento
      await this.notifyConsentChange(userId, consentType, 'REVOKED');
      
      return consent;
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw new Error('Failed to revoke consent');
    }
  }
  
  // Verificar consentimento do usuário
  async checkConsent(userId, consentType) {
    try {
      const consent = await prisma.userConsent.findFirst({
        where: {
          userId,
          consentType,
          revokedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: { grantedAt: 'desc' }
      });
      
      return !!consent;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }
  
  // Obter consentimentos do usuário
  async getUserConsents(userId) {
    try {
      const consents = await prisma.userConsent.findMany({
        where: { userId },
        orderBy: { grantedAt: 'desc' }
      });
      
      return consents;
    } catch (error) {
      console.error('Error getting user consents:', error);
      throw new Error('Failed to get user consents');
    }
  }
  
  // Obter dados pessoais do usuário
  async getUserPersonalData(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          gender: true,
          profilePicture: true,
          bio: true,
          skills: true,
          interests: true,
          availability: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });
      
      return user;
    } catch (error) {
      console.error('Error getting user personal data:', error);
      throw new Error('Failed to get user personal data');
    }
  }
  
  // Exportar dados do usuário
  async exportUserData(userId) {
    try {
      const [
        userData,
        applications,
        donations,
        messages,
        evaluations,
        improvements,
        consents,
        securityEvents
      ] = await Promise.all([
        this.getUserPersonalData(userId),
        prisma.application.findMany({ where: { userId } }),
        prisma.donation.findMany({ where: { userId } }),
        prisma.message.findMany({ where: { userId } }),
        prisma.evaluation.findMany({ where: { userId } }),
        prisma.improvement.findMany({ where: { userId } }),
        this.getUserConsents(userId),
        prisma.securityEvent.findMany({ where: { userId } })
      ]);
      
      const exportData = {
        user: userData,
        applications,
        donations,
        messages,
        evaluations,
        improvements,
        consents,
        securityEvents,
        exportedAt: new Date(),
        format: 'JSON'
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }
  
  // Excluir dados do usuário
  async deleteUserData(userId, deleteType = 'SOFT') {
    try {
      if (deleteType === 'HARD') {
        // Exclusão permanente
        await prisma.$transaction([
          prisma.application.deleteMany({ where: { userId } }),
          prisma.donation.deleteMany({ where: { userId } }),
          prisma.message.deleteMany({ where: { userId } }),
          prisma.evaluation.deleteMany({ where: { userId } }),
          prisma.improvement.deleteMany({ where: { userId } }),
          prisma.userConsent.deleteMany({ where: { userId } }),
          prisma.securityEvent.deleteMany({ where: { userId } }),
          prisma.user.delete({ where: { id: userId } })
        ]);
      } else {
        // Exclusão lógica
        await prisma.user.update({
          where: { id: userId },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            email: `deleted_${userId}@example.com`,
            name: 'Usuário Excluído',
            phone: null,
            address: null,
            profilePicture: null,
            bio: null,
            skills: null,
            interests: null,
            availability: null,
            location: null
          }
        });
      }
      
      // Notificar sobre exclusão
      await this.notifyDataDeletion(userId, deleteType);
      
      return { success: true, deleteType };
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }
  
  // Anonimizar dados do usuário
  async anonymizeUserData(userId) {
    try {
      const anonymizedData = {
        name: 'Usuário Anônimo',
        email: `anonymous_${userId}@example.com`,
        phone: null,
        address: null,
        profilePicture: null,
        bio: null,
        skills: null,
        interests: null,
        availability: null,
        location: null
      };
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...anonymizedData,
          anonymizedAt: new Date()
        }
      });
      
      // Notificar sobre anonimização
      await this.notifyDataAnonymization(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw new Error('Failed to anonymize user data');
    }
  }
  
  // Obter histórico de privacidade
  async getPrivacyHistory(userId) {
    try {
      const history = await prisma.privacyHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      
      return history;
    } catch (error) {
      console.error('Error getting privacy history:', error);
      throw new Error('Failed to get privacy history');
    }
  }
  
  // Registrar evento de privacidade
  async logPrivacyEvent(userId, eventType, eventData) {
    try {
      const event = await prisma.privacyHistory.create({
        data: {
          userId,
          eventType,
          eventData: JSON.stringify(eventData),
          timestamp: new Date()
        }
      });
      
      return event;
    } catch (error) {
      console.error('Error logging privacy event:', error);
      throw new Error('Failed to log privacy event');
    }
  }
  
  // Obter estatísticas de privacidade
  async getPrivacyStats(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      totalConsents,
      revokedConsents,
      dataExports,
      dataDeletions,
      dataAnonymizations,
      privacyEvents,
      consentTypes
    ] = await Promise.all([
      prisma.userConsent.count({
        where: { grantedAt: { gte: startDate } }
      }),
      prisma.userConsent.count({
        where: { revokedAt: { gte: startDate } }
      }),
      prisma.privacyHistory.count({
        where: {
          eventType: 'DATA_EXPORT',
          timestamp: { gte: startDate }
        }
      }),
      prisma.privacyHistory.count({
        where: {
          eventType: 'DATA_DELETION',
          timestamp: { gte: startDate }
        }
      }),
      prisma.privacyHistory.count({
        where: {
          eventType: 'DATA_ANONYMIZATION',
          timestamp: { gte: startDate }
        }
      }),
      prisma.privacyHistory.count({
        where: { timestamp: { gte: startDate } }
      }),
      prisma.userConsent.groupBy({
        by: ['consentType'],
        _count: { consentType: true },
        where: { grantedAt: { gte: startDate } }
      })
    ]);
    
    return {
      total: totalConsents,
      revoked: revokedConsents,
      exports: dataExports,
      deletions: dataDeletions,
      anonymizations: dataAnonymizations,
      events: privacyEvents,
      byType: consentTypes
    };
  }
  
  // Obter relatório de privacidade
  async getPrivacyReport(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      stats,
      events,
      consents,
      recommendations
    ] = await Promise.all([
      this.getPrivacyStats(period),
      prisma.privacyHistory.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        take: 100
      }),
      prisma.userConsent.findMany({
        where: { grantedAt: { gte: startDate } },
        orderBy: { grantedAt: 'desc' },
        take: 100
      }),
      this.getPrivacyRecommendations(period)
    ]);
    
    return {
      period,
      stats,
      events,
      consents,
      recommendations,
      generatedAt: new Date()
    };
  }
  
  // Obter recomendações de privacidade
  async getPrivacyRecommendations(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const recommendations = [];
    
    // Verificar consentimentos expirados
    const expiredConsents = await prisma.userConsent.count({
      where: {
        expiresAt: {
          lte: new Date()
        },
        revokedAt: null
      }
    });
    
    if (expiredConsents > 0) {
      recommendations.push({
        type: 'MEDIUM',
        title: 'Consentimentos expirados',
        description: `${expiredConsents} consentimentos expirados precisam ser renovados.`,
        action: 'Renovar consentimentos expirados'
      });
    }
    
    // Verificar dados não utilizados
    const unusedData = await prisma.user.count({
      where: {
        lastLoginAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 ano
        }
      }
    });
    
    if (unusedData > 0) {
      recommendations.push({
        type: 'LOW',
        title: 'Dados não utilizados',
        description: `${unusedData} usuários não acessaram a aplicação há mais de 1 ano.`,
        action: 'Considerar exclusão de dados não utilizados'
      });
    }
    
    // Verificar violações de privacidade
    const privacyViolations = await prisma.privacyHistory.count({
      where: {
        eventType: 'PRIVACY_VIOLATION',
        timestamp: { gte: startDate }
      }
    });
    
    if (privacyViolations > 0) {
      recommendations.push({
        type: 'HIGH',
        title: 'Violações de privacidade detectadas',
        description: `${privacyViolations} violações de privacidade foram detectadas.`,
        action: 'Investigar e corrigir violações'
      });
    }
    
    return recommendations;
  }
  
  // Notificar sobre mudança de consentimento
  async notifyConsentChange(userId, consentType, action) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
      });
      
      if (user) {
        // Enviar notificação por email
        await emailService.sendTemplate(user.email, 'consent-change', {
          subject: `Consentimento ${action === 'GRANTED' ? 'concedido' : 'revogado'}`,
          data: {
            user,
            consentType,
            action
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(user.id, {
          title: 'Consentimento Atualizado',
          body: `Seu consentimento para ${consentType} foi ${action === 'GRANTED' ? 'concedido' : 'revogado'}`,
          data: { consentType, action }
        });
      }
    } catch (error) {
      console.error('Error notifying consent change:', error);
    }
  }
  
  // Notificar sobre exclusão de dados
  async notifyDataDeletion(userId, deleteType) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
      });
      
      if (user) {
        // Enviar notificação por email
        await emailService.sendTemplate(user.email, 'data-deletion', {
          subject: 'Dados excluídos',
          data: {
            user,
            deleteType
          }
        });
      }
    } catch (error) {
      console.error('Error notifying data deletion:', error);
    }
  }
  
  // Notificar sobre anonimização de dados
  async notifyDataAnonymization(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
      });
      
      if (user) {
        // Enviar notificação por email
        await emailService.sendTemplate(user.email, 'data-anonymization', {
          subject: 'Dados anonimizados',
          data: { user }
        });
      }
    } catch (error) {
      console.error('Error notifying data anonymization:', error);
    }
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
}

module.exports = new PrivacyService();
