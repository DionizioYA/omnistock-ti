import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createSupplierRoutes = (supplierController: SupplierController): Router => {
  const router = Router();

  router.get('/', authMiddleware, supplierController.getSuppliers);
  router.get('/:id', authMiddleware, supplierController.getSupplierById);
  router.post('/', authMiddleware, requireRoles('ADMIN', 'GESTOR'), supplierController.createSupplier);
  router.put('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), supplierController.updateSupplier);
  router.delete('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), supplierController.deleteSupplier);

  return router;
};
