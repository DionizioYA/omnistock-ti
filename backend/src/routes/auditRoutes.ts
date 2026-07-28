import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createAuditRoutes = (auditController: AuditController): Router => {
  const router = Router();

  // Apenas ADMIN e GESTOR podem auditar os logs de governança
  router.get('/', authMiddleware, requireRoles('ADMIN', 'GESTOR'), auditController.getLogs);

  return router;
};
