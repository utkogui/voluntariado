const prisma = require('../config/database');
const emailService = require('./emailService');
const pushNotificationService = require('./pushNotificationService');

class ImprovementService {
  // Criar sugestão de melhoria
  async createImprovement(data) {
    const { title, description, category, priority, userId, attachments } = data;
    
    // Validações
    if (!title || !description || !category || !userId) {
      throw new Error('Campos obrigatórios não fornecidos');
    }
    
    // Criar sugestão
    const improvement = await prisma.improvement.create({
      data: {
        title,
        description,
        category,
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
    await this.notifyAdmins(improvement);
    
    return improvement;
  }
  
  // Obter sugestões do usuário
  async getUserImprovements(userId, options = {}) {
    const { page = 1, limit = 10, status, category } = options;
    const skip = (page - 1) * limit;
    
    const where = { userId };
    if (status) where.status = status;
    if (category) where.category = category;
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          comments: {
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
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter sugestão específica
  async getImprovementById(id) {
    const improvement = await prisma.improvement.findUnique({
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
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        comments: {
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
    
    if (!improvement) {
      throw new Error('Sugestão não encontrada');
    }
    
    return improvement;
  }
  
  // Listar todas as sugestões
  async getAllImprovements(options = {}) {
    const { page = 1, limit = 10, status, category, priority, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    
    const orderBy = {};
    if (sortBy === 'votes') {
      orderBy.votes = { _count: 'desc' };
    } else {
      orderBy[sortBy] = sortOrder;
    }
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          comments: {
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
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Votar em sugestão
  async voteOnImprovement(improvementId, userId, voteType) {
    if (!['UP', 'DOWN'].includes(voteType)) {
      throw new Error('Tipo de voto inválido');
    }
    
    // Verificar se usuário já votou
    const existingVote = await prisma.improvementVote.findUnique({
      where: {
        improvementId_userId: {
          improvementId,
          userId
        }
      }
    });
    
    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remover voto se for o mesmo tipo
        await prisma.improvementVote.delete({
          where: {
            improvementId_userId: {
              improvementId,
              userId
            }
          }
        });
        return { action: 'removed', voteType };
      } else {
        // Atualizar voto
        await prisma.improvementVote.update({
          where: {
            improvementId_userId: {
              improvementId,
              userId
            }
          },
          data: { type: voteType }
        });
        return { action: 'updated', voteType };
      }
    } else {
      // Criar novo voto
      await prisma.improvementVote.create({
        data: {
          improvementId,
          userId,
          type: voteType
        }
      });
      return { action: 'created', voteType };
    }
  }
  
  // Comentar em sugestão
  async commentOnImprovement(improvementId, userId, comment) {
    if (!comment.trim()) {
      throw new Error('Comentário não pode estar vazio');
    }
    
    const improvementComment = await prisma.improvementComment.create({
      data: {
        improvementId,
        userId,
        comment
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
    
    // Notificar autor da sugestão
    await this.notifyImprovementAuthor(improvementId, improvementComment);
    
    return improvementComment;
  }
  
  // Atualizar status da sugestão
  async updateImprovementStatus(id, status, adminId) {
    if (!['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED'].includes(status)) {
      throw new Error('Status inválido');
    }
    
    const improvement = await prisma.improvement.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminId
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
    
    // Notificar autor sobre mudança de status
    await this.notifyImprovementAuthor(id, { status });
    
    return improvement;
  }
  
  // Obter estatísticas de sugestões
  async getImprovementStats(period = '30d') {
    const startDate = this.getStartDate(period);
    
    const [
      totalImprovements,
      pendingImprovements,
      approvedImprovements,
      implementedImprovements,
      improvementsByCategory,
      improvementsByPriority,
      topImprovements
    ] = await Promise.all([
      prisma.improvement.count(),
      prisma.improvement.count({ where: { status: 'PENDING' } }),
      prisma.improvement.count({ where: { status: 'APPROVED' } }),
      prisma.improvement.count({ where: { status: 'IMPLEMENTED' } }),
      prisma.improvement.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.improvement.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      prisma.improvement.findMany({
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
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    ]);
    
    return {
      total: totalImprovements,
      pending: pendingImprovements,
      approved: approvedImprovements,
      implemented: implementedImprovements,
      byCategory: improvementsByCategory,
      byPriority: improvementsByPriority,
      top: topImprovements
    };
  }
  
  // Buscar sugestões
  async searchImprovements(query, options = {}) {
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
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
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
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter sugestões mais votadas
  async getTopVotedImprovements(options = {}) {
    const { page = 1, limit = 10, period = '30d' } = options;
    const skip = (page - 1) * limit;
    const startDate = this.getStartDate(period);
    
    const where = {
      createdAt: {
        gte: startDate
      }
    };
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          votes: { _count: 'desc' }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Notificar administradores sobre nova sugestão
  async notifyAdmins(improvement) {
    try {
      const admins = await prisma.user.findMany({
        where: { type: 'ADMIN' },
        select: { id: true, email: true, name: true }
      });
      
      for (const admin of admins) {
        // Enviar notificação por email
        await emailService.sendTemplate(admin.email, 'new-improvement', {
          subject: `Nova sugestão de melhoria: ${improvement.title}`,
          data: {
            improvement,
            adminName: admin.name
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(admin.id, {
          title: 'Nova Sugestão',
          body: `${improvement.title} - ${improvement.category}`,
          data: { improvementId: improvement.id }
        });
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
  
  // Notificar autor da sugestão
  async notifyImprovementAuthor(improvementId, data) {
    try {
      const improvement = await prisma.improvement.findUnique({
        where: { id: improvementId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });
      
      if (improvement) {
        // Enviar notificação por email
        await emailService.sendTemplate(improvement.user.email, 'improvement-update', {
          subject: 'Atualização na sua sugestão',
          data: {
            improvement,
            ...data
          }
        });
        
        // Enviar notificação push
        await pushNotificationService.sendToUser(improvement.user.id, {
          title: 'Sugestão Atualizada',
          body: 'Sua sugestão foi atualizada',
          data: { improvementId }
        });
      }
    } catch (error) {
      console.error('Error notifying improvement author:', error);
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
  
  // Obter sugestões por categoria
  async getImprovementsByCategory(category, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const where = { category };
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
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
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Obter sugestões pendentes
  async getPendingImprovements(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const where = { status: 'PENDING' };
    
    const [improvements, total] = await Promise.all([
      prisma.improvement.findMany({
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
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.improvement.count({ where })
    ]);
    
    return {
      improvements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Marcar sugestão como implementada
  async markAsImplemented(improvementId, implementationNotes, adminId) {
    const improvement = await prisma.improvement.update({
      where: { id: improvementId },
      data: {
        status: 'IMPLEMENTED',
        implementationNotes,
        implementedAt: new Date(),
        implementedBy: adminId
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
    
    // Notificar autor sobre implementação
    await this.notifyImprovementAuthor(improvementId, {
      status: 'IMPLEMENTED',
      implementationNotes
    });
    
    return improvement;
  }
}

module.exports = new ImprovementService();
