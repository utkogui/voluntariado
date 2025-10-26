const express = require('express');
const documentationVersioning = require('../services/documentationVersioning');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Initialize versioning system
router.post('/initialize', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    await documentationVersioning.initialize();
    
    res.json({
      success: true,
      message: 'Documentation versioning system initialized'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize versioning system',
      details: error.message
    });
  }
});

// Create new version
router.post('/create', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version, description, changes = [] } = req.body;
    
    if (!version || !description) {
      return res.status(400).json({
        success: false,
        error: 'Version and description are required'
      });
    }
    
    const versionMetadata = await documentationVersioning.createVersion(version, description, changes);
    
    res.json({
      success: true,
      message: `Documentation version ${version} created successfully`,
      data: versionMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create version',
      details: error.message
    });
  }
});

// Get all versions
router.get('/versions', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const versions = documentationVersioning.getAllVersions();
    
    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get versions',
      details: error.message
    });
  }
});

// Get specific version
router.get('/versions/:version', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { version } = req.params;
    const versionData = documentationVersioning.getVersion(version);
    
    if (!versionData) {
      return res.status(404).json({
        success: false,
        error: `Version ${version} not found`
      });
    }
    
    res.json({
      success: true,
      data: versionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get version',
      details: error.message
    });
  }
});

// Get current version
router.get('/current', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const currentVersion = documentationVersioning.getCurrentVersion();
    
    res.json({
      success: true,
      data: {
        version: currentVersion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get current version',
      details: error.message
    });
  }
});

// Switch to specific version
router.post('/switch/:version', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version } = req.params;
    const versionMetadata = await documentationVersioning.switchToVersion(version);
    
    res.json({
      success: true,
      message: `Switched to documentation version ${version}`,
      data: versionMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to switch version',
      details: error.message
    });
  }
});

// Create diff between versions
router.get('/diff/:version1/:version2', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version1, version2 } = req.params;
    const diff = await documentationVersioning.createDiff(version1, version2);
    
    res.json({
      success: true,
      data: diff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create diff',
      details: error.message
    });
  }
});

// Export version
router.get('/export/:version', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version } = req.params;
    const { format = 'zip' } = req.query;
    
    const exportPath = await documentationVersioning.exportVersion(version, format);
    
    res.json({
      success: true,
      message: `Version ${version} exported successfully`,
      data: {
        path: exportPath,
        format: format
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export version',
      details: error.message
    });
  }
});

// Download exported version
router.get('/download/:version', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { version } = req.params;
    const { format = 'zip' } = req.query;
    
    const fs = require('fs');
    const path = require('path');
    
    const exportPath = path.join(__dirname, '..', 'docs', 'exports', `${version}.${format}`);
    
    if (fs.existsSync(exportPath)) {
      res.download(exportPath, `documentation-${version}.${format}`);
    } else {
      res.status(404).json({
        success: false,
        error: 'Export file not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to download version',
      details: error.message
    });
  }
});

// Import version
router.post('/import', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version, archivePath } = req.body;
    
    if (!version || !archivePath) {
      return res.status(400).json({
        success: false,
        error: 'Version and archive path are required'
      });
    }
    
    const versionMetadata = await documentationVersioning.importVersion(archivePath, version);
    
    res.json({
      success: true,
      message: `Version ${version} imported successfully`,
      data: versionMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to import version',
      details: error.message
    });
  }
});

// Get version statistics
router.get('/stats', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const stats = documentationVersioning.getVersionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get version statistics',
      details: error.message
    });
  }
});

// Clean up old versions
router.post('/cleanup', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { keepVersions = 10 } = req.body;
    
    const deletedCount = await documentationVersioning.cleanupVersions(keepVersions);
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old versions`,
      data: {
        deletedCount: deletedCount,
        keepVersions: keepVersions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup versions',
      details: error.message
    });
  }
});

// Compare versions
router.get('/compare/:version1/:version2', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version1, version2 } = req.params;
    
    const version1Data = documentationVersioning.getVersion(version1);
    const version2Data = documentationVersioning.getVersion(version2);
    
    if (!version1Data || !version2Data) {
      return res.status(404).json({
        success: false,
        error: 'One or both versions not found'
      });
    }
    
    const diff = await documentationVersioning.createDiff(version1, version2);
    
    res.json({
      success: true,
      data: {
        version1: version1Data,
        version2: version2Data,
        diff: diff
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to compare versions',
      details: error.message
    });
  }
});

// Get version history
router.get('/history', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const historyPath = path.join(__dirname, '..', 'docs', 'version-history.json');
    
    if (fs.existsSync(historyPath)) {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      
      res.json({
        success: true,
        data: history
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Version history not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get version history',
      details: error.message
    });
  }
});

// Restore version
router.post('/restore/:version', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { version } = req.params;
    
    // This is essentially the same as switching to a version
    const versionMetadata = await documentationVersioning.switchToVersion(version);
    
    res.json({
      success: true,
      message: `Documentation restored to version ${version}`,
      data: versionMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to restore version',
      details: error.message
    });
  }
});

// Get version files
router.get('/versions/:version/files', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { version } = req.params;
    const versionData = documentationVersioning.getVersion(version);
    
    if (!versionData) {
      return res.status(404).json({
        success: false,
        error: `Version ${version} not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        version: version,
        files: versionData.files || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get version files',
      details: error.message
    });
  }
});

// Validate version format
router.post('/validate', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const { version } = req.body;
    
    if (!version) {
      return res.status(400).json({
        success: false,
        error: 'Version is required'
      });
    }
    
    const isValid = documentationVersioning.isValidVersion(version);
    const exists = documentationVersioning.versionExists(version);
    
    res.json({
      success: true,
      data: {
        version: version,
        isValid: isValid,
        exists: exists,
        canCreate: isValid && !exists
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate version',
      details: error.message
    });
  }
});

module.exports = router;
