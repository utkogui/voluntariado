const { PrismaClient } = require('@prisma/client');
const CommunicationService = require('./communicationService');

const prisma = new PrismaClient();

/**
 * Serviço de chat para gerenciar conversas e mensagens
 */
class ChatService {
  
  /**
   * Criar uma nova conversa
   * @param {Object} data - Dados da conversa
   * @returns {Object} Resultado da operação
   */
  static async createConversation(data) {
    try {
      const { title, type = 'DIRECT', participants, opportunityId } = data;

      // Verificar se já existe uma conversa direta entre os participantes
      if (type === 'DIRECT' && participants.length === 2) {
        const existingConversation = await this.findDirectConversation(participants[0], participants[1]);
        if (existingConversation) {
          return {
            success: true,
            data: existingConversation,
            message: 'Conversa já existe'
          };
        }
      }

      // Criar conversa
      const conversation = await prisma.conversation.create({
        data: {
          title,
          type,
          opportunityId,
          participants: {
            create: participants.map(userId => ({
              userId,
              role: 'MEMBER'
            }))
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true
            }
          }
        }
      });

      return {
        success: true,
        data: conversation
      };

    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Encontrar conversa direta entre dois usuários
   * @param {string} userId1 - ID do primeiro usuário
   * @param {string} userId2 - ID do segundo usuário
   * @returns {Object} Conversa encontrada ou null
   */
  static async findDirectConversation(userId1, userId2) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: {
                in: [userId1, userId2]
              }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return conversation;

    } catch (error) {
      console.error('Erro ao buscar conversa direta:', error);
      return null;
    }
  }

  /**
   * Obter conversas de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de conversas
   */
  static async getUserConversations(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status = 'ACTIVE'
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        participants: {
          some: {
            userId
          }
        },
        status
      };

      if (type) {
        where.type = type;
      }

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { updatedAt: 'desc' },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    userType: true,
                    volunteer: { select: { firstName: true, lastName: true } },
                    institution: { select: { name: true } },
                    company: { select: { name: true } },
                    university: { select: { name: true } }
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    email: true,
                    userType: true,
                    volunteer: { select: { firstName: true, lastName: true } },
                    institution: { select: { name: true } },
                    company: { select: { name: true } },
                    university: { select: { name: true } }
                  }
                }
              }
            },
            opportunity: {
              select: {
                id: true,
                title: true,
                description: true
              }
            }
          }
        }),
        prisma.conversation.count({ where })
      ]);

      return {
        success: true,
        data: conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar conversas do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter uma conversa específica
   * @param {string} conversationId - ID da conversa
   * @param {string} userId - ID do usuário
   * @returns {Object} Conversa
   */
  static async getConversation(conversationId, userId) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              userId
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              description: true
            }
          }
        }
      });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada'
        };
      }

      return {
        success: true,
        data: conversation
      };

    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar mensagem
   * @param {Object} data - Dados da mensagem
   * @returns {Object} Resultado da operação
   */
  static async sendMessage(data) {
    try {
      const {
        conversationId,
        senderId,
        content,
        type = 'TEXT',
        parentId,
        attachments = [],
        metadata
      } = data;

      // Verificar se o usuário é participante da conversa
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: senderId
        }
      });

      if (!participant) {
        return {
          success: false,
          error: 'Usuário não é participante desta conversa'
        };
      }

      // Criar mensagem
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type,
          parentId,
          metadata,
          attachments: {
            create: attachments.map(attachment => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize
            }))
          }
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          },
          attachments: true,
          parent: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      // Atualizar timestamp da conversa
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Enviar notificações para outros participantes
      await this.notifyMessageParticipants(conversationId, message, senderId);

      return {
        success: true,
        data: message
      };

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter mensagens de uma conversa
   * @param {string} conversationId - ID da conversa
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Lista de mensagens
   */
  static async getConversationMessages(conversationId, userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        before,
        after
      } = filters;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Verificar se o usuário é participante da conversa
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId
        }
      });

      if (!participant) {
        return {
          success: false,
          error: 'Usuário não é participante desta conversa'
        };
      }

      const where = {
        conversationId,
        deletedAt: null
      };

      if (before) {
        where.createdAt = {
          lt: new Date(before)
        };
      }

      if (after) {
        where.createdAt = {
          gt: new Date(after)
        };
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                userType: true,
                volunteer: { select: { firstName: true, lastName: true } },
                institution: { select: { name: true } },
                company: { select: { name: true } },
                university: { select: { name: true } }
              }
            },
            attachments: true,
            parent: {
              select: {
                id: true,
                content: true,
                sender: {
                  select: {
                    id: true,
                    volunteer: { select: { firstName: true, lastName: true } },
                    institution: { select: { name: true } },
                    company: { select: { name: true } },
                    university: { select: { name: true } }
                  }
                }
              }
            }
          }
        }),
        prisma.message.count({ where })
      ]);

      return {
        success: true,
        data: messages.reverse(), // Ordenar por data crescente
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar mensagens como lidas
   * @param {string} conversationId - ID da conversa
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async markMessagesAsRead(conversationId, userId) {
    try {
      // Atualizar lastReadAt do participante
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId
        },
        data: {
          lastReadAt: new Date()
        }
      });

      // Marcar mensagens como lidas
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          status: { in: ['SENT', 'DELIVERED'] }
        },
        data: {
          status: 'READ'
        }
      });

      return {
        success: true,
        message: 'Mensagens marcadas como lidas'
      };

    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Editar mensagem
   * @param {string} messageId - ID da mensagem
   * @param {string} userId - ID do usuário
   * @param {string} content - Novo conteúdo
   * @returns {Object} Resultado da operação
   */
  static async editMessage(messageId, userId, content) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId,
          deletedAt: null
        }
      });

      if (!message) {
        return {
          success: false,
          error: 'Mensagem não encontrada ou não autorizada'
        };
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          editedAt: new Date()
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          }
        }
      });

      return {
        success: true,
        data: updatedMessage
      };

    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deletar mensagem
   * @param {string} messageId - ID da mensagem
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  static async deleteMessage(messageId, userId) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId,
          deletedAt: null
        }
      });

      if (!message) {
        return {
          success: false,
          error: 'Mensagem não encontrada ou não autorizada'
        };
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          deletedAt: new Date(),
          content: 'Mensagem deletada'
        }
      });

      return {
        success: true,
        message: 'Mensagem deletada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adicionar participante à conversa
   * @param {string} conversationId - ID da conversa
   * @param {string} userId - ID do usuário
   * @param {string} addedBy - ID do usuário que está adicionando
   * @returns {Object} Resultado da operação
   */
  static async addParticipant(conversationId, userId, addedBy) {
    try {
      // Verificar se o usuário que está adicionando tem permissão
      const adminParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: addedBy,
          role: { in: ['ADMIN', 'MODERATOR'] }
        }
      });

      if (!adminParticipant) {
        return {
          success: false,
          error: 'Usuário não tem permissão para adicionar participantes'
        };
      }

      // Verificar se o usuário já é participante
      const existingParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId
        }
      });

      if (existingParticipant) {
        return {
          success: false,
          error: 'Usuário já é participante desta conversa'
        };
      }

      // Adicionar participante
      const participant = await prisma.conversationParticipant.create({
        data: {
          conversationId,
          userId,
          role: 'MEMBER'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          }
        }
      });

      return {
        success: true,
        data: participant
      };

    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remover participante da conversa
   * @param {string} conversationId - ID da conversa
   * @param {string} userId - ID do usuário
   * @param {string} removedBy - ID do usuário que está removendo
   * @returns {Object} Resultado da operação
   */
  static async removeParticipant(conversationId, userId, removedBy) {
    try {
      // Verificar se o usuário que está removendo tem permissão
      const adminParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: removedBy,
          role: { in: ['ADMIN', 'MODERATOR'] }
        }
      });

      if (!adminParticipant) {
        return {
          success: false,
          error: 'Usuário não tem permissão para remover participantes'
        };
      }

      // Remover participante
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId,
          userId
        }
      });

      return {
        success: true,
        message: 'Participante removido com sucesso'
      };

    } catch (error) {
      console.error('Erro ao remover participante:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Notificar participantes sobre nova mensagem
   * @param {string} conversationId - ID da conversa
   * @param {Object} message - Mensagem enviada
   * @param {string} senderId - ID do remetente
   */
  static async notifyMessageParticipants(conversationId, message, senderId) {
    try {
      // Buscar participantes da conversa
      const participants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          userId: { not: senderId }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          }
        }
      });

      // Enviar notificações para cada participante
      for (const participant of participants) {
        await CommunicationService.sendMessageNotification(
          message.sender,
          participant.user,
          message
        );
      }

    } catch (error) {
      console.error('Erro ao notificar participantes:', error);
    }
  }

  /**
   * Obter estatísticas de chat
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  static async getChatStats(userId) {
    try {
      const [
        totalConversations,
        totalMessages,
        unreadMessages,
        recentActivity
      ] = await Promise.all([
        prisma.conversation.count({
          where: {
            participants: {
              some: { userId }
            }
          }
        }),
        prisma.message.count({
          where: {
            conversation: {
              participants: {
                some: { userId }
              }
            }
          }
        }),
        prisma.message.count({
          where: {
            conversation: {
              participants: {
                some: { userId }
              }
            },
            senderId: { not: userId },
            status: { in: ['SENT', 'DELIVERED'] }
          }
        }),
        prisma.message.count({
          where: {
            conversation: {
              participants: {
                some: { userId }
              }
            },
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalConversations,
          totalMessages,
          unreadMessages,
          recentActivity
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ChatService;
