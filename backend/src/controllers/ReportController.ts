import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/ReportService';

export class ReportController {
  constructor(private reportService: ReportService) {}

  public getDashboardKPIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kpis = await this.reportService.getDashboardKPIs();
      res.status(200).json(kpis);
    } catch (err) {
      next(err);
    }
  };

  public getDashboardCharts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const charts = await this.reportService.getDashboardCharts();
      res.status(200).json(charts);
    } catch (err) {
      next(err);
    }
  };

  public getStockReportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateStockReportPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-geral-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getLowStockPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateLowStockPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-critico-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getMovementsPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateMovementsPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-historico-movimentacoes-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getStockReportExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateStockReportExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-estoque-geral-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getLoansPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateLoansPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-emprestimos-ti-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getLoansExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateLoansExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-emprestimos-ti-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getMovementsExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateMovementsExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-movimentacoes-ti-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getEntriesPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateEntriesPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-entradas-ti-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getEntriesExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateEntriesExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-entradas-ti-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getExitsPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateExitsPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-saidas-baixas-ti-${Date.now()}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getExitsExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.reportService.generateExitsExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-saidas-baixas-ti-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}

