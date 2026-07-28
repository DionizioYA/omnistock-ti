"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TicketController_1 = require("../controllers/TicketController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
const controller = new TicketController_1.TicketController();
// Todas as rotas de chamados exigem usuário logado
router.use(auth_middleware_1.authMiddleware);
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)('ADMIN', 'COORDINATOR', 'TECHNICIAN'), controller.updateStatus.bind(controller));
router.patch('/:id/assign', (0, rbac_middleware_1.requireRole)('ADMIN', 'COORDINATOR', 'TECHNICIAN'), controller.assign.bind(controller));
router.post('/:id/comments', controller.addComment.bind(controller));
router.post('/:id/close-signature', controller.closeWithSignature.bind(controller));
exports.default = router;
