const ActivityCancellationService = require('../services/activityCancellationService');
const ActivityRescheduleService = require('../services/activityRescheduleService');
const ActivityChangeNotificationService = require('../services/activityChangeNotificationService');
const ActivityBackupService = require('../services/activityBackupService');
const { validationResult } = require('express-validator');

/**
 * Cancelar atividade
 */
const cancelActivity = async (req, res) => {
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
    const userId = req.user.id;
    const cancellationData = req.body;

    const result = await ActivityCancellationService.cancelActivity(activityId, userId, cancellationData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Atividade cancelada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao cancelar atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Solicitar reagendamento de atividade
 */
const requestReschedule = async (req, res) => {
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
    const userId = req.user.id;
    const rescheduleData = req.body;

    const result = await ActivityRescheduleService.requestReschedule(activityId, userId, rescheduleData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Solicitação de reagendamento criada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao solicitar reagendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Aprovar reagendamento
 */
const approveReschedule = async (req, res) => {
  try {
    const { rescheduleId } = req.params;
    const userId = req.user.id;

    const result = await ActivityRescheduleService.approveReschedule(rescheduleId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Reagendamento aprovado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao aprovar reagendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rejeitar reagendamento
 */
const rejectReschedule = async (req, res) => {
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

    const { rescheduleId } = req.params;
    const userId = req.user.id;
    const { rejectionReason } = req.body;

    const result = await ActivityRescheduleService.rejectReschedule(rescheduleId, userId, rejectionReason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Reagendamento rejeitado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao rejeitar reagendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de cancelamentos
 */
const getCancellationHistory = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await ActivityCancellationService.getCancellationHistory(activityId);

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
    console.error('Erro ao obter histórico de cancelamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de reagendamentos
 */
const getRescheduleHistory = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await ActivityRescheduleService.getRescheduleHistory(activityId);

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
    console.error('Erro ao obter histórico de reagendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de cancelamentos
 */
const getCancellationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await ActivityCancellationService.getCancellationStats(userId, filters);

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
    console.error('Erro ao obter estatísticas de cancelamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter estatísticas de reagendamentos
 */
const getRescheduleStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const result = await ActivityRescheduleService.getRescheduleStats(userId, filters);

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
    console.error('Erro ao obter estatísticas de reagendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Processar reembolso
 */
const processRefund = async (req, res) => {
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

    const { cancellationId } = req.params;
    const userId = req.user.id;
    const refundData = req.body;

    const result = await ActivityCancellationService.processRefund(cancellationId, userId, refundData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Reembolso processado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Restaurar atividade cancelada
 */
const restoreCancelledActivity = async (req, res) => {
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
    const userId = req.user.id;
    const { reason } = req.body;

    const result = await ActivityCancellationService.restoreCancelledActivity(activityId, userId, reason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Atividade restaurada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao restaurar atividade cancelada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enviar notificação de mudança
 */
const sendChangeNotification = async (req, res) => {
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
    const { changeType, changeData, targetUsers = [] } = req.body;

    const result = await ActivityChangeNotificationService.sendChangeNotification(
      activityId,
      changeType,
      changeData,
      targetUsers
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Notificação de mudança enviada com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao enviar notificação de mudança:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de notificações de mudança
 */
const getChangeNotificationHistory = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await ActivityChangeNotificationService.getChangeNotificationHistory(activityId);

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
    console.error('Erro ao obter histórico de notificações de mudança:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Criar backup da atividade
 */
const createActivityBackup = async (req, res) => {
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
    const userId = req.user.id;
    const { backupType, reason, customData } = req.body;

    const result = await ActivityBackupService.createManualBackup(activityId, userId, {
      backupType,
      reason,
      customData
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Backup da atividade criado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar backup da atividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Restaurar atividade do backup
 */
const restoreFromBackup = async (req, res) => {
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

    const { backupId } = req.params;
    const userId = req.user.id;
    const restoreOptions = req.body;

    const result = await ActivityBackupService.restoreFromBackup(backupId, userId, restoreOptions);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Atividade restaurada do backup com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao restaurar do backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter histórico de backups
 */
const getBackupHistory = async (req, res) => {
  try {
    const { activityId } = req.params;

    const result = await ActivityBackupService.getActivityBackupHistory(activityId);

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
    console.error('Erro ao obter histórico de backups:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter backup específico
 */
const getBackup = async (req, res) => {
  try {
    const { backupId } = req.params;

    const result = await ActivityBackupService.getBackup(backupId);

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
    console.error('Erro ao obter backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Excluir backup
 */
const deleteBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const userId = req.user.id;

    const result = await ActivityBackupService.deleteBackup(backupId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Backup excluído com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao excluir backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  cancelActivity,
  requestReschedule,
  approveReschedule,
  rejectReschedule,
  getCancellationHistory,
  getRescheduleHistory,
  getCancellationStats,
  getRescheduleStats,
  processRefund,
  restoreCancelledActivity,
  sendChangeNotification,
  getChangeNotificationHistory,
  createActivityBackup,
  restoreFromBackup,
  getBackupHistory,
  getBackup,
  deleteBackup
};
