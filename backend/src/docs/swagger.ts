// ============================================================================
// DOCUMENTAÇÃO OPENAPI / SWAGGER - NEXUS DESK
// Especificação completa de Endpoints, esquemas e autenticação JWT.
// ============================================================================

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API REST - Nexus Desk (IT Service Desk)',
    version: '1.0.0',
    description: 'Documentação da API REST do Nexus Desk — Sistema Web Moderno, Profissional e Responsivo para Gerenciamento de Service Desk de TI. Segue princípios de Clean Code, SOLID e ITIL.',
    contact: {
      name: 'Nexus Desk IT Team',
      email: 'suporte@nexusdesk.local'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Servidor de Desenvolvimento Local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT gerado pelo endpoint /api/v1/auth/login'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@nexusdesk.local' },
          password: { type: 'string', example: '123456' }
        }
      },
      TicketCreateRequest: {
        type: 'object',
        required: ['title', 'description', 'priority', 'category', 'subcategory'],
        properties: {
          title: { type: 'string', example: 'Falha no certificado VPN no Notebook' },
          description: { type: 'string', example: 'Não consigo estabelecer conexão criptografada com a VPN corporativa.' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          category: { type: 'string', example: 'Rede & VPN' },
          subcategory: { type: 'string', example: 'Falha no AnyConnect' }
        }
      },
      InventoryCreateRequest: {
        type: 'object',
        required: ['assetCode', 'name', 'category', 'brand', 'model', 'serialNumber', 'location'],
        properties: {
          assetCode: { type: 'string', example: 'PAT-TI-010' },
          name: { type: 'string', example: 'Notebook Lenovo ThinkPad X1' },
          category: { type: 'string', enum: ['COMPUTER', 'MONITOR', 'PRINTER', 'PHONE', 'TABLET'], example: 'COMPUTER' },
          brand: { type: 'string', example: 'Lenovo' },
          model: { type: 'string', example: 'ThinkPad X1 Carbon 16GB' },
          serialNumber: { type: 'string', example: 'LNV-8891-BR' },
          location: { type: 'string', example: 'Matriz - 3º Andar' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/v1/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticar usuário e obter token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': { description: 'Login bem-sucedido com token JWT gerado.' },
          '401': { description: 'Credenciais inválidas.' }
        }
      }
    },
    '/api/v1/auth/quick-switch': {
      post: {
        tags: ['Autenticação'],
        summary: 'Alternar rápido de perfil (Para Demonstração)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['ADMIN', 'COORDINATOR', 'TECHNICIAN', 'USER'] }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Perfil alterado e token retornado.' }
        }
      }
    },
    '/api/v1/stats/overview': {
      get: {
        tags: ['Dashboard'],
        summary: 'Obter estatísticas globais, indicadores em tempo real, ranking e SLA Médio',
        responses: {
          '200': { description: 'Métricas do Dashboard no padrão Intune/Jira.' }
        }
      }
    },
    '/api/v1/tickets': {
      get: {
        tags: ['Chamados'],
        summary: 'Listar chamados cadastrados (filtros de status, prioridade e categoria disponíveis)',
        responses: {
          '200': { description: 'Lista de chamados retornada.' }
        }
      },
      post: {
        tags: ['Chamados'],
        summary: 'Abrir um novo chamado de TI',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TicketCreateRequest' }
            }
          }
        },
        responses: {
          '201': { description: 'Chamado aberto com cálculo automático do prazo de SLA.' }
        }
      }
    },
    '/api/v1/inventory': {
      get: {
        tags: ['Inventário'],
        summary: 'Listar ativos de TI (Computadores, Monitores, Impressoras, etc)',
        responses: {
          '200': { description: 'Lista de equipamentos de TI.' }
        }
      },
      post: {
        tags: ['Inventário'],
        summary: 'Cadastrar novo ativo patrimonial no sistema',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InventoryCreateRequest' }
            }
          }
        },
        responses: {
          '201': { description: 'Equipamento registrado com histórico criado.' }
        }
      }
    },
    '/api/v1/reports/tickets/excel': {
      get: {
        tags: ['Relatórios'],
        summary: 'Fazer download de todos os chamados em planilha Excel (.xlsx)',
        responses: {
          '200': { description: 'Arquivo XLSX gerado e entregue para download.' }
        }
      }
    },
    '/api/v1/reports/tickets/pdf': {
      get: {
        tags: ['Relatórios'],
        summary: 'Fazer download do Relatório Executivo do Service Desk em PDF formatado',
        responses: {
          '200': { description: 'Arquivo PDF formatado com PDFKit.' }
        }
      }
    }
  }
};
