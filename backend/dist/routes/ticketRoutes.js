"use strict";
// ============================================================================
// ROTAS DE CHAMADOS (TICKETS) - NEXUS DESK
// Mapeia endpoints de Service Desk com auditoria e JWT.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = __importDefault(require("../controllers/ticketController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const auditMiddleware_1 = require("../middlewares/auditMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJWT); // Requer autenticação para todas as rotas
// GET /api/v1/tickets - Listar chamados com filtros
router.get('/', ticketController_1.default.getTickets);
// GET /api/v1/tickets/:id - Detalhes do chamado com linha do tempo e SLA
router.get('/:id', ticketController_1.default.getTicketById);
// POST /api/v1/tickets - Abrir um novo chamado
router.post('/', (0, auditMiddleware_1.logAudit)('TICKET_CREATED', 'TICKET'), ticketController_1.default.createTicket);
// PATCH /api/v1/tickets/:id/status - Alterar status / atribuir chamado
router.patch('/:id/status', (0, rbacMiddleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.COORDINATOR, client_1.Role.TECHNICIAN), (0, auditMiddleware_1.logAudit)('TICKET_STATUS_UPDATED', 'TICKET'), ticketController_1.default.updateStatus);
// POST /api/v1/tickets/:id/comments - Adicionar comentário público ou interno
router.post('/:id/comments', (0, auditMiddleware_1.logAudit)('TICKET_COMMENTED', 'TICKET'), ticketController_1.default.addComment);
// POST /api/v1/tickets/:id/sign-close - Encerramento com assinatura digital do usuário
router.post('/:id/sign-close', (0, auditMiddleware_1.logAudit)('TICKET_SIGNED_CLOSED', 'TICKET'), ticketController_1.default.signAndClose);
exports.default = router;
