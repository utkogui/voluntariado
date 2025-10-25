const { PrismaClient } = require('@prisma/client');
const matchingService = require('./matchingService');

const prisma = new PrismaClient();

/**
 * Serviço para matching híbrido (presencial + online)
 */
class HybridMatchingService {
  
  /**
   * Encontrar matches híbridos para um voluntário
   * @param {string} volunteerId - ID do voluntário
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Resultado do matching híbrido
   */
  static async findHybridMatches(volunteerId, filters = {}) {
    try {
      // Buscar matches para voluntariado presencial
      const presentialMatches = await matchingService.findMatches(volunteerId, {
        ...filters,
        volunteerType: 'PRESENTIAL'
      });

      // Buscar matches para voluntariado online
      const onlineMatches = await matchingService.findMatches(volunteerId, {
        ...filters,
        volunteerType: 'ONLINE'
      });

      // Buscar matches híbridos
      const hybridMatches = await matchingService.findMatches(volunteerId, {
        ...filters,
        volunteerType: 'HYBRID'
      });

      // Combinar e analisar matches
      const combinedMatches = this.combineMatches(
        presentialMatches,
        onlineMatches,
        hybridMatches
      );

      return {
        success: true,
        data: combinedMatches,
        summary: {
          presential: presentialMatches.data?.length || 0,
          online: onlineMatches.data?.length || 0,
          hybrid: hybridMatches.data?.length || 0,
          total: combinedMatches.length
        }
      };

    } catch (error) {
      console.error('Erro ao buscar matches híbridos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Combinar matches de diferentes tipos
   * @param {Object} presentialMatches - Matches presenciais
   * @param {Object} onlineMatches - Matches online
   * @param {Object} hybridMatches - Matches híbridos
   * @returns {Array} Matches combinados
   */
  static combineMatches(presentialMatches, onlineMatches, hybridMatches) {
    const allMatches = [];

    // Adicionar matches presenciais
    if (presentialMatches.success && presentialMatches.data) {
      presentialMatches.data.forEach(match => {
        allMatches.push({
          ...match,
          matchType: 'PRESENTIAL',
          typeScore: match.scores.volunteerType || 0
        });
      });
    }

    // Adicionar matches online
    if (onlineMatches.success && onlineMatches.data) {
      onlineMatches.data.forEach(match => {
        allMatches.push({
          ...match,
          matchType: 'ONLINE',
          typeScore: match.scores.volunteerType || 0
        });
      });
    }

    // Adicionar matches híbridos
    if (hybridMatches.success && hybridMatches.data) {
      hybridMatches.data.forEach(match => {
        allMatches.push({
          ...match,
          matchType: 'HYBRID',
          typeScore: match.scores.volunteerType || 0
        });
      });
    }

    // Ordenar por pontuação total
    allMatches.sort((a, b) => b.scores.total - a.scores.total);

    return allMatches;
  }

  /**
   * Encontrar matches híbridos para uma oportunidade
   * @param {string} opportunityId - ID da oportunidade
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Resultado do matching híbrido
   */
  static async findHybridVolunteersForOpportunity(opportunityId, filters = {}) {
    try {
      // Buscar voluntários para a oportunidade
      const volunteers = await matchingService.findVolunteersForOpportunity(opportunityId, filters);

      if (!volunteers.success) {
        return volunteers;
      }

      // Analisar compatibilidade híbrida
      const hybridAnalysis = this.analyzeHybridCompatibility(volunteers.data);

      return {
        success: true,
        data: volunteers.data,
        hybridAnalysis,
        summary: {
          total: volunteers.data.length,
          presentialCompatible: hybridAnalysis.presentialCompatible,
          onlineCompatible: hybridAnalysis.onlineCompatible,
          hybridCompatible: hybridAnalysis.hybridCompatible
        }
      };

    } catch (error) {
      console.error('Erro ao buscar voluntários híbridos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analisar compatibilidade híbrida
   * @param {Array} volunteers - Lista de voluntários
   * @returns {Object} Análise de compatibilidade
   */
  static analyzeHybridCompatibility(volunteers) {
    const analysis = {
      presentialCompatible: 0,
      onlineCompatible: 0,
      hybridCompatible: 0,
      total: volunteers.length
    };

    volunteers.forEach(volunteer => {
      const volunteerTypeScore = volunteer.scores.volunteerType || 0;
      
      if (volunteerTypeScore >= 90) {
        analysis.hybridCompatible++;
      } else if (volunteerTypeScore >= 70) {
        analysis.presentialCompatible++;
        analysis.onlineCompatible++;
      } else if (volunteerTypeScore >= 50) {
        analysis.presentialCompatible++;
      }
    });

    return analysis;
  }

  /**
   * Obter estatísticas de matching por tipo
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Estatísticas de matching
   */
  static async getMatchingStatsByType(filters = {}) {
    try {
      const [
        presentialStats,
        onlineStats,
        hybridStats,
        totalStats
      ] = await Promise.all([
        this.getStatsByType('PRESENTIAL', filters),
        this.getStatsByType('ONLINE', filters),
        this.getStatsByType('HYBRID', filters),
        matchingService.getMatchingStats()
      ]);

      return {
        success: true,
        data: {
          presential: presentialStats,
          online: onlineStats,
          hybrid: hybridStats,
          total: totalStats.data
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de matching:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas por tipo de voluntariado
   * @param {string} type - Tipo de voluntariado
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Estatísticas do tipo
   */
  static async getStatsByType(type, filters = {}) {
    try {
      // Implementar lógica específica para cada tipo
      // Por enquanto, retornar dados de demonstração
      const stats = {
        type,
        totalMatches: Math.floor(Math.random() * 100),
        averageScore: Math.floor(Math.random() * 100),
        topSkills: [],
        topCategories: [],
        geographicDistribution: {}
      };

      return stats;

    } catch (error) {
      console.error(`Erro ao obter estatísticas para ${type}:`, error);
      return {
        type,
        error: error.message
      };
    }
  }

  /**
   * Encontrar matches por preferência de localização
   * @param {string} volunteerId - ID do voluntário
   * @param {Object} locationPreferences - Preferências de localização
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Resultado do matching
   */
  static async findMatchesByLocationPreference(volunteerId, locationPreferences, filters = {}) {
    try {
      const {
        maxDistance = 50,
        preferredCities = [],
        preferredStates = [],
        allowRemote = true
      } = locationPreferences;

      // Buscar matches com filtros de localização
      const matches = await matchingService.findMatches(volunteerId, {
        ...filters,
        maxDistance,
        preferredCities,
        preferredStates,
        allowRemote
      });

      if (!matches.success) {
        return matches;
      }

      // Analisar compatibilidade de localização
      const locationAnalysis = this.analyzeLocationCompatibility(matches.data, locationPreferences);

      return {
        success: true,
        data: matches.data,
        locationAnalysis,
        summary: {
          total: matches.data.length,
          nearby: locationAnalysis.nearby,
          remote: locationAnalysis.remote,
          preferred: locationAnalysis.preferred
        }
      };

    } catch (error) {
      console.error('Erro ao buscar matches por localização:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analisar compatibilidade de localização
   * @param {Array} matches - Lista de matches
   * @param {Object} preferences - Preferências de localização
   * @returns {Object} Análise de localização
   */
  static analyzeLocationCompatibility(matches, preferences) {
    const analysis = {
      nearby: 0,
      remote: 0,
      preferred: 0,
      total: matches.length
    };

    matches.forEach(match => {
      const locationScore = match.scores.location || 0;
      
      if (locationScore >= 80) {
        analysis.nearby++;
      } else if (locationScore === 0 && match.opportunity.isRemote) {
        analysis.remote++;
      }
      
      if (preferences.preferredCities.includes(match.opportunity.city) ||
          preferences.preferredStates.includes(match.opportunity.state)) {
        analysis.preferred++;
      }
    });

    return analysis;
  }

  /**
   * Obter relatório de matching híbrido
   * @param {Object} filters - Filtros para o relatório
   * @returns {Object} Relatório de matching
   */
  static async getHybridMatchingReport(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        volunteerType,
        category,
        city
      } = filters;

      // Implementar lógica de relatório
      const report = {
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalMatches: 0,
          presentialMatches: 0,
          onlineMatches: 0,
          hybridMatches: 0
        },
        trends: {
          presentialGrowth: 0,
          onlineGrowth: 0,
          hybridGrowth: 0
        },
        insights: []
      };

      return {
        success: true,
        data: report
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de matching híbrido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Otimizar matching híbrido
   * @param {string} volunteerId - ID do voluntário
   * @param {Object} preferences - Preferências do voluntário
   * @returns {Object} Resultado da otimização
   */
  static async optimizeHybridMatching(volunteerId, preferences) {
    try {
      const {
        preferredTypes = ['PRESENTIAL', 'ONLINE', 'HYBRID'],
        maxDistance = 50,
        minScore = 70,
        categories = [],
        skills = []
      } = preferences;

      // Buscar matches otimizados
      const optimizedMatches = await this.findHybridMatches(volunteerId, {
        volunteerTypes: preferredTypes,
        maxDistance,
        minScore,
        categories,
        skills
      });

      if (!optimizedMatches.success) {
        return optimizedMatches;
      }

      // Aplicar otimizações adicionais
      const optimized = this.applyOptimizations(optimizedMatches.data, preferences);

      return {
        success: true,
        data: optimized,
        optimizations: {
          applied: optimized.length,
          original: optimizedMatches.data.length
        }
      };

    } catch (error) {
      console.error('Erro ao otimizar matching híbrido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aplicar otimizações aos matches
   * @param {Array} matches - Lista de matches
   * @param {Object} preferences - Preferências do voluntário
   * @returns {Array} Matches otimizados
   */
  static applyOptimizations(matches, preferences) {
    // Implementar lógica de otimização
    // Por enquanto, retornar matches ordenados
    return matches.sort((a, b) => b.scores.total - a.scores.total);
  }
}

module.exports = HybridMatchingService;
