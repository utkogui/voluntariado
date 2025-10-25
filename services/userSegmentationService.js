const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de segmentação de usuários
 */
class UserSegmentationService {
  
  /**
   * Obter usuários por segmentação
   * @param {Object} filters - Filtros de segmentação
   * @param {Object} options - Opções de busca
   * @returns {Object} Usuários segmentados
   */
  static async getSegmentedUsers(filters, options = {}) {
    try {
      const {
        includeDetails = true,
        limit = 1000,
        offset = 0
      } = options;

      const whereClause = this.buildWhereClause(filters);
      const orderBy = this.buildOrderBy(filters);

      const users = await prisma.user.findMany({
        where: whereClause,
        include: {
          volunteer: includeDetails ? {
            select: {
              firstName: true,
              lastName: true,
              city: true,
              state: true,
              skills: true,
              interests: true,
              availability: true,
              experienceLevel: true
            }
          } : false,
          institution: includeDetails ? {
            select: {
              name: true,
              city: true,
              state: true,
              type: true
            }
          } : false,
          company: includeDetails ? {
            select: {
              name: true,
              city: true,
              state: true,
              industry: true
            }
          } : false,
          university: includeDetails ? {
            select: {
              name: true,
              city: true,
              state: true,
              type: true
            }
          } : false
        },
        orderBy,
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.user.count({
        where: whereClause
      });

      return {
        success: true,
        data: {
          users,
          totalCount,
          hasMore: offset + users.length < totalCount
        }
      };

    } catch (error) {
      console.error('Erro ao obter usuários segmentados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Construir cláusula WHERE baseada nos filtros
   * @param {Object} filters - Filtros de segmentação
   * @returns {Object} Cláusula WHERE
   */
  static buildWhereClause(filters) {
    const whereClause = {};

    // Filtro por tipo de usuário
    if (filters.userType) {
      whereClause.userType = filters.userType;
    }

    // Filtro por localização
    if (filters.city || filters.state || filters.country) {
      whereClause.OR = [
        {
          volunteer: {
            ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
            ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
            ...(filters.country && { country: { contains: filters.country, mode: 'insensitive' } })
          }
        },
        {
          institution: {
            ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
            ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
            ...(filters.country && { country: { contains: filters.country, mode: 'insensitive' } })
          }
        },
        {
          company: {
            ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
            ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
            ...(filters.country && { country: { contains: filters.country, mode: 'insensitive' } })
          }
        },
        {
          university: {
            ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
            ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
            ...(filters.country && { country: { contains: filters.country, mode: 'insensitive' } })
          }
        }
      ];
    }

    // Filtro por habilidades
    if (filters.skills && filters.skills.length > 0) {
      whereClause.volunteer = {
        ...whereClause.volunteer,
        skills: {
          hasSome: filters.skills
        }
      };
    }

    // Filtro por interesses
    if (filters.interests && filters.interests.length > 0) {
      whereClause.volunteer = {
        ...whereClause.volunteer,
        interests: {
          hasSome: filters.interests
        }
      };
    }

    // Filtro por nível de experiência
    if (filters.experienceLevel) {
      whereClause.volunteer = {
        ...whereClause.volunteer,
        experienceLevel: filters.experienceLevel
      };
    }

    // Filtro por disponibilidade
    if (filters.availability) {
      whereClause.volunteer = {
        ...whereClause.volunteer,
        availability: {
          hasSome: filters.availability
        }
      };
    }

    // Filtro por tipo de instituição
    if (filters.institutionType) {
      whereClause.institution = {
        ...whereClause.institution,
        type: filters.institutionType
      };
    }

    // Filtro por indústria da empresa
    if (filters.industry) {
      whereClause.company = {
        ...whereClause.company,
        industry: filters.industry
      };
    }

    // Filtro por tipo de universidade
    if (filters.universityType) {
      whereClause.university = {
        ...whereClause.university,
        type: filters.universityType
      };
    }

    // Filtro por data de criação
    if (filters.createdAfter) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(filters.createdAfter)
      };
    }

    if (filters.createdBefore) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(filters.createdBefore)
      };
    }

    // Filtro por última atividade
    if (filters.lastActiveAfter) {
      whereClause.updatedAt = {
        ...whereClause.updatedAt,
        gte: new Date(filters.lastActiveAfter)
      };
    }

    if (filters.lastActiveBefore) {
      whereClause.updatedAt = {
        ...whereClause.updatedAt,
        lte: new Date(filters.lastActiveBefore)
      };
    }

    // Filtro por participação em atividades
    if (filters.hasParticipatedInActivities !== undefined) {
      if (filters.hasParticipatedInActivities) {
        whereClause.activityParticipants = {
          some: {}
        };
      } else {
        whereClause.activityParticipants = {
          none: {}
        };
      }
    }

    // Filtro por número mínimo de atividades
    if (filters.minActivities) {
      whereClause.activityParticipants = {
        some: {},
        _count: {
          gte: filters.minActivities
        }
      };
    }

    // Filtro por número máximo de atividades
    if (filters.maxActivities) {
      whereClause.activityParticipants = {
        some: {},
        _count: {
          lte: filters.maxActivities
        }
      };
    }

    // Filtro por status de confirmação
    if (filters.confirmationStatus) {
      whereClause.activityConfirmations = {
        some: {
          status: filters.confirmationStatus
        }
      };
    }

    // Filtro por status de presença
    if (filters.attendanceStatus) {
      whereClause.attendanceRecords = {
        some: {
          status: filters.attendanceStatus
        }
      };
    }

    // Filtro por taxa de frequência
    if (filters.minAttendanceRate !== undefined) {
      // Implementar lógica de taxa de frequência
      // Por enquanto, usar filtro simples
    }

    // Filtro por grupos de mensagens
    if (filters.messageGroups && filters.messageGroups.length > 0) {
      whereClause.messageGroupMembers = {
        some: {
          groupId: { in: filters.messageGroups }
        }
      };
    }

    // Filtro por campanhas de mensagem
    if (filters.messageCampaigns && filters.messageCampaigns.length > 0) {
      whereClause.massMessages = {
        some: {
          campaignId: { in: filters.messageCampaigns }
        }
      };
    }

    // Filtro por preferências de notificação
    if (filters.notificationPreferences) {
      whereClause.notificationPreferences = {
        ...filters.notificationPreferences
      };
    }

    return whereClause;
  }

  /**
   * Construir cláusula ORDER BY baseada nos filtros
   * @param {Object} filters - Filtros de segmentação
   * @returns {Object} Cláusula ORDER BY
   */
  static buildOrderBy(filters) {
    if (filters.orderBy) {
      switch (filters.orderBy) {
        case 'name':
          return { volunteer: { firstName: 'asc' } };
        case 'email':
          return { email: 'asc' };
        case 'createdAt':
          return { createdAt: 'desc' };
        case 'lastActive':
          return { updatedAt: 'desc' };
        case 'activityCount':
          return { activityParticipants: { _count: 'desc' } };
        default:
          return { createdAt: 'desc' };
      }
    }
    return { createdAt: 'desc' };
  }

  /**
   * Obter estatísticas de segmentação
   * @param {Object} filters - Filtros de segmentação
   * @returns {Object} Estatísticas de segmentação
   */
  static async getSegmentationStats(filters) {
    try {
      const whereClause = this.buildWhereClause(filters);

      const [
        totalUsers,
        byUserType,
        byLocation,
        byExperienceLevel,
        byInstitutionType,
        byIndustry,
        byUniversityType,
        bySkills,
        byInterests,
        byAvailability
      ] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.groupBy({
          by: ['userType'],
          where: whereClause,
          _count: { userType: true }
        }),
        this.getLocationStats(whereClause),
        this.getExperienceLevelStats(whereClause),
        this.getInstitutionTypeStats(whereClause),
        this.getIndustryStats(whereClause),
        this.getUniversityTypeStats(whereClause),
        this.getSkillsStats(whereClause),
        this.getInterestsStats(whereClause),
        this.getAvailabilityStats(whereClause)
      ]);

      return {
        success: true,
        data: {
          totalUsers,
          byUserType: byUserType.map(item => ({
            userType: item.userType,
            count: item._count.userType
          })),
          byLocation,
          byExperienceLevel,
          byInstitutionType,
          byIndustry,
          byUniversityType,
          bySkills,
          byInterests,
          byAvailability
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de segmentação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de localização
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de localização
   */
  static async getLocationStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          volunteer: { select: { city: true, state: true } },
          institution: { select: { city: true, state: true } },
          company: { select: { city: true, state: true } },
          university: { select: { city: true, state: true } }
        }
      });

      const locationStats = {};
      
      users.forEach(user => {
        const location = user.volunteer || user.institution || user.company || user.university;
        if (location && location.city && location.state) {
          const key = `${location.city}, ${location.state}`;
          locationStats[key] = (locationStats[key] || 0) + 1;
        }
      });

      return Object.entries(locationStats)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    } catch (error) {
      console.error('Erro ao obter estatísticas de localização:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de nível de experiência
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de nível de experiência
   */
  static async getExperienceLevelStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          volunteer: { isNot: null }
        },
        select: {
          volunteer: { select: { experienceLevel: true } }
        }
      });

      const experienceStats = {};
      
      users.forEach(user => {
        if (user.volunteer && user.volunteer.experienceLevel) {
          const level = user.volunteer.experienceLevel;
          experienceStats[level] = (experienceStats[level] || 0) + 1;
        }
      });

      return Object.entries(experienceStats)
        .map(([level, count]) => ({ level, count }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Erro ao obter estatísticas de nível de experiência:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de tipo de instituição
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de tipo de instituição
   */
  static async getInstitutionTypeStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          institution: { isNot: null }
        },
        select: {
          institution: { select: { type: true } }
        }
      });

      const institutionStats = {};
      
      users.forEach(user => {
        if (user.institution && user.institution.type) {
          const type = user.institution.type;
          institutionStats[type] = (institutionStats[type] || 0) + 1;
        }
      });

      return Object.entries(institutionStats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Erro ao obter estatísticas de tipo de instituição:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de indústria
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de indústria
   */
  static async getIndustryStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          company: { isNot: null }
        },
        select: {
          company: { select: { industry: true } }
        }
      });

      const industryStats = {};
      
      users.forEach(user => {
        if (user.company && user.company.industry) {
          const industry = user.company.industry;
          industryStats[industry] = (industryStats[industry] || 0) + 1;
        }
      });

      return Object.entries(industryStats)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Erro ao obter estatísticas de indústria:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de tipo de universidade
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de tipo de universidade
   */
  static async getUniversityTypeStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          university: { isNot: null }
        },
        select: {
          university: { select: { type: true } }
        }
      });

      const universityStats = {};
      
      users.forEach(user => {
        if (user.university && user.university.type) {
          const type = user.university.type;
          universityStats[type] = (universityStats[type] || 0) + 1;
        }
      });

      return Object.entries(universityStats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Erro ao obter estatísticas de tipo de universidade:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de habilidades
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de habilidades
   */
  static async getSkillsStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          volunteer: { isNot: null }
        },
        select: {
          volunteer: { select: { skills: true } }
        }
      });

      const skillsStats = {};
      
      users.forEach(user => {
        if (user.volunteer && user.volunteer.skills) {
          user.volunteer.skills.forEach(skill => {
            skillsStats[skill] = (skillsStats[skill] || 0) + 1;
          });
        }
      });

      return Object.entries(skillsStats)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    } catch (error) {
      console.error('Erro ao obter estatísticas de habilidades:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de interesses
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de interesses
   */
  static async getInterestsStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          volunteer: { isNot: null }
        },
        select: {
          volunteer: { select: { interests: true } }
        }
      });

      const interestsStats = {};
      
      users.forEach(user => {
        if (user.volunteer && user.volunteer.interests) {
          user.volunteer.interests.forEach(interest => {
            interestsStats[interest] = (interestsStats[interest] || 0) + 1;
          });
        }
      });

      return Object.entries(interestsStats)
        .map(([interest, count]) => ({ interest, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    } catch (error) {
      console.error('Erro ao obter estatísticas de interesses:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de disponibilidade
   * @param {Object} whereClause - Cláusula WHERE
   * @returns {Array} Estatísticas de disponibilidade
   */
  static async getAvailabilityStats(whereClause) {
    try {
      const users = await prisma.user.findMany({
        where: {
          ...whereClause,
          volunteer: { isNot: null }
        },
        select: {
          volunteer: { select: { availability: true } }
        }
      });

      const availabilityStats = {};
      
      users.forEach(user => {
        if (user.volunteer && user.volunteer.availability) {
          user.volunteer.availability.forEach(availability => {
            availabilityStats[availability] = (availabilityStats[availability] || 0) + 1;
          });
        }
      });

      return Object.entries(availabilityStats)
        .map(([availability, count]) => ({ availability, count }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Erro ao obter estatísticas de disponibilidade:', error);
      return [];
    }
  }

  /**
   * Salvar segmento personalizado
   * @param {string} userId - ID do usuário
   * @param {Object} segmentData - Dados do segmento
   * @returns {Object} Resultado da operação
   */
  static async saveCustomSegment(userId, segmentData) {
    try {
      const {
        name,
        description,
        filters,
        isPublic = false
      } = segmentData;

      // Verificar se já existe um segmento com o mesmo nome
      const existingSegment = await prisma.messageGroup.findFirst({
        where: {
          name,
          createdBy: userId,
          type: 'SEGMENTED'
        }
      });

      if (existingSegment) {
        return {
          success: false,
          error: 'Já existe um segmento com este nome'
        };
      }

      // Criar segmento
      const segment = await prisma.messageGroup.create({
        data: {
          name,
          description,
          type: 'SEGMENTED',
          createdBy: userId,
          settings: {
            filters,
            isPublic
          }
        }
      });

      return {
        success: true,
        data: segment
      };

    } catch (error) {
      console.error('Erro ao salvar segmento personalizado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter segmentos personalizados
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros
   * @returns {Object} Segmentos personalizados
   */
  static async getCustomSegments(userId, filters = {}) {
    try {
      const {
        isPublic,
        limit = 20,
        offset = 0
      } = filters;

      const whereClause = {
        type: 'SEGMENTED',
        OR: [
          { createdBy: userId },
          { settings: { path: ['isPublic'], equals: true } }
        ]
      };

      if (isPublic !== undefined) {
        whereClause.settings = {
          path: ['isPublic'],
          equals: isPublic
        };
      }

      const segments = await prisma.messageGroup.findMany({
        where: whereClause,
        include: {
          createdByUser: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: segments
      };

    } catch (error) {
      console.error('Erro ao obter segmentos personalizados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = UserSegmentationService;
