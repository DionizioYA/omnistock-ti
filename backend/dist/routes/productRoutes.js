"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createProductRoutes = (productController) => {
    const router = (0, express_1.Router)();
    // Todos os papéis autenticados podem consultar os produtos e baixar Excel de estoque
    router.get('/', auth_1.authMiddleware, productController.getProducts);
    router.get('/export/excel', auth_1.authMiddleware, productController.exportExcel);
    router.get('/:id', auth_1.authMiddleware, productController.getProductById);
    // Apenas ADMIN e GESTOR podem criar, editar, importar ou desativar produtos
    router.post('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), productController.createProduct);
    router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), productController.updateProduct);
    router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), productController.deleteProduct);
    router.post('/import/excel', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), productController.importExcel);
    return router;
};
exports.createProductRoutes = createProductRoutes;
