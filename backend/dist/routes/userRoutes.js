"use strict";
// ============================================================================
// ROTAS DE USUÁRIOS E PERFIS - NEXUS DESK
// Mapeia endpoints para administração de contas e alteração de perfil (RBAC).
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const auditMiddleware_1 = require("../middlewares/auditMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJWT);
// GET /api/v1/users - Listar usuários cadastrados
router.get('/', userController_1.default.getUsers);
// GET /api/v1/users/:id - Obter usuário por ID
router.get('/:id', userController_1.default.getUserById);
// POST /api/v1/users - Cadastrar novo usuário (Apenas Admin/Coordenador)
router.post('/', (0, rbacMiddleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.COORDINATOR), (0, auditMiddleware_1.logAudit)('USER_CREATED', 'USER'), userController_1.default.createUser);
// PATCH /api/v1/users/:id/role - Alterar perfil RBAC de um usuário (Apenas Admin)
router.patch('/:id/role', (0, rbacMiddleware_1.authorizeRoles)(client_1.Role.ADMIN), (0, auditMiddleware_1.logAudit)('USER_ROLE_UPDATED', 'USER'), userController_1.default.updateRole);
exports.default = router;
