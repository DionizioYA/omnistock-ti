"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSupplierRepository = void 0;
class PrismaSupplierRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.supplier.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async findByCnpj(cnpj) {
        return this.prisma.supplier.findUnique({
            where: { cnpj }
        });
    }
    async findAll() {
        return this.prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { nomeFantasia: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async create(data) {
        return this.prisma.supplier.create({
            data
        });
    }
    async update(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return this.prisma.supplier.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
exports.PrismaSupplierRepository = PrismaSupplierRepository;
