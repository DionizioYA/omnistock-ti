"use strict";
// ============================================================================
// ROTAS DA BASE DE CONHECIMENTO - NEXUS DESK
// Mapeia endpoints de tutoriais, FAQs e busca inteligente.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const knowledgeController_1 = __importDefault(require("../controllers/knowledgeController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const auditMiddleware_1 = require("../middlewares/auditMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJWT);
// GET /api/v1/knowledge - Listar e buscar artigos de forma inteligente
router.get('/', knowledgeController_1.default.getArticles);
// GET /api/v1/knowledge/:id - Ver conteúdo do artigo
router.get('/:id', knowledgeController_1.default.getArticleById);
// POST /api/v1/knowledge - Publicar novo artigo
router.post('/', (0, rbacMiddleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.COORDINATOR, client_1.Role.TECHNICIAN), (0, auditMiddleware_1.logAudit)('KNOWLEDGE_ARTICLE_CREATED', 'KNOWLEDGE'), knowledgeController_1.default.createArticle);
exports.default = router;
