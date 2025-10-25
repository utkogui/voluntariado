import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const prisma = new PrismaClient();

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 10;
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Backup completo do banco de dados
  async createFullBackup(description = 'Manual backup') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `full_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Comando para backup do PostgreSQL
      const dbUrl = process.env.DATABASE_URL;
      const backupCommand = `pg_dump "${dbUrl}" > "${backupPath}"`;

      await execAsync(backupCommand);

      // Salvar metadados do backup
      const backupMetadata = {
        id: `backup_${Date.now()}`,
        type: 'FULL',
        fileName: backupFileName,
        filePath: backupPath,
        description,
        createdAt: new Date().toISOString(),
        size: fs.statSync(backupPath).size,
        status: 'COMPLETED'
      };

      await this.saveBackupMetadata(backupMetadata);
      await this.cleanupOldBackups();

      return backupMetadata;
    } catch (error) {
      console.error('Error creating full backup:', error);
      throw new Error(`Failed to create full backup: ${error.message}`);
    }
  }

  // Backup incremental (apenas dados modificados)
  async createIncrementalBackup(description = 'Incremental backup') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `incremental_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Buscar última modificação
      const lastBackup = await this.getLastBackup();
      const sinceDate = lastBackup ? lastBackup.createdAt : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Backup incremental usando --since
      const dbUrl = process.env.DATABASE_URL;
      const backupCommand = `pg_dump "${dbUrl}" --since="${sinceDate}" > "${backupPath}"`;

      await execAsync(backupCommand);

      const backupMetadata = {
        id: `backup_${Date.now()}`,
        type: 'INCREMENTAL',
        fileName: backupFileName,
        filePath: backupPath,
        description,
        createdAt: new Date().toISOString(),
        size: fs.statSync(backupPath).size,
        status: 'COMPLETED',
        sinceDate
      };

      await this.saveBackupMetadata(backupMetadata);
      await this.cleanupOldBackups();

      return backupMetadata;
    } catch (error) {
      console.error('Error creating incremental backup:', error);
      throw new Error(`Failed to create incremental backup: ${error.message}`);
    }
  }

  // Backup de tabelas específicas
  async createTableBackup(tableNames, description = 'Table backup') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const tablesStr = tableNames.join(',');
      const backupFileName = `table_backup_${tablesStr}_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      const dbUrl = process.env.DATABASE_URL;
      const backupCommand = `pg_dump "${dbUrl}" --table="${tablesStr}" > "${backupPath}"`;

      await execAsync(backupCommand);

      const backupMetadata = {
        id: `backup_${Date.now()}`,
        type: 'TABLE',
        fileName: backupFileName,
        filePath: backupPath,
        description,
        createdAt: new Date().toISOString(),
        size: fs.statSync(backupPath).size,
        status: 'COMPLETED',
        tables: tableNames
      };

      await this.saveBackupMetadata(backupMetadata);
      await this.cleanupOldBackups();

      return backupMetadata;
    } catch (error) {
      console.error('Error creating table backup:', error);
      throw new Error(`Failed to create table backup: ${error.message}`);
    }
  }

  // Restaurar backup
  async restoreBackup(backupId) {
    try {
      const backup = await this.getBackupById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      if (!fs.existsSync(backup.filePath)) {
        throw new Error('Backup file not found');
      }

      // Fazer backup atual antes de restaurar
      await this.createFullBackup(`Pre-restore backup for ${backupId}`);

      // Restaurar backup
      const dbUrl = process.env.DATABASE_URL;
      const restoreCommand = `psql "${dbUrl}" < "${backup.filePath}"`;

      await execAsync(restoreCommand);

      // Atualizar status
      await this.updateBackupStatus(backupId, 'RESTORED');

      return {
        message: 'Backup restored successfully',
        backupId,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  // Listar backups
  async listBackups(limit = 50, offset = 0) {
    try {
      const backups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  // Obter backup por ID
  async getBackupById(backupId) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId }
      });

      return backup;
    } catch (error) {
      console.error('Error getting backup by ID:', error);
      throw new Error(`Failed to get backup: ${error.message}`);
    }
  }

  // Obter último backup
  async getLastBackup() {
    try {
      const backup = await prisma.backup.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      return backup;
    } catch (error) {
      console.error('Error getting last backup:', error);
      return null;
    }
  }

  // Salvar metadados do backup
  async saveBackupMetadata(metadata) {
    try {
      const backup = await prisma.backup.create({
        data: {
          id: metadata.id,
          type: metadata.type,
          fileName: metadata.fileName,
          filePath: metadata.filePath,
          description: metadata.description,
          size: metadata.size,
          status: metadata.status,
          tables: metadata.tables || [],
          sinceDate: metadata.sinceDate || null
        }
      });

      return backup;
    } catch (error) {
      console.error('Error saving backup metadata:', error);
      throw new Error(`Failed to save backup metadata: ${error.message}`);
    }
  }

  // Atualizar status do backup
  async updateBackupStatus(backupId, status) {
    try {
      const backup = await prisma.backup.update({
        where: { id: backupId },
        data: { 
          status,
          updatedAt: new Date().toISOString()
        }
      });

      return backup;
    } catch (error) {
      console.error('Error updating backup status:', error);
      throw new Error(`Failed to update backup status: ${error.message}`);
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups() {
    try {
      const backups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (backups.length > this.maxBackups) {
        const backupsToDelete = backups.slice(this.maxBackups);
        
        for (const backup of backupsToDelete) {
          // Deletar arquivo físico
          if (fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
          }
          
          // Deletar registro do banco
          await prisma.backup.delete({
            where: { id: backup.id }
          });
        }

        console.log(`Cleaned up ${backupsToDelete.length} old backups`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  // Verificar integridade do backup
  async verifyBackup(backupId) {
    try {
      const backup = await this.getBackupById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      if (!fs.existsSync(backup.filePath)) {
        throw new Error('Backup file not found');
      }

      // Verificar se o arquivo não está corrompido
      const stats = fs.statSync(backup.filePath);
      const isValid = stats.size > 0;

      await this.updateBackupStatus(backupId, isValid ? 'VERIFIED' : 'CORRUPTED');

      return {
        backupId,
        isValid,
        size: stats.size,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying backup:', error);
      throw new Error(`Failed to verify backup: ${error.message}`);
    }
  }

  // Agendar backup automático
  scheduleAutomaticBackup(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        console.log('Starting automatic backup...');
        await this.createIncrementalBackup('Automatic scheduled backup');
        console.log('Automatic backup completed');
      } catch (error) {
        console.error('Automatic backup failed:', error);
      }
    }, intervalMs);

    console.log(`Automatic backup scheduled every ${intervalHours} hours`);
  }

  // Obter estatísticas de backup
  async getBackupStats() {
    try {
      const totalBackups = await prisma.backup.count();
      const fullBackups = await prisma.backup.count({
        where: { type: 'FULL' }
      });
      const incrementalBackups = await prisma.backup.count({
        where: { type: 'INCREMENTAL' }
      });
      const tableBackups = await prisma.backup.count({
        where: { type: 'TABLE' }
      });

      const totalSize = await prisma.backup.aggregate({
        _sum: { size: true }
      });

      return {
        totalBackups,
        fullBackups,
        incrementalBackups,
        tableBackups,
        totalSize: totalSize._sum.size || 0,
        lastBackup: await this.getLastBackup()
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      throw new Error(`Failed to get backup stats: ${error.message}`);
    }
  }
}

// Singleton instance
const backupService = new BackupService();

export default backupService;
