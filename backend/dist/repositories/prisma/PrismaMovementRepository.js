"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMovementRepository = void 0;
class PrismaMovementRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.stockMovement.findUnique({
            where: { id },
            include: {
                product: {
                    select: { id: true, code: true, barcode: true, name: true, unit: true, location: true }
                },
                user: {
                    select: { id: true, name: true, role: true }
                }
            }
        });
    }
    async findAll(params = {}) {
        const where = {};
        if (params.productId) {
            where.productId = params.productId;
        }
        if (params.type) {
            where.type = params.type;
        }
        return this.prisma.stockMovement.findMany({
            where,
            orderBy: { datetime: 'desc' },
            take: params.limit || 50,
            include: {
                product: {
                    select: { id: true, code: true, barcode: true, name: true, unit: true, location: true }
                },
                user: {
                    select: { id: true, name: true, role: true }
                }
            }
        });
    }
    async create(data) {
        return this.prisma.stockMovement.create({
            data,
            include: {
                product: true,
                user: {
                    select: { id: true, name: true, role: true }
                }
            }
        });
    }
    async getTopMovedProducts(limit = 6) {
        const grouped = await this.prisma.stockMovement.groupBy({
            by: ['productId'],
            _count: {
                id: true
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: limit
        });
        const productIds = grouped.map(g => g.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, code: true, name: true, unit: true, currentStock: true }
        });
        return grouped.map(g => {
            const p = products.find(prod => prod.id === g.productId);
            return {
                id: g.productId,
                code: p?.code || 'N/A',
                name: p?.name || 'Produto Removido',
                unit: p?.unit || 'UN',
                currentStock: p?.currentStock || 0,
                totalQuantityMoved: g._sum.quantity || 0,
                movementsCount: g._count.id || 0
            };
        });
    }
    async getMovementsStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [entradas, saidas] = await Promise.all([
            this.prisma.stockMovement.aggregate({
                where: {
                    datetime: { gte: startDate },
                    type: { in: ['ENTRADA', 'DEVOLUCAO'] }
                },
                _sum: { quantity: true }
            }),
            this.prisma.stockMovement.aggregate({
                where: {
                    datetime: { gte: startDate },
                    type: { in: ['SAIDA', 'AJUSTE'] }
                },
                _sum: { quantity: true }
            })
        ]);
        return {
            entradas: entradas._sum.quantity || 0,
            saidas: saidas._sum.quantity || 0
        };
    }
}
exports.PrismaMovementRepository = PrismaMovementRepository;
