"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuditRepository = void 0;
class PrismaAuditRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        return this.prisma.auditLog.create({
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    async findAll(limit = 100) {
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
}
exports.PrismaAuditRepository = PrismaAuditRepository;
