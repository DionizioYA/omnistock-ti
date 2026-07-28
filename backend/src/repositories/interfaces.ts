import {
  Product,
  Category,
  Supplier,
  StockMovement,
  InventoryAudit,
  InventoryAuditItem,
  Alert,
  AuditLog,
  User,
  Loan,
  Prisma
} from '@prisma/client';
import { PaginationParams, PaginatedResult } from '../domain/types';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCode(code: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Product>>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<Product>;
  updateStock(id: string, newStock: number): Promise<Product>;
  getLowStockProducts(): Promise<Product[]>;
  getZeroStockProducts(): Promise<Product[]>;
  getExpiringSoonProducts(days?: number): Promise<Product[]>;
  countAll(): Promise<number>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  create(data: Prisma.CategoryCreateInput): Promise<Category>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  delete(id: string): Promise<Category>;
}

export interface ISupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findByCnpj(cnpj: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  create(data: Prisma.SupplierCreateInput): Promise<Supplier>;
  update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier>;
  delete(id: string): Promise<Supplier>;
}

export interface IMovementRepository {
  findById(id: string): Promise<StockMovement | null>;
  findAll(params: { productId?: string; type?: string; limit?: number }): Promise<StockMovement[]>;
  create(data: Prisma.StockMovementUncheckedCreateInput): Promise<StockMovement>;
  getTopMovedProducts(limit?: number): Promise<any[]>;
  getMovementsStats(days?: number): Promise<{ entradas: number; saidas: number }>;
}

export interface IInventoryRepository {
  findById(id: string): Promise<InventoryAudit | null>;
  findAll(): Promise<InventoryAudit[]>;
  create(data: Prisma.InventoryAuditCreateInput): Promise<InventoryAudit>;
  updateStatus(id: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', notes?: string): Promise<InventoryAudit>;
  updateItemCount(auditId: string, productId: string, physicalCount: number): Promise<InventoryAuditItem>;
  getItemsByAuditId(auditId: string): Promise<InventoryAuditItem[]>;
}

export interface IAlertRepository {
  findById(id: string): Promise<Alert | null>;
  findAllActive(): Promise<Alert[]>;
  create(data: Prisma.AlertUncheckedCreateInput): Promise<Alert>;
  markAsRead(id: string): Promise<Alert>;
  deleteByProductIdAndType(productId: string, type: string): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
}

export interface IAuditRepository {
  log(data: Prisma.AuditLogCreateInput): Promise<AuditLog>;
  findAll(limit?: number): Promise<AuditLog[]>;
}

export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findAll(status?: string): Promise<Loan[]>;
  create(data: Prisma.LoanUncheckedCreateInput): Promise<Loan>;
  update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan>;
  getOverdueLoans(): Promise<Loan[]>;
  delete(id: string): Promise<Loan>;
}

