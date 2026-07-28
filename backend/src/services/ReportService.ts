import { IProductRepository, IMovementRepository, ICategoryRepository, ILoanRepository } from '../repositories/interfaces';
import { DashboardKPIs } from '../domain/types';
import { PDFUtil } from '../utils/pdf';
import { ExcelUtil } from '../utils/excel';

export class ReportService {
  constructor(
    private productRepo: IProductRepository,
    private movementRepo: IMovementRepository,
    private categoryRepo: ICategoryRepository,
    private loanRepo?: ILoanRepository
  ) {}

  public async getDashboardKPIs(): Promise<DashboardKPIs> {
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
      } else if (current <= min) {
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

    const recentProductsCount = products.filter(
      p => (today.getTime() - new Date(p.createdAt).getTime()) <= 30 * 24 * 60 * 60 * 1000
    ).length;

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

  public async getDashboardCharts(): Promise<{
    movementsStats: { entradas: number; saidas: number };
    categoryDistribution: { name: string; value: number; count: number; color: string }[];
    topMovedProducts: any[];
  }> {
    const [movementsStats, categories, topMovedProducts] = await Promise.all([
      this.movementRepo.getMovementsStats(30),
      this.categoryRepo.findAll(),
      this.movementRepo.getTopMovedProducts(6)
    ]);

    const allProductsResult = await this.productRepo.findAll({ limit: 10000 });
    const products = allProductsResult.data;

    const catMap: { [key: string]: { name: string; value: number; count: number; color: string } } = {};
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

  public async generateStockReportPdf(): Promise<Buffer> {
    const all = await this.productRepo.findAll({ limit: 10000 });
    return PDFUtil.generateStockReportPdf(all.data, 'Relatório Geral de Estoque & Valuation');
  }

  public async generateLowStockPdf(): Promise<Buffer> {
    const lowStock = await this.productRepo.getLowStockProducts();
    return PDFUtil.generateStockReportPdf(lowStock, 'Relatório de Produtos com Estoque Crítico / Abaixo do Mínimo');
  }

  public async generateMovementsPdf(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    return PDFUtil.generateMovementsPdf(movements);
  }

  public async generateStockReportExcel(): Promise<Buffer> {
    const all = await this.productRepo.findAll({ limit: 10000 });
    return ExcelUtil.generateProductsExcel(all.data);
  }

  public async generateMovementsExcel(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    return ExcelUtil.generateMovementsExcel(movements, 'Histórico de Movimentações - Service Desk');
  }

  public async generateLoansPdf(): Promise<Buffer> {
    const loans = await this.loanRepo?.findAll() || [];
    return PDFUtil.generateLoansPdf(loans, 'Relatório de Equipamentos Emprestados');
  }

  public async generateLoansExcel(): Promise<Buffer> {
    const loans = await this.loanRepo?.findAll() || [];
    return ExcelUtil.generateLoansExcel(loans);
  }

  public async generateEntriesPdf(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    const entries = movements.filter(m => m.type === 'ENTRADA');
    return PDFUtil.generateMovementsPdf(entries);
  }

  public async generateEntriesExcel(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    const entries = movements.filter(m => m.type === 'ENTRADA');
    return ExcelUtil.generateMovementsExcel(entries, 'Relatório de Entradas de TI');
  }

  public async generateExitsPdf(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    const exits = movements.filter(m => m.type === 'SAIDA' || m.type === 'EMPRESTIMO' || m.type === 'BAIXA');
    return PDFUtil.generateMovementsPdf(exits);
  }

  public async generateExitsExcel(): Promise<Buffer> {
    const movements = await this.movementRepo.findAll({ limit: 500 });
    const exits = movements.filter(m => m.type === 'SAIDA' || m.type === 'EMPRESTIMO' || m.type === 'BAIXA');
    return ExcelUtil.generateMovementsExcel(exits, 'Relatório de Saídas e Baixas de TI');
  }
}

