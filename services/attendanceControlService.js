const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de controle de frequência
 */
class AttendanceControlService {
  
  /**
   * Obter frequência do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Frequência do usuário
   */
  static async getUserAttendanceFrequency(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        activityStatus = 'COMPLETED',
        includeActivityDetails = false
      } = filters;

      const whereClause = {
        userId,
        activity: {
          status: activityStatus
        }
      };

      if (startDate || endDate) {
        whereClause.activity.startDate = {};
        if (startDate) whereClause.activity.startDate.gte = new Date(startDate);
        if (endDate) whereClause.activity.startDate.lte = new Date(endDate);
      }

      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          activity: includeActivityDetails ? {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true
            }
          } : false
        },
        orderBy: { checkInTime: 'desc' }
      });

      // Calcular estatísticas
      const totalActivities = records.length;
      const presentCount = records.filter(r => ['PRESENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL'].includes(r.status)).length;
      const absentCount = records.filter(r => r.status === 'ABSENT').length;
      const lateCount = records.filter(r => r.status === 'LATE').length;
      const earlyLeaveCount = records.filter(r => r.status === 'EARLY_LEAVE').length;
      const excusedCount = records.filter(r => r.status === 'EXCUSED').length;
      const noShowCount = records.filter(r => r.status === 'NO_SHOW').length;

      const attendanceRate = totalActivities > 0 ? Math.round((presentCount / totalActivities) * 100) : 0;
      const punctualityRate = presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 100) : 0;

      return {
        success: true,
        data: {
          totalActivities,
          presentCount,
          absentCount,
          lateCount,
          earlyLeaveCount,
          excusedCount,
          noShowCount,
          attendanceRate,
          punctualityRate,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao obter frequência do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter frequência da atividade
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @returns {Object} Frequência da atividade
   */
  static async getActivityAttendanceFrequency(activityId, filters = {}) {
    try {
      const {
        includeUserDetails = false
      } = filters;

      const records = await prisma.attendanceRecord.findMany({
        where: { activityId },
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

      // Calcular estatísticas
      const totalParticipants = records.length;
      const presentCount = records.filter(r => ['PRESENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL'].includes(r.status)).length;
      const absentCount = records.filter(r => r.status === 'ABSENT').length;
      const lateCount = records.filter(r => r.status === 'LATE').length;
      const earlyLeaveCount = records.filter(r => r.status === 'EARLY_LEAVE').length;
      const excusedCount = records.filter(r => r.status === 'EXCUSED').length;
      const noShowCount = records.filter(r => r.status === 'NO_SHOW').length;

      const attendanceRate = totalParticipants > 0 ? Math.round((presentCount / totalParticipants) * 100) : 0;
      const punctualityRate = presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 100) : 0;

      return {
        success: true,
        data: {
          totalParticipants,
          presentCount,
          absentCount,
          lateCount,
          earlyLeaveCount,
          excusedCount,
          noShowCount,
          attendanceRate,
          punctualityRate,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao obter frequência da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter frequência por período
   * @param {string} userId - ID do usuário (opcional)
   * @param {Object} filters - Filtros
   * @returns {Object} Frequência por período
   */
  static async getAttendanceFrequencyByPeriod(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        groupBy = 'day', // day, week, month
        activityStatus = 'COMPLETED'
      } = filters;

      const whereClause = {
        activity: {
          status: activityStatus
        }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      if (startDate || endDate) {
        whereClause.activity.startDate = {};
        if (startDate) whereClause.activity.startDate.gte = new Date(startDate);
        if (endDate) whereClause.activity.startDate.lte = new Date(endDate);
      }

      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          activity: {
            select: {
              startDate: true
            }
          }
        },
        orderBy: { checkInTime: 'asc' }
      });

      // Agrupar por período
      const groupedData = {};
      
      records.forEach(record => {
        const date = new Date(record.activity.startDate);
        let periodKey;

        switch (groupBy) {
          case 'day':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            periodKey = date.toISOString().split('T')[0];
        }

        if (!groupedData[periodKey]) {
          groupedData[periodKey] = {
            period: periodKey,
            totalActivities: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            earlyLeaveCount: 0,
            excusedCount: 0,
            noShowCount: 0
          };
        }

        groupedData[periodKey].totalActivities++;
        
        switch (record.status) {
          case 'PRESENT':
          case 'LATE':
          case 'EARLY_LEAVE':
          case 'PARTIAL':
            groupedData[periodKey].presentCount++;
            if (record.status === 'LATE') {
              groupedData[periodKey].lateCount++;
            }
            if (record.status === 'EARLY_LEAVE') {
              groupedData[periodKey].earlyLeaveCount++;
            }
            break;
          case 'ABSENT':
            groupedData[periodKey].absentCount++;
            break;
          case 'EXCUSED':
            groupedData[periodKey].excusedCount++;
            break;
          case 'NO_SHOW':
            groupedData[periodKey].noShowCount++;
            break;
        }
      });

      // Calcular taxas para cada período
      Object.values(groupedData).forEach(period => {
        period.attendanceRate = period.totalActivities > 0 
          ? Math.round((period.presentCount / period.totalActivities) * 100) 
          : 0;
        period.punctualityRate = period.presentCount > 0 
          ? Math.round(((period.presentCount - period.lateCount) / period.presentCount) * 100) 
          : 0;
      });

      return {
        success: true,
        data: Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period))
      };

    } catch (error) {
      console.error('Erro ao obter frequência por período:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter ranking de frequência
   * @param {Object} filters - Filtros
   * @returns {Object} Ranking de frequência
   */
  static async getAttendanceRanking(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        activityStatus = 'COMPLETED',
        limit = 10,
        includeUserDetails = true
      } = filters;

      const whereClause = {
        activity: {
          status: activityStatus
        }
      };

      if (startDate || endDate) {
        whereClause.activity.startDate = {};
        if (startDate) whereClause.activity.startDate.gte = new Date(startDate);
        if (endDate) whereClause.activity.startDate.lte = new Date(endDate);
      }

      // Obter todos os registros
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
        }
      });

      // Agrupar por usuário e calcular estatísticas
      const userStats = {};
      
      records.forEach(record => {
        const userId = record.userId;
        
        if (!userStats[userId]) {
          userStats[userId] = {
            userId,
            user: record.user,
            totalActivities: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            earlyLeaveCount: 0,
            excusedCount: 0,
            noShowCount: 0
          };
        }

        userStats[userId].totalActivities++;
        
        switch (record.status) {
          case 'PRESENT':
          case 'LATE':
          case 'EARLY_LEAVE':
          case 'PARTIAL':
            userStats[userId].presentCount++;
            if (record.status === 'LATE') {
              userStats[userId].lateCount++;
            }
            if (record.status === 'EARLY_LEAVE') {
              userStats[userId].earlyLeaveCount++;
            }
            break;
          case 'ABSENT':
            userStats[userId].absentCount++;
            break;
          case 'EXCUSED':
            userStats[userId].excusedCount++;
            break;
          case 'NO_SHOW':
            userStats[userId].noShowCount++;
            break;
        }
      });

      // Calcular taxas e ordenar
      const ranking = Object.values(userStats)
        .map(user => ({
          ...user,
          attendanceRate: user.totalActivities > 0 
            ? Math.round((user.presentCount / user.totalActivities) * 100) 
            : 0,
          punctualityRate: user.presentCount > 0 
            ? Math.round(((user.presentCount - user.lateCount) / user.presentCount) * 100) 
            : 0
        }))
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, limit);

      return {
        success: true,
        data: ranking
      };

    } catch (error) {
      console.error('Erro ao obter ranking de frequência:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas gerais de frequência
   * @param {Object} filters - Filtros
   * @returns {Object} Estatísticas gerais
   */
  static async getGeneralAttendanceStats(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        activityStatus = 'COMPLETED'
      } = filters;

      const whereClause = {
        activity: {
          status: activityStatus
        }
      };

      if (startDate || endDate) {
        whereClause.activity.startDate = {};
        if (startDate) whereClause.activity.startDate.gte = new Date(startDate);
        if (endDate) whereClause.activity.startDate.lte = new Date(endDate);
      }

      const [
        totalRecords,
        byStatus,
        byUserType,
        byActivityType,
        averageAttendanceRate
      ] = await Promise.all([
        prisma.attendanceRecord.count({
          where: whereClause
        }),
        prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true }
        }),
        prisma.attendanceRecord.groupBy({
          by: ['user'],
          where: whereClause,
          _count: { user: true }
        }),
        prisma.attendanceRecord.groupBy({
          by: ['activity'],
          where: whereClause,
          _count: { activity: true }
        }),
        this.calculateAverageAttendanceRate(whereClause)
      ]);

      return {
        success: true,
        data: {
          totalRecords,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          averageAttendanceRate,
          totalUsers: byUserType.length,
          totalActivities: byActivityType.length
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas gerais:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calcular taxa média de frequência
   * @param {Object} whereClause - Condições de busca
   * @returns {number} Taxa média
   */
  static async calculateAverageAttendanceRate(whereClause) {
    try {
      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        select: {
          userId: true,
          status: true
        }
      });

      // Agrupar por usuário
      const userStats = {};
      records.forEach(record => {
        if (!userStats[record.userId]) {
          userStats[record.userId] = {
            total: 0,
            present: 0
          };
        }
        
        userStats[record.userId].total++;
        if (['PRESENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL'].includes(record.status)) {
          userStats[record.userId].present++;
        }
      });

      // Calcular taxa média
      const rates = Object.values(userStats).map(user => 
        user.total > 0 ? (user.present / user.total) * 100 : 0
      );

      return rates.length > 0 
        ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) 
        : 0;

    } catch (error) {
      console.error('Erro ao calcular taxa média de frequência:', error);
      return 0;
    }
  }

  /**
   * Obter alertas de frequência
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Alertas de frequência
   */
  static async getAttendanceAlerts(userId, filters = {}) {
    try {
      const {
        days = 30,
        minAttendanceRate = 70
      } = filters;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const frequency = await this.getUserAttendanceFrequency(userId, {
        startDate,
        endDate,
        activityStatus: 'COMPLETED'
      });

      if (!frequency.success) {
        return frequency;
      }

      const alerts = [];

      // Alerta de baixa frequência
      if (frequency.data.attendanceRate < minAttendanceRate) {
        alerts.push({
          type: 'LOW_ATTENDANCE',
          severity: 'WARNING',
          message: `Sua frequência está em ${frequency.data.attendanceRate}%. Considere participar de mais atividades.`,
          data: {
            currentRate: frequency.data.attendanceRate,
            minRate: minAttendanceRate
          }
        });
      }

      // Alerta de atrasos frequentes
      if (frequency.data.lateCount > 0 && frequency.data.presentCount > 0) {
        const lateRate = Math.round((frequency.data.lateCount / frequency.data.presentCount) * 100);
        if (lateRate > 30) {
          alerts.push({
            type: 'FREQUENT_LATE',
            severity: 'INFO',
            message: `Você chegou atrasado em ${lateRate}% das atividades. Tente chegar no horário.`,
            data: {
              lateRate,
              lateCount: frequency.data.lateCount
            }
          });
        }
      }

      // Alerta de saídas antecipadas
      if (frequency.data.earlyLeaveCount > 0 && frequency.data.presentCount > 0) {
        const earlyLeaveRate = Math.round((frequency.data.earlyLeaveCount / frequency.data.presentCount) * 100);
        if (earlyLeaveRate > 20) {
          alerts.push({
            type: 'FREQUENT_EARLY_LEAVE',
            severity: 'INFO',
            message: `Você saiu antes do horário em ${earlyLeaveRate}% das atividades.`,
            data: {
              earlyLeaveRate,
              earlyLeaveCount: frequency.data.earlyLeaveCount
            }
          });
        }
      }

      return {
        success: true,
        data: {
          alerts,
          frequency: frequency.data
        }
      };

    } catch (error) {
      console.error('Erro ao obter alertas de frequência:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AttendanceControlService;
