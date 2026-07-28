"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaInventoryRepository = void 0;
class PrismaInventoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
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
    async findAll() {
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
    async create(data) {
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
    async updateStatus(id, status, notes) {
        const updateData = {
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
    async updateItemCount(auditId, productId, physicalCount) {
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
    async getItemsByAuditId(auditId) {
        return this.prisma.inventoryAuditItem.findMany({
            where: { auditId },
            include: {
                product: true
            }
        });
    }
}
exports.PrismaInventoryRepository = PrismaInventoryRepository;
