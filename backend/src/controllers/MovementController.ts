import { Request, Response, NextFunction } from 'express';
import { MovementService } from '../services/MovementService';
import { movementSchema } from '../domain/schemas';
import { AuthenticatedRequest } from '../middlewares/auth';

export class MovementController {
  constructor(private movementService: MovementService) {}

  public getMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, type, limit = 50 } = req.query;
      const movements = await this.movementService.getMovements({
        productId: productId as string,
        type: type as string,
        limit: Number(limit)
      });
      res.status(200).json(movements);
    } catch (err) {
      next(err);
    }
  };

  public getMovementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movement = await this.movementService.getMovementById(req.params.id);
      res.status(200).json(movement);
    } catch (err) {
      next(err);
    }
  };

  public registerMovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = movementSchema.parse(req.body);

      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const movement = await this.movementService.registerMovement({
        ...validated,
        userId: req.user.id
      });

      res.status(201).json(movement);
    } catch (err) {
      next(err);
    }
  };
}
