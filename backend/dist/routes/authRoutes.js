"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createAuthRoutes = (authController) => {
    const router = (0, express_1.Router)();
    router.post('/login', authController.login);
    router.get('/me', auth_1.authMiddleware, authController.getMe);
    return router;
};
exports.createAuthRoutes = createAuthRoutes;
