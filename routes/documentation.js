const express = require('express');
const documentationGenerator = require('../services/documentationGenerator');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate API documentation
router.post('/generate/api', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const apiDocs = await documentationGenerator.generateAPIDocs();
    
    res.json({
      success: true,
      message: 'API documentation generated successfully',
      data: apiDocs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate API documentation',
      details: error.message
    });
  }
});

// Generate database documentation
router.post('/generate/database', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const dbDocs = await documentationGenerator.generateDatabaseDocs();
    
    res.json({
      success: true,
      message: 'Database documentation generated successfully',
      data: dbDocs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate database documentation',
      details: error.message
  });
  }
});

// Generate deployment documentation
router.post('/generate/deployment', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const deploymentDocs = await documentationGenerator.generateDeploymentDocs();
    
    res.json({
      success: true,
      message: 'Deployment documentation generated successfully',
      data: deploymentDocs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate deployment documentation',
      details: error.message
    });
  }
});

// Generate all documentation
router.post('/generate/all', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const allDocs = await documentationGenerator.generateAllDocs();
    
    res.json({
      success: true,
      message: 'All documentation generated successfully',
      data: allDocs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate all documentation',
      details: error.message
    });
  }
});

// Generate markdown documentation
router.post('/generate/markdown', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const markdownDocs = await documentationGenerator.generateMarkdownDocs();
    
    res.json({
      success: true,
      message: 'Markdown documentation generated successfully',
      data: {
        content: markdownDocs,
        length: markdownDocs.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate markdown documentation',
      details: error.message
    });
  }
});

// Get generated documentation
router.get('/api', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiDocPath = path.join(__dirname, '..', 'docs', 'api-generated.json');
    
    if (fs.existsSync(apiDocPath)) {
      const apiDoc = JSON.parse(fs.readFileSync(apiDocPath, 'utf8'));
      
      res.json({
        success: true,
        data: apiDoc
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'API documentation not found. Please generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to read API documentation',
      details: error.message
    });
  }
});

// Get database documentation
router.get('/database', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const dbDocPath = path.join(__dirname, '..', 'docs', 'database-schema.json');
    
    if (fs.existsSync(dbDocPath)) {
      const dbDoc = JSON.parse(fs.readFileSync(dbDocPath, 'utf8'));
      
      res.json({
        success: true,
        data: dbDoc
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Database documentation not found. Please generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to read database documentation',
      details: error.message
    });
  }
});

// Get deployment documentation
router.get('/deployment', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const deploymentDocPath = path.join(__dirname, '..', 'docs', 'deployment-info.json');
    
    if (fs.existsSync(deploymentDocPath)) {
      const deploymentDoc = JSON.parse(fs.readFileSync(deploymentDocPath, 'utf8'));
      
      res.json({
        success: true,
        data: deploymentDoc
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Deployment documentation not found. Please generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to read deployment documentation',
      details: error.message
    });
  }
});

// Get comprehensive documentation
router.get('/comprehensive', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const comprehensiveDocPath = path.join(__dirname, '..', 'docs', 'comprehensive-docs.json');
    
    if (fs.existsSync(comprehensiveDocPath)) {
      const comprehensiveDoc = JSON.parse(fs.readFileSync(comprehensiveDocPath, 'utf8'));
      
      res.json({
        success: true,
        data: comprehensiveDoc
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Comprehensive documentation not found. Please generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to read comprehensive documentation',
      details: error.message
    });
  }
});

// Get markdown documentation
router.get('/markdown', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const markdownDocPath = path.join(__dirname, '..', 'docs', 'auto-generated.md');
    
    if (fs.existsSync(markdownDocPath)) {
      const markdownDoc = fs.readFileSync(markdownDocPath, 'utf8');
      
      res.json({
        success: true,
        data: {
          content: markdownDoc,
          length: markdownDoc.length
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Markdown documentation not found. Please generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to read markdown documentation',
      details: error.message
    });
  }
});

// Download documentation as file
router.get('/download/:type', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const { type } = req.params;
    const docsDir = path.join(__dirname, '..', 'docs');
    
    let filePath;
    let filename;
    let contentType;
    
    switch (type) {
      case 'api':
        filePath = path.join(docsDir, 'api-generated.json');
        filename = 'api-documentation.json';
        contentType = 'application/json';
        break;
      case 'database':
        filePath = path.join(docsDir, 'database-schema.json');
        filename = 'database-schema.json';
        contentType = 'application/json';
        break;
      case 'deployment':
        filePath = path.join(docsDir, 'deployment-info.json');
        filename = 'deployment-info.json';
        contentType = 'application/json';
        break;
      case 'comprehensive':
        filePath = path.join(docsDir, 'comprehensive-docs.json');
        filename = 'comprehensive-documentation.json';
        contentType = 'application/json';
        break;
      case 'markdown':
        filePath = path.join(docsDir, 'auto-generated.md');
        filename = 'documentation.md';
        contentType = 'text/markdown';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid documentation type'
        });
    }
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        error: 'Documentation file not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to download documentation',
      details: error.message
    });
  }
});

// Schedule automatic documentation generation
router.post('/schedule', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    documentationGenerator.scheduleGeneration();
    
    res.json({
      success: true,
      message: 'Automatic documentation generation scheduled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to schedule automatic documentation generation',
      details: error.message
    });
  }
});

// Get documentation status
router.get('/status', authMiddleware, requireRole(['ADMIN']), (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const docsDir = path.join(__dirname, '..', 'docs');
    const files = [
      'api-generated.json',
      'database-schema.json',
      'deployment-info.json',
      'comprehensive-docs.json',
      'auto-generated.md'
    ];
    
    const status = {
      files: {},
      lastGenerated: null,
      totalSize: 0
    };
    
    for (const file of files) {
      const filePath = path.join(docsDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        status.files[file] = {
          exists: true,
          size: stats.size,
          lastModified: stats.mtime
        };
        status.totalSize += stats.size;
        
        if (!status.lastGenerated || stats.mtime > status.lastGenerated) {
          status.lastGenerated = stats.mtime;
        }
      } else {
        status.files[file] = {
          exists: false,
          size: 0,
          lastModified: null
        };
      }
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get documentation status',
      details: error.message
    });
  }
});

module.exports = router;
