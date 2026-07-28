import { Request, Response, NextFunction } from 'express';
import { IAuditRepository } from '../repositories/interfaces';

export class AuditController {
  constructor(private auditRepo: IAuditRepository) {}

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 200 } = req.query;
      const logs = await this.auditRepo.findAll(Number(limit));
      res.status(200).json(logs);
    } catch (err) {
      next(err);
    }
  };
}
