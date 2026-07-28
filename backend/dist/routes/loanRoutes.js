"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoanRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createLoanRoutes = (loanController) => {
    const router = (0, express_1.Router)();
    router.use(auth_1.authMiddleware);
    router.get('/', loanController.getAll);
    router.get('/:id', loanController.getById);
    router.post('/', loanController.create);
    router.post('/:id/return', loanController.returnLoan);
    router.delete('/:id', loanController.delete);
    return router;
};
exports.createLoanRoutes = createLoanRoutes;
