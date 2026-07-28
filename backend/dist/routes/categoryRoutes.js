"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createCategoryRoutes = (categoryController) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_1.authMiddleware, categoryController.getCategories);
    router.post('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), categoryController.createCategory);
    router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), categoryController.updateCategory);
    router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), categoryController.deleteCategory);
    return router;
};
exports.createCategoryRoutes = createCategoryRoutes;
