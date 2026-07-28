import { Router } from 'express';
import { BackupController } from '../controllers/BackupController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createBackupRoutes = (backupController: BackupController): Router => {
  const router = Router();

  // Apenas ADMIN pode baixar o snapshot JSON completo de backup
  router.get('/download', authMiddleware, requireRoles('ADMIN'), backupController.getFullBackup);

  return router;
};
