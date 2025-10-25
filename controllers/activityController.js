const ActivityService = require('../services/activityService');
const { validationResult } = require('express-validator');

/**
 * Criar nova atividade
 */
const createActivity = async (req, res) => {
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
      title,
      description,
      type,
      maxParticipants,
      isRecurring,
      recurrenceRule,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      isOnline,
      meetingUrl,
      startDate,
      endDate,
      timezone,
      opportunityId,
      materials = [],
      requirements = []
    } = req.body;

    const createdById = req.user.id;

    const result = await ActivityService.createActivity({
      title,
      description,
      type,
      maxParticipants,
      isRecurring,
      recurrenceRule,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      isOnline,
      meetingUrl,
      startDate,
      endDate,
      timezone,
      opportunityId,
      createdById,
      materials,
      requirements
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter atividade por ID
 */
const getActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const result = await ActivityService.getActivity(activityId, userId);

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
    console.error('Erro ao buscar atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter atividades do usuário
 */
const getUserActivities = async (req, res) => {
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

    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      status,
      fromDate,
      toDate,
      role = 'all'
    } = req.query;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas atividades'
      });
    }

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status,
      fromDate,
      toDate,
      role
    };

    const result = await ActivityService.getUserActivities(userId, filters);

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
    console.error('Erro ao buscar atividades do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Inscrever usuário em atividade
 */
const registerUser = async (req, res) => {
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

    const { activityId } = req.params;
    const { role = 'PARTICIPANT' } = req.body;
    const userId = req.user.id;

    const result = await ActivityService.registerUser(activityId, userId, role);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Inscrição realizada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao inscrever usuário na atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar inscrição em atividade
 */
const unregisterUser = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const result = await ActivityService.unregisterUser(activityId, userId);

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
    console.error('Erro ao cancelar inscrição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Confirmar presença em atividade
 */
const confirmAttendance = async (req, res) => {
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

    const { activityId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const result = await ActivityService.confirmAttendance(activityId, userId, status, notes);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Presença confirmada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar status da atividade
 */
const updateActivityStatus = async (req, res) => {
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

    const { activityId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const result = await ActivityService.updateActivityStatus(activityId, status, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Status da atividade atualizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar status da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de atividades
 */
const getActivityStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id && req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas estatísticas'
      });
    }

    const result = await ActivityService.getActivityStats(userId);

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
    console.error('Erro ao obter estatísticas de atividades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar atividades próximas
 */
const getUpcomingActivities = async (req, res) => {
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
      page = 1,
      limit = 20,
      type,
      city,
      radius = 50,
      fromDate,
      toDate
    } = req.query;

    const userId = req.user.id;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      fromDate: fromDate || new Date().toISOString(),
      toDate,
      role: 'all'
    };

    const result = await ActivityService.getUserActivities(userId, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Filtrar por localização se especificado
    let activities = result.data;
    if (city) {
      activities = activities.filter(activity => 
        activity.city && activity.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: activities,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erro ao buscar atividades próximas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar atividades por oportunidade
 */
const getActivitiesByOpportunity = async (req, res) => {
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

    const { opportunityId } = req.params;
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const { prisma } = require('../config/database');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { opportunityId };
    if (status) where.status = status;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { startDate: 'asc' },
        include: {
          createdBy: {
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
          materials: true,
          requirements: true
        }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar atividades por oportunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createActivity,
  getActivity,
  getUserActivities,
  registerUser,
  unregisterUser,
  confirmAttendance,
  updateActivityStatus,
  getActivityStats,
  getUpcomingActivities,
  getActivitiesByOpportunity
};
