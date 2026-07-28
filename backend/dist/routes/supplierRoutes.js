"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupplierRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createSupplierRoutes = (supplierController) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_1.authMiddleware, supplierController.getSuppliers);
    router.get('/:id', auth_1.authMiddleware, supplierController.getSupplierById);
    router.post('/', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), supplierController.createSupplier);
    router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), supplierController.updateSupplier);
    router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRoles)('ADMIN', 'GESTOR'), supplierController.deleteSupplier);
    return router;
};
exports.createSupplierRoutes = createSupplierRoutes;
