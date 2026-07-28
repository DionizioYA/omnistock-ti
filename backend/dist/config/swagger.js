"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = require("./logger");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FluentDesk ITSM API',
            version: '1.0.0',
            description: 'API REST do sistema de gerenciamento de Service Desk de TI (FluentDesk)',
            contact: {
                name: 'Equipe de Suporte & Arquitetura',
                email: 'suporte@fluentdesk.com.br',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de Desenvolvimento',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Insira o token JWT retornado no login: Bearer <seu_token>',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    logger_1.logger.info('📚 Documentação Swagger interativa disponível em http://localhost:3001/api-docs');
}
