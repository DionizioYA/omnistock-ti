"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlertRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createAlertRoutes = (alertController) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_1.authMiddleware, alertController.getActiveAlerts);
    router.put('/:id/read', auth_1.authMiddleware, alertController.markAsRead);
    router.patch('/:id/read', auth_1.authMiddleware, alertController.markAsRead);
    return router;
};
exports.createAlertRoutes = createAlertRoutes;
