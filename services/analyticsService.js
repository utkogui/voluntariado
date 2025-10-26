const prisma = require('../config/database');
const emailService = require('./emailService');
const pushNotificationService = require('./pushNotificationService');

class AnalyticsService {
  // Registrar evento de uso
  async trackEvent(userId, eventType, eventData = {}) {
    try {
      const event = await prisma.analyticsEvent.create({
        data: {
          userId,
          eventType,
          eventData: JSON.stringify(eventData),
          timestamp: new Date()
        }
      });
      
      return event;
    } catch (error) {
      console.error('Error tracking event:', error);
      throw new Error('Failed to track event');
    }
  }
  
  // Obter métricas de uso
  async getUsageMetrics(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalOpportunities,
      totalApplications,
      totalDonations,
      totalMessages,
      totalEvaluations,
      totalImprovements,
      userGrowth,
      opportunityGrowth,
      applicationGrowth,
      donationGrowth,
      messageGrowth,
      evaluationGrowth,
      improvementGrowth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.opportunity.count(),
      prisma.application.count(),
      prisma.donation.count(),
      prisma.message.count(),
      prisma.evaluation.count(),
      prisma.improvement.count(),
      this.getUserGrowth(period),
      this.getOpportunityGrowth(period),
      this.getApplicationGrowth(period),
      this.getDonationGrowth(period),
      this.getMessageGrowth(period),
      this.getEvaluationGrowth(period),
      this.getImprovementGrowth(period)
    ]);
    
    return {
      total: {
        users: totalUsers,
        activeUsers,
        newUsers,
        opportunities: totalOpportunities,
        applications: totalApplications,
        donations: totalDonations,
        messages: totalMessages,
        evaluations: totalEvaluations,
        improvements: totalImprovements
      },
      growth: {
        users: userGrowth,
        opportunities: opportunityGrowth,
        applications: applicationGrowth,
        donations: donationGrowth,
        messages: messageGrowth,
        evaluations: evaluationGrowth,
        improvements: improvementGrowth
      }
    };
  }
  
  // Obter métricas de engajamento
  async getEngagementMetrics(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      avgSessionDuration,
      avgPagesPerSession,
      bounceRate,
      retentionRate,
      userEngagementScore,
      topPages,
      topActions,
      userJourney
    ] = await Promise.all([
      this.getAvgSessionDuration(period),
      this.getAvgPagesPerSession(period),
      this.getBounceRate(period),
      this.getRetentionRate(period),
      this.getUserEngagementScore(period),
      this.getTopPages(period),
      this.getTopActions(period),
      this.getUserJourney(period)
    ]);
    
    return {
      avgSessionDuration,
      avgPagesPerSession,
      bounceRate,
      retentionRate,
      userEngagementScore,
      topPages,
      topActions,
      userJourney
    };
  }
  
  // Obter métricas de performance
  async getPerformanceMetrics(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      avgResponseTime,
      errorRate,
      uptime,
      throughput,
      peakUsage,
      slowQueries,
      memoryUsage,
      cpuUsage
    ] = await Promise.all([
      this.getAvgResponseTime(period),
      this.getErrorRate(period),
      this.getUptime(period),
      this.getThroughput(period),
      this.getPeakUsage(period),
      this.getSlowQueries(period),
      this.getMemoryUsage(period),
      this.getCpuUsage(period)
    ]);
    
    return {
      avgResponseTime,
      errorRate,
      uptime,
      throughput,
      peakUsage,
      slowQueries,
      memoryUsage,
      cpuUsage
    };
  }
  
  // Obter métricas de negócio
  async getBusinessMetrics(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      conversionRate,
      userLifetimeValue,
      churnRate,
      revenue,
      costPerAcquisition,
      returnOnInvestment,
      marketShare,
      competitiveAnalysis
    ] = await Promise.all([
      this.getConversionRate(period),
      this.getUserLifetimeValue(period),
      this.getChurnRate(period),
      this.getRevenue(period),
      this.getCostPerAcquisition(period),
      this.getReturnOnInvestment(period),
      this.getMarketShare(period),
      this.getCompetitiveAnalysis(period)
    ]);
    
    return {
      conversionRate,
      userLifetimeValue,
      churnRate,
      revenue,
      costPerAcquisition,
      returnOnInvestment,
      marketShare,
      competitiveAnalysis
    };
  }
  
  // Obter relatório personalizado
  async getCustomReport(reportConfig) {
    const { metrics, period, filters, groupBy, sortBy } = reportConfig;
    
    const startDate = this.getStartDate(period);
    const where = this.buildWhereClause(filters, startDate);
    
    const report = await prisma.analyticsEvent.groupBy({
      by: groupBy || ['eventType'],
      where,
      _count: {
        eventType: true
      },
      orderBy: sortBy || {
        _count: {
          eventType: 'desc'
        }
      }
    });
    
    return {
      report,
      config: reportConfig,
      generatedAt: new Date()
    };
  }
  
  // Obter dashboard de métricas
  async getMetricsDashboard(period = '30d') {
    const [
      usageMetrics,
      engagementMetrics,
      performanceMetrics,
      businessMetrics
    ] = await Promise.all([
      this.getUsageMetrics(period),
      this.getEngagementMetrics(period),
      this.getPerformanceMetrics(period),
      this.getBusinessMetrics(period)
    ]);
    
    return {
      period,
      usage: usageMetrics,
      engagement: engagementMetrics,
      performance: performanceMetrics,
      business: businessMetrics,
      generatedAt: new Date()
    };
  }
  
  // Obter tendências
  async getTrends(metric, period = '30d') {
    const startDate = this.getStartDate(period);
    
    const trends = await prisma.analyticsEvent.findMany({
      where: {
        eventType: metric,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    return {
      metric,
      period,
      trends: trends.map(trend => ({
        timestamp: trend.timestamp,
        value: trend.eventData
      }))
    };
  }
  
  // Obter comparação de períodos
  async getPeriodComparison(currentPeriod, previousPeriod) {
    const currentStartDate = this.getStartDate(currentPeriod);
    const previousStartDate = this.getStartDate(previousPeriod);
    
    const [
      currentMetrics,
      previousMetrics
    ] = await Promise.all([
      this.getUsageMetrics(currentPeriod),
      this.getUsageMetrics(previousPeriod)
    ]);
    
    const comparison = {};
    
    Object.keys(currentMetrics.total).forEach(key => {
      const current = currentMetrics.total[key];
      const previous = previousMetrics.total[key];
      const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      comparison[key] = {
        current,
        previous,
        change: Math.round(change * 100) / 100
      };
    });
    
    return {
      currentPeriod,
      previousPeriod,
      comparison
    };
  }
  
  // Obter alertas de métricas
  async getMetricAlerts() {
    const alerts = [];
    
    // Verificar métricas críticas
    const criticalMetrics = await this.getCriticalMetrics();
    
    criticalMetrics.forEach(metric => {
      if (metric.value < metric.threshold) {
        alerts.push({
          type: 'WARNING',
          metric: metric.name,
          value: metric.value,
          threshold: metric.threshold,
          message: `${metric.name} está abaixo do limite (${metric.value} < ${metric.threshold})`
        });
      }
    });
    
    return alerts;
  }
  
  // Obter exportação de dados
  async exportData(format, period, filters = {}) {
    const startDate = this.getStartDate(period);
    const where = this.buildWhereClause(filters, startDate);
    
    const data = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      case 'excel':
        return this.exportToExcel(data);
      default:
        throw new Error('Formato de exportação não suportado');
    }
  }
  
  // Métodos auxiliares
  async getUserGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getOpportunityGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.opportunity.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getApplicationGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.application.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getDonationGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.donation.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getMessageGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.message.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getEvaluationGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.evaluation.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getImprovementGrowth(period) {
    const startDate = this.getStartDate(period);
    
    const growth = await prisma.improvement.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return growth;
  }
  
  async getAvgSessionDuration(period) {
    // Implementar lógica para calcular duração média de sessão
    return 0;
  }
  
  async getAvgPagesPerSession(period) {
    // Implementar lógica para calcular páginas médias por sessão
    return 0;
  }
  
  async getBounceRate(period) {
    // Implementar lógica para calcular taxa de rejeição
    return 0;
  }
  
  async getRetentionRate(period) {
    // Implementar lógica para calcular taxa de retenção
    return 0;
  }
  
  async getUserEngagementScore(period) {
    // Implementar lógica para calcular score de engajamento
    return 0;
  }
  
  async getTopPages(period) {
    // Implementar lógica para obter páginas mais visitadas
    return [];
  }
  
  async getTopActions(period) {
    // Implementar lógica para obter ações mais realizadas
    return [];
  }
  
  async getUserJourney(period) {
    // Implementar lógica para obter jornada do usuário
    return [];
  }
  
  async getAvgResponseTime(period) {
    // Implementar lógica para calcular tempo médio de resposta
    return 0;
  }
  
  async getErrorRate(period) {
    // Implementar lógica para calcular taxa de erro
    return 0;
  }
  
  async getUptime(period) {
    // Implementar lógica para calcular uptime
    return 0;
  }
  
  async getThroughput(period) {
    // Implementar lógica para calcular throughput
    return 0;
  }
  
  async getPeakUsage(period) {
    // Implementar lógica para obter pico de uso
    return 0;
  }
  
  async getSlowQueries(period) {
    // Implementar lógica para obter consultas lentas
    return [];
  }
  
  async getMemoryUsage(period) {
    // Implementar lógica para obter uso de memória
    return 0;
  }
  
  async getCpuUsage(period) {
    // Implementar lógica para obter uso de CPU
    return 0;
  }
  
  async getConversionRate(period) {
    // Implementar lógica para calcular taxa de conversão
    return 0;
  }
  
  async getUserLifetimeValue(period) {
    // Implementar lógica para calcular valor de vida do usuário
    return 0;
  }
  
  async getChurnRate(period) {
    // Implementar lógica para calcular taxa de churn
    return 0;
  }
  
  async getRevenue(period) {
    // Implementar lógica para calcular receita
    return 0;
  }
  
  async getCostPerAcquisition(period) {
    // Implementar lógica para calcular custo por aquisição
    return 0;
  }
  
  async getReturnOnInvestment(period) {
    // Implementar lógica para calcular ROI
    return 0;
  }
  
  async getMarketShare(period) {
    // Implementar lógica para calcular participação de mercado
    return 0;
  }
  
  async getCompetitiveAnalysis(period) {
    // Implementar lógica para análise competitiva
    return {};
  }
  
  async getCriticalMetrics() {
    // Implementar lógica para obter métricas críticas
    return [];
  }
  
  buildWhereClause(filters, startDate) {
    const where = {
      timestamp: {
        gte: startDate
      }
    };
    
    if (filters.eventType) {
      where.eventType = filters.eventType;
    }
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    return where;
  }
  
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
  
  exportToCSV(data) {
    // Implementar exportação para CSV
    return data;
  }
  
  exportToJSON(data) {
    // Implementar exportação para JSON
    return data;
  }
  
  exportToExcel(data) {
    // Implementar exportação para Excel
    return data;
  }
}

module.exports = new AnalyticsService();