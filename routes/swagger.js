const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const config = require('../config/production');

const router = express.Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Voluntariado API',
      version: '1.0.0',
      description: 'API RESTful para gestão de oportunidades de voluntariado',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@voluntariado.com',
        url: 'https://voluntariado.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.voluntariado.com/v1',
        description: 'Servidor de Produção'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            type: {
              type: 'string',
              enum: ['VOLUNTEER', 'INSTITUTION'],
              description: 'Tipo de usuário'
            },
            profile: {
              $ref: '#/components/schemas/UserProfile'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        UserProfile: {
          type: 'object',
          properties: {
            bio: {
              type: 'string',
              description: 'Biografia do usuário'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Habilidades do usuário'
            },
            availability: {
              type: 'string',
              enum: ['WEEKDAYS', 'WEEKENDS', 'FLEXIBLE'],
              description: 'Disponibilidade do usuário'
            },
            location: {
              $ref: '#/components/schemas/Location'
            }
          }
        },
        Location: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'Cidade'
            },
            state: {
              type: 'string',
              description: 'Estado'
            },
            address: {
              type: 'string',
              description: 'Endereço completo'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  format: 'float'
                },
                lng: {
                  type: 'number',
                  format: 'float'
                }
              }
            }
          }
        },
        Opportunity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da oportunidade'
            },
            title: {
              type: 'string',
              description: 'Título da oportunidade'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada'
            },
            category: {
              type: 'string',
              enum: ['EDUCATION', 'HEALTH', 'ENVIRONMENT', 'SOCIAL', 'TECHNOLOGY'],
              description: 'Categoria da oportunidade'
            },
            type: {
              type: 'string',
              enum: ['IN_PERSON', 'ONLINE', 'HYBRID'],
              description: 'Tipo de oportunidade'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'],
              description: 'Status da oportunidade'
            },
            institution: {
              $ref: '#/components/schemas/Institution'
            },
            location: {
              $ref: '#/components/schemas/Location'
            },
            schedule: {
              $ref: '#/components/schemas/Schedule'
            },
            requirements: {
              $ref: '#/components/schemas/Requirements'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Institution: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              description: 'Nome da instituição'
            },
            description: {
              type: 'string',
              description: 'Descrição da instituição'
            },
            category: {
              type: 'string',
              enum: ['EDUCATION', 'HEALTH', 'ENVIRONMENT', 'SOCIAL', 'TECHNOLOGY']
            },
            location: {
              $ref: '#/components/schemas/Location'
            },
            contact: {
              $ref: '#/components/schemas/Contact'
            },
            verified: {
              type: 'boolean',
              description: 'Se a instituição é verificada'
            }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            phone: {
              type: 'string',
              description: 'Telefone de contato'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Website da instituição'
            }
          }
        },
        Schedule: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de início'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de fim'
            },
            recurrence: {
              type: 'string',
              enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'],
              description: 'Recorrência da oportunidade'
            }
          }
        },
        Requirements: {
          type: 'object',
          properties: {
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Habilidades necessárias'
            },
            minAge: {
              type: 'integer',
              minimum: 0,
              description: 'Idade mínima'
            },
            maxVolunteers: {
              type: 'integer',
              minimum: 1,
              description: 'Número máximo de voluntários'
            }
          }
        },
        Application: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            opportunityId: {
              type: 'string',
              format: 'uuid'
            },
            volunteerId: {
              type: 'string',
              format: 'uuid'
            },
            message: {
              type: 'string',
              description: 'Mensagem do voluntário'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']
            },
            appliedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Match: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['OPPORTUNITY', 'VOLUNTEER']
            },
            opportunity: {
              $ref: '#/components/schemas/Opportunity'
            },
            volunteer: {
              $ref: '#/components/schemas/User'
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Score de compatibilidade'
            },
            reasons: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Razões do match'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Evaluation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            opportunityId: {
              type: 'string',
              format: 'uuid'
            },
            evaluatorId: {
              type: 'string',
              format: 'uuid'
            },
            targetUserId: {
              type: 'string',
              format: 'uuid'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Avaliação de 1 a 5 estrelas'
            },
            comment: {
              type: 'string',
              description: 'Comentário da avaliação'
            },
            type: {
              type: 'string',
              enum: ['VOLUNTEER_TO_INSTITUTION', 'INSTITUTION_TO_VOLUNTEER']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            participants: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              },
              description: 'IDs dos participantes'
            },
            type: {
              type: 'string',
              enum: ['DIRECT', 'GROUP']
            },
            subject: {
              type: 'string',
              description: 'Assunto da conversa'
            },
            lastMessage: {
              $ref: '#/components/schemas/Message'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            conversationId: {
              type: 'string',
              format: 'uuid'
            },
            senderId: {
              type: 'string',
              format: 'uuid'
            },
            content: {
              type: 'string',
              description: 'Conteúdo da mensagem'
            },
            type: {
              type: 'string',
              enum: ['TEXT', 'IMAGE', 'FILE']
            },
            sentAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Código do erro'
                },
                message: {
                  type: 'string',
                  description: 'Mensagem de erro'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                requestId: {
                  type: 'string',
                  description: 'ID da requisição para rastreamento'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Dados da resposta'
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  description: 'Lista de itens'
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'integer',
                      description: 'Página atual'
                    },
                    limit: {
                      type: 'integer',
                      description: 'Itens por página'
                    },
                    total: {
                      type: 'integer',
                      description: 'Total de itens'
                    },
                    pages: {
                      type: 'integer',
                      description: 'Total de páginas'
                    },
                    hasNext: {
                      type: 'boolean',
                      description: 'Se há próxima página'
                    },
                    hasPrev: {
                      type: 'boolean',
                      description: 'Se há página anterior'
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso inválido ou ausente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de acesso inválido',
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Sem permissão para acessar o recurso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'AUTHORIZATION_ERROR',
                  message: 'Sem permissão para acessar este recurso',
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Recurso não encontrado',
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação de dados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Dados de entrada inválidos',
                  details: [
                    {
                      field: 'email',
                      message: 'Email é obrigatório'
                    }
                  ],
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Limite de taxa excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Limite de requisições excedido',
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: {
                  code: 'INTERNAL_ERROR',
                  message: 'Erro interno do servidor',
                  timestamp: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticação'
      },
      {
        name: 'Users',
        description: 'Gestão de usuários'
      },
      {
        name: 'Institutions',
        description: 'Gestão de instituições'
      },
      {
        name: 'Opportunities',
        description: 'Gestão de oportunidades'
      },
      {
        name: 'Matching',
        description: 'Sistema de matching e recomendações'
      },
      {
        name: 'Communication',
        description: 'Sistema de comunicação e chat'
      },
      {
        name: 'Evaluations',
        description: 'Sistema de avaliações'
      },
      {
        name: 'System',
        description: 'Endpoints do sistema'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sistema de Voluntariado API',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerUiOptions));

// Serve OpenAPI JSON
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Serve OpenAPI YAML
router.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(specs);
});

module.exports = router;
