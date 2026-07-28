import { PrismaClient, Alert, Prisma } from '@prisma/client';
import { IAlertRepository } from '../interfaces';

export class PrismaAlertRepository implements IAlertRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Alert | null> {
    return this.prisma.alert.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, code: true, barcode: true, name: true, currentStock: true, minStock: true }
        }
      }
    });
  }

  public async findAllActive(): Promise<Alert[]> {
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

  private async syncOverdueLoanAlerts(): Promise<void> {
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
    } catch (error) {
      console.error('Erro ao sincronizar alertas de empréstimos:', error);
    }
  }

  public async create(data: Prisma.AlertUncheckedCreateInput): Promise<Alert> {
    return this.prisma.alert.create({
      data,
      include: {
        product: {
          select: { id: true, code: true, barcode: true, name: true, currentStock: true, minStock: true }
        }
      }
    });
  }

  public async markAsRead(id: string): Promise<Alert> {
    return this.prisma.alert.update({
      where: { id },
      data: { isRead: true }
    });
  }

  public async deleteByProductIdAndType(productId: string, type: string): Promise<void> {
    await this.prisma.alert.deleteMany({
      where: {
        productId,
        type: type as any
      }
    });
  }
}
