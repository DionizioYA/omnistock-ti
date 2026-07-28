"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createInventoryRoutes = (inventoryController) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_1.authMiddleware, inventoryController.getAudits);
    router.get('/:id', auth_1.authMiddleware, inventoryController.getAuditById);
    // Iniciar novo inventário
    router.post('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR', 'ALMOXARIFE'), inventoryController.createAudit);
    // Lançamento de contagem física (Suporta bipar código de barras)
    router.post('/:id/items', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR', 'ALMOXARIFE'), inventoryController.registerConferenceCount);
    // Ajuste automático de divergências
    router.post('/:id/auto-adjust', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), inventoryController.autoAdjustDivergences);
    return router;
};
exports.createInventoryRoutes = createInventoryRoutes;
