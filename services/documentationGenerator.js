const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config/production');

class DocumentationGenerator {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'docs');
    this.apiDir = path.join(__dirname, '..', 'routes');
    this.controllersDir = path.join(__dirname, '..', 'controllers');
    this.servicesDir = path.join(__dirname, '..', 'services');
    this.modelsDir = path.join(__dirname, '..', 'models');
  }

  // Generate API documentation from code
  async generateAPIDocs() {
    try {
      console.log('Generating API documentation...');
      
      const routes = await this.scanRoutes();
      const controllers = await this.scanControllers();
      const services = await this.scanServices();
      
      const apiDoc = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        routes: routes,
        controllers: controllers,
        services: services
      };
      
      const outputPath = path.join(this.docsDir, 'api-generated.json');
      fs.writeFileSync(outputPath, JSON.stringify(apiDoc, null, 2));
      
      console.log('API documentation generated successfully');
      return apiDoc;
    } catch (error) {
      console.error('Error generating API docs:', error);
      throw error;
    }
  }

  // Scan routes directory
  async scanRoutes() {
    const routes = [];
    const routeFiles = fs.readdirSync(this.apiDir);
    
    for (const file of routeFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(this.apiDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const routeInfo = this.parseRouteFile(content, file);
        routes.push(routeInfo);
      }
    }
    
    return routes;
  }

  // Parse route file content
  parseRouteFile(content, filename) {
    const routes = [];
    const lines = content.split('\n');
    
    let currentRoute = null;
    let inRouteBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for route definition
      if (line.startsWith('router.')) {
        const method = line.split('.')[1].split('(')[0];
        const path = line.match(/\(['"`]([^'"`]+)['"`]/)?.[1];
        
        if (path) {
          currentRoute = {
            method: method.toUpperCase(),
            path: path,
            file: filename,
            line: i + 1,
            description: '',
            parameters: [],
            responses: []
          };
          inRouteBlock = true;
        }
      }
      
      // Check for JSDoc comments
      if (line.startsWith('/**') && currentRoute) {
        const jsdoc = this.extractJSDoc(lines, i);
        currentRoute.description = jsdoc.description;
        currentRoute.parameters = jsdoc.parameters;
        currentRoute.responses = jsdoc.responses;
      }
      
      // End of route block
      if (inRouteBlock && (line.startsWith('router.') || line.startsWith('module.exports'))) {
        if (currentRoute) {
          routes.push(currentRoute);
          currentRoute = null;
        }
        inRouteBlock = false;
      }
    }
    
    return {
      file: filename,
      routes: routes
    };
  }

  // Extract JSDoc comments
  extractJSDoc(lines, startIndex) {
    const jsdoc = {
      description: '',
      parameters: [],
      responses: []
    };
    
    let i = startIndex;
    let inDescription = true;
    
    while (i < lines.length && !lines[i].includes('*/')) {
      const line = lines[i].trim();
      
      if (line.startsWith('*')) {
        const content = line.substring(1).trim();
        
        if (content.startsWith('@param')) {
          inDescription = false;
          const param = this.parseParamTag(content);
          jsdoc.parameters.push(param);
        } else if (content.startsWith('@returns') || content.startsWith('@response')) {
          inDescription = false;
          const response = this.parseResponseTag(content);
          jsdoc.responses.push(response);
        } else if (inDescription && content) {
          jsdoc.description += content + ' ';
        }
      }
      
      i++;
    }
    
    return jsdoc;
  }

  // Parse @param tag
  parseParamTag(content) {
    const match = content.match(/@param\s+{([^}]+)}\s+(\w+)\s+(.+)/);
    if (match) {
      return {
        type: match[1],
        name: match[2],
        description: match[3]
      };
    }
    return null;
  }

  // Parse @returns/@response tag
  parseResponseTag(content) {
    const match = content.match(/@(returns|response)\s+{([^}]+)}\s+(.+)/);
    if (match) {
      return {
        type: match[2],
        description: match[3]
      };
    }
    return null;
  }

  // Scan controllers directory
  async scanControllers() {
    const controllers = [];
    const controllerFiles = fs.readdirSync(this.controllersDir);
    
    for (const file of controllerFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(this.controllersDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const controllerInfo = this.parseControllerFile(content, file);
        controllers.push(controllerInfo);
      }
    }
    
    return controllers;
  }

  // Parse controller file
  parseControllerFile(content, filename) {
    const functions = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for function definition
      if (line.startsWith('async ') || line.startsWith('const ') || line.startsWith('function ')) {
        const funcMatch = line.match(/(?:async\s+)?(?:const\s+)?(\w+)\s*[=:]\s*(?:async\s+)?\(/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const funcInfo = {
            name: funcName,
            file: filename,
            line: i + 1,
            description: '',
            parameters: [],
            returns: ''
          };
          
          // Look for JSDoc above function
          let j = i - 1;
          while (j >= 0 && lines[j].trim().startsWith('*')) {
            const jsdocLine = lines[j].trim();
            if (jsdocLine.startsWith('*')) {
              const content = jsdocLine.substring(1).trim();
              if (content.startsWith('@param')) {
                const param = this.parseParamTag(content);
                if (param) funcInfo.parameters.push(param);
              } else if (content.startsWith('@returns')) {
                const returns = this.parseResponseTag(content);
                if (returns) funcInfo.returns = returns.description;
              } else if (content && !content.startsWith('@')) {
                funcInfo.description = content + ' ' + funcInfo.description;
              }
            }
            j--;
          }
          
          functions.push(funcInfo);
        }
      }
    }
    
    return {
      file: filename,
      functions: functions
    };
  }

  // Scan services directory
  async scanServices() {
    const services = [];
    const serviceFiles = fs.readdirSync(this.servicesDir);
    
    for (const file of serviceFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(this.servicesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const serviceInfo = this.parseServiceFile(content, file);
        services.push(serviceInfo);
      }
    }
    
    return services;
  }

  // Parse service file
  parseServiceFile(content, filename) {
    const methods = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for method definition
      if (line.startsWith('async ') || line.startsWith('  async ') || line.startsWith('\tasync ')) {
        const methodMatch = line.match(/(?:async\s+)?(\w+)\s*\(/);
        if (methodMatch) {
          const methodName = methodMatch[1];
          const methodInfo = {
            name: methodName,
            file: filename,
            line: i + 1,
            description: '',
            parameters: [],
            returns: ''
          };
          
          // Look for JSDoc above method
          let j = i - 1;
          while (j >= 0 && lines[j].trim().startsWith('*')) {
            const jsdocLine = lines[j].trim();
            if (jsdocLine.startsWith('*')) {
              const content = jsdocLine.substring(1).trim();
              if (content.startsWith('@param')) {
                const param = this.parseParamTag(content);
                if (param) methodInfo.parameters.push(param);
              } else if (content.startsWith('@returns')) {
                const returns = this.parseResponseTag(content);
                if (returns) methodInfo.returns = returns.description;
              } else if (content && !content.startsWith('@')) {
                methodInfo.description = content + ' ' + methodInfo.description;
              }
            }
            j--;
          }
          
          methods.push(methodInfo);
        }
      }
    }
    
    return {
      file: filename,
      methods: methods
    };
  }

  // Generate database schema documentation
  async generateDatabaseDocs() {
    try {
      console.log('Generating database documentation...');
      
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const schemaDoc = this.parsePrismaSchema(schemaContent);
      
      const outputPath = path.join(this.docsDir, 'database-schema.json');
      fs.writeFileSync(outputPath, JSON.stringify(schemaDoc, null, 2));
      
      console.log('Database documentation generated successfully');
      return schemaDoc;
    } catch (error) {
      console.error('Error generating database docs:', error);
      throw error;
    }
  }

  // Parse Prisma schema
  parsePrismaSchema(content) {
    const models = [];
    const enums = [];
    const lines = content.split('\n');
    
    let currentModel = null;
    let currentEnum = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for model definition
      if (line.startsWith('model ')) {
        const modelName = line.split(' ')[1];
        currentModel = {
          name: modelName,
          fields: [],
          indexes: [],
          relations: []
        };
      }
      
      // Check for enum definition
      if (line.startsWith('enum ')) {
        const enumName = line.split(' ')[1];
        currentEnum = {
          name: enumName,
          values: []
        };
      }
      
      // Parse model fields
      if (currentModel && line.includes(' ') && !line.startsWith('}')) {
        const fieldMatch = line.match(/(\w+)\s+(\w+)(?:\s+@\w+)?/);
        if (fieldMatch) {
          const field = {
            name: fieldMatch[1],
            type: fieldMatch[2],
            attributes: []
          };
          
          // Extract attributes
          const attrMatch = line.match(/@\w+/g);
          if (attrMatch) {
            field.attributes = attrMatch;
          }
          
          currentModel.fields.push(field);
        }
      }
      
      // Parse enum values
      if (currentEnum && line.includes(' ') && !line.startsWith('}')) {
        const valueMatch = line.match(/(\w+)/);
        if (valueMatch) {
          currentEnum.values.push(valueMatch[1]);
        }
      }
      
      // End of model
      if (line.startsWith('}') && currentModel) {
        models.push(currentModel);
        currentModel = null;
      }
      
      // End of enum
      if (line.startsWith('}') && currentEnum) {
        enums.push(currentEnum);
        currentEnum = null;
      }
    }
    
    return {
      models: models,
      enums: enums,
      generatedAt: new Date().toISOString()
    };
  }

  // Generate deployment documentation
  async generateDeploymentDocs() {
    try {
      console.log('Generating deployment documentation...');
      
      const deploymentDoc = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        environment: config.server.nodeEnv,
        services: {
          database: {
            type: 'PostgreSQL',
            version: '15+',
            connection: config.database.url ? 'configured' : 'not configured'
          },
          cache: {
            type: 'Redis',
            version: '6+',
            connection: config.redis.url ? 'configured' : 'not configured'
          },
          email: {
            service: config.email.service,
            configured: !!config.email.apiKey
          },
          sms: {
            service: config.sms.service,
            configured: !!config.sms.accountSid
          },
          pushNotifications: {
            service: 'Firebase',
            configured: !!config.pushNotifications.firebase.projectId
          }
        },
        endpoints: {
          api: `${config.server.host}:${config.server.port}/api/v1`,
          health: `${config.server.host}:${config.server.port}/health`,
          docs: `${config.server.host}:${config.server.port}/docs`
        }
      };
      
      const outputPath = path.join(this.docsDir, 'deployment-info.json');
      fs.writeFileSync(outputPath, JSON.stringify(deploymentDoc, null, 2));
      
      console.log('Deployment documentation generated successfully');
      return deploymentDoc;
    } catch (error) {
      console.error('Error generating deployment docs:', error);
      throw error;
    }
  }

  // Generate comprehensive documentation
  async generateAllDocs() {
    try {
      console.log('Generating comprehensive documentation...');
      
      const apiDocs = await this.generateAPIDocs();
      const dbDocs = await this.generateDatabaseDocs();
      const deploymentDocs = await this.generateDeploymentDocs();
      
      const comprehensiveDoc = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        api: apiDocs,
        database: dbDocs,
        deployment: deploymentDocs,
        summary: {
          totalRoutes: apiDocs.routes.reduce((sum, route) => sum + route.routes.length, 0),
          totalControllers: apiDocs.controllers.length,
          totalServices: apiDocs.services.length,
          totalModels: dbDocs.models.length,
          totalEnums: dbDocs.enums.length
        }
      };
      
      const outputPath = path.join(this.docsDir, 'comprehensive-docs.json');
      fs.writeFileSync(outputPath, JSON.stringify(comprehensiveDoc, null, 2));
      
      console.log('Comprehensive documentation generated successfully');
      return comprehensiveDoc;
    } catch (error) {
      console.error('Error generating comprehensive docs:', error);
      throw error;
    }
  }

  // Generate markdown documentation
  async generateMarkdownDocs() {
    try {
      console.log('Generating markdown documentation...');
      
      const comprehensiveDoc = JSON.parse(
        fs.readFileSync(path.join(this.docsDir, 'comprehensive-docs.json'), 'utf8')
      );
      
      let markdown = '# Documentação Automática do Sistema\n\n';
      markdown += `**Gerado em**: ${comprehensiveDoc.generatedAt}\n\n`;
      
      // API Documentation
      markdown += '## API Documentation\n\n';
      markdown += `**Total de rotas**: ${comprehensiveDoc.summary.totalRoutes}\n\n`;
      
      for (const routeFile of comprehensiveDoc.api.routes) {
        markdown += `### ${routeFile.file}\n\n`;
        
        for (const route of routeFile.routes) {
          markdown += `#### ${route.method} ${route.path}\n\n`;
          markdown += `**Arquivo**: ${route.file}:${route.line}\n\n`;
          markdown += `**Descrição**: ${route.description}\n\n`;
          
          if (route.parameters.length > 0) {
            markdown += '**Parâmetros**:\n\n';
            for (const param of route.parameters) {
              markdown += `- **${param.name}** (${param.type}): ${param.description}\n`;
            }
            markdown += '\n';
          }
          
          if (route.responses.length > 0) {
            markdown += '**Respostas**:\n\n';
            for (const response of route.responses) {
              markdown += `- **${response.type}**: ${response.description}\n`;
            }
            markdown += '\n';
          }
        }
      }
      
      // Database Documentation
      markdown += '## Database Schema\n\n';
      markdown += `**Total de modelos**: ${comprehensiveDoc.summary.totalModels}\n\n`;
      
      for (const model of comprehensiveDoc.database.models) {
        markdown += `### ${model.name}\n\n`;
        
        markdown += '**Campos**:\n\n';
        for (const field of model.fields) {
          markdown += `- **${field.name}**: ${field.type}`;
          if (field.attributes.length > 0) {
            markdown += ` (${field.attributes.join(', ')})`;
          }
          markdown += '\n';
        }
        markdown += '\n';
      }
      
      // Deployment Information
      markdown += '## Deployment Information\n\n';
      markdown += `**Ambiente**: ${comprehensiveDoc.deployment.environment}\n\n`;
      
      markdown += '**Serviços**:\n\n';
      for (const [serviceName, serviceInfo] of Object.entries(comprehensiveDoc.deployment.services)) {
        markdown += `- **${serviceName}**: ${serviceInfo.type || serviceInfo.service} (${serviceInfo.configured ? 'configurado' : 'não configurado'})\n`;
      }
      markdown += '\n';
      
      markdown += '**Endpoints**:\n\n';
      for (const [endpointName, endpointUrl] of Object.entries(comprehensiveDoc.deployment.endpoints)) {
        markdown += `- **${endpointName}**: ${endpointUrl}\n`;
      }
      
      const outputPath = path.join(this.docsDir, 'auto-generated.md');
      fs.writeFileSync(outputPath, markdown);
      
      console.log('Markdown documentation generated successfully');
      return markdown;
    } catch (error) {
      console.error('Error generating markdown docs:', error);
      throw error;
    }
  }

  // Schedule automatic documentation generation
  scheduleGeneration() {
    // Generate docs every hour
    setInterval(async () => {
      try {
        await this.generateAllDocs();
        await this.generateMarkdownDocs();
        console.log('Scheduled documentation generation completed');
      } catch (error) {
        console.error('Scheduled documentation generation failed:', error);
      }
    }, 3600000); // 1 hour
    
    console.log('Automatic documentation generation scheduled');
  }
}

// Create singleton instance
const docGenerator = new DocumentationGenerator();

module.exports = docGenerator;
