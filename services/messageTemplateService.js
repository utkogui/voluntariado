const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageTemplateService {
  /**
   * Criar template de mensagem
   */
  async createTemplate(userId, templateData) {
    try {
      const {
        name,
        description,
        type,
        subject,
        content,
        contentType,
        variables = [],
        isActive = true,
        tags = [],
        category = 'GENERAL'
      } = templateData;

      const template = await prisma.messageTemplate.create({
        data: {
          name,
          description,
          type,
          subject,
          content,
          contentType,
          variables,
          isActive,
          tags,
          category,
          createdBy: userId
        }
      });

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Erro ao criar template de mensagem:', error);
      return {
        success: false,
        error: 'Erro ao criar template de mensagem'
      };
    }
  }

  /**
   * Atualizar template de mensagem
   */
  async updateTemplate(templateId, userId, updateData) {
    try {
      // Verificar se o template existe e se o usuário tem permissão
      const existingTemplate = await prisma.messageTemplate.findUnique({
        where: { id: templateId }
      });

      if (!existingTemplate) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      if (existingTemplate.createdBy !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para atualizar este template'
        };
      }

      const template = await prisma.messageTemplate.update({
        where: { id: templateId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Erro ao atualizar template de mensagem:', error);
      return {
        success: false,
        error: 'Erro ao atualizar template de mensagem'
      };
    }
  }

  /**
   * Obter template por ID
   */
  async getTemplate(templateId, userId) {
    try {
      const template = await prisma.messageTemplate.findUnique({
        where: { id: templateId },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true
            }
          }
        }
      });

      if (!template) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      // Verificar se o usuário tem permissão para ver o template
      if (template.createdBy !== userId && template.isActive === false) {
        return {
          success: false,
          error: 'Usuário não tem permissão para ver este template'
        };
      }

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Erro ao obter template:', error);
      return {
        success: false,
        error: 'Erro ao obter template'
      };
    }
  }

  /**
   * Obter templates do usuário
   */
  async getUserTemplates(userId, filters = {}) {
    try {
      const {
        type,
        category,
        isActive,
        tags,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        createdBy: userId
      };

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags
        };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.messageTemplate.findMany({
          where,
          include: {
            createdByUser: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.messageTemplate.count({ where })
      ]);

      return {
        success: true,
        data: {
          templates,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter templates do usuário:', error);
      return {
        success: false,
        error: 'Erro ao obter templates do usuário'
      };
    }
  }

  /**
   * Obter templates públicos
   */
  async getPublicTemplates(filters = {}) {
    try {
      const {
        type,
        category,
        tags,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const where = {
        isActive: true,
        isPublic: true
      };

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags
        };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.messageTemplate.findMany({
          where,
          include: {
            createdByUser: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.messageTemplate.count({ where })
      ]);

      return {
        success: true,
        data: {
          templates,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao obter templates públicos:', error);
      return {
        success: false,
        error: 'Erro ao obter templates públicos'
      };
    }
  }

  /**
   * Duplicar template
   */
  async duplicateTemplate(templateId, userId, newName) {
    try {
      const originalTemplate = await prisma.messageTemplate.findUnique({
        where: { id: templateId }
      });

      if (!originalTemplate) {
        return {
          success: false,
          error: 'Template original não encontrado'
        };
      }

      const duplicatedTemplate = await prisma.messageTemplate.create({
        data: {
          name: newName || `${originalTemplate.name} (Cópia)`,
          description: originalTemplate.description,
          type: originalTemplate.type,
          subject: originalTemplate.subject,
          content: originalTemplate.content,
          contentType: originalTemplate.contentType,
          variables: originalTemplate.variables,
          isActive: false, // Template duplicado começa como inativo
          tags: originalTemplate.tags,
          category: originalTemplate.category,
          createdBy: userId
        }
      });

      return {
        success: true,
        data: duplicatedTemplate
      };
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      return {
        success: false,
        error: 'Erro ao duplicar template'
      };
    }
  }

  /**
   * Excluir template
   */
  async deleteTemplate(templateId, userId) {
    try {
      // Verificar se o template existe e se o usuário tem permissão
      const existingTemplate = await prisma.messageTemplate.findUnique({
        where: { id: templateId }
      });

      if (!existingTemplate) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      if (existingTemplate.createdBy !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para excluir este template'
        };
      }

      await prisma.messageTemplate.delete({
        where: { id: templateId }
      });

      return {
        success: true,
        message: 'Template excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      return {
        success: false,
        error: 'Erro ao excluir template'
      };
    }
  }

  /**
   * Ativar/desativar template
   */
  async toggleTemplateStatus(templateId, userId, isActive) {
    try {
      // Verificar se o template existe e se o usuário tem permissão
      const existingTemplate = await prisma.messageTemplate.findUnique({
        where: { id: templateId }
      });

      if (!existingTemplate) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      if (existingTemplate.createdBy !== userId) {
        return {
          success: false,
          error: 'Usuário não tem permissão para alterar este template'
        };
      }

      const template = await prisma.messageTemplate.update({
        where: { id: templateId },
        data: {
          isActive,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Erro ao alterar status do template:', error);
      return {
        success: false,
        error: 'Erro ao alterar status do template'
      };
    }
  }

  /**
   * Renderizar template com variáveis
   */
  async renderTemplate(templateId, variables = {}) {
    try {
      const template = await prisma.messageTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        return {
          success: false,
          error: 'Template não encontrado'
        };
      }

      if (!template.isActive) {
        return {
          success: false,
          error: 'Template não está ativo'
        };
      }

      let renderedSubject = template.subject;
      let renderedContent = template.content;

      // Substituir variáveis no assunto
      if (template.subject && Object.keys(variables).length > 0) {
        renderedSubject = this.replaceVariables(template.subject, variables);
      }

      // Substituir variáveis no conteúdo
      if (template.content && Object.keys(variables).length > 0) {
        renderedContent = this.replaceVariables(template.content, variables);
      }

      return {
        success: true,
        data: {
          subject: renderedSubject,
          content: renderedContent,
          contentType: template.contentType
        }
      };
    } catch (error) {
      console.error('Erro ao renderizar template:', error);
      return {
        success: false,
        error: 'Erro ao renderizar template'
      };
    }
  }

  /**
   * Substituir variáveis no texto
   */
  replaceVariables(text, variables) {
    let result = text;

    // Substituir variáveis no formato {{variableName}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });

    // Substituir variáveis no formato {variableName}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });

    return result;
  }

  /**
   * Obter categorias de templates
   */
  async getTemplateCategories() {
    try {
      const categories = await prisma.messageTemplate.groupBy({
        by: ['category'],
        where: {
          isActive: true
        },
        _count: {
          id: true
        }
      });

      return {
        success: true,
        data: categories.map(cat => ({
          category: cat.category,
          count: cat._count.id
        }))
      };
    } catch (error) {
      console.error('Erro ao obter categorias de templates:', error);
      return {
        success: false,
        error: 'Erro ao obter categorias de templates'
      };
    }
  }

  /**
   * Obter tags de templates
   */
  async getTemplateTags() {
    try {
      const templates = await prisma.messageTemplate.findMany({
        where: {
          isActive: true
        },
        select: {
          tags: true
        }
      });

      const allTags = templates.flatMap(template => template.tags || []);
      const tagCounts = {};

      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: sortedTags
      };
    } catch (error) {
      console.error('Erro ao obter tags de templates:', error);
      return {
        success: false,
        error: 'Erro ao obter tags de templates'
      };
    }
  }

  /**
   * Obter estatísticas de templates
   */
  async getTemplateStats(userId) {
    try {
      const [
        totalTemplates,
        activeTemplates,
        inactiveTemplates,
        publicTemplates,
        privateTemplates,
        typeStats,
        categoryStats
      ] = await Promise.all([
        prisma.messageTemplate.count({
          where: { createdBy: userId }
        }),
        prisma.messageTemplate.count({
          where: { createdBy: userId, isActive: true }
        }),
        prisma.messageTemplate.count({
          where: { createdBy: userId, isActive: false }
        }),
        prisma.messageTemplate.count({
          where: { createdBy: userId, isPublic: true }
        }),
        prisma.messageTemplate.count({
          where: { createdBy: userId, isPublic: false }
        }),
        prisma.messageTemplate.groupBy({
          by: ['type'],
          where: { createdBy: userId },
          _count: { id: true }
        }),
        prisma.messageTemplate.groupBy({
          by: ['category'],
          where: { createdBy: userId },
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalTemplates,
          activeTemplates,
          inactiveTemplates,
          publicTemplates,
          privateTemplates,
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id
          })),
          categoryStats: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.id
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de templates:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas de templates'
      };
    }
  }

  /**
   * Validar template
   */
  async validateTemplate(templateData) {
    try {
      const errors = [];

      // Validar campos obrigatórios
      if (!templateData.name || templateData.name.trim().length === 0) {
        errors.push('Nome do template é obrigatório');
      }

      if (!templateData.type) {
        errors.push('Tipo do template é obrigatório');
      }

      if (!templateData.content || templateData.content.trim().length === 0) {
        errors.push('Conteúdo do template é obrigatório');
      }

      // Validar tipo de conteúdo
      if (templateData.contentType && !['TEXT', 'HTML', 'MARKDOWN'].includes(templateData.contentType)) {
        errors.push('Tipo de conteúdo inválido');
      }

      // Validar variáveis no conteúdo
      if (templateData.content && templateData.variables) {
        const content = templateData.content;
        const variables = templateData.variables || [];

        // Encontrar todas as variáveis usadas no conteúdo
        const usedVariables = content.match(/\{\{(\w+)\}\}|\{(\w+)\}/g) || [];
        const variableNames = usedVariables.map(v => v.replace(/[{}]/g, ''));

        // Verificar se todas as variáveis usadas estão definidas
        const undefinedVariables = variableNames.filter(v => !variables.includes(v));
        if (undefinedVariables.length > 0) {
          errors.push(`Variáveis não definidas: ${undefinedVariables.join(', ')}`);
        }
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Erro ao validar template:', error);
      return {
        success: false,
        errors: ['Erro interno ao validar template']
      };
    }
  }
}

module.exports = new MessageTemplateService();
