"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email }
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                department: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                passwordHash: true
            }
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
