"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCategoryRepository = void 0;
class PrismaCategoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                children: {
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async create(data) {
        return this.prisma.category.create({
            data,
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async update(id, data) {
        return this.prisma.category.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.category.delete({
            where: { id }
        });
    }
}
exports.PrismaCategoryRepository = PrismaCategoryRepository;
