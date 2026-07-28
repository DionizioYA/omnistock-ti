"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createAuditRoutes = (auditController) => {
    const router = (0, express_1.Router)();
    // Apenas ADMIN e GESTOR podem auditar os logs de governança
    router.get('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), auditController.getLogs);
    return router;
};
exports.createAuditRoutes = createAuditRoutes;
