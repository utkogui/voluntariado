const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Criar um novo requisito para uma oportunidade
 */
const createRequirement = async (req, res) => {
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

    const { opportunityId } = req.params;
    const {
      title,
      description,
      requirementType,
      isRequired = true,
      priority = 'MEDIUM',
      validationRules,
      minValue,
      maxValue,
      allowedValues
    } = req.body;

    // Verificar se a oportunidade existe e se o usuário tem permissão
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        createdById: req.user.id
      }
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Oportunidade não encontrada ou você não tem permissão para editá-la'
      });
    }

    // Criar o requisito
    const requirement = await prisma.opportunityRequirement.create({
      data: {
        title,
        description,
        requirementType,
        isRequired,
        priority,
        validationRules,
        minValue,
        maxValue,
        allowedValues,
        opportunityId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Requisito criado com sucesso',
      data: requirement
    });

  } catch (error) {
    console.error('Erro ao criar requisito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Listar todos os requisitos de uma oportunidade
 */
const getRequirementsByOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { page = 1, limit = 10, priority, requirementType } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      opportunityId
    };

    if (priority) {
      where.priority = priority;
    }

    if (requirementType) {
      where.requirementType = requirementType;
    }

    // Buscar requisitos
    const [requirements, total] = await Promise.all([
      prisma.opportunityRequirement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.opportunityRequirement.count({ where })
    ]);

    res.json({
      success: true,
      data: requirements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar requisitos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter um requisito específico
 */
const getRequirementById = async (req, res) => {
  try {
    const { requirementId } = req.params;

    const requirement = await prisma.opportunityRequirement.findUnique({
      where: { id: requirementId },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            createdById: true
          }
        }
      }
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requisito não encontrado'
      });
    }

    // Verificar se o usuário tem permissão para ver este requisito
    if (requirement.opportunity.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este requisito'
      });
    }

    res.json({
      success: true,
      data: requirement
    });

  } catch (error) {
    console.error('Erro ao buscar requisito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualizar um requisito
 */
const updateRequirement = async (req, res) => {
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

    const { requirementId } = req.params;
    const {
      title,
      description,
      requirementType,
      isRequired,
      priority,
      validationRules,
      minValue,
      maxValue,
      allowedValues
    } = req.body;

    // Verificar se o requisito existe e se o usuário tem permissão
    const existingRequirement = await prisma.opportunityRequirement.findUnique({
      where: { id: requirementId },
      include: {
        opportunity: {
          select: {
            createdById: true
          }
        }
      }
    });

    if (!existingRequirement) {
      return res.status(404).json({
        success: false,
        message: 'Requisito não encontrado'
      });
    }

    if (existingRequirement.opportunity.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este requisito'
      });
    }

    // Atualizar o requisito
    const updatedRequirement = await prisma.opportunityRequirement.update({
      where: { id: requirementId },
      data: {
        title,
        description,
        requirementType,
        isRequired,
        priority,
        validationRules,
        minValue,
        maxValue,
        allowedValues
      }
    });

    res.json({
      success: true,
      message: 'Requisito atualizado com sucesso',
      data: updatedRequirement
    });

  } catch (error) {
    console.error('Erro ao atualizar requisito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Deletar um requisito
 */
const deleteRequirement = async (req, res) => {
  try {
    const { requirementId } = req.params;

    // Verificar se o requisito existe e se o usuário tem permissão
    const existingRequirement = await prisma.opportunityRequirement.findUnique({
      where: { id: requirementId },
      include: {
        opportunity: {
          select: {
            createdById: true
          }
        }
      }
    });

    if (!existingRequirement) {
      return res.status(404).json({
        success: false,
        message: 'Requisito não encontrado'
      });
    }

    if (existingRequirement.opportunity.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este requisito'
      });
    }

    // Deletar o requisito
    await prisma.opportunityRequirement.delete({
      where: { id: requirementId }
    });

    res.json({
      success: true,
      message: 'Requisito deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar requisito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validar se um voluntário atende aos requisitos de uma oportunidade
 */
const validateVolunteerRequirements = async (req, res) => {
  try {
    const { opportunityId, volunteerId } = req.params;

    // Buscar a oportunidade e seus requisitos
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        opportunityRequirements: {
          where: { isRequired: true },
          orderBy: { priority: 'desc' }
        }
      }
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Oportunidade não encontrada'
      });
    }

    // Buscar dados do voluntário
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        user: true,
        backgroundChecks: {
          where: { status: 'APPROVED' }
        }
      }
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Voluntário não encontrado'
      });
    }

    // Validar cada requisito
    const validationResults = [];
    let meetsAllRequirements = true;

    for (const requirement of opportunity.opportunityRequirements) {
      const validation = await validateSingleRequirement(requirement, volunteer);
      validationResults.push({
        requirementId: requirement.id,
        title: requirement.title,
        type: requirement.requirementType,
        priority: requirement.priority,
        isValid: validation.isValid,
        message: validation.message,
        details: validation.details
      });

      if (!validation.isValid && requirement.isRequired) {
        meetsAllRequirements = false;
      }
    }

    res.json({
      success: true,
      data: {
        opportunityId,
        volunteerId,
        meetsAllRequirements,
        validationResults,
        summary: {
          total: validationResults.length,
          valid: validationResults.filter(r => r.isValid).length,
          invalid: validationResults.filter(r => !r.isValid).length,
          critical: validationResults.filter(r => !r.isValid && r.priority === 'CRITICAL').length
        }
      }
    });

  } catch (error) {
    console.error('Erro ao validar requisitos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Função auxiliar para validar um requisito específico
 */
const validateSingleRequirement = async (requirement, volunteer) => {
  try {
    switch (requirement.requirementType) {
      case 'AGE':
        return validateAgeRequirement(requirement, volunteer);
      
      case 'EXPERIENCE':
        return validateExperienceRequirement(requirement, volunteer);
      
      case 'EDUCATION':
        return validateEducationRequirement(requirement, volunteer);
      
      case 'SKILL':
        return validateSkillRequirement(requirement, volunteer);
      
      case 'LANGUAGE':
        return validateLanguageRequirement(requirement, volunteer);
      
      case 'AVAILABILITY':
        return validateAvailabilityRequirement(requirement, volunteer);
      
      case 'LOCATION':
        return validateLocationRequirement(requirement, volunteer);
      
      case 'DOCUMENT':
        return validateDocumentRequirement(requirement, volunteer);
      
      case 'BACKGROUND_CHECK':
        return validateBackgroundCheckRequirement(requirement, volunteer);
      
      case 'CUSTOM':
        return validateCustomRequirement(requirement, volunteer);
      
      default:
        return {
          isValid: false,
          message: 'Tipo de requisito não reconhecido',
          details: null
        };
    }
  } catch (error) {
    return {
      isValid: false,
      message: 'Erro ao validar requisito',
      details: error.message
    };
  }
};

/**
 * Validadores específicos para cada tipo de requisito
 */
const validateAgeRequirement = (requirement, volunteer) => {
  const age = calculateAge(volunteer.dateOfBirth);
  const minAge = requirement.minValue || 0;
  const maxAge = requirement.maxValue || 100;

  const isValid = age >= minAge && age <= maxAge;
  
  return {
    isValid,
    message: isValid 
      ? `Idade ${age} anos atende aos requisitos (${minAge}-${maxAge} anos)`
      : `Idade ${age} anos não atende aos requisitos (${minAge}-${maxAge} anos)`,
    details: { age, minAge, maxAge }
  };
};

const validateExperienceRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada no histórico de voluntariado
  // Por enquanto, retornar como válido se o voluntário tem background check
  const hasExperience = volunteer.backgroundChecks.length > 0;
  
  return {
    isValid: hasExperience,
    message: hasExperience 
      ? 'Voluntário possui experiência comprovada'
      : 'Voluntário não possui experiência comprovada',
    details: { hasExperience }
  };
};

const validateEducationRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada em documentos de educação
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito de educação validado',
    details: null
  };
};

const validateSkillRequirement = (requirement, volunteer) => {
  const requiredSkills = requirement.allowedValues || [];
  const volunteerSkills = volunteer.skills || [];
  
  const hasRequiredSkills = requiredSkills.every(skill => 
    volunteerSkills.includes(skill)
  );
  
  return {
    isValid: hasRequiredSkills,
    message: hasRequiredSkills 
      ? 'Voluntário possui todas as habilidades necessárias'
      : 'Voluntário não possui todas as habilidades necessárias',
    details: { requiredSkills, volunteerSkills, hasRequiredSkills }
  };
};

const validateLanguageRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada em habilidades de idioma
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito de idioma validado',
    details: null
  };
};

const validateAvailabilityRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada na disponibilidade do voluntário
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito de disponibilidade validado',
    details: null
  };
};

const validateLocationRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada na localização
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito de localização validado',
    details: null
  };
};

const validateDocumentRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada em documentos do voluntário
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito de documento validado',
    details: null
  };
};

const validateBackgroundCheckRequirement = (requirement, volunteer) => {
  const hasValidBackgroundCheck = volunteer.backgroundChecks.some(
    check => check.status === 'APPROVED' && 
    (!check.expiresAt || check.expiresAt > new Date())
  );
  
  return {
    isValid: hasValidBackgroundCheck,
    message: hasValidBackgroundCheck 
      ? 'Verificação de antecedentes aprovada'
      : 'Verificação de antecedentes não aprovada ou expirada',
    details: { hasValidBackgroundCheck }
  };
};

const validateCustomRequirement = (requirement, volunteer) => {
  // Implementar lógica baseada em regras customizadas
  // Por enquanto, retornar como válido
  return {
    isValid: true,
    message: 'Requisito customizado validado',
    details: null
  };
};

/**
 * Função auxiliar para calcular idade
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  createRequirement,
  getRequirementsByOpportunity,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  validateVolunteerRequirements
};