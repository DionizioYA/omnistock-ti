"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaLoanRepository = void 0;
class PrismaLoanRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.loan.findUnique({
            where: { id },
            include: {
                product: true
            }
        });
    }
    async findAll(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        return this.prisma.loan.findMany({
            where,
            include: {
                product: true
            },
            orderBy: { loanDate: 'desc' }
        });
    }
    async create(data) {
        return this.prisma.loan.create({
            data,
            include: {
                product: true
            }
        });
    }
    async update(id, data) {
        return this.prisma.loan.update({
            where: { id },
            data,
            include: {
                product: true
            }
        });
    }
    async getOverdueLoans() {
        return this.prisma.loan.findMany({
            where: {
                status: 'OVERDUE'
            },
            include: {
                product: true
            },
            orderBy: { loanDate: 'asc' }
        });
    }
    async delete(id) {
        return this.prisma.loan.delete({
            where: { id }
        });
    }
}
exports.PrismaLoanRepository = PrismaLoanRepository;
