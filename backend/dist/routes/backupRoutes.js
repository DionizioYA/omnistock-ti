"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackupRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createBackupRoutes = (backupController) => {
    const router = (0, express_1.Router)();
    // Apenas ADMIN pode baixar o snapshot JSON completo de backup
    router.get('/download', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN'), backupController.getFullBackup);
    return router;
};
exports.createBackupRoutes = createBackupRoutes;
