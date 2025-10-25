const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço para validação e gerenciamento de requisitos de oportunidades
 */
class OpportunityRequirementsService {
  
  /**
   * Validar se um voluntário atende aos requisitos de uma oportunidade
   * @param {string} opportunityId - ID da oportunidade
   * @param {string} volunteerId - ID do voluntário
   * @returns {Object} Resultado da validação
   */
  static async validateVolunteerForOpportunity(opportunityId, volunteerId) {
    try {
      // Buscar a oportunidade e seus requisitos
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          opportunityRequirements: {
            orderBy: { priority: 'desc' }
          }
        }
      });

      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
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
        throw new Error('Voluntário não encontrado');
      }

      // Validar cada requisito
      const validationResults = [];
      let meetsAllRequirements = true;
      let criticalFailures = 0;

      for (const requirement of opportunity.opportunityRequirements) {
        const validation = await this.validateSingleRequirement(requirement, volunteer);
        
        validationResults.push({
          requirementId: requirement.id,
          title: requirement.title,
          type: requirement.requirementType,
          priority: requirement.priority,
          isRequired: requirement.isRequired,
          isValid: validation.isValid,
          message: validation.message,
          details: validation.details
        });

        if (!validation.isValid) {
          if (requirement.isRequired) {
            meetsAllRequirements = false;
          }
          if (requirement.priority === 'CRITICAL') {
            criticalFailures++;
          }
        }
      }

      return {
        opportunityId,
        volunteerId,
        meetsAllRequirements,
        criticalFailures,
        validationResults,
        summary: {
          total: validationResults.length,
          valid: validationResults.filter(r => r.isValid).length,
          invalid: validationResults.filter(r => !r.isValid).length,
          critical: validationResults.filter(r => !r.isValid && r.priority === 'CRITICAL').length,
          required: validationResults.filter(r => r.isRequired).length,
          requiredValid: validationResults.filter(r => r.isRequired && r.isValid).length
        }
      };

    } catch (error) {
      console.error('Erro ao validar requisitos:', error);
      throw error;
    }
  }

  /**
   * Validar um requisito específico
   * @param {Object} requirement - Requisito a ser validado
   * @param {Object} volunteer - Dados do voluntário
   * @returns {Object} Resultado da validação
   */
  static async validateSingleRequirement(requirement, volunteer) {
    try {
      switch (requirement.requirementType) {
        case 'AGE':
          return this.validateAgeRequirement(requirement, volunteer);
        
        case 'EXPERIENCE':
          return this.validateExperienceRequirement(requirement, volunteer);
        
        case 'EDUCATION':
          return this.validateEducationRequirement(requirement, volunteer);
        
        case 'SKILL':
          return this.validateSkillRequirement(requirement, volunteer);
        
        case 'LANGUAGE':
          return this.validateLanguageRequirement(requirement, volunteer);
        
        case 'AVAILABILITY':
          return this.validateAvailabilityRequirement(requirement, volunteer);
        
        case 'LOCATION':
          return this.validateLocationRequirement(requirement, volunteer);
        
        case 'DOCUMENT':
          return this.validateDocumentRequirement(requirement, volunteer);
        
        case 'BACKGROUND_CHECK':
          return this.validateBackgroundCheckRequirement(requirement, volunteer);
        
        case 'CUSTOM':
          return this.validateCustomRequirement(requirement, volunteer);
        
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
  }

  /**
   * Validar requisito de idade
   */
  static validateAgeRequirement(requirement, volunteer) {
    const age = this.calculateAge(volunteer.dateOfBirth);
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
  }

  /**
   * Validar requisito de experiência
   */
  static async validateExperienceRequirement(requirement, volunteer) {
    // Buscar histórico de aplicações aprovadas
    const approvedApplications = await prisma.application.findMany({
      where: {
        volunteerId: volunteer.id,
        status: 'APPROVED'
      },
      include: {
        opportunity: true
      }
    });

    const experienceMonths = approvedApplications.reduce((total, app) => {
      if (app.opportunity.startDate && app.opportunity.endDate) {
        const start = new Date(app.opportunity.startDate);
        const end = new Date(app.opportunity.endDate);
        const diffTime = Math.abs(end - start);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return total + diffMonths;
      }
      return total;
    }, 0);

    const requiredMonths = requirement.minValue || 0;
    const isValid = experienceMonths >= requiredMonths;
    
    return {
      isValid,
      message: isValid 
        ? `Experiência de ${experienceMonths} meses atende aos requisitos (${requiredMonths} meses)`
        : `Experiência de ${experienceMonths} meses não atende aos requisitos (${requiredMonths} meses)`,
      details: { experienceMonths, requiredMonths }
    };
  }

  /**
   * Validar requisito de educação
   */
  static async validateEducationRequirement(requirement, volunteer) {
    // Buscar documentos de educação do voluntário
    const educationDocuments = await prisma.document.findMany({
      where: {
        userId: volunteer.userId,
        documentType: 'EDUCATION',
        status: 'APPROVED'
      }
    });

    const hasEducation = educationDocuments.length > 0;
    const requiredLevel = requirement.allowedValues || [];
    
    // Implementar lógica mais específica baseada no nível de educação
    const isValid = hasEducation;
    
    return {
      isValid,
      message: isValid 
        ? 'Documentos de educação aprovados'
        : 'Documentos de educação não encontrados ou não aprovados',
      details: { hasEducation, requiredLevel }
    };
  }

  /**
   * Validar requisito de habilidades
   */
  static validateSkillRequirement(requirement, volunteer) {
    const requiredSkills = requirement.allowedValues || [];
    const volunteerSkills = volunteer.skills || [];
    
    const hasRequiredSkills = requiredSkills.every(skill => 
      volunteerSkills.includes(skill)
    );
    
    const missingSkills = requiredSkills.filter(skill => 
      !volunteerSkills.includes(skill)
    );
    
    return {
      isValid: hasRequiredSkills,
      message: hasRequiredSkills 
        ? 'Voluntário possui todas as habilidades necessárias'
        : `Voluntário não possui as seguintes habilidades: ${missingSkills.join(', ')}`,
      details: { 
        requiredSkills, 
        volunteerSkills, 
        hasRequiredSkills,
        missingSkills
      }
    };
  }

  /**
   * Validar requisito de idioma
   */
  static validateLanguageRequirement(requirement, volunteer) {
    const requiredLanguages = requirement.allowedValues || [];
    const volunteerSkills = volunteer.skills || [];
    
    // Assumir que habilidades de idioma estão no formato "Idioma - Nível"
    const languageSkills = volunteerSkills.filter(skill => 
      skill.toLowerCase().includes('inglês') || 
      skill.toLowerCase().includes('espanhol') ||
      skill.toLowerCase().includes('francês') ||
      skill.toLowerCase().includes('alemão')
    );
    
    const hasRequiredLanguages = requiredLanguages.every(lang => 
      languageSkills.some(skill => skill.toLowerCase().includes(lang.toLowerCase()))
    );
    
    return {
      isValid: hasRequiredLanguages,
      message: hasRequiredLanguages 
        ? 'Voluntário possui os idiomas necessários'
        : 'Voluntário não possui os idiomas necessários',
      details: { requiredLanguages, languageSkills, hasRequiredLanguages }
    };
  }

  /**
   * Validar requisito de disponibilidade
   */
  static validateAvailabilityRequirement(requirement, volunteer) {
    const volunteerAvailability = volunteer.availability || {};
    const requiredAvailability = requirement.validationRules || {};
    
    // Implementar lógica de validação de disponibilidade
    // Por enquanto, retornar como válido se o voluntário tem disponibilidade definida
    const hasAvailability = Object.keys(volunteerAvailability).length > 0;
    
    return {
      isValid: hasAvailability,
      message: hasAvailability 
        ? 'Voluntário possui disponibilidade definida'
        : 'Voluntário não possui disponibilidade definida',
      details: { volunteerAvailability, requiredAvailability, hasAvailability }
    };
  }

  /**
   * Validar requisito de localização
   */
  static validateLocationRequirement(requirement, volunteer) {
    const volunteerLocation = {
      city: volunteer.city,
      state: volunteer.state,
      latitude: volunteer.latitude,
      longitude: volunteer.longitude
    };
    
    const requiredLocation = requirement.validationRules || {};
    const maxDistance = requirement.maxValue || 50; // km
    
    // Implementar lógica de validação de distância
    // Por enquanto, retornar como válido se o voluntário tem localização definida
    const hasLocation = volunteer.latitude && volunteer.longitude;
    
    return {
      isValid: hasLocation,
      message: hasLocation 
        ? 'Voluntário possui localização definida'
        : 'Voluntário não possui localização definida',
      details: { volunteerLocation, requiredLocation, maxDistance, hasLocation }
    };
  }

  /**
   * Validar requisito de documento
   */
  static async validateDocumentRequirement(requirement, volunteer) {
    const requiredDocuments = requirement.allowedValues || [];
    
    const approvedDocuments = await prisma.document.findMany({
      where: {
        userId: volunteer.userId,
        status: 'APPROVED'
      }
    });
    
    const documentTypes = approvedDocuments.map(doc => doc.documentType);
    const hasRequiredDocuments = requiredDocuments.every(docType => 
      documentTypes.includes(docType)
    );
    
    const missingDocuments = requiredDocuments.filter(docType => 
      !documentTypes.includes(docType)
    );
    
    return {
      isValid: hasRequiredDocuments,
      message: hasRequiredDocuments 
        ? 'Voluntário possui todos os documentos necessários'
        : `Voluntário não possui os seguintes documentos: ${missingDocuments.join(', ')}`,
      details: { 
        requiredDocuments, 
        documentTypes, 
        hasRequiredDocuments,
        missingDocuments
      }
    };
  }

  /**
   * Validar requisito de verificação de antecedentes
   */
  static validateBackgroundCheckRequirement(requirement, volunteer) {
    const hasValidBackgroundCheck = volunteer.backgroundChecks.some(
      check => check.status === 'APPROVED' && 
      (!check.expiresAt || check.expiresAt > new Date())
    );
    
    const checkTypes = volunteer.backgroundChecks
      .filter(check => check.status === 'APPROVED')
      .map(check => check.checkType);
    
    return {
      isValid: hasValidBackgroundCheck,
      message: hasValidBackgroundCheck 
        ? 'Verificação de antecedentes aprovada'
        : 'Verificação de antecedentes não aprovada ou expirada',
      details: { 
        hasValidBackgroundCheck, 
        checkTypes,
        backgroundChecks: volunteer.backgroundChecks
      }
    };
  }

  /**
   * Validar requisito customizado
   */
  static validateCustomRequirement(requirement, volunteer) {
    const validationRules = requirement.validationRules || {};
    
    // Implementar lógica baseada em regras customizadas
    // Por enquanto, retornar como válido
    return {
      isValid: true,
      message: 'Requisito customizado validado',
      details: { validationRules }
    };
  }

  /**
   * Calcular idade baseada na data de nascimento
   */
  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obter estatísticas de requisitos para uma oportunidade
   */
  static async getRequirementStats(opportunityId) {
    try {
      const requirements = await prisma.opportunityRequirement.findMany({
        where: { opportunityId }
      });

      const stats = {
        total: requirements.length,
        byType: {},
        byPriority: {},
        byRequired: {
          required: requirements.filter(r => r.isRequired).length,
          optional: requirements.filter(r => !r.isRequired).length
        }
      };

      // Estatísticas por tipo
      requirements.forEach(req => {
        stats.byType[req.requirementType] = (stats.byType[req.requirementType] || 0) + 1;
        stats.byPriority[req.priority] = (stats.byPriority[req.priority] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Erro ao obter estatísticas de requisitos:', error);
      throw error;
    }
  }

  /**
   * Obter requisitos mais comuns por categoria
   */
  static async getCommonRequirementsByCategory(categoryId) {
    try {
      const opportunities = await prisma.opportunity.findMany({
        where: {
          categories: {
            some: { id: categoryId }
          }
        },
        include: {
          opportunityRequirements: true
        }
      });

      const requirementCounts = {};
      
      opportunities.forEach(opportunity => {
        opportunity.opportunityRequirements.forEach(req => {
          const key = `${req.requirementType}-${req.title}`;
          requirementCounts[key] = (requirementCounts[key] || 0) + 1;
        });
      });

      // Ordenar por frequência
      const sortedRequirements = Object.entries(requirementCounts)
        .map(([key, count]) => {
          const [type, title] = key.split('-', 2);
          return { type, title, count };
        })
        .sort((a, b) => b.count - a.count);

      return sortedRequirements;

    } catch (error) {
      console.error('Erro ao obter requisitos comuns:', error);
      throw error;
    }
  }
}

module.exports = OpportunityRequirementsService;