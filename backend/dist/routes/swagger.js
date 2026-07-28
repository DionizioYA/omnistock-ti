"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwaggerRoutes = exports.swaggerSpec = void 0;
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'OmniStock ERP - API REST de Controle de Estoque',
        version: '1.0.0',
        description: 'Documentação oficial da API REST do OmniStock ERP - Sistema Completo, Moderno e Responsivo de Gestão de Estoque e Almoxarifado com suporte a Leitora de Código de Barras, Inventário Inteligente e Relatórios PDF/Excel.'
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Servidor Local - Ambiente de Desenvolvimento e Demonstração'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Autenticação JWT fornecendo o Token no formato: Bearer {token}'
            }
        },
        schemas: {
            Product: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    code: { type: 'string', example: 'PRD-001' },
                    barcode: { type: 'string', example: '7891000100011' },
                    name: { type: 'string', example: 'Notebook Dell Latitude 5430' },
                    unit: { type: 'string', example: 'UN' },
                    currentStock: { type: 'integer', example: 25 },
                    minStock: { type: 'integer', example: 5 },
                    maxStock: { type: 'integer', example: 100 },
                    purchasePrice: { type: 'number', example: 4500.00 },
                    salesPrice: { type: 'number', example: 6200.00 }
                }
            },
            StockMovement: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    type: { type: 'string', enum: ['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCAO'] },
                    quantity: { type: 'integer', example: 10 },
                    reason: { type: 'string', example: 'Aquisição conforme NF 12345' },
                    datetime: { type: 'string', format: 'date-time' }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/auth/login': {
            post: {
                summary: 'Autenticar usuário e obter token JWT',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'admin@omnistock.com.br' },
                                    password: { type: 'string', example: 'admin123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login bem sucedido retornando token e perfil' },
                    401: { description: 'Credenciais inválidas' }
                }
            }
        },
        '/products': {
            get: {
                summary: 'Listar produtos com paginação e busca avançada',
                parameters: [
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'categoryId', in: 'query', schema: { type: 'string' } },
                    { name: 'lowStock', in: 'query', schema: { type: 'boolean' } }
                ],
                responses: {
                    200: { description: 'Lista paginada de produtos' }
                }
            },
            post: {
                summary: 'Cadastrar novo produto',
                responses: {
                    201: { description: 'Produto cadastrado com sucesso' }
                }
            }
        },
        '/movements': {
            get: {
                summary: 'Consultar histórico imutável de movimentações de estoque',
                responses: {
                    200: { description: 'Histórico de movimentações' }
                }
            },
            post: {
                summary: 'Registrar nova entrada, saída, transferência, ajuste ou devolução',
                responses: {
                    201: { description: 'Movimentação registrada e estoque atualizado' }
                }
            }
        },
        '/inventory': {
            get: {
                summary: 'Listar auditorias de inventário',
                responses: { 200: { description: 'Lista de inventários realizados' } }
            },
            post: {
                summary: 'Iniciar novo inventário inteligente (Geral, Categoria ou Localização)',
                responses: { 201: { description: 'Inventário aberto com itens e saldo em sistema' } }
            }
        },
        '/reports/kpis': {
            get: {
                summary: 'Consultar os 10 cards de métricas (KPIs) do Dashboard ERP',
                responses: { 200: { description: 'Indicadores financeiros e operacionais em tempo real' } }
            }
        }
    }
};
const createSwaggerRoutes = () => {
    const router = (0, express_1.Router)();
    router.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
    return router;
};
exports.createSwaggerRoutes = createSwaggerRoutes;
