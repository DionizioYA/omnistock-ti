import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createCategoryRoutes = (categoryController: CategoryController): Router => {
  const router = Router();

  router.get('/', authMiddleware, categoryController.getCategories);
  router.post('/', authMiddleware, requireRoles('ADMIN', 'GESTOR'), categoryController.createCategory);
  router.put('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), categoryController.updateCategory);
  router.delete('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), categoryController.deleteCategory);

  return router;
};
