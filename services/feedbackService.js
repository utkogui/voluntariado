const prisma = require('../config/database');
const emailService = require('./emailService');
const pushNotificationService = require('./pushNotificationService');

class FeedbackService {
  // Criar feedback
  async createFeedback(data) {
    const { type, category, title, description, priority, userId, attachments } = data;
    
    // Validações
    if (!type || !category || !title || !description || !userId) {
      throw new Error('Campos obrigatórios não fornecidos');
    }
    
    // Criar feedback
    const feedback = await prisma.feedback.create({
      data: {
        type,
        category,
        title,
        description,
        priority: priority || 'MEDIUM',
        userId,
        attachments: attachments || []
      },
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
    
    // Notificar administradores
    await this.notifyAdmins(feedback);
    
    return feedback;
  }
  
  // Obter feedbacks do usuário
  async getUserFeedbacks(userId, options = {}) {
    const { page = 1, limit = 10, status, type } = options;
    const skip = (page - 1) * limit;
    
    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter feedback específico
  async getFeedbackById(id, userId, userType) {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!feedback) {
      throw new Error('Feedback não encontrado');
    }
    
    // Verificar permissão de acesso
    if (feedback.userId !== userId && userType !== 'ADMIN') {
      throw new Error('Sem permissão para acessar este feedback');
    }
    
    return feedback;
  }
  
  // Responder ao feedback
  async respondToFeedback(feedbackId, responseData) {
    const { message, status, priority, userId } = responseData;
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }
    
    // Verificar se feedback existe
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });
    
    if (!feedback) {
      throw new Error('Feedback não encontrado');
    }
    
    // Criar resposta
    const response = await prisma.feedbackResponse.create({
      data: {
        feedbackId,
        userId,
        message,
        status: status || feedback.status,
        priority: priority || feedback.priority
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    
    // Atualizar status do feedback se fornecido
    if (status) {
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: { status }
      });
    }
    
    // Notificar usuário sobre resposta
    await this.notifyUser(feedback.userId, {
      feedbackId,
      response,
      status
    });
    
    return response;
  }
  
  // Listar todos os feedbacks (admin)
  async getAllFeedbacks(options = {}) {
    const { page = 1, limit = 10, status, type, category, priority } = options;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true
            }
          },
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Atualizar status do feedback
  async updateFeedbackStatus(id, status, priority) {
    if (!status) {
      throw new Error('Status é obrigatório');
    }
    
    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        status,
        priority: priority || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Notificar usuário sobre mudança de status
    await this.notifyUser(feedback.userId, {
      feedbackId: id,
      status,
      priority
    });
    
    return feedback;
  }
  
  // Obter estatísticas de feedback
  async getFeedbackStats(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      totalFeedbacks,
      openFeedbacks,
      closedFeedbacks,
      feedbacksByType,
      feedbacksByCategory,
      feedbacksByPriority,
      recentFeedbacks
    ] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: 'OPEN' } }),
      prisma.feedback.count({ where: { status: 'CLOSED' } }),
      prisma.feedback.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.feedback.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.feedback.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      prisma.feedback.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      })
    ]);
    
    return {
      total: totalFeedbacks,
      open: openFeedbacks,
      closed: closedFeedbacks,
      byType: feedbacksByType,
      byCategory: feedbacksByCategory,
      byPriority: feedbacksByPriority,
      recent: recentFeedbacks
    };
  }
  
  // Buscar feedbacks
  async searchFeedbacks(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    if (!query) {
      throw new Error('Termo de busca é obrigatório');
    }
    
    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } }
      ]
    };
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Notificar administradores sobre novo feedback
  async notifyAdmins(feedback) {
    try {
      const admins = await prisma.user.findMany({
        where: { type: 'ADMIN' },
        select: { id: true, email: true, name: true }
      });
      
      for (const admin of admins) {
        // Enviar notificação por email
        await emailService.sendTemplate(admin.email, 'new-feedback', {
          subject: `Novo feedback recebido: ${feedback.title}`,
          data: {
            feedback,
            adminName: admin.name
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(admin.id, {
          title: 'Novo Feedback',
          body: `${feedback.title} - ${feedback.category}`,
          data: { feedbackId: feedback.id }
        });
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
  
  // Notificar usuário sobre atualização
  async notifyUser(userId, data) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
      });
      
      if (user) {
        // Enviar notificação por email
        await emailService.sendTemplate(user.email, 'feedback-update', {
          subject: 'Atualização no seu feedback',
          data: {
            user,
            ...data
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(user.id, {
          title: 'Feedback Atualizado',
          body: 'Seu feedback foi atualizado',
          data: { feedbackId: data.feedbackId }
        });
      }
    } catch (error) {
      console.error('Error notifying user:', error);
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
  
  // Obter feedbacks por categoria
  async getFeedbacksByCategory(category, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const where = { category };
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter feedbacks por prioridade
  async getFeedbacksByPriority(priority, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const where = { priority };
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter feedbacks pendentes
  async getPendingFeedbacks(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const where = { status: 'OPEN' };
    
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);
    
    return {
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Marcar feedback como resolvido
  async markAsResolved(feedbackId, resolution, userId) {
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status: 'CLOSED',
        resolution,
        resolvedAt: new Date(),
        resolvedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Notificar usuário sobre resolução
    await this.notifyUser(feedback.userId, {
      feedbackId,
      status: 'CLOSED',
      resolution
    });
    
    return feedback;
  }
  
  // Reabrir feedback
  async reopenFeedback(feedbackId, reason, userId) {
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status: 'OPEN',
        reopenedAt: new Date(),
        reopenedBy: userId,
        reopenReason: reason
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Notificar usuário sobre reabertura
    await this.notifyUser(feedback.userId, {
      feedbackId,
      status: 'OPEN',
      reason
    });
    
    return feedback;
  }
}

module.exports = new FeedbackService();
