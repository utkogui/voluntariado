const NotificationTemplateService = require('../services/notificationTemplateService');
const { validationResult } = require('express-validator');

/**
 * Criar template de notificação
 */
const createTemplate = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const {
      name,
      type,
      title,
      body,
      channelId,
      sound,
      icon,
      color,
      data,
      isActive = true
    } = req.body;

    const createdBy = req.user.id;

    const result = await NotificationTemplateService.createTemplate({
      name,
      type,
      title,
      body,
      channelId,
      sound,
      icon,
      color,
      data,
      isActive,
      createdBy
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter template por tipo
 */
const getTemplateByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;

    const result = await NotificationTemplateService.getTemplateByType(type, userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao obter template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter todos os templates
 */
const getTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isActive,
      createdBy
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      createdBy: createdBy === 'me' ? req.user.id : createdBy
    };

    const result = await NotificationTemplateService.getTemplates(filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erro ao obter templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar template
 */
const updateTemplate = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { templateId } = req.params;
    const updateData = req.body;

    // Verificar se o template pertence ao usuário ou se é admin
    const { prisma } = require('../config/database');
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }

    if (template.createdBy !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este template'
      });
    }

    const result = await NotificationTemplateService.updateTemplate(templateId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deletar template
 */
const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // Verificar se o template pertence ao usuário ou se é admin
    const { prisma } = require('../config/database');
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }

    if (template.createdBy !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este template'
      });
    }

    const result = await NotificationTemplateService.deleteTemplate(templateId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erro ao deletar template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de templates
 */
const getTemplateStats = async (req, res) => {
  try {
    const result = await NotificationTemplateService.getTemplateStats();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Inicializar templates padrão
 */
const initializeDefaultTemplates = async (req, res) => {
  try {
    // Apenas admin pode inicializar templates padrão
    if (req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem inicializar templates padrão'
      });
    }

    const result = await NotificationTemplateService.initializeDefaultTemplates();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Templates padrão inicializados com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao inicializar templates padrão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Processar template com dados
 */
const processTemplate = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { templateId, data } = req.body;

    // Buscar template
    const { prisma } = require('../config/database');
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }

    // Processar template
    const processedTemplate = NotificationTemplateService.processTemplate(template, data);

    res.json({
      success: true,
      data: processedTemplate
    });

  } catch (error) {
    console.error('Erro ao processar template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter templates padrão
 */
const getDefaultTemplates = async (req, res) => {
  try {
    const defaultTemplates = NotificationTemplateService.getDefaultTemplates();

    res.json({
      success: true,
      data: defaultTemplates
    });

  } catch (error) {
    console.error('Erro ao obter templates padrão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createTemplate,
  getTemplateByType,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  getTemplateStats,
  initializeDefaultTemplates,
  processTemplate,
  getDefaultTemplates
};
