const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da API de verificação de antecedentes
const BACKGROUND_CHECK_API_BASE_URL = process.env.BACKGROUND_CHECK_API_URL || 'https://api.backgroundcheck.com/v1';
const API_KEY = process.env.BACKGROUND_CHECK_API_KEY;

const backgroundCheckService = {
  // Iniciar verificação de antecedentes
  initiateBackgroundCheck: async (userId, personalData) => {
    try {
      const response = await axios.post(`${BACKGROUND_CHECK_API_BASE_URL}/checks`, {
        user_id: userId,
        personal_data: {
          full_name: personalData.fullName,
          date_of_birth: personalData.dateOfBirth,
          social_security_number: personalData.socialSecurityNumber,
          address: personalData.address,
          phone_number: personalData.phoneNumber,
          email: personalData.email
        },
        check_types: personalData.checkTypes || ['criminal', 'identity', 'employment'],
        consent: true,
        callback_url: process.env.BACKGROUND_CHECK_CALLBACK_URL
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        checkId: response.data.check_id,
        status: response.data.status,
        estimatedCompletionTime: response.data.estimated_completion_time,
        message: 'Verificação de antecedentes iniciada com sucesso'
      };
    } catch (error) {
      console.error('Error initiating background check:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Verificar status da verificação
  getCheckStatus: async (checkId) => {
    try {
      const response = await axios.get(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return {
        success: true,
        checkId: response.data.check_id,
        status: response.data.status,
        progress: response.data.progress,
        results: response.data.results,
        completedAt: response.data.completed_at,
        expiresAt: response.data.expires_at
      };
    } catch (error) {
      console.error('Error getting check status:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Obter relatório completo
  getCheckReport: async (checkId) => {
    try {
      const response = await axios.get(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/report`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return {
        success: true,
        checkId: response.data.check_id,
        report: response.data.report,
        summary: response.data.summary,
        riskLevel: response.data.risk_level,
        recommendations: response.data.recommendations,
        generatedAt: response.data.generated_at
      };
    } catch (error) {
      console.error('Error getting check report:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Listar verificações de um usuário
  getUserChecks: async (userId, limit = 10, offset = 0) => {
    try {
      const response = await axios.get(`${BACKGROUND_CHECK_API_BASE_URL}/users/${userId}/checks`, {
        params: { limit, offset },
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return {
        success: true,
        checks: response.data.checks,
        total: response.data.total,
        hasMore: response.data.has_more
      };
    } catch (error) {
      console.error('Error getting user checks:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Cancelar verificação
  cancelCheck: async (checkId) => {
    try {
      const response = await axios.post(`${BACKGROUND_CHECK_API_BASE_URL}/checks/${checkId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return {
        success: true,
        checkId: response.data.check_id,
        status: response.data.status,
        message: 'Verificação cancelada com sucesso'
      };
    } catch (error) {
      console.error('Error canceling check:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Verificar elegibilidade para voluntariado
  checkVolunteerEligibility: async (checkId) => {
    try {
      const statusResult = await backgroundCheckService.getCheckStatus(checkId);
      
      if (!statusResult.success) {
        return statusResult;
      }

      if (statusResult.status !== 'completed') {
        return {
          success: true,
          eligible: null,
          status: statusResult.status,
          message: 'Verificação ainda em andamento'
        };
      }

      const reportResult = await backgroundCheckService.getCheckReport(checkId);
      
      if (!reportResult.success) {
        return reportResult;
      }

      // Lógica de elegibilidade baseada no relatório
      const isEligible = backgroundCheckService.evaluateEligibility(reportResult.report);
      
      return {
        success: true,
        eligible: isEligible.eligible,
        riskLevel: isEligible.riskLevel,
        reasons: isEligible.reasons,
        recommendations: isEligible.recommendations,
        checkId: checkId
      };
    } catch (error) {
      console.error('Error checking volunteer eligibility:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Avaliar elegibilidade baseada no relatório
  evaluateEligibility: (report) => {
    const reasons = [];
    let riskLevel = 'low';
    let eligible = true;

    // Verificar registros criminais
    if (report.criminal_records && report.criminal_records.length > 0) {
      const violentCrimes = report.criminal_records.filter(record => 
        record.category === 'violent' || record.severity === 'felony'
      );
      
      if (violentCrimes.length > 0) {
        eligible = false;
        riskLevel = 'high';
        reasons.push('Registros criminais violentos encontrados');
      } else {
        riskLevel = 'medium';
        reasons.push('Registros criminais não violentos encontrados');
      }
    }

    // Verificar verificação de identidade
    if (report.identity_verification && !report.identity_verification.verified) {
      eligible = false;
      riskLevel = 'high';
      reasons.push('Identidade não verificada');
    }

    // Verificar histórico de emprego
    if (report.employment_history) {
      const gaps = report.employment_history.gaps;
      if (gaps && gaps.length > 0) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
        reasons.push('Gaps significativos no histórico de emprego');
      }
    }

    // Verificar referências
    if (report.references) {
      const negativeReferences = report.references.filter(ref => 
        ref.rating === 'negative' || ref.rating === 'poor'
      );
      
      if (negativeReferences.length > 0) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
        reasons.push('Referências negativas encontradas');
      }
    }

    const recommendations = [];
    
    if (eligible) {
      if (riskLevel === 'medium') {
        recommendations.push('Considerar supervisão adicional');
        recommendations.push('Revisar periodicamente');
      }
    } else {
      recommendations.push('Não aprovar para voluntariado');
      recommendations.push('Considerar outras formas de contribuição');
    }

    return {
      eligible,
      riskLevel,
      reasons,
      recommendations
    };
  },

  // Obter estatísticas de verificações
  getCheckStats: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(`${BACKGROUND_CHECK_API_BASE_URL}/stats`, {
        params,
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return {
        success: true,
        stats: response.data
      };
    } catch (error) {
      console.error('Error getting check stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  },

  // Processar webhook de atualização de status
  processStatusUpdate: async (webhookData) => {
    try {
      const { check_id, status, results } = webhookData;
      
      // Aqui você implementaria a lógica para processar a atualização
      // Por exemplo, notificar o usuário, atualizar o banco de dados, etc.
      
      console.log(`Background check ${check_id} status updated to ${status}`);
      
      return {
        success: true,
        message: 'Status update processed successfully'
      };
    } catch (error) {
      console.error('Error processing status update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = backgroundCheckService;