import { Router } from 'express';
import { MovementController } from '../controllers/MovementController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createMovementRoutes = (movementController: MovementController): Router => {
  const router = Router();

  // Visualização de movimentações
  router.get('/', authMiddleware, movementController.getMovements);
  router.get('/:id', authMiddleware, movementController.getMovementById);

  // Registrar nova movimentação imutável (ADMIN, GESTOR e ALMOXARIFE)
  router.post('/', authMiddleware, requireRoles('ADMIN', 'GESTOR', 'ALMOXARIFE'), movementController.registerMovement);

  return router;
};
