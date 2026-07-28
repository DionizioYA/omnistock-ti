"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApiRouter = void 0;
const express_1 = require("express");
// Repositories
const PrismaProductRepository_1 = require("../repositories/prisma/PrismaProductRepository");
const PrismaCategoryRepository_1 = require("../repositories/prisma/PrismaCategoryRepository");
const PrismaSupplierRepository_1 = require("../repositories/prisma/PrismaSupplierRepository");
const PrismaMovementRepository_1 = require("../repositories/prisma/PrismaMovementRepository");
const PrismaInventoryRepository_1 = require("../repositories/prisma/PrismaInventoryRepository");
const PrismaAlertRepository_1 = require("../repositories/prisma/PrismaAlertRepository");
const PrismaUserRepository_1 = require("../repositories/prisma/PrismaUserRepository");
const PrismaAuditRepository_1 = require("../repositories/prisma/PrismaAuditRepository");
const PrismaLoanRepository_1 = require("../repositories/prisma/PrismaLoanRepository");
// Services
const AuthService_1 = require("../services/AuthService");
const ProductService_1 = require("../services/ProductService");
const MovementService_1 = require("../services/MovementService");
const InventoryService_1 = require("../services/InventoryService");
const ReportService_1 = require("../services/ReportService");
const BackupService_1 = require("../services/BackupService");
// Controllers
const AuthController_1 = require("../controllers/AuthController");
const ProductController_1 = require("../controllers/ProductController");
const CategoryController_1 = require("../controllers/CategoryController");
const SupplierController_1 = require("../controllers/SupplierController");
const MovementController_1 = require("../controllers/MovementController");
const InventoryController_1 = require("../controllers/InventoryController");
const AlertController_1 = require("../controllers/AlertController");
const ReportController_1 = require("../controllers/ReportController");
const AuditController_1 = require("../controllers/AuditController");
const BackupController_1 = require("../controllers/BackupController");
const LoanController_1 = require("../controllers/LoanController");
// Route creators
const authRoutes_1 = require("./authRoutes");
const productRoutes_1 = require("./productRoutes");
const categoryRoutes_1 = require("./categoryRoutes");
const supplierRoutes_1 = require("./supplierRoutes");
const movementRoutes_1 = require("./movementRoutes");
const inventoryRoutes_1 = require("./inventoryRoutes");
const alertRoutes_1 = require("./alertRoutes");
const reportRoutes_1 = require("./reportRoutes");
const auditRoutes_1 = require("./auditRoutes");
const backupRoutes_1 = require("./backupRoutes");
const loanRoutes_1 = require("./loanRoutes");
const swagger_1 = require("./swagger");
const buildApiRouter = (prisma) => {
    const router = (0, express_1.Router)();
    // 1. Instanciar repositórios via Prisma
    const productRepo = new PrismaProductRepository_1.PrismaProductRepository(prisma);
    const categoryRepo = new PrismaCategoryRepository_1.PrismaCategoryRepository(prisma);
    const supplierRepo = new PrismaSupplierRepository_1.PrismaSupplierRepository(prisma);
    const movementRepo = new PrismaMovementRepository_1.PrismaMovementRepository(prisma);
    const inventoryRepo = new PrismaInventoryRepository_1.PrismaInventoryRepository(prisma);
    const alertRepo = new PrismaAlertRepository_1.PrismaAlertRepository(prisma);
    const userRepo = new PrismaUserRepository_1.PrismaUserRepository(prisma);
    const auditRepo = new PrismaAuditRepository_1.PrismaAuditRepository(prisma);
    const loanRepo = new PrismaLoanRepository_1.PrismaLoanRepository(prisma);
    // 2. Instanciar serviços
    const authService = new AuthService_1.AuthService(userRepo);
    const productService = new ProductService_1.ProductService(productRepo, alertRepo);
    const movementService = new MovementService_1.MovementService(movementRepo, productRepo, alertRepo);
    const inventoryService = new InventoryService_1.InventoryService(inventoryRepo, productRepo, movementService, prisma);
    const reportService = new ReportService_1.ReportService(productRepo, movementRepo, categoryRepo, loanRepo);
    const backupService = new BackupService_1.BackupService(prisma);
    // 3. Instanciar controllers
    const authController = new AuthController_1.AuthController(authService);
    const productController = new ProductController_1.ProductController(productService);
    const categoryController = new CategoryController_1.CategoryController(categoryRepo);
    const supplierController = new SupplierController_1.SupplierController(supplierRepo);
    const movementController = new MovementController_1.MovementController(movementService);
    const inventoryController = new InventoryController_1.InventoryController(inventoryService);
    const alertController = new AlertController_1.AlertController(alertRepo);
    const reportController = new ReportController_1.ReportController(reportService);
    const auditController = new AuditController_1.AuditController(auditRepo);
    const backupController = new BackupController_1.BackupController(backupService);
    const loanController = new LoanController_1.LoanController(loanRepo, productRepo, movementRepo);
    // 4. Registrar rotas em sub-paths
    router.use('/auth', (0, authRoutes_1.createAuthRoutes)(authController));
    router.use('/products', (0, productRoutes_1.createProductRoutes)(productController));
    router.use('/categories', (0, categoryRoutes_1.createCategoryRoutes)(categoryController));
    router.use('/suppliers', (0, supplierRoutes_1.createSupplierRoutes)(supplierController));
    router.use('/movements', (0, movementRoutes_1.createMovementRoutes)(movementController));
    router.use('/inventory', (0, inventoryRoutes_1.createInventoryRoutes)(inventoryController));
    router.use('/alerts', (0, alertRoutes_1.createAlertRoutes)(alertController));
    router.use('/reports', (0, reportRoutes_1.createReportRoutes)(reportController));
    router.use('/audit-logs', (0, auditRoutes_1.createAuditRoutes)(auditController));
    router.use('/backup', (0, backupRoutes_1.createBackupRoutes)(backupController));
    router.use('/loans', (0, loanRoutes_1.createLoanRoutes)(loanController));
    router.use('/docs', (0, swagger_1.createSwaggerRoutes)());
    return router;
};
exports.buildApiRouter = buildApiRouter;
