import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/InventoryService';
import { inventoryAuditSchema, inventoryConferenceItemSchema } from '../domain/schemas';
import { AuthenticatedRequest } from '../middlewares/auth';

export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  public getAudits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const audits = await this.inventoryService.getAudits();
      res.status(200).json(audits);
    } catch (err) {
      next(err);
    }
  };

  public getAuditById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const audit = await this.inventoryService.getAuditById(req.params.id);
      res.status(200).json(audit);
    } catch (err) {
      next(err);
    }
  };

  public createAudit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = inventoryAuditSchema.parse(req.body);

      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const audit = await this.inventoryService.createAudit({
        ...validated,
        userId: req.user.id
      });

      res.status(201).json(audit);
    } catch (err) {
      next(err);
    }
  };

  public registerConferenceCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, physicalCount } = inventoryConferenceItemSchema.parse(req.body);
      const updatedItem = await this.inventoryService.registerItemCount(req.params.id, productId, physicalCount);
      res.status(200).json(updatedItem);
    } catch (err) {
      next(err);
    }
  };

  public autoAdjustDivergences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const completedAudit = await this.inventoryService.autoAdjustAndComplete(req.params.id, req.user.id);
      res.status(200).json(completedAudit);
    } catch (err) {
      next(err);
    }
  };
}
