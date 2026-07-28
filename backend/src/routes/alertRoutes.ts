import { Router } from 'express';
import { AlertController } from '../controllers/AlertController';
import { authMiddleware } from '../middlewares/auth';

export const createAlertRoutes = (alertController: AlertController): Router => {
  const router = Router();

  router.get('/', authMiddleware, alertController.getActiveAlerts);
  router.put('/:id/read', authMiddleware, alertController.markAsRead);
  router.patch('/:id/read', authMiddleware, alertController.markAsRead);

  return router;
};
