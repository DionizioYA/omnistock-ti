"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
class ReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    getDashboardKPIs = async (req, res, next) => {
        try {
            const kpis = await this.reportService.getDashboardKPIs();
            res.status(200).json(kpis);
        }
        catch (err) {
            next(err);
        }
    };
    getDashboardCharts = async (req, res, next) => {
        try {
            const charts = await this.reportService.getDashboardCharts();
            res.status(200).json(charts);
        }
        catch (err) {
            next(err);
        }
    };
    getStockReportPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateStockReportPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-geral-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getLowStockPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateLowStockPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-critico-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getMovementsPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateMovementsPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-historico-movimentacoes-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getStockReportExcel = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateStockReportExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-geral-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getLoansPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateLoansPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-emprestimos-ti-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getLoansExcel = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateLoansExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-emprestimos-ti-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getMovementsExcel = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateMovementsExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-movimentacoes-ti-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getEntriesPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateEntriesPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-entradas-ti-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getEntriesExcel = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateEntriesExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-entradas-ti-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getExitsPdf = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateExitsPdf();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-saidas-baixas-ti-${Date.now()}.pdf`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    getExitsExcel = async (req, res, next) => {
        try {
            const buffer = await this.reportService.generateExitsExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-saidas-baixas-ti-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ReportController = ReportController;
