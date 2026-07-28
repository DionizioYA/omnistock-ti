import { Request, Response, NextFunction } from 'express';
import { ISupplierRepository } from '../repositories/interfaces';
import { supplierSchema } from '../domain/schemas';

export class SupplierController {
  constructor(private supplierRepo: ISupplierRepository) {}

  public getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suppliers = await this.supplierRepo.findAll();
      res.status(200).json(suppliers);
    } catch (err) {
      next(err);
    }
  };

  public getSupplierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.supplierRepo.findById(req.params.id);
      if (!supplier) {
        res.status(404).json({ error: 'Fornecedor não encontrado.' });
        return;
      }
      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  };

  public createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = supplierSchema.parse(req.body);
      const supplier = await this.supplierRepo.create(validated);
      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  };

  public updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.supplierRepo.update(req.params.id, req.body);
      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  };

  public deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.supplierRepo.delete(req.params.id);
      res.status(200).json({ message: 'Fornecedor desativado com sucesso (exclusão lógica ERP).' });
    } catch (err) {
      next(err);
    }
  };
}
