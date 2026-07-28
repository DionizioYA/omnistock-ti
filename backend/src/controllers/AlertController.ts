import { Request, Response, NextFunction } from 'express';
import { IAlertRepository } from '../repositories/interfaces';

export class AlertController {
  constructor(private alertRepo: IAlertRepository) {}

  public getActiveAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.alertRepo.findAllActive();
      res.status(200).json(alerts);
    } catch (err) {
      next(err);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.alertRepo.markAsRead(req.params.id);
      res.status(200).json(alert);
    } catch (err) {
      next(err);
    }
  };
}
