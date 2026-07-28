"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMovementRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createMovementRoutes = (movementController) => {
    const router = (0, express_1.Router)();
    // Visualização de movimentações
    router.get('/', auth_1.authMiddleware, movementController.getMovements);
    router.get('/:id', auth_1.authMiddleware, movementController.getMovementById);
    // Registrar nova movimentação imutável (ADMIN, GESTOR e ALMOXARIFE)
    router.post('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR', 'ALMOXARIFE'), movementController.registerMovement);
    return router;
};
exports.createMovementRoutes = createMovementRoutes;
