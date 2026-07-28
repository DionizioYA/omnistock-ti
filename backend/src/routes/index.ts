import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaProductRepository } from '../repositories/prisma/PrismaProductRepository';
import { PrismaCategoryRepository } from '../repositories/prisma/PrismaCategoryRepository';
import { PrismaSupplierRepository } from '../repositories/prisma/PrismaSupplierRepository';
import { PrismaMovementRepository } from '../repositories/prisma/PrismaMovementRepository';
import { PrismaInventoryRepository } from '../repositories/prisma/PrismaInventoryRepository';
import { PrismaAlertRepository } from '../repositories/prisma/PrismaAlertRepository';
import { PrismaUserRepository } from '../repositories/prisma/PrismaUserRepository';
import { PrismaAuditRepository } from '../repositories/prisma/PrismaAuditRepository';
import { PrismaLoanRepository } from '../repositories/prisma/PrismaLoanRepository';

// Services
import { AuthService } from '../services/AuthService';
import { ProductService } from '../services/ProductService';
import { MovementService } from '../services/MovementService';
import { InventoryService } from '../services/InventoryService';
import { ReportService } from '../services/ReportService';
import { BackupService } from '../services/BackupService';

// Controllers
import { AuthController } from '../controllers/AuthController';
import { ProductController } from '../controllers/ProductController';
import { CategoryController } from '../controllers/CategoryController';
import { SupplierController } from '../controllers/SupplierController';
import { MovementController } from '../controllers/MovementController';
import { InventoryController } from '../controllers/InventoryController';
import { AlertController } from '../controllers/AlertController';
import { ReportController } from '../controllers/ReportController';
import { AuditController } from '../controllers/AuditController';
import { BackupController } from '../controllers/BackupController';
import { LoanController } from '../controllers/LoanController';

// Route creators
import { createAuthRoutes } from './authRoutes';
import { createProductRoutes } from './productRoutes';
import { createCategoryRoutes } from './categoryRoutes';
import { createSupplierRoutes } from './supplierRoutes';
import { createMovementRoutes } from './movementRoutes';
import { createInventoryRoutes } from './inventoryRoutes';
import { createAlertRoutes } from './alertRoutes';
import { createReportRoutes } from './reportRoutes';
import { createAuditRoutes } from './auditRoutes';
import { createBackupRoutes } from './backupRoutes';
import { createLoanRoutes } from './loanRoutes';
import { createSwaggerRoutes } from './swagger';

export const buildApiRouter = (prisma: PrismaClient): Router => {
  const router = Router();

  // 1. Instanciar repositórios via Prisma
  const productRepo = new PrismaProductRepository(prisma);
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const supplierRepo = new PrismaSupplierRepository(prisma);
  const movementRepo = new PrismaMovementRepository(prisma);
  const inventoryRepo = new PrismaInventoryRepository(prisma);
  const alertRepo = new PrismaAlertRepository(prisma);
  const userRepo = new PrismaUserRepository(prisma);
  const auditRepo = new PrismaAuditRepository(prisma);
  const loanRepo = new PrismaLoanRepository(prisma);

  // 2. Instanciar serviços
  const authService = new AuthService(userRepo);
  const productService = new ProductService(productRepo, alertRepo);
  const movementService = new MovementService(movementRepo, productRepo, alertRepo);
  const inventoryService = new InventoryService(inventoryRepo, productRepo, movementService, prisma);
  const reportService = new ReportService(productRepo, movementRepo, categoryRepo, loanRepo);
  const backupService = new BackupService(prisma);

  // 3. Instanciar controllers
  const authController = new AuthController(authService);
  const productController = new ProductController(productService);
  const categoryController = new CategoryController(categoryRepo);
  const supplierController = new SupplierController(supplierRepo);
  const movementController = new MovementController(movementService);
  const inventoryController = new InventoryController(inventoryService);
  const alertController = new AlertController(alertRepo);
  const reportController = new ReportController(reportService);
  const auditController = new AuditController(auditRepo);
  const backupController = new BackupController(backupService);
  const loanController = new LoanController(loanRepo, productRepo, movementRepo);

  // 4. Registrar rotas em sub-paths
  router.use('/auth', createAuthRoutes(authController));
  router.use('/products', createProductRoutes(productController));
  router.use('/categories', createCategoryRoutes(categoryController));
  router.use('/suppliers', createSupplierRoutes(supplierController));
  router.use('/movements', createMovementRoutes(movementController));
  router.use('/inventory', createInventoryRoutes(inventoryController));
  router.use('/alerts', createAlertRoutes(alertController));
  router.use('/reports', createReportRoutes(reportController));
  router.use('/audit-logs', createAuditRoutes(auditController));
  router.use('/backup', createBackupRoutes(backupController));
  router.use('/loans', createLoanRoutes(loanController));
  router.use('/docs', createSwaggerRoutes());

  return router;
};
