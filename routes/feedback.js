const express = require('express');
const prisma = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Criar feedback
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { type, category, title, description, priority, attachments } = req.body;
    const userId = req.user.id;
    
    // Validações
    if (!type || !category || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não fornecidos'
      });
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
    await notifyAdmins(feedback);
    
    res.status(201).json({
      success: true,
      message: 'Feedback enviado com sucesso',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
});

// Listar feedbacks do usuário
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, type } = req.query;
    
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
    
    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter feedback específico
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;
    
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
      return res.status(404).json({
        success: false,
        error: 'Feedback não encontrado'
      });
    }
    
    // Verificar permissão de acesso
    if (feedback.userId !== userId && userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para acessar este feedback'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
});

// Responder ao feedback
router.post('/:id/respond', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status, priority } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }
    
    // Verificar se feedback existe
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback não encontrado'
      });
    }
    
    // Criar resposta
    const response = await prisma.feedbackResponse.create({
      data: {
        feedbackId: id,
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
        where: { id },
        data: { status }
      });
    }
    
    // Notificar usuário sobre resposta
    await notifyUser(feedback.userId, response);
    
    res.status(201).json({
      success: true,
      message: 'Resposta enviada com sucesso',
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// Listar todos os feedbacks (admin)
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, type, category, priority } = req.query;
    
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
    
    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar status do feedback
router.patch('/:id/status', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório'
      });
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
    await notifyUser(feedback.userId, { status, priority });
    
    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
});

// Obter estatísticas de feedback
router.get('/stats/overview', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = getStartDate(period);
    
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
    
    res.json({
      success: true,
      data: {
        total: totalFeedbacks,
        open: openFeedbacks,
        closed: closedFeedbacks,
        byType: feedbacksByType,
        byCategory: feedbacksByCategory,
        byPriority: feedbacksByPriority,
        recent: recentFeedbacks
      }
    });
  } catch (error) {
    next(error);
  }
});

// Buscar feedbacks
router.get('/search', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Termo de busca é obrigatório'
      });
    }
    
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } }
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
    
    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Função para notificar administradores
async function notifyAdmins(feedback) {
  try {
    const admins = await prisma.user.findMany({
      where: { type: 'ADMIN' },
      select: { id: true, email: true }
    });
    
    for (const admin of admins) {
      // Enviar notificação por email
      await sendEmailNotification(admin.email, {
        subject: `Novo feedback recebido: ${feedback.title}`,
        template: 'new-feedback',
        data: {
          feedback,
          adminName: admin.name
        }
      });
      
      // Enviar notificação push
      await sendPushNotification(admin.id, {
        title: 'Novo Feedback',
        body: `${feedback.title} - ${feedback.category}`,
        data: { feedbackId: feedback.id }
      });
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

// Função para notificar usuário
async function notifyUser(userId, data) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    if (user) {
      // Enviar notificação por email
      await sendEmailNotification(user.email, {
        subject: 'Atualização no seu feedback',
        template: 'feedback-update',
        data: {
          user,
          ...data
        }
      });
      
      // Enviar notificação push
      await sendPushNotification(user.id, {
        title: 'Feedback Atualizado',
        body: 'Seu feedback foi atualizado',
        data: { feedbackId: data.feedbackId }
      });
    }
  } catch (error) {
    console.error('Error notifying user:', error);
  }
}

// Função para obter data de início baseada no período
function getStartDate(period) {
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

// Função para enviar notificação por email
async function sendEmailNotification(email, { subject, template, data }) {
  try {
    const emailService = require('../services/emailService');
    await emailService.sendTemplate(email, template, data);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Função para enviar notificação push
async function sendPushNotification(userId, { title, body, data }) {
  try {
    const pushService = require('../services/pushNotificationService');
    await pushService.sendToUser(userId, { title, body, data });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = router;
