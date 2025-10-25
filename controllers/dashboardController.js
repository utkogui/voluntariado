const { PrismaClient } = require('@prisma/client');
const NotificationService = require('../services/notificationService');
const CommunicationService = require('../services/communicationService');

const prisma = new PrismaClient();

/**
 * Obter dashboard de notificações do usuário
 */
const getNotificationDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este dashboard'
      });
    }

    // Buscar estatísticas de notificações
    const statsResult = await NotificationService.getNotificationStats(userId);
    if (!statsResult.success) {
      return res.status(400).json({
        success: false,
        message: statsResult.error
      });
    }

    // Buscar notificações recentes
    const recentNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    // Buscar notificações por tipo
    const notificationsByType = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
    });

    // Buscar notificações por status
    const notificationsByStatus = await prisma.notification.groupBy({
      by: ['isRead'],
      where: { userId },
      _count: {
        isRead: true
      }
    });

    // Buscar notificações por período
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyCount, monthlyCount] = await Promise.all([
      prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: lastWeek }
        }
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    // Buscar oportunidades relevantes recentes
    const relevantOpportunities = await prisma.opportunity.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: lastWeek }
      },
      include: {
        categories: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            userType: true,
            institution: { select: { name: true } },
            company: { select: { name: true } },
            university: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Calcular score de relevância para cada oportunidade
    const opportunitiesWithRelevance = [];
    for (const opportunity of relevantOpportunities) {
      try {
        const relevance = await NotificationService.calculateRelevance(
          { id: userId },
          opportunity
        );
        
        if (relevance.score >= 70) {
          opportunitiesWithRelevance.push({
            ...opportunity,
            relevanceScore: relevance.score,
            relevanceReasons: relevance.reasons
          });
        }
      } catch (error) {
        console.error('Erro ao calcular relevância:', error);
      }
    }

    // Ordenar por score de relevância
    opportunitiesWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Buscar preferências de notificação
    const notificationPreferences = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationPreferences: true
      }
    });

    // Buscar atividades recentes
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Buscar estatísticas de engajamento
    const engagementStats = await this.calculateEngagementStats(userId);

    res.json({
      success: true,
      data: {
        stats: statsResult.data,
        recentNotifications,
        notificationsByType: notificationsByType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        notificationsByStatus: notificationsByStatus.map(item => ({
          isRead: item.isRead,
          count: item._count.isRead
        })),
        periodStats: {
          weekly: weeklyCount,
          monthly: monthlyCount
        },
        relevantOpportunities: opportunitiesWithRelevance,
        notificationPreferences: notificationPreferences?.notificationPreferences || {},
        recentActivities,
        engagementStats
      }
    });

  } catch (error) {
    console.error('Erro ao obter dashboard de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Calcular estatísticas de engajamento
 */
const calculateEngagementStats = async (userId) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalNotifications,
      readNotifications,
      clickedNotifications,
      applicationsFromNotifications,
      totalApplications
    ] = await Promise.all([
      prisma.notification.count({
        where: { userId, createdAt: { gte: lastMonth } }
      }),
      prisma.notification.count({
        where: { userId, isRead: true, createdAt: { gte: lastMonth } }
      }),
      prisma.notification.count({
        where: { 
          userId, 
          data: { path: ['clicked'], equals: true },
          createdAt: { gte: lastMonth }
        }
      }),
      prisma.application.count({
        where: {
          volunteerId: userId,
          createdAt: { gte: lastMonth },
          data: { path: ['fromNotification'], equals: true }
        }
      }),
      prisma.application.count({
        where: {
          volunteerId: userId,
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;
    const clickRate = totalNotifications > 0 ? (clickedNotifications / totalNotifications) * 100 : 0;
    const conversionRate = totalApplications > 0 ? (applicationsFromNotifications / totalApplications) * 100 : 0;

    return {
      totalNotifications,
      readNotifications,
      clickedNotifications,
      applicationsFromNotifications,
      totalApplications,
      readRate: Math.round(readRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };

  } catch (error) {
    console.error('Erro ao calcular estatísticas de engajamento:', error);
    return {
      totalNotifications: 0,
      readNotifications: 0,
      clickedNotifications: 0,
      applicationsFromNotifications: 0,
      totalApplications: 0,
      readRate: 0,
      clickRate: 0,
      conversionRate: 0
    };
  }
};

/**
 * Obter dashboard de notificações para administradores
 */
const getAdminNotificationDashboard = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem acessar este dashboard'
      });
    }

    // Buscar estatísticas gerais
    const [
      totalNotifications,
      totalUsers,
      totalOpportunities,
      notificationsByType,
      notificationsByStatus,
      recentNotifications,
      topUsers,
      topOpportunities
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.user.count(),
      prisma.opportunity.count(),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.notification.groupBy({
        by: ['isRead'],
        _count: { isRead: true }
      }),
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          userType: true,
          _count: {
            select: {
              notifications: true
            }
          }
        },
        orderBy: {
          notifications: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      prisma.opportunity.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              notifications: true
            }
          }
        },
        orderBy: {
          notifications: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Buscar estatísticas por período
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyNotifications, monthlyNotifications] = await Promise.all([
      prisma.notification.count({
        where: { createdAt: { gte: lastWeek } }
      }),
      prisma.notification.count({
        where: { createdAt: { gte: lastMonth } }
      })
    ]);

    // Buscar estatísticas de engajamento
    const engagementStats = await this.calculateAdminEngagementStats();

    res.json({
      success: true,
      data: {
        overview: {
          totalNotifications,
          totalUsers,
          totalOpportunities,
          weeklyNotifications,
          monthlyNotifications
        },
        notificationsByType: notificationsByType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        notificationsByStatus: notificationsByStatus.map(item => ({
          isRead: item.isRead,
          count: item._count.isRead
        })),
        recentNotifications,
        topUsers,
        topOpportunities,
        engagementStats
      }
    });

  } catch (error) {
    console.error('Erro ao obter dashboard de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Calcular estatísticas de engajamento para admin
 */
const calculateAdminEngagementStats = async () => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalNotifications,
      readNotifications,
      clickedNotifications,
      applicationsFromNotifications,
      totalApplications
    ] = await Promise.all([
      prisma.notification.count({
        where: { createdAt: { gte: lastMonth } }
      }),
      prisma.notification.count({
        where: { isRead: true, createdAt: { gte: lastMonth } }
      }),
      prisma.notification.count({
        where: { 
          data: { path: ['clicked'], equals: true },
          createdAt: { gte: lastMonth }
        }
      }),
      prisma.application.count({
        where: {
          createdAt: { gte: lastMonth },
          data: { path: ['fromNotification'], equals: true }
        }
      }),
      prisma.application.count({
        where: { createdAt: { gte: lastMonth } }
      })
    ]);

    const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;
    const clickRate = totalNotifications > 0 ? (clickedNotifications / totalNotifications) * 100 : 0;
    const conversionRate = totalApplications > 0 ? (applicationsFromNotifications / totalApplications) * 100 : 0;

    return {
      totalNotifications,
      readNotifications,
      clickedNotifications,
      applicationsFromNotifications,
      totalApplications,
      readRate: Math.round(readRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };

  } catch (error) {
    console.error('Erro ao calcular estatísticas de engajamento do admin:', error);
    return {
      totalNotifications: 0,
      readNotifications: 0,
      clickedNotifications: 0,
      applicationsFromNotifications: 0,
      totalApplications: 0,
      readRate: 0,
      clickRate: 0,
      conversionRate: 0
    };
  }
};

/**
 * Obter relatório de notificações
 */
const getNotificationReport = async (req, res) => {
  try {
    const { startDate, endDate, type, userId } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (type) {
      where.type = type;
    }
    if (userId) {
      where.userId = userId;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Gerar relatório
    const report = {
      total: notifications.length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      byStatus: notifications.reduce((acc, n) => {
        acc[n.isRead ? 'read' : 'unread'] = (acc[n.isRead ? 'read' : 'unread'] || 0) + 1;
        return acc;
      }, {}),
      byUser: notifications.reduce((acc, n) => {
        const userId = n.userId;
        if (!acc[userId]) {
          acc[userId] = {
            user: n.user,
            count: 0
          };
        }
        acc[userId].count++;
        return acc;
      }, {}),
      notifications
    };

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getNotificationDashboard,
  getAdminNotificationDashboard,
  getNotificationReport
};
