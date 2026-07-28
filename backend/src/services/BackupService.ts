import { PrismaClient } from '@prisma/client';

export class BackupService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Exporta um snapshot em tempo real de todo o banco de dados ERP em formato JSON estruturado.
   */
  public async generateFullBackup(): Promise<any> {
    const [users, categories, suppliers, products, stockMovements, inventoryAudits, alerts, auditLogs] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true } }),
      this.prisma.category.findMany(),
      this.prisma.supplier.findMany(),
      this.prisma.product.findMany(),
      this.prisma.stockMovement.findMany(),
      this.prisma.inventoryAudit.findMany({ include: { items: true } }),
      this.prisma.alert.findMany(),
      this.prisma.auditLog.findMany({ take: 1000 })
    ]);

    return {
      metadata: {
        system: 'OmniStock ERP - Sistema Completo de Controle de Estoque',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        counts: {
          users: users.length,
          categories: categories.length,
          suppliers: suppliers.length,
          products: products.length,
          movements: stockMovements.length,
          inventoryAudits: inventoryAudits.length,
          alerts: alerts.length
        }
      },
      data: {
        users,
        categories,
        suppliers,
        products,
        stockMovements,
        inventoryAudits,
        alerts,
        auditLogs
      }
    };
  }
}
