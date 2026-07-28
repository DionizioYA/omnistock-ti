import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, requireRoles } from '../middlewares/auth';

export const createProductRoutes = (productController: ProductController): Router => {
  const router = Router();

  // Todos os papéis autenticados podem consultar os produtos e baixar Excel de estoque
  router.get('/', authMiddleware, productController.getProducts);
  router.get('/export/excel', authMiddleware, productController.exportExcel);
  router.get('/:id', authMiddleware, productController.getProductById);

  // Apenas ADMIN e GESTOR podem criar, editar, importar ou desativar produtos
  router.post('/', authMiddleware, requireRoles('ADMIN', 'GESTOR'), productController.createProduct);
  router.put('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), productController.updateProduct);
  router.delete('/:id', authMiddleware, requireRoles('ADMIN', 'GESTOR'), productController.deleteProduct);
  router.post('/import/excel', authMiddleware, requireRoles('ADMIN', 'GESTOR'), productController.importExcel);

  return router;
};
