const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço para gestão de doações de materiais/recursos
 */
class DonationService {
  
  /**
   * Obter estatísticas de doações
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Object} Estatísticas de doações
   */
  static async getDonationStats(userId = null) {
    try {
      const where = userId ? { donorId: userId } : {};
      
      const [
        totalDonations,
        availableDonations,
        reservedDonations,
        collectedDonations,
        cancelledDonations,
        donationsByCategory,
        donationsByPriority,
        donationsByCondition,
        totalValue
      ] = await Promise.all([
        prisma.donation.count({ where }),
        prisma.donation.count({ where: { ...where, status: 'AVAILABLE' } }),
        prisma.donation.count({ where: { ...where, status: 'RESERVED' } }),
        prisma.donation.count({ where: { ...where, status: 'COLLECTED' } }),
        prisma.donation.count({ where: { ...where, status: 'CANCELLED' } }),
        this.getDonationsByCategory(where),
        this.getDonationsByPriority(where),
        this.getDonationsByCondition(where),
        this.getTotalValue(where)
      ]);

      return {
        total: totalDonations,
        available: availableDonations,
        reserved: reservedDonations,
        collected: collectedDonations,
        cancelled: cancelledDonations,
        byCategory: donationsByCategory,
        byPriority: donationsByPriority,
        byCondition: donationsByCondition,
        totalValue: totalValue
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de doações:', error);
      throw error;
    }
  }

  /**
   * Obter doações por categoria
   */
  static async getDonationsByCategory(where = {}) {
    const donations = await prisma.donation.groupBy({
      by: ['category'],
      where,
      _count: {
        category: true
      }
    });

    return donations.map(item => ({
      category: item.category,
      count: item._count.category
    }));
  }

  /**
   * Obter doações por prioridade
   */
  static async getDonationsByPriority(where = {}) {
    const donations = await prisma.donation.groupBy({
      by: ['priority'],
      where,
      _count: {
        priority: true
      }
    });

    return donations.map(item => ({
      priority: item.priority,
      count: item._count.priority
    }));
  }

  /**
   * Obter doações por condição
   */
  static async getDonationsByCondition(where = {}) {
    const donations = await prisma.donation.groupBy({
      by: ['condition'],
      where,
      _count: {
        condition: true
      }
    });

    return donations.map(item => ({
      condition: item.condition,
      count: item._count.condition
    }));
  }

  /**
   * Obter valor total das doações
   */
  static async getTotalValue(where = {}) {
    const result = await prisma.donation.aggregate({
      where: {
        ...where,
        estimatedValue: {
          not: null
        }
      },
      _sum: {
        estimatedValue: true
      }
    });

    return result._sum.estimatedValue || 0;
  }

  /**
   * Buscar doações próximas por localização
   * @param {number} latitude - Latitude do usuário
   * @param {number} longitude - Longitude do usuário
   * @param {number} radius - Raio em km (padrão: 50)
   * @param {Object} filters - Filtros adicionais
   * @returns {Array} Doações próximas
   */
  static async findNearbyDonations(latitude, longitude, radius = 50, filters = {}) {
    try {
      const where = {
        status: 'AVAILABLE',
        latitude: { not: null },
        longitude: { not: null },
        ...filters
      };

      const donations = await prisma.donation.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      // Calcular distância e filtrar por raio
      const nearbyDonations = donations
        .map(donation => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            donation.latitude,
            donation.longitude
          );
          return {
            ...donation,
            distance: Math.round(distance * 100) / 100
          };
        })
        .filter(donation => donation.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return nearbyDonations;

    } catch (error) {
      console.error('Erro ao buscar doações próximas:', error);
      throw error;
    }
  }

  /**
   * Buscar doações por texto
   * @param {string} searchTerm - Termo de busca
   * @param {Object} filters - Filtros adicionais
   * @returns {Array} Doações encontradas
   */
  static async searchDonations(searchTerm, filters = {}) {
    try {
      const where = {
        status: 'AVAILABLE',
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ],
        ...filters
      };

      const donations = await prisma.donation.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return donations;

    } catch (error) {
      console.error('Erro ao buscar doações:', error);
      throw error;
    }
  }

  /**
   * Obter doações expiradas
   * @returns {Array} Doações expiradas
   */
  static async getExpiredDonations() {
    try {
      const now = new Date();
      
      const expiredDonations = await prisma.donation.findMany({
        where: {
          status: {
            in: ['AVAILABLE', 'RESERVED']
          },
          availableUntil: {
            lt: now
          }
        },
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        }
      });

      return expiredDonations;

    } catch (error) {
      console.error('Erro ao buscar doações expiradas:', error);
      throw error;
    }
  }

  /**
   * Marcar doações como expiradas
   * @returns {number} Número de doações marcadas como expiradas
   */
  static async markExpiredDonations() {
    try {
      const now = new Date();
      
      const result = await prisma.donation.updateMany({
        where: {
          status: {
            in: ['AVAILABLE', 'RESERVED']
          },
          availableUntil: {
            lt: now
          }
        },
        data: {
          status: 'EXPIRED'
        }
      });

      return result.count;

    } catch (error) {
      console.error('Erro ao marcar doações como expiradas:', error);
      throw error;
    }
  }

  /**
   * Obter doações por oportunidade
   * @param {string} opportunityId - ID da oportunidade
   * @returns {Array} Doações da oportunidade
   */
  static async getDonationsByOpportunity(opportunityId) {
    try {
      const donations = await prisma.donation.findMany({
        where: { opportunityId },
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          },
          collectedBy: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return donations;

    } catch (error) {
      console.error('Erro ao buscar doações da oportunidade:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de doações do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros adicionais
   * @returns {Object} Histórico de doações
   */
  static async getUserDonationHistory(userId, filters = {}) {
    try {
      const where = {
        donorId: userId,
        ...filters
      };

      const [donations, stats] = await Promise.all([
        prisma.donation.findMany({
          where,
          include: {
            opportunity: {
              select: {
                id: true,
                title: true
              }
            },
            collectedBy: {
              select: {
                id: true,
                email: true,
                userType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.getDonationStats(userId)
      ]);

      return {
        donations,
        stats
      };

    } catch (error) {
      console.error('Erro ao buscar histórico de doações:', error);
      throw error;
    }
  }

  /**
   * Obter doações mais procuradas
   * @param {number} limit - Limite de resultados (padrão: 10)
   * @returns {Array} Doações mais procuradas
   */
  static async getMostSoughtDonations(limit = 10) {
    try {
      // Buscar doações com mais reservas (baseado em histórico)
      const donations = await prisma.donation.findMany({
        where: {
          status: 'AVAILABLE'
        },
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      return donations;

    } catch (error) {
      console.error('Erro ao buscar doações mais procuradas:', error);
      throw error;
    }
  }

  /**
   * Obter doações por categoria específica
   * @param {string} category - Categoria da doação
   * @param {Object} filters - Filtros adicionais
   * @returns {Array} Doações da categoria
   */
  static async getDonationsByCategory(category, filters = {}) {
    try {
      const where = {
        category,
        status: 'AVAILABLE',
        ...filters
      };

      const donations = await prisma.donation.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return donations;

    } catch (error) {
      console.error('Erro ao buscar doações por categoria:', error);
      throw error;
    }
  }

  /**
   * Calcular distância entre duas coordenadas (Haversine)
   * @param {number} lat1 - Latitude 1
   * @param {number} lng1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lng2 - Longitude 2
   * @returns {number} Distância em km
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Obter relatório de doações
   * @param {Object} filters - Filtros para o relatório
   * @returns {Object} Relatório de doações
   */
  static async getDonationReport(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        category,
        status,
        priority
      } = filters;

      const where = {};

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      const [
        totalDonations,
        donationsByStatus,
        donationsByCategory,
        donationsByPriority,
        totalValue,
        averageValue
      ] = await Promise.all([
        prisma.donation.count({ where }),
        this.getDonationsByStatus(where),
        this.getDonationsByCategory(where),
        this.getDonationsByPriority(where),
        this.getTotalValue(where),
        this.getAverageValue(where)
      ]);

      return {
        total: totalDonations,
        byStatus: donationsByStatus,
        byCategory: donationsByCategory,
        byPriority: donationsByPriority,
        totalValue,
        averageValue
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de doações:', error);
      throw error;
    }
  }

  /**
   * Obter doações por status
   */
  static async getDonationsByStatus(where = {}) {
    const donations = await prisma.donation.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    return donations.map(item => ({
      status: item.status,
      count: item._count.status
    }));
  }

  /**
   * Obter valor médio das doações
   */
  static async getAverageValue(where = {}) {
    const result = await prisma.donation.aggregate({
      where: {
        ...where,
        estimatedValue: {
          not: null
        }
      },
      _avg: {
        estimatedValue: true
      }
    });

    return result._avg.estimatedValue || 0;
  }
}

module.exports = DonationService;
