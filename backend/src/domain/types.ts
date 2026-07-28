export type Role = 'ADMIN' | 'TECNICO' | 'CONSULTA' | 'GESTOR' | 'ALMOXARIFE';

export type MovementType = 'ENTRADA' | 'SAIDA' | 'EMPRESTIMO' | 'DEVOLUCAO' | 'BAIXA' | 'TRANSFERENCIA' | 'AJUSTE';

export type InventoryStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type InventoryType = 'GERAL' | 'POR_CATEGORIA' | 'POR_LOCALIZACAO';

export type AlertType = 'LOW_STOCK' | 'EXPIRING_SOON' | 'STALE_STOCK' | 'ZERO_STOCK' | 'DUPLICATE_PRODUCT' | 'OVERDUE_LOAN';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  supplierId?: string;
  lowStock?: boolean;
  zeroStock?: boolean;
  expiringSoon?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardKPIs {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  zeroStockCount: number;
  expiringSoonCount: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
  estimatedProfit: number;
  movementsToday: number;
  recentProductsCount: number;
  loanedCount?: number;
}

export interface ChartDataPoint {
  name: string;
  entradas?: number;
  saidas?: number;
  value?: number;
  count?: number;
  color?: string;
}

export interface LoanData {
  id?: string;
  userName: string;
  department: string;
  equipmentName: string;
  productId: string;
  patrimony?: string;
  loanDate?: Date | string;
  expectedReturnDate: Date | string;
  returnDate?: Date | string | null;
  deliveredBy: string;
  status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

