"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
class InventoryService {
    inventoryRepo;
    productRepo;
    movementService;
    prisma;
    constructor(inventoryRepo, productRepo, movementService, prisma) {
        this.inventoryRepo = inventoryRepo;
        this.productRepo = productRepo;
        this.movementService = movementService;
        this.prisma = prisma;
    }
    async getAudits() {
        return this.inventoryRepo.findAll();
    }
    async getAuditById(id) {
        const audit = await this.inventoryRepo.findById(id);
        if (!audit) {
            throw new Error('Inventário não encontrado');
        }
        return audit;
    }
    async createAudit(data) {
        const allProductsResult = await this.productRepo.findAll({ limit: 1000 });
        let targetProducts = allProductsResult.data;
        if (data.type === 'POR_CATEGORIA' && data.targetFilter) {
            targetProducts = targetProducts.filter(p => p.categoryId === data.targetFilter);
        }
        else if (data.type === 'POR_LOCALIZACAO' && data.targetFilter) {
            targetProducts = targetProducts.filter(p => p.location?.toLowerCase().includes(data.targetFilter.toLowerCase()));
        }
        if (targetProducts.length === 0) {
            throw new Error('Nenhum produto encontrado para o escopo selecionado do inventário.');
        }
        const count = await this.prisma.inventoryAudit.count();
        const code = `INV-2026-${String(count + 1).padStart(4, '0')}`;
        const audit = await this.inventoryRepo.create({
            code,
            title: data.title,
            type: data.type,
            targetFilter: data.targetFilter || null,
            notes: data.notes || null,
            user: { connect: { id: data.userId } },
            items: {
                create: targetProducts.map(p => ({
                    productId: p.id,
                    systemQuantity: p.currentStock,
                    physicalCount: null,
                    divergence: null,
                    isAdjusted: false
                }))
            }
        });
        return this.getAuditById(audit.id);
    }
    async registerItemCount(auditId, productIdOrBarcode, physicalCount) {
        const audit = await this.inventoryRepo.findById(auditId);
        if (!audit || audit.status !== 'IN_PROGRESS') {
            throw new Error('Inventário não está aberto para conferência');
        }
        let targetProductId = productIdOrBarcode;
        let product = await this.productRepo.findById(targetProductId);
        if (!product) {
            product = await this.productRepo.findByBarcode(targetProductId);
            if (!product) {
                product = await this.productRepo.findByCode(targetProductId);
            }
            if (product) {
                targetProductId = product.id;
            }
        }
        return this.inventoryRepo.updateItemCount(auditId, targetProductId, physicalCount);
    }
    async autoAdjustAndComplete(auditId, userId) {
        const audit = await this.inventoryRepo.findById(auditId);
        if (!audit || audit.status !== 'IN_PROGRESS') {
            throw new Error('Inventário não está em andamento');
        }
        const items = await this.inventoryRepo.getItemsByAuditId(auditId);
        let adjustedCount = 0;
        for (const item of items) {
            if (item.physicalCount !== null && item.divergence !== null && item.divergence !== 0) {
                await this.movementService.registerMovement({
                    type: 'AJUSTE',
                    productId: item.productId,
                    quantity: item.physicalCount,
                    userId,
                    reason: `Ajuste Automático do Inventário ${audit.code} (${audit.title}) - Divergência: ${item.divergence > 0 ? `+${item.divergence}` : item.divergence}`,
                    observation: `Divergência entre saldo anterior (${item.systemQuantity}) e contagem física (${item.physicalCount})`
                });
                await this.prisma.inventoryAuditItem.update({
                    where: { id: item.id },
                    data: { isAdjusted: true }
                });
                adjustedCount++;
            }
        }
        const completedAudit = await this.inventoryRepo.updateStatus(auditId, 'COMPLETED', `Concluído em ${new Date().toLocaleString('pt-BR')}. ${adjustedCount} item(ns) com divergência ajustado(s) automaticamente.`);
        return completedAudit;
    }
}
exports.InventoryService = InventoryService;
