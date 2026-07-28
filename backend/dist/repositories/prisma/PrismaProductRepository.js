"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaProductRepository = void 0;
class PrismaProductRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true
            }
        });
    }
    async findByCode(code) {
        return this.prisma.product.findUnique({
            where: { code },
            include: { category: true, supplier: true }
        });
    }
    async findByBarcode(barcode) {
        return this.prisma.product.findUnique({
            where: { barcode },
            include: { category: true, supplier: true }
        });
    }
    async findAll(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true
        };
        if (params.search) {
            where.OR = [
                { name: { contains: params.search } },
                { code: { contains: params.search } },
                { barcode: { contains: params.search } },
                { brand: { contains: params.search } }
            ];
        }
        if (params.categoryId) {
            where.categoryId = params.categoryId;
        }
        if (params.supplierId) {
            where.supplierId = params.supplierId;
        }
        if (params.lowStock) {
            // Prisma SQLite / PostgreSQL filter where currentStock <= minStock and currentStock > 0
            where.AND = [
                { currentStock: { gt: 0 } },
                { currentStock: { lte: 5 } } // Exemplo de limiar
            ];
        }
        if (params.zeroStock) {
            where.currentStock = 0;
        }
        const [total, data] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [params.sortBy || 'name']: params.sortOrder || 'asc'
                },
                include: {
                    category: true,
                    supplier: true
                }
            })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async create(data) {
        return this.prisma.product.create({
            data,
            include: { category: true, supplier: true }
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
            include: { category: true, supplier: true }
        });
    }
    async delete(id) {
        // Exclusão lógica (Enterprise ERP Best Practice)
        return this.prisma.product.update({
            where: { id },
            data: { isActive: false },
            include: { category: true, supplier: true }
        });
    }
    async updateStock(id, newStock) {
        return this.prisma.product.update({
            where: { id },
            data: { currentStock: newStock },
            include: { category: true, supplier: true }
        });
    }
    async getLowStockProducts() {
        const all = await this.prisma.product.findMany({
            where: { isActive: true },
            include: { category: true, supplier: true }
        });
        return all.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock);
    }
    async getZeroStockProducts() {
        return this.prisma.product.findMany({
            where: { isActive: true, currentStock: 0 },
            include: { category: true, supplier: true }
        });
    }
    async getExpiringSoonProducts(days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.prisma.product.findMany({
            where: {
                isActive: true,
                expiryDate: {
                    not: null,
                    lte: futureDate
                }
            },
            include: { category: true, supplier: true }
        });
    }
    async countAll() {
        return this.prisma.product.count({ where: { isActive: true } });
    }
}
exports.PrismaProductRepository = PrismaProductRepository;
