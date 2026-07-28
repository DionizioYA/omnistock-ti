"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const pdf_1 = require("../utils/pdf");
const excel_1 = require("../utils/excel");
class ReportService {
    productRepo;
    movementRepo;
    categoryRepo;
    loanRepo;
    constructor(productRepo, movementRepo, categoryRepo, loanRepo) {
        this.productRepo = productRepo;
        this.movementRepo = movementRepo;
        this.categoryRepo = categoryRepo;
        this.loanRepo = loanRepo;
    }
    async getDashboardKPIs() {
        const allProductsResult = await this.productRepo.findAll({ limit: 10000 });
        const products = allProductsResult.data;
        let totalStockUnits = 0;
        let totalPurchaseValue = 0;
        let totalSalesValue = 0;
        let lowStockCount = 0;
        let zeroStockCount = 0;
        let expiringSoonCount = 0;
        const today = new Date();
        const expiryThreshold = new Date();
        expiryThreshold.setDate(today.getDate() + 30);
        products.forEach((p) => {
            const current = p.currentStock || 0;
            const min = p.minStock || 0;
            totalStockUnits += current;
            totalPurchaseValue += current * (p.purchasePrice || 0);
            totalSalesValue += current * (p.salesPrice || 0);
            if (current === 0) {
                zeroStockCount++;
            }
            else if (current <= min) {
                lowStockCount++;
            }
            if (p.expiryDate && new Date(p.expiryDate) <= expiryThreshold) {
                expiringSoonCount++;
            }
        });
        const estimatedProfit = totalSalesValue - totalPurchaseValue;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const recentMovements = await this.movementRepo.findAll({ limit: 100 });
        const movementsToday = recentMovements.filter(m => new Date(m.datetime) >= todayStart).length;
        const recentProductsCount = products.filter(p => (today.getTime() - new Date(p.createdAt).getTime()) <= 30 * 24 * 60 * 60 * 1000).length;
        return {
            totalProducts: products.length,
            totalStockUnits,
            lowStockCount,
            zeroStockCount,
            expiringSoonCount,
            totalPurchaseValue,
            totalSalesValue,
            estimatedProfit,
            movementsToday,
            recentProductsCount
        };
    }
    async getDashboardCharts() {
        const [movementsStats, categories, topMovedProducts] = await Promise.all([
            this.movementRepo.getMovementsStats(30),
            this.categoryRepo.findAll(),
            this.movementRepo.getTopMovedProducts(6)
        ]);
        const allProductsResult = await this.productRepo.findAll({ limit: 10000 });
        const products = allProductsResult.data;
        const catMap = {};
        categories.forEach((c) => {
            catMap[c.id] = {
                name: c.name,
                value: 0,
                count: 0,
                color: c.color || '#3B82F6'
            };
        });
        products.forEach((p) => {
            const cid = p.categoryId;
            if (catMap[cid]) {
                catMap[cid].count += 1;
                catMap[cid].value += (p.currentStock || 0) * (p.purchasePrice || 0);
            }
        });
        const categoryDistribution = Object.values(catMap).filter(item => item.count > 0 || item.value > 0);
        return {
            movementsStats,
            categoryDistribution,
            topMovedProducts
        };
    }
    async generateStockReportPdf() {
        const all = await this.productRepo.findAll({ limit: 10000 });
        return pdf_1.PDFUtil.generateStockReportPdf(all.data, 'Relatório Geral de Estoque & Valuation');
    }
    async generateLowStockPdf() {
        const lowStock = await this.productRepo.getLowStockProducts();
        return pdf_1.PDFUtil.generateStockReportPdf(lowStock, 'Relatório de Produtos com Estoque Crítico / Abaixo do Mínimo');
    }
    async generateMovementsPdf() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        return pdf_1.PDFUtil.generateMovementsPdf(movements);
    }
    async generateStockReportExcel() {
        const all = await this.productRepo.findAll({ limit: 10000 });
        return excel_1.ExcelUtil.generateProductsExcel(all.data);
    }
    async generateMovementsExcel() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        return excel_1.ExcelUtil.generateMovementsExcel(movements, 'Histórico de Movimentações - Service Desk');
    }
    async generateLoansPdf() {
        const loans = await this.loanRepo?.findAll() || [];
        return pdf_1.PDFUtil.generateLoansPdf(loans, 'Relatório de Equipamentos Emprestados');
    }
    async generateLoansExcel() {
        const loans = await this.loanRepo?.findAll() || [];
        return excel_1.ExcelUtil.generateLoansExcel(loans);
    }
    async generateEntriesPdf() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        const entries = movements.filter(m => m.type === 'ENTRADA');
        return pdf_1.PDFUtil.generateMovementsPdf(entries);
    }
    async generateEntriesExcel() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        const entries = movements.filter(m => m.type === 'ENTRADA');
        return excel_1.ExcelUtil.generateMovementsExcel(entries, 'Relatório de Entradas de TI');
    }
    async generateExitsPdf() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        const exits = movements.filter(m => m.type === 'SAIDA' || m.type === 'EMPRESTIMO' || m.type === 'BAIXA');
        return pdf_1.PDFUtil.generateMovementsPdf(exits);
    }
    async generateExitsExcel() {
        const movements = await this.movementRepo.findAll({ limit: 500 });
        const exits = movements.filter(m => m.type === 'SAIDA' || m.type === 'EMPRESTIMO' || m.type === 'BAIXA');
        return excel_1.ExcelUtil.generateMovementsExcel(exits, 'Relatório de Saídas e Baixas de TI');
    }
}
exports.ReportService = ReportService;
