const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de relatórios de presença
 */
class AttendanceReportService {
  
  /**
   * Gerar relatório de presença
   * @param {string} activityId - ID da atividade
   * @param {string} generatedBy - ID do usuário que está gerando
   * @param {Object} reportData - Dados do relatório
   * @returns {Object} Resultado da operação
   */
  static async generateAttendanceReport(activityId, generatedBy, reportData) {
    try {
      const {
        reportType = 'ACTIVITY_SUMMARY',
        filters = {},
        includeUserDetails = true,
        includeActivityDetails = true
      } = reportData;

      let reportContent;

      switch (reportType) {
        case 'DAILY':
          reportContent = await this.generateDailyReport(activityId, filters, includeUserDetails);
          break;
        case 'WEEKLY':
          reportContent = await this.generateWeeklyReport(activityId, filters, includeUserDetails);
          break;
        case 'MONTHLY':
          reportContent = await this.generateMonthlyReport(activityId, filters, includeUserDetails);
          break;
        case 'ACTIVITY_SUMMARY':
          reportContent = await this.generateActivitySummaryReport(activityId, filters, includeUserDetails, includeActivityDetails);
          break;
        case 'PARTICIPANT_SUMMARY':
          reportContent = await this.generateParticipantSummaryReport(activityId, filters, includeUserDetails);
          break;
        case 'CUSTOM':
          reportContent = await this.generateCustomReport(activityId, filters, includeUserDetails, includeActivityDetails);
          break;
        default:
          return {
            success: false,
            error: 'Tipo de relatório inválido'
          };
      }

      if (!reportContent.success) {
        return reportContent;
      }

      // Salvar relatório
      const report = await prisma.attendanceReport.create({
        data: {
          activityId,
          generatedBy,
          reportType,
          reportData: reportContent.data,
          filters
        }
      });

      return {
        success: true,
        data: {
          report,
          content: reportContent.data
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de presença:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório diário
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @returns {Object} Relatório diário
   */
  static async generateDailyReport(activityId, filters, includeUserDetails) {
    try {
      const { date } = filters;
      const targetDate = date ? new Date(date) : new Date();
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await prisma.attendanceRecord.findMany({
        where: {
          activityId,
          checkInTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);

      return {
        success: true,
        data: {
          reportType: 'DAILY',
          date: targetDate.toISOString().split('T')[0],
          stats,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório diário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório semanal
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @returns {Object} Relatório semanal
   */
  static async generateWeeklyReport(activityId, filters, includeUserDetails) {
    try {
      const { weekStart } = filters;
      const startDate = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const records = await prisma.attendanceRecord.findMany({
        where: {
          activityId,
          checkInTime: {
            gte: startDate,
            lte: endDate
          }
        },
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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);
      const dailyBreakdown = this.groupRecordsByDay(records);

      return {
        success: true,
        data: {
          reportType: 'WEEKLY',
          weekStart: startDate.toISOString().split('T')[0],
          weekEnd: endDate.toISOString().split('T')[0],
          stats,
          dailyBreakdown,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório semanal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório mensal
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @returns {Object} Relatório mensal
   */
  static async generateMonthlyReport(activityId, filters, includeUserDetails) {
    try {
      const { year, month } = filters;
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;
      
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

      const records = await prisma.attendanceRecord.findMany({
        where: {
          activityId,
          checkInTime: {
            gte: startDate,
            lte: endDate
          }
        },
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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);
      const weeklyBreakdown = this.groupRecordsByWeek(records);
      const dailyBreakdown = this.groupRecordsByDay(records);

      return {
        success: true,
        data: {
          reportType: 'MONTHLY',
          year: targetYear,
          month: targetMonth,
          monthName: startDate.toLocaleString('pt-BR', { month: 'long' }),
          stats,
          weeklyBreakdown,
          dailyBreakdown,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório de resumo da atividade
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @param {boolean} includeActivityDetails - Incluir detalhes da atividade
   * @returns {Object} Relatório de resumo da atividade
   */
  static async generateActivitySummaryReport(activityId, filters, includeUserDetails, includeActivityDetails) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
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
          }
        }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);
      const participantStats = this.calculateParticipantStats(records);

      return {
        success: true,
        data: {
          reportType: 'ACTIVITY_SUMMARY',
          activity: includeActivityDetails ? {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            startDate: activity.startDate,
            endDate: activity.endDate,
            status: activity.status,
            address: activity.address,
            city: activity.city,
            state: activity.state,
            isOnline: activity.isOnline,
            meetingUrl: activity.meetingUrl
          } : { id: activity.id, title: activity.title },
          totalParticipants: activity.participants.length,
          stats,
          participantStats,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de resumo da atividade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório de resumo do participante
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @returns {Object} Relatório de resumo do participante
   */
  static async generateParticipantSummaryReport(activityId, filters, includeUserDetails) {
    try {
      const { userId } = filters;

      if (!userId) {
        return {
          success: false,
          error: 'ID do usuário é obrigatório para relatório de participante'
        };
      }

      const records = await prisma.attendanceRecord.findMany({
        where: {
          activityId,
          userId
        },
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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);
      const timeAnalysis = this.analyzeTimePatterns(records);

      return {
        success: true,
        data: {
          reportType: 'PARTICIPANT_SUMMARY',
          userId,
          stats,
          timeAnalysis,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de resumo do participante:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar relatório customizado
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @param {boolean} includeUserDetails - Incluir detalhes do usuário
   * @param {boolean} includeActivityDetails - Incluir detalhes da atividade
   * @returns {Object} Relatório customizado
   */
  static async generateCustomReport(activityId, filters, includeUserDetails, includeActivityDetails) {
    try {
      const {
        startDate,
        endDate,
        status,
        userType,
        groupBy = 'day'
      } = filters;

      const whereClause = { activityId };
      
      if (startDate || endDate) {
        whereClause.checkInTime = {};
        if (startDate) whereClause.checkInTime.gte = new Date(startDate);
        if (endDate) whereClause.checkInTime.lte = new Date(endDate);
      }

      if (status) {
        whereClause.status = status;
      }

      if (userType) {
        whereClause.user = {
          userType
        };
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
        orderBy: { checkInTime: 'asc' }
      });

      const stats = this.calculateAttendanceStats(records);
      let groupedData;

      switch (groupBy) {
        case 'day':
          groupedData = this.groupRecordsByDay(records);
          break;
        case 'week':
          groupedData = this.groupRecordsByWeek(records);
          break;
        case 'month':
          groupedData = this.groupRecordsByMonth(records);
          break;
        case 'user':
          groupedData = this.groupRecordsByUser(records);
          break;
        default:
          groupedData = this.groupRecordsByDay(records);
      }

      return {
        success: true,
        data: {
          reportType: 'CUSTOM',
          filters,
          stats,
          groupedData,
          records
        }
      };

    } catch (error) {
      console.error('Erro ao gerar relatório customizado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calcular estatísticas de presença
   * @param {Array} records - Registros de presença
   * @returns {Object} Estatísticas
   */
  static calculateAttendanceStats(records) {
    const total = records.length;
    const present = records.filter(r => ['PRESENT', 'LATE', 'EARLY_LEAVE', 'PARTIAL'].includes(r.status)).length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const earlyLeave = records.filter(r => r.status === 'EARLY_LEAVE').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;
    const noShow = records.filter(r => r.status === 'NO_SHOW').length;

    return {
      total,
      present,
      absent,
      late,
      earlyLeave,
      excused,
      noShow,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      punctualityRate: present > 0 ? Math.round(((present - late) / present) * 100) : 0
    };
  }

  /**
   * Calcular estatísticas por participante
   * @param {Array} records - Registros de presença
   * @returns {Object} Estatísticas por participante
   */
  static calculateParticipantStats(records) {
    const participantStats = {};
    
    records.forEach(record => {
      const userId = record.userId;
      if (!participantStats[userId]) {
        participantStats[userId] = {
          userId,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          earlyLeave: 0,
          excused: 0,
          noShow: 0
        };
      }
      
      participantStats[userId].total++;
      
      switch (record.status) {
        case 'PRESENT':
        case 'LATE':
        case 'EARLY_LEAVE':
        case 'PARTIAL':
          participantStats[userId].present++;
          if (record.status === 'LATE') participantStats[userId].late++;
          if (record.status === 'EARLY_LEAVE') participantStats[userId].earlyLeave++;
          break;
        case 'ABSENT':
          participantStats[userId].absent++;
          break;
        case 'EXCUSED':
          participantStats[userId].excused++;
          break;
        case 'NO_SHOW':
          participantStats[userId].noShow++;
          break;
      }
    });

    // Calcular taxas
    Object.values(participantStats).forEach(participant => {
      participant.attendanceRate = participant.total > 0 
        ? Math.round((participant.present / participant.total) * 100) 
        : 0;
      participant.punctualityRate = participant.present > 0 
        ? Math.round(((participant.present - participant.late) / participant.present) * 100) 
        : 0;
    });

    return Object.values(participantStats);
  }

  /**
   * Agrupar registros por dia
   * @param {Array} records - Registros de presença
   * @returns {Object} Registros agrupados por dia
   */
  static groupRecordsByDay(records) {
    const grouped = {};
    
    records.forEach(record => {
      const date = new Date(record.checkInTime).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });

    return Object.keys(grouped).map(date => ({
      date,
      records: grouped[date],
      stats: this.calculateAttendanceStats(grouped[date])
    }));
  }

  /**
   * Agrupar registros por semana
   * @param {Array} records - Registros de presença
   * @returns {Object} Registros agrupados por semana
   */
  static groupRecordsByWeek(records) {
    const grouped = {};
    
    records.forEach(record => {
      const date = new Date(record.checkInTime);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(record);
    });

    return Object.keys(grouped).map(weekKey => ({
      weekStart: weekKey,
      records: grouped[weekKey],
      stats: this.calculateAttendanceStats(grouped[weekKey])
    }));
  }

  /**
   * Agrupar registros por mês
   * @param {Array} records - Registros de presença
   * @returns {Object} Registros agrupados por mês
   */
  static groupRecordsByMonth(records) {
    const grouped = {};
    
    records.forEach(record => {
      const date = new Date(record.checkInTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(record);
    });

    return Object.keys(grouped).map(monthKey => ({
      month: monthKey,
      records: grouped[monthKey],
      stats: this.calculateAttendanceStats(grouped[monthKey])
    }));
  }

  /**
   * Agrupar registros por usuário
   * @param {Array} records - Registros de presença
   * @returns {Object} Registros agrupados por usuário
   */
  static groupRecordsByUser(records) {
    const grouped = {};
    
    records.forEach(record => {
      const userId = record.userId;
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(record);
    });

    return Object.keys(grouped).map(userId => ({
      userId,
      records: grouped[userId],
      stats: this.calculateAttendanceStats(grouped[userId])
    }));
  }

  /**
   * Analisar padrões de tempo
   * @param {Array} records - Registros de presença
   * @returns {Object} Análise de padrões de tempo
   */
  static analyzeTimePatterns(records) {
    const checkInTimes = records
      .filter(r => r.checkInTime)
      .map(r => new Date(r.checkInTime).getHours());
    
    const checkOutTimes = records
      .filter(r => r.checkOutTime)
      .map(r => new Date(r.checkOutTime).getHours());

    const averageCheckIn = checkInTimes.length > 0 
      ? Math.round(checkInTimes.reduce((sum, time) => sum + time, 0) / checkInTimes.length) 
      : 0;
    
    const averageCheckOut = checkOutTimes.length > 0 
      ? Math.round(checkOutTimes.reduce((sum, time) => sum + time, 0) / checkOutTimes.length) 
      : 0;

    return {
      averageCheckIn,
      averageCheckOut,
      totalCheckIns: checkInTimes.length,
      totalCheckOuts: checkOutTimes.length
    };
  }

  /**
   * Obter início da semana
   * @param {Date} date - Data
   * @returns {Date} Início da semana
   */
  static getWeekStart(date) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * Obter relatórios salvos
   * @param {string} activityId - ID da atividade
   * @param {Object} filters - Filtros
   * @returns {Object} Relatórios salvos
   */
  static async getSavedReports(activityId, filters = {}) {
    try {
      const {
        reportType,
        limit = 10,
        offset = 0
      } = filters;

      const whereClause = { activityId };
      if (reportType) {
        whereClause.reportType = reportType;
      }

      const reports = await prisma.attendanceReport.findMany({
        where: whereClause,
        include: {
          generatedByUser: {
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
        },
        orderBy: { generatedAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: reports
      };

    } catch (error) {
      console.error('Erro ao obter relatórios salvos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter relatório específico
   * @param {string} reportId - ID do relatório
   * @returns {Object} Relatório
   */
  static async getReport(reportId) {
    try {
      const report = await prisma.attendanceReport.findUnique({
        where: { id: reportId },
        include: {
          generatedByUser: {
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

      if (!report) {
        return {
          success: false,
          error: 'Relatório não encontrado'
        };
      }

      return {
        success: true,
        data: report
      };

    } catch (error) {
      console.error('Erro ao obter relatório:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Excluir relatório
   * @param {string} reportId - ID do relatório
   * @param {string} deletedBy - ID do usuário que está excluindo
   * @returns {Object} Resultado da operação
   */
  static async deleteReport(reportId, deletedBy) {
    try {
      const report = await prisma.attendanceReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return {
          success: false,
          error: 'Relatório não encontrado'
        };
      }

      // Verificar se o usuário pode excluir o relatório
      if (report.generatedBy !== deletedBy) {
        return {
          success: false,
          error: 'Você não tem permissão para excluir este relatório'
        };
      }

      await prisma.attendanceReport.delete({
        where: { id: reportId }
      });

      return {
        success: true,
        data: {
          deletedAt: new Date(),
          deletedBy
        }
      };

    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AttendanceReportService;
