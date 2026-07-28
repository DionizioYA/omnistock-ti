import { Request, Response, NextFunction } from 'express';
import { BackupService } from '../services/BackupService';

export class BackupController {
  constructor(private backupService: BackupService) {}

  public getFullBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backup = await this.backupService.generateFullBackup();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-backup-${Date.now()}.json`);
      res.status(200).json(backup);
    } catch (err) {
      next(err);
    }
  };
}
