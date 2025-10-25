const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_TYPES } = require('../utils/constants');
const { createError } = require('../middleware/errorHandler');
const profileService = require('../services/profileService');

// Obter perfil do usuário logado
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await profileService.getUserProfile(userId);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json(result.data);
  } catch (error) {
    throw error;
  }
};

// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const updateData = req.body;

    const result = await profileService.updateUserProfile(userId, userType, updateData);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message,
      profile: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Alterar senha
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await profileService.changeUserPassword(userId, currentPassword, newPassword);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message
    });
  } catch (error) {
    throw error;
  }
};

// Deletar conta
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Senha é obrigatória para deletar a conta'
      });
    }

    const result = await profileService.deleteUserAccount(userId, password);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas do usuário
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const result = await profileService.getProfileStats(userId, userType);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data
    });
  } catch (error) {
    throw error;
  }
};

// Verificar email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Em uma implementação real, você validaria o token
    // Por enquanto, apenas marcamos como verificado
    const user = await prisma.user.findFirst({
      where: { id: token } // Simplificado para demonstração
    });

    if (!user) {
      return res.status(404).json({
        error: 'Token inválido'
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    res.json({
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED
    });

  } catch (error) {
    throw error;
  }
};

// Atualizar email do usuário
const updateEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        error: 'Novo email e senha são obrigatórios'
      });
    }

    const result = await profileService.updateUserEmail(userId, newEmail, password);

    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      message: result.message
    });
  } catch (error) {
    throw error;
  }
};

// Buscar usuários (apenas para administradores)
const searchUsers = async (req, res) => {
  try {
    const { q, userType, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const result = await profileService.searchUsers(
      q.trim(),
      userType,
      parseInt(page),
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      users: result.data.users,
      pagination: result.data.pagination
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateEmail,
  deleteAccount,
  getUserStats,
  verifyEmail,
  searchUsers
};
