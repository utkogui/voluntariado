const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Criar uma nova doação
 */
const createDonation = async (req, res) => {
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
      category,
      priority = 'MEDIUM',
      quantity,
      unit,
      condition = 'NEW',
      estimatedValue,
      images = [],
      address,
      city,
      state,
      zipCode,
      country = 'Brasil',
      latitude,
      longitude,
      isPickup = false,
      availableFrom,
      availableUntil,
      opportunityId
    } = req.body;

    // Verificar se a oportunidade existe (se fornecida)
    if (opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId }
      });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Oportunidade não encontrada'
        });
      }
    }

    // Criar a doação
    const donation = await prisma.donation.create({
      data: {
        title,
        description,
        category,
        priority,
        quantity,
        unit,
        condition,
        estimatedValue,
        images,
        address,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        isPickup,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        donorId: req.user.id,
        opportunityId
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
      message: 'Doação criada com sucesso',
      data: donation
    });

  } catch (error) {
    console.error('Erro ao criar doação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Listar doações com filtros
 */
const getDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      city,
      state,
      isPickup,
      minValue,
      maxValue,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      status: {
        not: 'CANCELLED'
      }
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (state) {
      where.state = state;
    }

    if (isPickup !== undefined) {
      where.isPickup = isPickup === 'true';
    }

    if (minValue || maxValue) {
      where.estimatedValue = {};
      if (minValue) where.estimatedValue.gte = parseFloat(minValue);
      if (maxValue) where.estimatedValue.lte = parseFloat(maxValue);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar doações
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
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
      }),
      prisma.donation.count({ where })
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter uma doação específica
 */
const getDonationById = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
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
        },
        collectedBy: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    res.json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar uma doação
 */
const updateDonation = async (req, res) => {
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

    const { donationId } = req.params;
    const {
      title,
      description,
      category,
      priority,
      quantity,
      unit,
      condition,
      estimatedValue,
      images,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      isPickup,
      availableFrom,
      availableUntil
    } = req.body;

    // Verificar se a doação existe e se o usuário tem permissão
    const existingDonation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!existingDonation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    if (existingDonation.donorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar esta doação'
      });
    }

    // Verificar se a doação pode ser editada
    if (existingDonation.status === 'COLLECTED') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar uma doação já coletada'
      });
    }

    // Atualizar a doação
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        title,
        description,
        category,
        priority,
        quantity,
        unit,
        condition,
        estimatedValue,
        images,
        address,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        isPickup,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null
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

    res.json({
      success: true,
      message: 'Doação atualizada com sucesso',
      data: updatedDonation
    });

  } catch (error) {
    console.error('Erro ao atualizar doação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deletar uma doação
 */
const deleteDonation = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Verificar se a doação existe e se o usuário tem permissão
    const existingDonation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!existingDonation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    if (existingDonation.donorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar esta doação'
      });
    }

    // Verificar se a doação pode ser deletada
    if (existingDonation.status === 'COLLECTED') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar uma doação já coletada'
      });
    }

    // Deletar a doação
    await prisma.donation.delete({
      where: { id: donationId }
    });

    res.json({
      success: true,
      message: 'Doação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar doação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reservar uma doação
 */
const reserveDonation = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Verificar se a doação existe
    const donation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    // Verificar se a doação está disponível
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Doação não está disponível para reserva'
      });
    }

    // Verificar se não é o próprio doador
    if (donation.donorId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode reservar sua própria doação'
      });
    }

    // Reservar a doação
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'RESERVED',
        collectedById: req.user.id
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

    res.json({
      success: true,
      message: 'Doação reservada com sucesso',
      data: updatedDonation
    });

  } catch (error) {
    console.error('Erro ao reservar doação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Confirmar coleta de uma doação
 */
const confirmCollection = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Verificar se a doação existe
    const donation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    // Verificar se a doação está reservada
    if (donation.status !== 'RESERVED') {
      return res.status(400).json({
        success: false,
        message: 'Doação não está reservada'
      });
    }

    // Verificar se o usuário tem permissão (doador ou coletor)
    if (donation.donorId !== req.user.id && donation.collectedById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para confirmar esta coleta'
      });
    }

    // Confirmar coleta
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'COLLECTED',
        collectedAt: new Date()
      },
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
        },
        opportunity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Coleta confirmada com sucesso',
      data: updatedDonation
    });

  } catch (error) {
    console.error('Erro ao confirmar coleta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancelar reserva de uma doação
 */
const cancelReservation = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Verificar se a doação existe
    const donation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Doação não encontrada'
      });
    }

    // Verificar se a doação está reservada
    if (donation.status !== 'RESERVED') {
      return res.status(400).json({
        success: false,
        message: 'Doação não está reservada'
      });
    }

    // Verificar se o usuário tem permissão (doador ou coletor)
    if (donation.donorId !== req.user.id && donation.collectedById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para cancelar esta reserva'
      });
    }

    // Cancelar reserva
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'AVAILABLE',
        collectedById: null
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

    res.json({
      success: true,
      message: 'Reserva cancelada com sucesso',
      data: updatedDonation
    });

  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter doações do usuário
 */
const getUserDonations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verificar se o usuário tem permissão
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar estas doações'
      });
    }

    // Construir filtros
    const where = {
      donorId: userId
    };

    if (status) {
      where.status = status;
    }

    // Buscar doações
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
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
        }
      }),
      prisma.donation.count({ where })
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar doações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  reserveDonation,
  confirmCollection,
  cancelReservation,
  getUserDonations
};
