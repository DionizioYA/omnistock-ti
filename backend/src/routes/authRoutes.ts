import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/login', authController.login);
  router.get('/me', authMiddleware, authController.getMe);

  return router;
};
