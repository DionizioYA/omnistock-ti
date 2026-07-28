"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const createReportRoutes = (reportController) => {
    const router = (0, express_1.Router)();
    router.get('/kpis', auth_1.authMiddleware, reportController.getDashboardKPIs);
    router.get('/charts', auth_1.authMiddleware, reportController.getDashboardCharts);
    // Estoque
    router.get('/pdf/stock', auth_1.authMiddleware, reportController.getStockReportPdf);
    router.get('/excel/stock', auth_1.authMiddleware, reportController.getStockReportExcel);
    router.get('/pdf/low-stock', auth_1.authMiddleware, reportController.getLowStockPdf);
    // Empréstimos
    router.get('/pdf/loans', auth_1.authMiddleware, reportController.getLoansPdf);
    router.get('/excel/loans', auth_1.authMiddleware, reportController.getLoansExcel);
    // Movimentações, Entradas e Saídas
    router.get('/pdf/movements', auth_1.authMiddleware, reportController.getMovementsPdf);
    router.get('/excel/movements', auth_1.authMiddleware, reportController.getMovementsExcel);
    router.get('/pdf/entries', auth_1.authMiddleware, reportController.getEntriesPdf);
    router.get('/excel/entries', auth_1.authMiddleware, reportController.getEntriesExcel);
    router.get('/pdf/exits', auth_1.authMiddleware, reportController.getExitsPdf);
    router.get('/excel/exits', auth_1.authMiddleware, reportController.getExitsExcel);
    return router;
};
exports.createReportRoutes = createReportRoutes;
