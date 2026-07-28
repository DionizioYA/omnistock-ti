import { PrismaClient, InventoryAudit, InventoryAuditItem, Prisma } from '@prisma/client';
import { IInventoryRepository } from '../interfaces';

export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<InventoryAudit | null> {
    return this.prisma.inventoryAudit.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                barcode: true,
                name: true,
                unit: true,
                location: true,
                currentStock: true
              }
            }
          },
          orderBy: {
            product: { name: 'asc' }
          }
        }
      }
    });
  }

  public async findAll(): Promise<InventoryAudit[]> {
    return this.prisma.inventoryAudit.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        },
        _count: {
          select: { items: true }
        }
      }
    });
  }

  public async create(data: Prisma.InventoryAuditCreateInput): Promise<InventoryAudit> {
    return this.prisma.inventoryAudit.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, role: true }
        },
        items: true
      }
    });
  }

  public async updateStatus(id: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', notes?: string): Promise<InventoryAudit> {
    const updateData: Prisma.InventoryAuditUpdateInput = {
      status
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    return this.prisma.inventoryAudit.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, role: true }
        },
        items: true
      }
    });
  }

  public async updateItemCount(auditId: string, productId: string, physicalCount: number): Promise<InventoryAuditItem> {
    const existing = await this.prisma.inventoryAuditItem.findUnique({
      where: {
        auditId_productId: { auditId, productId }
      }
    });

    if (!existing) {
      throw new Error('Item de inventário não encontrado');
    }

    const divergence = physicalCount - existing.systemQuantity;

    return this.prisma.inventoryAuditItem.update({
      where: { id: existing.id },
      data: {
        physicalCount,
        divergence
      },
      include: {
        product: true
      }
    });
  }

  public async getItemsByAuditId(auditId: string): Promise<InventoryAuditItem[]> {
    return this.prisma.inventoryAuditItem.findMany({
      where: { auditId },
      include: {
        product: true
      }
    });
  }
}
