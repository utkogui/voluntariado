const MessageGroupService = require('../services/messageGroupService');
const MassMessageService = require('../services/massMessageService');
const UserSegmentationService = require('../services/userSegmentationService');
const MessageSchedulingService = require('../services/messageSchedulingService');
const { validationResult } = require('express-validator');

/**
 * Criar grupo de mensagens
 */
const createMessageGroup = async (req, res) => {
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

    const userId = req.user.id;
    const groupData = req.body;

    const result = await MessageGroupService.createMessageGroup(userId, groupData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Grupo de mensagens criado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar grupo de mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar grupo de mensagens
 */
const updateMessageGroup = async (req, res) => {
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

    const { groupId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const result = await MessageGroupService.updateMessageGroup(groupId, userId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Grupo de mensagens atualizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar grupo de mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adicionar membro ao grupo
 */
const addMemberToGroup = async (req, res) => {
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

    const { groupId } = req.params;
    const { userId: memberId, role = 'MEMBER' } = req.body;
    const addedBy = req.user.id;

    const result = await MessageGroupService.addMemberToGroup(groupId, memberId, addedBy, role);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Membro adicionado ao grupo com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao adicionar membro ao grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remover membro do grupo
 */
const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, userId: memberId } = req.params;
    const removedBy = req.user.id;

    const result = await MessageGroupService.removeMemberFromGroup(groupId, memberId, removedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Membro removido do grupo com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao remover membro do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter grupos do usuário
 */
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageGroupService.getUserGroups(userId, filters);

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
    console.error('Erro ao obter grupos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter grupo específico
 */
const getMessageGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const options = req.query;

    const result = await MessageGroupService.getMessageGroup(groupId, userId, options);

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
    console.error('Erro ao obter grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter membros do grupo
 */
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageGroupService.getGroupMembers(groupId, userId, filters);

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
    console.error('Erro ao obter membros do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar função do membro
 */
const updateMemberRole = async (req, res) => {
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

    const { groupId, userId: memberId } = req.params;
    const { newRole } = req.body;
    const updatedBy = req.user.id;

    const result = await MessageGroupService.updateMemberRole(groupId, memberId, newRole, updatedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Função do membro atualizada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar função do membro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Excluir grupo
 */
const deleteMessageGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const deletedBy = req.user.id;

    const result = await MessageGroupService.deleteMessageGroup(groupId, deletedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Grupo excluído com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas do grupo
 */
const getGroupStats = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const result = await MessageGroupService.getGroupStats(groupId, userId);

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
    console.error('Erro ao obter estatísticas do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar usuários para adicionar ao grupo
 */
const searchUsersForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageGroupService.searchUsersForGroup(groupId, userId, filters);

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
    console.error('Erro ao buscar usuários para o grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Criar campanha de mensagem em massa
 */
const createCampaign = async (req, res) => {
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

    const userId = req.user.id;
    const campaignData = req.body;

    const result = await MassMessageService.createCampaign(userId, campaignData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Executar campanha
 */
const executeCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const executedBy = req.user.id;

    const result = await MassMessageService.executeCampaign(campaignId, executedBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Campanha executada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao executar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter campanhas do usuário
 */
const getUserCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await MassMessageService.getUserCampaigns(userId, filters);

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
    console.error('Erro ao obter campanhas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter campanha específica
 */
const getCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    const result = await MassMessageService.getCampaign(campaignId, userId);

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
    console.error('Erro ao obter campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar campanha
 */
const cancelCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const cancelledBy = req.user.id;

    const result = await MassMessageService.cancelCampaign(campaignId, cancelledBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Campanha cancelada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao cancelar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas da campanha
 */
const getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    const result = await MassMessageService.getCampaignStats(campaignId, userId);

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
    console.error('Erro ao obter estatísticas da campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter usuários segmentados
 */
const getSegmentedUsers = async (req, res) => {
  try {
    const filters = req.query;
    const options = req.query;

    const result = await UserSegmentationService.getSegmentedUsers(filters, options);

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
    console.error('Erro ao obter usuários segmentados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de segmentação
 */
const getSegmentationStats = async (req, res) => {
  try {
    const filters = req.query;

    const result = await UserSegmentationService.getSegmentationStats(filters);

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
    console.error('Erro ao obter estatísticas de segmentação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Salvar segmento personalizado
 */
const saveCustomSegment = async (req, res) => {
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

    const userId = req.user.id;
    const segmentData = req.body;

    const result = await UserSegmentationService.saveCustomSegment(userId, segmentData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Segmento personalizado salvo com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao salvar segmento personalizado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter segmentos personalizados
 */
const getCustomSegments = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await UserSegmentationService.getCustomSegments(userId, filters);

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
    console.error('Erro ao obter segmentos personalizados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Agendar campanha
 */
const scheduleCampaign = async (req, res) => {
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

    const { campaignId } = req.params;
    const scheduledBy = req.user.id;
    const scheduleData = req.body;

    const result = await MessageSchedulingService.scheduleCampaign(campaignId, scheduledBy, scheduleData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Campanha agendada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao agendar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar agendamento de campanha
 */
const cancelScheduledCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const cancelledBy = req.user.id;

    const result = await MessageSchedulingService.cancelScheduledCampaign(campaignId, cancelledBy);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reagendar campanha
 */
const rescheduleCampaign = async (req, res) => {
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

    const { campaignId } = req.params;
    const rescheduledBy = req.user.id;
    const rescheduleData = req.body;

    const result = await MessageSchedulingService.rescheduleCampaign(campaignId, rescheduledBy, rescheduleData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Campanha reagendada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao reagendar campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter campanhas agendadas
 */
const getScheduledCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageSchedulingService.getScheduledCampaigns(userId, filters);

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
    console.error('Erro ao obter campanhas agendadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de agendamento
 */
const getSchedulingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageSchedulingService.getSchedulingStats(userId, filters);

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
    console.error('Erro ao obter estatísticas de agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter campanhas próximas
 */
const getUpcomingCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const options = req.query;

    const result = await MessageSchedulingService.getUpcomingCampaigns(userId, options);

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
    console.error('Erro ao obter campanhas próximas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de agendamentos
 */
const getSchedulingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await MessageSchedulingService.getSchedulingHistory(userId, filters);

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
    console.error('Erro ao obter histórico de agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createMessageGroup,
  updateMessageGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getUserGroups,
  getMessageGroup,
  getGroupMembers,
  updateMemberRole,
  deleteMessageGroup,
  getGroupStats,
  searchUsersForGroup,
  createCampaign,
  executeCampaign,
  getUserCampaigns,
  getCampaign,
  cancelCampaign,
  getCampaignStats,
  getSegmentedUsers,
  getSegmentationStats,
  saveCustomSegment,
  getCustomSegments,
  scheduleCampaign,
  cancelScheduledCampaign,
  rescheduleCampaign,
  getScheduledCampaigns,
  getSchedulingStats,
  getUpcomingCampaigns,
  getSchedulingHistory
};
