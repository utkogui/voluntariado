const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const config = require('../config/production');

class DatabaseBackupService {
  constructor() {
    this.prisma = new PrismaClient();
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.retentionDays = config.backup.retentionDays;
    this.s3Bucket = config.backup.s3Bucket;
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Create database backup
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `volunteer_app_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);
      
      console.log(`Creating database backup: ${backupFileName}`);
      
      // Create PostgreSQL dump
      const dumpCommand = `pg_dump "${config.database.url}" > "${backupPath}"`;
      
      await new Promise((resolve, reject) => {
        exec(dumpCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Backup creation failed:', error);
            reject(error);
            return;
          }
          if (stderr) {
            console.warn('Backup warnings:', stderr);
          }
          resolve();
        });
      });
      
      // Compress backup
      const compressedPath = `${backupPath}.gz`;
      const compressCommand = `gzip "${backupPath}"`;
      
      await new Promise((resolve, reject) => {
        exec(compressCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Compression failed:', error);
            reject(error);
            return;
          }
          resolve();
        });
      });
      
      console.log(`Backup created and compressed: ${compressedPath}`);
      
      // Upload to S3
      await this.uploadToS3(compressedPath, backupFileName + '.gz');
      
      // Clean up local file
      fs.unlinkSync(compressedPath);
      
      console.log(`Backup ${backupFileName} completed successfully`);
      
      return {
        success: true,
        fileName: backupFileName + '.gz',
        timestamp: new Date().toISOString(),
        size: fs.statSync(compressedPath).size
      };
      
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  // Upload backup to S3
  async uploadToS3(filePath, fileName) {
    try {
      const fileContent = fs.readFileSync(filePath);
      
      const uploadParams = {
        Bucket: this.s3Bucket,
        Key: `backups/${fileName}`,
        Body: fileContent,
        ContentType: 'application/gzip',
        ServerSideEncryption: 'AES256',
        Metadata: {
          'backup-date': new Date().toISOString(),
          'database': 'volunteer_app_production'
        }
      };
      
      const result = await this.s3.upload(uploadParams).promise();
      console.log(`Backup uploaded to S3: ${result.Location}`);
      
      return result;
      
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw error;
    }
  }

  // Restore database from backup
  async restoreBackup(backupFileName) {
    try {
      console.log(`Restoring database from backup: ${backupFileName}`);
      
      // Download from S3
      const localPath = await this.downloadFromS3(backupFileName);
      
      // Decompress if needed
      let restorePath = localPath;
      if (backupFileName.endsWith('.gz')) {
        const decompressCommand = `gunzip "${localPath}"`;
        await new Promise((resolve, reject) => {
          exec(decompressCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('Decompression failed:', error);
              reject(error);
              return;
            }
            resolve();
          });
        });
        restorePath = localPath.replace('.gz', '');
      }
      
      // Restore database
      const restoreCommand = `psql "${config.database.url}" < "${restorePath}"`;
      
      await new Promise((resolve, reject) => {
        exec(restoreCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Restore failed:', error);
            reject(error);
            return;
          }
          if (stderr) {
            console.warn('Restore warnings:', stderr);
          }
          resolve();
        });
      });
      
      // Clean up local files
      if (fs.existsSync(restorePath)) {
        fs.unlinkSync(restorePath);
      }
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      
      console.log(`Database restored successfully from ${backupFileName}`);
      
      return {
        success: true,
        fileName: backupFileName,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  // Download backup from S3
  async downloadFromS3(fileName) {
    try {
      const downloadParams = {
        Bucket: this.s3Bucket,
        Key: `backups/${fileName}`
      };
      
      const result = await this.s3.getObject(downloadParams).promise();
      const localPath = path.join(this.backupDir, fileName);
      
      fs.writeFileSync(localPath, result.Body);
      console.log(`Backup downloaded from S3: ${localPath}`);
      
      return localPath;
      
    } catch (error) {
      console.error('S3 download failed:', error);
      throw error;
    }
  }

  // List available backups
  async listBackups() {
    try {
      const listParams = {
        Bucket: this.s3Bucket,
        Prefix: 'backups/',
        MaxKeys: 100
      };
      
      const result = await this.s3.listObjectsV2(listParams).promise();
      
      const backups = result.Contents.map(obj => ({
        fileName: obj.Key.replace('backups/', ''),
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag
      }));
      
      return backups.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw error;
    }
  }

  // Clean up old backups
  async cleanupOldBackups() {
    try {
      console.log('Cleaning up old backups...');
      
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      const oldBackups = backups.filter(backup => 
        new Date(backup.lastModified) < cutoffDate
      );
      
      for (const backup of oldBackups) {
        try {
          await this.s3.deleteObject({
            Bucket: this.s3Bucket,
            Key: `backups/${backup.fileName}`
          }).promise();
          
          console.log(`Deleted old backup: ${backup.fileName}`);
        } catch (error) {
          console.error(`Failed to delete backup ${backup.fileName}:`, error);
        }
      }
      
      console.log(`Cleaned up ${oldBackups.length} old backups`);
      
      return {
        success: true,
        deletedCount: oldBackups.length,
        cutoffDate: cutoffDate.toISOString()
      };
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  // Schedule automatic backups
  scheduleBackups() {
    const schedule = config.backup.schedule || '0 2 * * *'; // Default: daily at 2 AM
    
    console.log(`Scheduling automatic backups: ${schedule}`);
    
    cron.schedule(schedule, async () => {
      try {
        console.log('Starting scheduled backup...');
        await this.createBackup();
        await this.cleanupOldBackups();
        console.log('Scheduled backup completed successfully');
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    });
    
    console.log('Automatic backups scheduled successfully');
  }

  // Test database connection
  async testConnection() {
    try {
      await this.prisma.$connect();
      console.log('Database connection test successful');
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        LIMIT 10
      `;
      
      const tableCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      return {
        success: true,
        stats,
        tableCount: tableCount[0].count
      };
      
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Close database connection
  async close() {
    await this.prisma.$disconnect();
  }
}

module.exports = DatabaseBackupService;
