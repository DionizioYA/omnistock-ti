import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createInventoryRoutes = (inventoryController: InventoryController): Router => {
  const router = Router();

  router.get('/', authMiddleware, inventoryController.getAudits);
  router.get('/:id', authMiddleware, inventoryController.getAuditById);

  // Iniciar novo inventário
  router.post('/', authMiddleware, requireRoles('ADMIN', 'GESTOR', 'ALMOXARIFE'), inventoryController.createAudit);

  // Lançamento de contagem física (Suporta bipar código de barras)
  router.post('/:id/items', authMiddleware, requireRoles('ADMIN', 'GESTOR', 'ALMOXARIFE'), inventoryController.registerConferenceCount);

  // Ajuste automático de divergências
  router.post('/:id/auto-adjust', authMiddleware, requireRoles('ADMIN', 'GESTOR'), inventoryController.autoAdjustDivergences);

  return router;
};
