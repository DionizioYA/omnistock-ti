import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/auth';

export const createReportRoutes = (reportController: ReportController): Router => {
  const router = Router();

  router.get('/kpis', authMiddleware, reportController.getDashboardKPIs);
  router.get('/charts', authMiddleware, reportController.getDashboardCharts);

  // Estoque
  router.get('/pdf/stock', authMiddleware, reportController.getStockReportPdf);
  router.get('/excel/stock', authMiddleware, reportController.getStockReportExcel);
  router.get('/pdf/low-stock', authMiddleware, reportController.getLowStockPdf);

  // Empréstimos
  router.get('/pdf/loans', authMiddleware, reportController.getLoansPdf);
  router.get('/excel/loans', authMiddleware, reportController.getLoansExcel);

  // Movimentações, Entradas e Saídas
  router.get('/pdf/movements', authMiddleware, reportController.getMovementsPdf);
  router.get('/excel/movements', authMiddleware, reportController.getMovementsExcel);
  router.get('/pdf/entries', authMiddleware, reportController.getEntriesPdf);
  router.get('/excel/entries', authMiddleware, reportController.getEntriesExcel);
  router.get('/pdf/exits', authMiddleware, reportController.getExitsPdf);
  router.get('/excel/exits', authMiddleware, reportController.getExitsExcel);

  return router;
};
