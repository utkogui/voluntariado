const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de backup de atividades
 */
class ActivityBackupService {
  
  /**
   * Criar backup automático da atividade
   * @param {string} activityId - ID da atividade
   * @param {string} backupType - Tipo do backup
   * @param {Object} reason - Motivo do backup
   * @returns {Object} Resultado da operação
   */
  static async createAutomaticBackup(activityId, backupType, reason = null) {
    try {
      // Obter dados completos da atividade
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          participants: {
            include: {
              user: {
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
          },
          confirmations: {
            include: {
              user: {
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
          },
          materials: true,
          requirements: true,
          evaluations: {
            include: {
              evaluator: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              },
              evaluated: {
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
          },
          cancellations: {
            include: {
              cancelledByUser: {
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
          },
          reschedules: {
            include: {
              rescheduledByUser: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              },
              approvedByUser: {
                select: {
                  id: true,
                  email: true,
                  userType: true,
                  volunteer: { select: { firstName: true, lastName: true } },
                  institution: { select: { name: true } },
                  company: { select: { name: true } },
                  university: { select: { name: true } }
                }
              },
              rejectedByUser: {
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
          },
          changeNotifications: true,
          createdBy: {
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

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Preparar dados do backup
      const backupData = {
        activity: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          type: activity.type,
          status: activity.status,
          maxParticipants: activity.maxParticipants,
          currentParticipants: activity.currentParticipants,
          isRecurring: activity.isRecurring,
          recurrenceRule: activity.recurrenceRule,
          address: activity.address,
          city: activity.city,
          state: activity.state,
          zipCode: activity.zipCode,
          country: activity.country,
          latitude: activity.latitude,
          longitude: activity.longitude,
          isOnline: activity.isOnline,
          meetingUrl: activity.meetingUrl,
          startDate: activity.startDate,
          endDate: activity.endDate,
          timezone: activity.timezone,
          opportunityId: activity.opportunityId,
          createdById: activity.createdById,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        },
        participants: activity.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          role: p.role,
          status: p.status,
          registeredAt: p.registeredAt,
          user: p.user
        })),
        confirmations: activity.confirmations.map(c => ({
          id: c.id,
          userId: c.userId,
          status: c.status,
          confirmedAt: c.confirmedAt,
          notes: c.notes,
          user: c.user
        })),
        materials: activity.materials,
        requirements: activity.requirements,
        evaluations: activity.evaluations.map(e => ({
          id: e.id,
          evaluatorId: e.evaluatorId,
          evaluatedId: e.evaluatedId,
          rating: e.rating,
          comment: e.comment,
          createdAt: e.createdAt,
          evaluator: e.evaluator,
          evaluated: e.evaluated
        })),
        cancellations: activity.cancellations.map(c => ({
          id: c.id,
          cancelledBy: c.cancelledBy,
          reason: c.reason,
          reasonCode: c.reasonCode,
          details: c.details,
          refundRequired: c.refundRequired,
          refundAmount: c.refundAmount,
          refundStatus: c.refundStatus,
          createdAt: c.createdAt,
          cancelledByUser: c.cancelledByUser
        })),
        reschedules: activity.reschedules.map(r => ({
          id: r.id,
          rescheduledBy: r.rescheduledBy,
          reason: r.reason,
          reasonCode: r.reasonCode,
          details: r.details,
          originalStartDate: r.originalStartDate,
          originalEndDate: r.originalEndDate,
          newStartDate: r.newStartDate,
          newEndDate: r.newEndDate,
          status: r.status,
          approvedBy: r.approvedBy,
          approvedAt: r.approvedAt,
          rejectedBy: r.rejectedBy,
          rejectedAt: r.rejectedAt,
          rejectionReason: r.rejectionReason,
          createdAt: r.createdAt,
          rescheduledByUser: r.rescheduledByUser,
          approvedByUser: r.approvedByUser,
          rejectedByUser: r.rejectedByUser
        })),
        changeNotifications: activity.changeNotifications,
        createdBy: activity.createdBy,
        backupMetadata: {
          backupType,
          backupReason: reason,
          backupDate: new Date().toISOString(),
          version: '1.0'
        }
      };

      // Criar registro de backup
      const backup = await prisma.activityBackup.create({
        data: {
          activityId,
          backupType,
          backupData,
          reason: reason || `Backup automático antes de ${backupType.toLowerCase().replace('_', ' ')}`
        }
      });

      return {
        success: true,
        data: backup
      };

    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Criar backup manual da atividade
   * @param {string} activityId - ID da atividade
   * @param {string} createdBy - ID do usuário que está criando o backup
   * @param {Object} backupData - Dados do backup
   * @returns {Object} Resultado da operação
   */
  static async createManualBackup(activityId, createdBy, backupData) {
    try {
      const {
        backupType = 'AUTOMATIC_BACKUP',
        reason = 'Backup manual',
        customData = null
      } = backupData;

      // Verificar se a atividade existe
      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (!activity) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      // Se dados customizados foram fornecidos, usar eles
      let finalBackupData;
      if (customData) {
        finalBackupData = {
          ...customData,
          backupMetadata: {
            backupType,
            backupReason: reason,
            backupDate: new Date().toISOString(),
            createdBy,
            version: '1.0',
            isManual: true
          }
        };
      } else {
        // Criar backup automático com dados completos
        const autoBackup = await this.createAutomaticBackup(activityId, backupType, reason);
        if (!autoBackup.success) {
          return autoBackup;
        }
        finalBackupData = autoBackup.data.backupData;
      }

      // Criar registro de backup
      const backup = await prisma.activityBackup.create({
        data: {
          activityId,
          backupType,
          backupData: finalBackupData,
          reason: `Backup manual: ${reason}`
        }
      });

      return {
        success: true,
        data: backup
      };

    } catch (error) {
      console.error('Erro ao criar backup manual:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restaurar atividade a partir de backup
   * @param {string} backupId - ID do backup
   * @param {string} restoredBy - ID do usuário que está restaurando
   * @param {Object} restoreOptions - Opções de restauração
   * @returns {Object} Resultado da operação
   */
  static async restoreFromBackup(backupId, restoredBy, restoreOptions = {}) {
    try {
      const {
        restoreParticipants = true,
        restoreConfirmations = true,
        restoreMaterials = true,
        restoreRequirements = true,
        restoreEvaluations = false, // Por padrão, não restaurar avaliações
        createNewActivity = false
      } = restoreOptions;

      // Obter backup
      const backup = await prisma.activityBackup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        return {
          success: false,
          error: 'Backup não encontrado'
        };
      }

      const backupData = backup.backupData;
      const activityData = backupData.activity;

      let activityId = activityData.id;

      // Se deve criar nova atividade
      if (createNewActivity) {
        // Criar nova atividade com dados do backup
        const newActivity = await prisma.activity.create({
          data: {
            title: `${activityData.title} (Restaurada)`,
            description: activityData.description,
            type: activityData.type,
            status: 'SCHEDULED',
            maxParticipants: activityData.maxParticipants,
            currentParticipants: 0, // Resetar participantes
            isRecurring: activityData.isRecurring,
            recurrenceRule: activityData.recurrenceRule,
            address: activityData.address,
            city: activityData.city,
            state: activityData.state,
            zipCode: activityData.zipCode,
            country: activityData.country,
            latitude: activityData.latitude,
            longitude: activityData.longitude,
            isOnline: activityData.isOnline,
            meetingUrl: activityData.meetingUrl,
            startDate: activityData.startDate,
            endDate: activityData.endDate,
            timezone: activityData.timezone,
            opportunityId: activityData.opportunityId,
            createdById: restoredBy
          }
        });

        activityId = newActivity.id;
      } else {
        // Verificar se a atividade original ainda existe
        const existingActivity = await prisma.activity.findUnique({
          where: { id: activityData.id }
        });

        if (!existingActivity) {
          return {
            success: false,
            error: 'Atividade original não existe mais'
          };
        }

        // Atualizar atividade existente
        await prisma.activity.update({
          where: { id: activityData.id },
          data: {
            title: activityData.title,
            description: activityData.description,
            type: activityData.type,
            status: 'SCHEDULED',
            maxParticipants: activityData.maxParticipants,
            isRecurring: activityData.isRecurring,
            recurrenceRule: activityData.recurrenceRule,
            address: activityData.address,
            city: activityData.city,
            state: activityData.state,
            zipCode: activityData.zipCode,
            country: activityData.country,
            latitude: activityData.latitude,
            longitude: activityData.longitude,
            isOnline: activityData.isOnline,
            meetingUrl: activityData.meetingUrl,
            startDate: activityData.startDate,
            endDate: activityData.endDate,
            timezone: activityData.timezone,
            updatedAt: new Date()
          }
        });
      }

      // Restaurar participantes
      if (restoreParticipants && backupData.participants) {
        // Remover participantes existentes
        await prisma.activityParticipant.deleteMany({
          where: { activityId }
        });

        // Adicionar participantes do backup
        for (const participant of backupData.participants) {
          await prisma.activityParticipant.create({
            data: {
              activityId,
              userId: participant.userId,
              role: participant.role,
              status: 'REGISTERED' // Resetar status
            }
          });
        }
      }

      // Restaurar confirmações
      if (restoreConfirmations && backupData.confirmations) {
        // Remover confirmações existentes
        await prisma.activityConfirmation.deleteMany({
          where: { activityId }
        });

        // Adicionar confirmações do backup
        for (const confirmation of backupData.confirmations) {
          await prisma.activityConfirmation.create({
            data: {
              activityId,
              userId: confirmation.userId,
              status: 'PENDING', // Resetar status
              notes: confirmation.notes
            }
          });
        }
      }

      // Restaurar materiais
      if (restoreMaterials && backupData.materials) {
        // Remover materiais existentes
        await prisma.activityMaterial.deleteMany({
          where: { activityId }
        });

        // Adicionar materiais do backup
        for (const material of backupData.materials) {
          await prisma.activityMaterial.create({
            data: {
              activityId,
              name: material.name,
              description: material.description,
              quantity: material.quantity,
              unit: material.unit,
              isRequired: material.isRequired,
              providedBy: material.providedBy
            }
          });
        }
      }

      // Restaurar requisitos
      if (restoreRequirements && backupData.requirements) {
        // Remover requisitos existentes
        await prisma.activityRequirement.deleteMany({
          where: { activityId }
        });

        // Adicionar requisitos do backup
        for (const requirement of backupData.requirements) {
          await prisma.activityRequirement.create({
            data: {
              activityId,
              title: requirement.title,
              description: requirement.description,
              requirementType: requirement.requirementType,
              isRequired: requirement.isRequired,
              priority: requirement.priority,
              validationRules: requirement.validationRules,
              minValue: requirement.minValue,
              maxValue: requirement.maxValue,
              allowedValues: requirement.allowedValues
            }
          });
        }
      }

      // Restaurar avaliações (opcional)
      if (restoreEvaluations && backupData.evaluations) {
        // Remover avaliações existentes
        await prisma.activityEvaluation.deleteMany({
          where: { activityId }
        });

        // Adicionar avaliações do backup
        for (const evaluation of backupData.evaluations) {
          await prisma.activityEvaluation.create({
            data: {
              activityId,
              evaluatorId: evaluation.evaluatorId,
              evaluatedId: evaluation.evaluatedId,
              rating: evaluation.rating,
              comment: evaluation.comment
            }
          });
        }
      }

      return {
        success: true,
        data: {
          activityId,
          restoredAt: new Date(),
          restoredBy,
          restoreOptions
        }
      };

    } catch (error) {
      console.error('Erro ao restaurar do backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter histórico de backups da atividade
   * @param {string} activityId - ID da atividade
   * @returns {Object} Histórico de backups
   */
  static async getActivityBackupHistory(activityId) {
    try {
      const backups = await prisma.activityBackup.findMany({
        where: { activityId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: backups
      };

    } catch (error) {
      console.error('Erro ao obter histórico de backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter backup específico
   * @param {string} backupId - ID do backup
   * @returns {Object} Dados do backup
   */
  static async getBackup(backupId) {
    try {
      const backup = await prisma.activityBackup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        return {
          success: false,
          error: 'Backup não encontrado'
        };
      }

      return {
        success: true,
        data: backup
      };

    } catch (error) {
      console.error('Erro ao obter backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Excluir backup
   * @param {string} backupId - ID do backup
   * @param {string} deletedBy - ID do usuário que está excluindo
   * @returns {Object} Resultado da operação
   */
  static async deleteBackup(backupId, deletedBy) {
    try {
      const backup = await prisma.activityBackup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        return {
          success: false,
          error: 'Backup não encontrado'
        };
      }

      await prisma.activityBackup.delete({
        where: { id: backupId }
      });

      return {
        success: true,
        data: {
          deletedAt: new Date(),
          deletedBy
        }
      };

    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de backups
   * @param {string} activityId - ID da atividade
   * @returns {Object} Estatísticas
   */
  static async getBackupStats(activityId) {
    try {
      const [
        totalBackups,
        byBackupType,
        recentBackups
      ] = await Promise.all([
        prisma.activityBackup.count({
          where: { activityId }
        }),
        prisma.activityBackup.groupBy({
          by: ['backupType'],
          where: { activityId },
          _count: { backupType: true }
        }),
        prisma.activityBackup.findMany({
          where: { activityId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return {
        success: true,
        data: {
          totalBackups,
          byBackupType: byBackupType.map(item => ({
            backupType: item.backupType,
            count: item._count.backupType
          })),
          recentBackups
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ActivityBackupService;
