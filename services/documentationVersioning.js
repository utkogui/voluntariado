const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DocumentationVersioning {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'docs');
    this.versionsDir = path.join(this.docsDir, 'versions');
    this.currentVersion = '1.0.0';
    this.versionHistory = [];
  }

  // Initialize versioning system
  async initialize() {
    try {
      // Create versions directory if it doesn't exist
      if (!fs.existsSync(this.versionsDir)) {
        fs.mkdirSync(this.versionsDir, { recursive: true });
      }

      // Create version history file if it doesn't exist
      const historyPath = path.join(this.docsDir, 'version-history.json');
      if (!fs.existsSync(historyPath)) {
        const initialHistory = {
          versions: [],
          currentVersion: this.currentVersion,
          lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(historyPath, JSON.stringify(initialHistory, null, 2));
      }

      // Load existing version history
      this.versionHistory = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      
      console.log('Documentation versioning system initialized');
    } catch (error) {
      console.error('Error initializing versioning system:', error);
      throw error;
    }
  }

  // Create a new version of documentation
  async createVersion(version, description, changes = []) {
    try {
      console.log(`Creating documentation version ${version}...`);
      
      // Validate version format
      if (!this.isValidVersion(version)) {
        throw new Error('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
      }

      // Check if version already exists
      if (this.versionExists(version)) {
        throw new Error(`Version ${version} already exists`);
      }

      // Create version directory
      const versionDir = path.join(this.versionsDir, version);
      if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
      }

      // Copy current documentation to version directory
      await this.copyDocumentationToVersion(versionDir);

      // Create version metadata
      const versionMetadata = {
        version: version,
        description: description,
        changes: changes,
        createdAt: new Date().toISOString(),
        createdBy: process.env.USER || 'system',
        gitCommit: await this.getCurrentGitCommit(),
        files: await this.getDocumentationFiles(versionDir)
      };

      // Save version metadata
      const metadataPath = path.join(versionDir, 'version-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(versionMetadata, null, 2));

      // Update version history
      this.versionHistory.versions.push(versionMetadata);
      this.versionHistory.currentVersion = version;
      this.versionHistory.lastUpdated = new Date().toISOString();

      // Save updated history
      const historyPath = path.join(this.docsDir, 'version-history.json');
      fs.writeFileSync(historyPath, JSON.stringify(this.versionHistory, null, 2));

      console.log(`Documentation version ${version} created successfully`);
      return versionMetadata;
    } catch (error) {
      console.error(`Error creating version ${version}:`, error);
      throw error;
    }
  }

  // Copy current documentation to version directory
  async copyDocumentationToVersion(versionDir) {
    try {
      const filesToCopy = [
        'api-documentation.md',
        'architecture-design.md',
        'user-guide-volunteer.md',
        'user-guide-institution.md',
        'admin-guide.md',
        'deployment-guide.md',
        'maintenance-guide.md',
        'troubleshooting-guide.md',
        'testing-guide.md',
        'quality-standards.md',
        'security-privacy.md',
        'swagger-annotations.js',
        'api-generated.json',
        'database-schema.json',
        'deployment-info.json',
        'comprehensive-docs.json',
        'auto-generated.md'
      ];

      for (const file of filesToCopy) {
        const sourcePath = path.join(this.docsDir, file);
        const destPath = path.join(versionDir, file);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      }

      // Copy entire docs directory structure
      await this.copyDirectory(this.docsDir, versionDir, ['versions']);
    } catch (error) {
      console.error('Error copying documentation:', error);
      throw error;
    }
  }

  // Copy directory recursively
  async copyDirectory(src, dest, exclude = []) {
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (exclude.includes(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.copyDirectory(srcPath, destPath, exclude);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    } catch (error) {
      console.error('Error copying directory:', error);
      throw error;
    }
  }

  // Get current git commit hash
  async getCurrentGitCommit() {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  // Get list of documentation files in version directory
  async getDocumentationFiles(versionDir) {
    try {
      const files = [];
      const entries = fs.readdirSync(versionDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(versionDir, entry.name);
          const stats = fs.statSync(filePath);
          files.push({
            name: entry.name,
            size: stats.size,
            modified: stats.mtime.toISOString()
          });
        }
      }
      
      return files;
    } catch (error) {
      console.error('Error getting documentation files:', error);
      return [];
    }
  }

  // Check if version exists
  versionExists(version) {
    return this.versionHistory.versions.some(v => v.version === version);
  }

  // Validate version format (semantic versioning)
  isValidVersion(version) {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  // Get version information
  getVersion(version) {
    return this.versionHistory.versions.find(v => v.version === version);
  }

  // Get all versions
  getAllVersions() {
    return this.versionHistory.versions.sort((a, b) => {
      return this.compareVersions(b.version, a.version); // Sort descending
    });
  }

  // Compare two versions
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  // Get current version
  getCurrentVersion() {
    return this.versionHistory.currentVersion;
  }

  // Switch to a specific version
  async switchToVersion(version) {
    try {
      console.log(`Switching to documentation version ${version}...`);
      
      if (!this.versionExists(version)) {
        throw new Error(`Version ${version} does not exist`);
      }

      const versionDir = path.join(this.versionsDir, version);
      const versionMetadata = this.getVersion(version);
      
      if (!fs.existsSync(versionDir)) {
        throw new Error(`Version directory for ${version} does not exist`);
      }

      // Backup current documentation
      const backupDir = path.join(this.docsDir, 'backup', new Date().toISOString());
      fs.mkdirSync(backupDir, { recursive: true });
      await this.copyDirectory(this.docsDir, backupDir, ['versions', 'backup']);

      // Copy version documentation to current docs directory
      await this.copyDirectory(versionDir, this.docsDir, ['version-metadata.json']);

      // Update current version in history
      this.versionHistory.currentVersion = version;
      this.versionHistory.lastUpdated = new Date().toISOString();

      // Save updated history
      const historyPath = path.join(this.docsDir, 'version-history.json');
      fs.writeFileSync(historyPath, JSON.stringify(this.versionHistory, null, 2));

      console.log(`Switched to documentation version ${version}`);
      return versionMetadata;
    } catch (error) {
      console.error(`Error switching to version ${version}:`, error);
      throw error;
    }
  }

  // Create a diff between two versions
  async createDiff(version1, version2) {
    try {
      console.log(`Creating diff between versions ${version1} and ${version2}...`);
      
      if (!this.versionExists(version1) || !this.versionExists(version2)) {
        throw new Error('One or both versions do not exist');
      }

      const version1Dir = path.join(this.versionsDir, version1);
      const version2Dir = path.join(this.versionsDir, version2);
      
      const diff = {
        version1: version1,
        version2: version2,
        createdAt: new Date().toISOString(),
        changes: []
      };

      // Get files from both versions
      const files1 = await this.getDocumentationFiles(version1Dir);
      const files2 = await this.getDocumentationFiles(version2Dir);
      
      // Find added files
      const addedFiles = files2.filter(f2 => !files1.some(f1 => f1.name === f2.name));
      diff.changes.push(...addedFiles.map(file => ({
        type: 'added',
        file: file.name,
        size: file.size
      })));

      // Find removed files
      const removedFiles = files1.filter(f1 => !files2.some(f2 => f2.name === f1.name));
      diff.changes.push(...removedFiles.map(file => ({
        type: 'removed',
        file: file.name,
        size: file.size
      })));

      // Find modified files
      const modifiedFiles = files1.filter(f1 => {
        const f2 = files2.find(f => f.name === f1.name);
        return f2 && f1.size !== f2.size;
      });
      diff.changes.push(...modifiedFiles.map(file => ({
        type: 'modified',
        file: file.name,
        oldSize: file.size,
        newSize: files2.find(f => f.name === file.name).size
      })));

      return diff;
    } catch (error) {
      console.error('Error creating diff:', error);
      throw error;
    }
  }

  // Export version to archive
  async exportVersion(version, format = 'zip') {
    try {
      console.log(`Exporting version ${version} as ${format}...`);
      
      if (!this.versionExists(version)) {
        throw new Error(`Version ${version} does not exist`);
      }

      const versionDir = path.join(this.versionsDir, version);
      const exportPath = path.join(this.docsDir, 'exports', `${version}.${format}`);
      
      // Create exports directory if it doesn't exist
      const exportsDir = path.dirname(exportPath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      if (format === 'zip') {
        const archiver = require('archiver');
        const output = fs.createWriteStream(exportPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
          console.log(`Version ${version} exported to ${exportPath}`);
        });
        
        archive.pipe(output);
        archive.directory(versionDir, false);
        await archive.finalize();
      } else if (format === 'tar') {
        const tar = require('tar');
        await tar.create({
          file: exportPath,
          cwd: this.versionsDir
        }, [version]);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }

      return exportPath;
    } catch (error) {
      console.error(`Error exporting version ${version}:`, error);
      throw error;
    }
  }

  // Import version from archive
  async importVersion(archivePath, version) {
    try {
      console.log(`Importing version ${version} from ${archivePath}...`);
      
      if (!fs.existsSync(archivePath)) {
        throw new Error(`Archive file ${archivePath} does not exist`);
      }

      if (this.versionExists(version)) {
        throw new Error(`Version ${version} already exists`);
      }

      const versionDir = path.join(this.versionsDir, version);
      fs.mkdirSync(versionDir, { recursive: true });

      const ext = path.extname(archivePath).toLowerCase();
      
      if (ext === '.zip') {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(archivePath);
        zip.extractAllTo(versionDir, true);
      } else if (ext === '.tar' || ext === '.tar.gz') {
        const tar = require('tar');
        await tar.extract({
          file: archivePath,
          cwd: versionDir
        });
      } else {
        throw new Error(`Unsupported archive format: ${ext}`);
      }

      // Load version metadata
      const metadataPath = path.join(versionDir, 'version-metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        // Add to version history
        this.versionHistory.versions.push(metadata);
        this.versionHistory.lastUpdated = new Date().toISOString();

        // Save updated history
        const historyPath = path.join(this.docsDir, 'version-history.json');
        fs.writeFileSync(historyPath, JSON.stringify(this.versionHistory, null, 2));
      }

      console.log(`Version ${version} imported successfully`);
      return this.getVersion(version);
    } catch (error) {
      console.error(`Error importing version ${version}:`, error);
      throw error;
    }
  }

  // Get version statistics
  getVersionStats() {
    const stats = {
      totalVersions: this.versionHistory.versions.length,
      currentVersion: this.versionHistory.currentVersion,
      lastUpdated: this.versionHistory.lastUpdated,
      versions: this.versionHistory.versions.map(v => ({
        version: v.version,
        createdAt: v.createdAt,
        files: v.files ? v.files.length : 0,
        totalSize: v.files ? v.files.reduce((sum, f) => sum + f.size, 0) : 0
      }))
    };

    return stats;
  }

  // Clean up old versions
  async cleanupVersions(keepVersions = 10) {
    try {
      console.log(`Cleaning up old versions, keeping ${keepVersions} most recent...`);
      
      const versions = this.getAllVersions();
      const versionsToDelete = versions.slice(keepVersions);
      
      for (const version of versionsToDelete) {
        const versionDir = path.join(this.versionsDir, version.version);
        if (fs.existsSync(versionDir)) {
          fs.rmSync(versionDir, { recursive: true, force: true });
        }
        
        // Remove from history
        this.versionHistory.versions = this.versionHistory.versions.filter(
          v => v.version !== version.version
        );
      }

      // Save updated history
      const historyPath = path.join(this.docsDir, 'version-history.json');
      fs.writeFileSync(historyPath, JSON.stringify(this.versionHistory, null, 2));

      console.log(`Cleaned up ${versionsToDelete.length} old versions`);
      return versionsToDelete.length;
    } catch (error) {
      console.error('Error cleaning up versions:', error);
      throw error;
    }
  }
}

// Create singleton instance
const docVersioning = new DocumentationVersioning();

module.exports = docVersioning;
