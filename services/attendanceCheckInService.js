const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de check-in/check-out
 */
class AttendanceCheckInService {
  
  /**
   * Fazer check-in na atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} checkInData - Dados do check-in
   * @returns {Object} Resultado da operação
   */
  static async checkIn(activityId, userId, checkInData = {}) {
    try {
      const {
        location,
        latitude,
        longitude,
        deviceInfo,
        notes
      } = checkInData;

      // Verificar se a atividade existe e está ativa
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      if (activity.status === 'CANCELLED') {
        return {
          success: false,
          error: 'Atividade foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          success: false,
          error: 'Atividade já foi concluída'
        };
      }

      // Verificar se o usuário é participante da atividade
      if (activity.participants.length === 0) {
        return {
          success: false,
          error: 'Você não é participante desta atividade'
        };
      }

      // Verificar se já fez check-in
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        }
      });

      if (existingRecord && existingRecord.checkInTime) {
        return {
          success: false,
          error: 'Você já fez check-in nesta atividade'
        };
      }

      // Verificar se está dentro do horário permitido para check-in
      const now = new Date();
      const activityStart = new Date(activity.startDate);
      const activityEnd = new Date(activity.endDate);
      
      // Permitir check-in até 30 minutos antes do início
      const checkInStart = new Date(activityStart.getTime() - 30 * 60 * 1000);
      
      if (now < checkInStart) {
        return {
          success: false,
          error: 'Check-in ainda não está disponível. Disponível 30 minutos antes do início da atividade.'
        };
      }

      if (now > activityEnd) {
        return {
          success: false,
          error: 'Check-in não está mais disponível. A atividade já terminou.'
        };
      }

      // Determinar status baseado no horário
      let status = 'PRESENT';
      const lateThreshold = new Date(activityStart.getTime() + 15 * 60 * 1000); // 15 minutos após o início
      
      if (now > lateThreshold) {
        status = 'LATE';
      }

      // Criar ou atualizar registro de presença
      const attendanceRecord = await prisma.attendanceRecord.upsert({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        update: {
          checkInTime: now,
          status,
          location,
          latitude,
          longitude,
          deviceInfo,
          notes
        },
        create: {
          activityId,
          userId,
          checkInTime: now,
          status,
          location,
          latitude,
          longitude,
          deviceInfo,
          notes
        }
      });

      // Atualizar contador de participantes presentes
      await this.updatePresentParticipantsCount(activityId);

      return {
        success: true,
        data: attendanceRecord
      };

    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fazer check-out na atividade
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} checkOutData - Dados do check-out
   * @returns {Object} Resultado da operação
   */
  static async checkOut(activityId, userId, checkOutData = {}) {
    try {
      const { notes } = checkOutData;

      // Verificar se a atividade existe
      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Verificar se fez check-in
      const attendanceRecord = await prisma.attendanceRecord.findUnique({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        }
      });

      if (!attendanceRecord) {
        return {
          success: false,
          error: 'Você precisa fazer check-in antes de fazer check-out'
        };
      }

      if (attendanceRecord.checkOutTime) {
        return {
          success: false,
          error: 'Você já fez check-out nesta atividade'
        };
      }

      if (!attendanceRecord.checkInTime) {
        return {
          success: false,
          error: 'Você precisa fazer check-in antes de fazer check-out'
        };
      }

      const now = new Date();
      const activityEnd = new Date(activity.endDate);
      
      // Determinar status baseado no horário
      let status = attendanceRecord.status;
      const earlyLeaveThreshold = new Date(activityEnd.getTime() - 30 * 60 * 1000); // 30 minutos antes do fim
      
      if (now < earlyLeaveThreshold) {
        status = 'EARLY_LEAVE';
      }

      // Atualizar registro de presença
      const updatedRecord = await prisma.attendanceRecord.update({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        },
        data: {
          checkOutTime: now,
          status,
          notes: notes || attendanceRecord.notes
        }
      });

      return {
        success: true,
        data: updatedRecord
      };

    } catch (error) {
      console.error('Erro ao fazer check-out:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marcar ausência
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @param {Object} absenceData - Dados da ausência
   * @returns {Object} Resultado da operação
   */
  static async markAbsence(activityId, userId, absenceData = {}) {
    try {
      const { notes, isExcused = false } = absenceData;

      // Verificar se a atividade existe
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Verificar se o usuário é participante da atividade
      if (activity.participants.length === 0) {
        return {
          success: false,
          error: 'Usuário não é participante desta atividade'
        };
      }

      // Verificar se já tem registro de presença
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        }
      });

      if (existingRecord) {
        return {
          success: false,
          error: 'Já existe um registro de presença para este usuário'
        };
      }

      // Criar registro de ausência
      const attendanceRecord = await prisma.attendanceRecord.create({
        data: {
          activityId,
          userId,
          status: isExcused ? 'EXCUSED' : 'ABSENT',
          notes
        }
      });

      return {
        success: true,
        data: attendanceRecord
      };

    } catch (error) {
      console.error('Erro ao marcar ausência:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter registros de presença da atividade
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @returns {Object} Registros de presença
   */
  static async getActivityAttendanceRecords(activityId, filters = {}) {
    try {
      const {
        status,
        includeUserDetails = true
      } = filters;

      const whereClause = { activityId };
      if (status) {
        whereClause.status = status;
      }

      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          user: includeUserDetails ? {
            select: {
              id: true,
              email: true,
              userType: true,
              volunteer: { select: { firstName: true, lastName: true } },
              institution: { select: { name: true } },
              company: { select: { name: true } },
              university: { select: { name: true } }
            }
          } : false
        },
        orderBy: { checkInTime: 'desc' }
      });

      return {
        success: true,
        data: records
      };

    } catch (error) {
      console.error('Erro ao obter registros de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter registros de presença do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Registros de presença
   */
  static async getUserAttendanceRecords(userId, filters = {}) {
    try {
      const {
        status,
        activityStatus,
        startDate,
        endDate,
        includeActivityDetails = true
      } = filters;

      const whereClause = { userId };
      if (status) {
        whereClause.status = status;
      }

      if (startDate || endDate || activityStatus) {
        whereClause.activity = {};
        if (startDate) whereClause.activity.startDate = { gte: new Date(startDate) };
        if (endDate) whereClause.activity.startDate = { lte: new Date(endDate) };
        if (activityStatus) whereClause.activity.status = activityStatus;
      }

      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          activity: includeActivityDetails ? {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              status: true,
              address: true,
              city: true,
              state: true,
              isOnline: true,
              meetingUrl: true
            }
          } : false
        },
        orderBy: { checkInTime: 'desc' }
      });

      return {
        success: true,
        data: records
      };

    } catch (error) {
      console.error('Erro ao obter registros do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar contador de participantes presentes
   * @param {string} activityId - ID da atividade
   */
  static async updatePresentParticipantsCount(activityId) {
    try {
      const presentCount = await prisma.attendanceRecord.count({
        where: {
          activityId,
          status: { in: ['PRESENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL'] }
        }
      });

      await prisma.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: presentCount
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar contador de participantes presentes:', error);
    }
  }

  /**
   * Obter estatísticas de presença
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getAttendanceStats(activityId) {
    try {
      const [
        totalRecords,
        byStatus,
        presentCount,
        absentCount,
        lateCount,
        earlyLeaveCount,
        excusedCount
      ] = await Promise.all([
        prisma.attendanceRecord.count({
          where: { activityId }
        }),
        prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: { activityId },
          _count: { status: true }
        }),
        prisma.attendanceRecord.count({
          where: { activityId, status: 'PRESENT' }
        }),
        prisma.attendanceRecord.count({
          where: { activityId, status: 'ABSENT' }
        }),
        prisma.attendanceRecord.count({
          where: { activityId, status: 'LATE' }
        }),
        prisma.attendanceRecord.count({
          where: { activityId, status: 'EARLY_LEAVE' }
        }),
        prisma.attendanceRecord.count({
          where: { activityId, status: 'EXCUSED' }
        })
      ]);

      return {
        success: true,
        data: {
          totalRecords,
          presentCount,
          absentCount,
          lateCount,
          earlyLeaveCount,
          excusedCount,
          attendanceRate: totalRecords > 0 
            ? Math.round(((presentCount + lateCount + earlyLeaveCount) / totalRecords) * 100) 
            : 0,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar se usuário pode fazer check-in
   * @param {string} activityId - ID da atividade
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da verificação
   */
  static async canCheckIn(activityId, userId) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            where: { userId }
          }
        }
      });

      if (!activity) {
        return {
          canCheckIn: false,
          reason: 'Atividade não encontrada'
        };
      }

      if (activity.participants.length === 0) {
        return {
          canCheckIn: false,
          reason: 'Você não é participante desta atividade'
        };
      }

      if (activity.status === 'CANCELLED') {
        return {
          canCheckIn: false,
          reason: 'Atividade foi cancelada'
        };
      }

      if (activity.status === 'COMPLETED') {
        return {
          canCheckIn: false,
          reason: 'Atividade já foi concluída'
        };
      }

      // Verificar se já fez check-in
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          activityId_userId: {
            activityId,
            userId
          }
        }
      });

      if (existingRecord && existingRecord.checkInTime) {
        return {
          canCheckIn: false,
          reason: 'Você já fez check-in nesta atividade'
        };
      }

      // Verificar horário
      const now = new Date();
      const activityStart = new Date(activity.startDate);
      const activityEnd = new Date(activity.endDate);
      const checkInStart = new Date(activityStart.getTime() - 30 * 60 * 1000);

      if (now < checkInStart) {
        return {
          canCheckIn: false,
          reason: 'Check-in ainda não está disponível. Disponível 30 minutos antes do início da atividade.'
        };
      }

      if (now > activityEnd) {
        return {
          canCheckIn: false,
          reason: 'Check-in não está mais disponível. A atividade já terminou.'
        };
      }

      return {
        canCheckIn: true,
        reason: 'Check-in disponível'
      };

    } catch (error) {
      console.error('Erro ao verificar se pode fazer check-in:', error);
      return {
        canCheckIn: false,
        reason: 'Erro interno'
      };
    }
  }
}

module.exports = AttendanceCheckInService;
