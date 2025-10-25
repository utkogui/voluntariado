const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_TYPES } = require('../utils/constants');
const bcrypt = require('bcryptjs');

// Obter perfil completo do usuário
const getUserProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        volunteer: {
          include: {
            applications: {
              include: {
                opportunity: {
                  include: {
                    categories: true
                  }
                }
              }
            },
            backgroundChecks: true,
            evaluations: {
              include: {
                evaluator: {
                  select: {
                    id: true,
                    email: true,
                    userType: true
                  }
                }
              }
            }
          }
        },
        institution: {
          include: {
            categories: true,
            opportunities: {
              include: {
                categories: true,
                applications: true
              }
            },
            evaluations: {
              include: {
                evaluator: {
                  select: {
                    id: true,
                    email: true,
                    userType: true
                  }
                }
              }
            }
          }
        },
        company: {
          include: {
            opportunities: {
              include: {
                categories: true,
                applications: true
              }
            },
            reports: true
          }
        },
        university: {
          include: {
            opportunities: {
              include: {
                categories: true,
                applications: true
              }
            },
            reports: true
          }
        },
        documents: {
          where: {
            status: 'APPROVED'
          }
        }
      }
    });

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Determinar perfil baseado no tipo
    let profile = null;
    if (user.volunteer) profile = user.volunteer;
    else if (user.institution) profile = user.institution;
    else if (user.company) profile = user.company;
    else if (user.university) profile = user.university;

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          status: user.status,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        profile,
        documents: user.documents
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar perfil de voluntário
const updateVolunteerProfile = async (userId, updateData) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { userId }
    });

    if (!volunteer) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedVolunteer = await prisma.volunteer.update({
      where: { userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        gender: updateData.gender,
        bio: updateData.bio,
        profileImage: updateData.profileImage,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        country: updateData.country,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        skills: updateData.skills,
        skillLevels: updateData.skillLevels,
        availability: updateData.availability,
        volunteerTypes: updateData.volunteerTypes
      },
      include: {
        applications: {
          include: {
            opportunity: {
              include: {
                categories: true
              }
            }
          }
        },
        backgroundChecks: true,
        evaluations: true
      }
    });

    return {
      success: true,
      data: updatedVolunteer,
      message: 'Perfil de voluntário atualizado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar perfil de instituição
const updateInstitutionProfile = async (userId, updateData) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { userId }
    });

    if (!institution) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Atualizar categorias se fornecidas
    if (updateData.categories) {
      await prisma.institution.update({
        where: { userId },
        data: {
          categories: {
            set: updateData.categories.map(categoryId => ({ id: categoryId }))
          }
        }
      });
    }

    const updatedInstitution = await prisma.institution.update({
      where: { userId },
      data: {
        name: updateData.name,
        description: updateData.description,
        website: updateData.website,
        phone: updateData.phone,
        email: updateData.email,
        logo: updateData.logo,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        country: updateData.country,
        latitude: updateData.latitude,
        longitude: updateData.longitude
      },
      include: {
        categories: true,
        opportunities: {
          include: {
            categories: true,
            applications: true
          }
        },
        evaluations: true
      }
    });

    return {
      success: true,
      data: updatedInstitution,
      message: 'Perfil de instituição atualizado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar perfil de empresa
const updateCompanyProfile = async (userId, updateData) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId }
    });

    if (!company) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedCompany = await prisma.company.update({
      where: { userId },
      data: {
        name: updateData.name,
        description: updateData.description,
        website: updateData.website,
        phone: updateData.phone,
        email: updateData.email,
        logo: updateData.logo,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        country: updateData.country,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        companySize: updateData.companySize,
        industry: updateData.industry
      },
      include: {
        opportunities: {
          include: {
            categories: true,
            applications: true
          }
        },
        reports: true
      }
    });

    return {
      success: true,
      data: updatedCompany,
      message: 'Perfil de empresa atualizado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar perfil de universidade
const updateUniversityProfile = async (userId, updateData) => {
  try {
    const university = await prisma.university.findUnique({
      where: { userId }
    });

    if (!university) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    const updatedUniversity = await prisma.university.update({
      where: { userId },
      data: {
        name: updateData.name,
        description: updateData.description,
        website: updateData.website,
        phone: updateData.phone,
        email: updateData.email,
        logo: updateData.logo,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        country: updateData.country,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        universityType: updateData.universityType,
        accreditation: updateData.accreditation
      },
      include: {
        opportunities: {
          include: {
            categories: true,
            applications: true
          }
        },
        reports: true
      }
    });

    return {
      success: true,
      data: updatedUniversity,
      message: 'Perfil de universidade atualizado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar perfil baseado no tipo de usuário
const updateUserProfile = async (userId, userType, updateData) => {
  try {
    switch (userType) {
      case USER_TYPES.VOLUNTEER:
        return await updateVolunteerProfile(userId, updateData);
      case USER_TYPES.INSTITUTION:
        return await updateInstitutionProfile(userId, updateData);
      case USER_TYPES.COMPANY:
        return await updateCompanyProfile(userId, updateData);
      case USER_TYPES.UNIVERSITY:
        return await updateUniversityProfile(userId, updateData);
      default:
        return {
          success: false,
          error: 'Tipo de usuário inválido'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Alterar senha do usuário
const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Senha atual incorreta'
      };
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Atualizar email do usuário
const updateUserEmail = async (userId, newEmail, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Senha incorreta'
      };
    }

    // Verificar se o novo email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Este email já está em uso'
      };
    }

    // Atualizar email
    await prisma.user.update({
      where: { id: userId },
      data: { 
        email: newEmail,
        isVerified: false // Email precisa ser verificado novamente
      }
    });

    return {
      success: true,
      message: 'Email atualizado com sucesso. Verifique seu novo email.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Deletar conta do usuário
const deleteUserAccount = async (userId, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      };
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Senha incorreta'
      };
    }

    // Deletar usuário (cascade deletará todos os dados relacionados)
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      success: true,
      message: 'Conta deletada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter estatísticas do perfil
const getProfileStats = async (userId, userType) => {
  try {
    let stats = {};

    switch (userType) {
      case USER_TYPES.VOLUNTEER:
        const volunteerStats = await prisma.volunteer.findUnique({
          where: { userId },
          include: {
            applications: {
              include: {
                opportunity: true
              }
            },
            backgroundChecks: true,
            evaluations: true
          }
        });

        if (volunteerStats) {
          stats = {
            totalApplications: volunteerStats.applications.length,
            approvedApplications: volunteerStats.applications.filter(app => app.status === 'APPROVED').length,
            pendingApplications: volunteerStats.applications.filter(app => app.status === 'PENDING').length,
            totalBackgroundChecks: volunteerStats.backgroundChecks.length,
            approvedBackgroundChecks: volunteerStats.backgroundChecks.filter(check => check.status === 'APPROVED').length,
            totalEvaluations: volunteerStats.evaluations.length,
            averageRating: volunteerStats.evaluations.length > 0 
              ? volunteerStats.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / volunteerStats.evaluations.length 
              : 0,
            skillsCount: volunteerStats.skills.length,
            volunteerTypesCount: volunteerStats.volunteerTypes.length
          };
        }
        break;

      case USER_TYPES.INSTITUTION:
        const institutionStats = await prisma.institution.findUnique({
          where: { userId },
          include: {
            opportunities: {
              include: {
                applications: true
              }
            },
            evaluations: true,
            categories: true
          }
        });

        if (institutionStats) {
          stats = {
            totalOpportunities: institutionStats.opportunities.length,
            activeOpportunities: institutionStats.opportunities.filter(opp => opp.status === 'PUBLISHED').length,
            totalApplications: institutionStats.opportunities.reduce((sum, opp) => sum + opp.applications.length, 0),
            totalEvaluations: institutionStats.evaluations.length,
            averageRating: institutionStats.evaluations.length > 0 
              ? institutionStats.evaluations.reduce((sum, eval) => sum + eval.rating, 0) / institutionStats.evaluations.length 
              : 0,
            categoriesCount: institutionStats.categories.length
          };
        }
        break;

      case USER_TYPES.COMPANY:
        const companyStats = await prisma.company.findUnique({
          where: { userId },
          include: {
            opportunities: {
              include: {
                applications: true
              }
            },
            reports: true
          }
        });

        if (companyStats) {
          stats = {
            totalOpportunities: companyStats.opportunities.length,
            activeOpportunities: companyStats.opportunities.filter(opp => opp.status === 'PUBLISHED').length,
            totalApplications: companyStats.opportunities.reduce((sum, opp) => sum + opp.applications.length, 0),
            totalReports: companyStats.reports.length,
            planType: companyStats.planType,
            isActive: companyStats.isActive
          };
        }
        break;

      case USER_TYPES.UNIVERSITY:
        const universityStats = await prisma.university.findUnique({
          where: { userId },
          include: {
            opportunities: {
              include: {
                applications: true
              }
            },
            reports: true
          }
        });

        if (universityStats) {
          stats = {
            totalOpportunities: universityStats.opportunities.length,
            activeOpportunities: universityStats.opportunities.filter(opp => opp.status === 'PUBLISHED').length,
            totalApplications: universityStats.opportunities.reduce((sum, opp) => sum + opp.applications.length, 0),
            totalReports: universityStats.reports.length,
            planType: universityStats.planType,
            isActive: universityStats.isActive,
            universityType: universityStats.universityType
          };
        }
        break;
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Buscar usuários por nome ou email (para administradores)
const searchUsers = async (query, userType = null, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const whereClause = {
      OR: [
        {
          email: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    };

    if (userType) {
      whereClause.userType = userType;
    }

    // Adicionar busca por nome nos perfis específicos
    if (userType === USER_TYPES.VOLUNTEER) {
      whereClause.OR.push({
        volunteer: {
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        }
      });
    } else if (userType === USER_TYPES.INSTITUTION) {
      whereClause.OR.push({
        institution: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        }
      });
    } else if (userType === USER_TYPES.COMPANY) {
      whereClause.OR.push({
        company: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        }
      });
    } else if (userType === USER_TYPES.UNIVERSITY) {
      whereClause.OR.push({
        university: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        }
      });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        volunteer: {
          select: {
            firstName: true,
            lastName: true,
            city: true,
            state: true
          }
        },
        institution: {
          select: {
            name: true,
            city: true,
            state: true
          }
        },
        company: {
          select: {
            name: true,
            city: true,
            state: true
          }
        },
        university: {
          select: {
            name: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.user.count({
      where: whereClause
    });

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserEmail,
  deleteUserAccount,
  getProfileStats,
  searchUsers
};
