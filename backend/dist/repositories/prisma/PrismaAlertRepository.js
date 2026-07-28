"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAlertRepository = void 0;
class PrismaAlertRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.alert.findUnique({
            where: { id },
            include: {
                product: {
                    select: { id: true, code: true, barcode: true, name: true, currentStock: true, minStock: true }
                }
            }
        });
    }
    async findAllActive() {
        await this.syncOverdueLoanAlerts();
        return this.prisma.alert.findMany({
            where: { isRead: false },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { id: true, code: true, barcode: true, name: true, currentStock: true, minStock: true }
                }
            }
        });
    }
    async syncOverdueLoanAlerts() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const overdueLoans = await this.prisma.loan.findMany({
                where: {
                    status: { in: ['ACTIVE', 'OVERDUE'] },
                    loanDate: { lte: thirtyDaysAgo }
                }
            });
            for (const loan of overdueLoans) {
                if (loan.status === 'ACTIVE') {
                    await this.prisma.loan.update({
                        where: { id: loan.id },
                        data: { status: 'OVERDUE' }
                    });
                }
                const existingAlert = await this.prisma.alert.findFirst({
                    where: {
                        productId: loan.productId,
                        type: 'OVERDUE_LOAN',
                        isRead: false
                    }
                });
                if (!existingAlert) {
                    await this.prisma.alert.create({
                        data: {
                            type: 'OVERDUE_LOAN',
                            title: `Empréstimo de TI Excedeu 30 Dias`,
                            message: `Equipamento "${loan.equipmentName}" com "${loan.userName}" (${loan.department}) está em posse há mais de 30 dias. Data do empréstimo: ${new Date(loan.loanDate).toLocaleDateString('pt-BR')}.`,
                            productId: loan.productId
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error('Erro ao sincronizar alertas de empréstimos:', error);
        }
    }
    async create(data) {
        return this.prisma.alert.create({
            data,
            include: {
                product: {
                    select: { id: true, code: true, barcode: true, name: true, currentStock: true, minStock: true }
                }
            }
        });
    }
    async markAsRead(id) {
        return this.prisma.alert.update({
            where: { id },
            data: { isRead: true }
        });
    }
    async deleteByProductIdAndType(productId, type) {
        await this.prisma.alert.deleteMany({
            where: {
                productId,
                type: type
            }
        });
    }
}
exports.PrismaAlertRepository = PrismaAlertRepository;
