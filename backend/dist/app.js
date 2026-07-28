"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
const audit_1 = require("./middlewares/audit");
dotenv_1.default.config();
const createApp = (prisma) => {
    const app = (0, express_1.default)();
    // CORS de produção e desenvolvimento
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express_1.default.json({ limit: '25mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
    app.use((0, morgan_1.default)('dev'));
    // Middleware global para auditoria contínua das ações (POST, PUT, DELETE)
    app.use((0, audit_1.createAuditMiddleware)(prisma));
    // Rota de Healthcheck do ERP
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ONLINE',
            system: 'OmniStock ERP - Controle de Estoque & Gestão de Almoxarifado',
            timestamp: new Date().toISOString()
        });
    });
    // Rotas da API REST
    app.use('/api', (0, routes_1.buildApiRouter)(prisma));
    // Global Error Handler (SOLID / Clean Code)
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
