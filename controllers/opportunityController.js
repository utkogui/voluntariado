const opportunityService = require('../services/opportunityService');
const DonationService = require('../services/donationService');
const { ERROR_MESSAGES } = require('../utils/constants');

// Obter todas as oportunidades
const getAllOpportunities = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      volunteerType: req.query.volunteerType,
      city: req.query.city,
      category: req.query.category,
      skill: req.query.skill,
      isRemote: req.query.isRemote === 'true' ? true : req.query.isRemote === 'false' ? false : undefined
    };

    const result = await opportunityService.getAllOpportunities(filters);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data,
      filters: filters,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter oportunidade por ID
const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await opportunityService.getOpportunityById(id);
    
    if (!result.success) {
      const statusCode = result.error === ERROR_MESSAGES.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.json({
      opportunity: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Buscar oportunidades
const searchOpportunities = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query de busca deve ter pelo menos 2 caracteres'
      });
    }

    const filters = {
      status: req.query.status,
      volunteerType: req.query.volunteerType,
      city: req.query.city
    };

    const result = await opportunityService.searchOpportunities(q.trim(), filters);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data,
      query: result.query,
      filters: filters,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter oportunidades por categoria
const getOpportunitiesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await opportunityService.getOpportunitiesByCategory(categoryId);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data,
      categoryId: result.categoryId,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter oportunidades próximas
const getNearbyOpportunities = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude e longitude são obrigatórios'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Latitude e longitude devem ser números válidos'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Latitude deve estar entre -90 e 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Longitude deve estar entre -180 e 180'
      });
    }

    const result = await opportunityService.getNearbyOpportunities(latitude, longitude, radiusKm);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      opportunities: result.data,
      center: result.center,
      radius: result.radius,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Obter estatísticas das oportunidades
const getOpportunityStats = async (req, res) => {
  try {
    const result = await opportunityService.getOpportunityStats();
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      stats: result.data,
      demo: result.demo || false
    });
  } catch (error) {
    throw error;
  }
};

// Criar nova oportunidade
const createOpportunity = async (req, res) => {
  try {
    const opportunityData = req.body;
    const userId = req.user.id;
    const userType = req.user.userType;

    // Validar se o usuário pode criar oportunidades
    if (!['INSTITUTION', 'COMPANY', 'UNIVERSITY'].includes(userType)) {
      return res.status(403).json({
        error: 'Apenas instituições, empresas e universidades podem criar oportunidades'
      });
    }

    // Adicionar dados do criador
    opportunityData.createdById = userId;
    opportunityData.createdByType = userType;

    // Em modo demonstração, simular criação
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      const newOpportunity = {
        id: 'demo-' + Date.now(),
        ...opportunityData,
        currentVolunteers: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.status(201).json({
        message: 'Oportunidade criada com sucesso (modo demonstração)',
        opportunity: newOpportunity,
        demo: true
      });
    }

    // Em produção, salvar no banco
    const opportunity = await prisma.opportunity.create({
      data: opportunityData,
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true
      }
    });

    res.status(201).json({
      message: 'Oportunidade criada com sucesso',
      opportunity
    });
  } catch (error) {
    throw error;
  }
};

// Atualizar oportunidade
const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Em modo demonstração, simular atualização
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      return res.json({
        message: 'Oportunidade atualizada com sucesso (modo demonstração)',
        opportunity: { id, ...updateData, updatedAt: new Date() },
        demo: true
      });
    }

    // Verificar se a oportunidade existe e se o usuário pode editá-la
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!opportunity) {
      return res.status(404).json({
        error: 'Oportunidade não encontrada'
      });
    }

    if (opportunity.createdById !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar esta oportunidade'
      });
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
        institution: true,
        company: true,
        university: true
      }
    });

    res.json({
      message: 'Oportunidade atualizada com sucesso',
      opportunity: updatedOpportunity
    });
  } catch (error) {
    throw error;
  }
};

// Deletar oportunidade
const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Em modo demonstração, simular exclusão
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      return res.json({
        message: 'Oportunidade excluída com sucesso (modo demonstração)',
        demo: true
      });
    }

    // Verificar se a oportunidade existe e se o usuário pode deletá-la
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!opportunity) {
      return res.status(404).json({
        error: 'Oportunidade não encontrada'
      });
    }

    if (opportunity.createdById !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para excluir esta oportunidade'
      });
    }

    await prisma.opportunity.delete({
      where: { id }
    });

    res.json({
      message: 'Oportunidade excluída com sucesso'
    });
  } catch (error) {
    throw error;
  }
};

// Obter doações de uma oportunidade
const getOpportunityDonations = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { page = 1, limit = 10, status, category } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    const donations = await DonationService.getDonationsByOpportunity(opportunityId);
    
    // Aplicar filtros adicionais
    let filteredDonations = donations;
    if (Object.keys(filters).length > 0) {
      filteredDonations = donations.filter(donation => {
        return Object.entries(filters).every(([key, value]) => 
          donation[key] === value
        );
      });
    }

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedDonations = filteredDonations.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedDonations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredDonations.length,
        pages: Math.ceil(filteredDonations.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar doações da oportunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter estatísticas de doações de uma oportunidade
const getOpportunityDonationStats = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const stats = await DonationService.getDonationStats();
    const opportunityDonations = await DonationService.getDonationsByOpportunity(opportunityId);

    const opportunityStats = {
      total: opportunityDonations.length,
      available: opportunityDonations.filter(d => d.status === 'AVAILABLE').length,
      reserved: opportunityDonations.filter(d => d.status === 'RESERVED').length,
      collected: opportunityDonations.filter(d => d.status === 'COLLECTED').length,
      byCategory: DonationService.getDonationsByCategory(opportunityDonations),
      byPriority: DonationService.getDonationsByPriority(opportunityDonations),
      totalValue: opportunityDonations.reduce((sum, d) => sum + (d.estimatedValue || 0), 0)
    };

    res.json({
      success: true,
      data: {
        opportunity: opportunityStats,
        global: stats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de doações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Adicionar doação a uma oportunidade
const addDonationToOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const donationData = {
      ...req.body,
      opportunityId
    };

    // Verificar se a oportunidade existe
    const opportunity = await opportunityService.getOpportunityById(opportunityId);
    if (!opportunity.success) {
      return res.status(404).json({
        success: false,
        message: 'Oportunidade não encontrada'
      });
    }

    // Criar doação
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const donation = await prisma.donation.create({
      data: {
        ...donationData,
        donorId: req.user.id,
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
      }
    });

    res.status(201).json({
      success: true,
      message: 'Doação adicionada à oportunidade com sucesso',
      data: donation
    });

  } catch (error) {
    console.error('Erro ao adicionar doação à oportunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remover doação de uma oportunidade
const removeDonationFromOpportunity = async (req, res) => {
  try {
    const { opportunityId, donationId } = req.params;

    // Verificar se a doação pertence à oportunidade
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const donation = await prisma.donation.findFirst({
      where: {
        id: donationId,
        opportunityId: opportunityId,
        donorId: req.user.id
      }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada ou você não tem permissão para removê-la'
      });
    }

    // Remover associação com a oportunidade
    await prisma.donation.update({
      where: { id: donationId },
      data: { opportunityId: null }
    });

    res.json({
      success: true,
      message: 'Doação removida da oportunidade com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover doação da oportunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllOpportunities,
  getOpportunityById,
  searchOpportunities,
  getOpportunitiesByCategory,
  getNearbyOpportunities,
  getOpportunityStats,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityDonations,
  getOpportunityDonationStats,
  addDonationToOpportunity,
  removeDonationFromOpportunity
};


