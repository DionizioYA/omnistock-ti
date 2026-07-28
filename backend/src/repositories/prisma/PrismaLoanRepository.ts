import { PrismaClient, Loan, Prisma } from '@prisma/client';
import { ILoanRepository } from '../interfaces';

export class PrismaLoanRepository implements ILoanRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Loan | null> {
    return this.prisma.loan.findUnique({
      where: { id },
      include: {
        product: true
      }
    });
  }

  public async findAll(status?: string): Promise<Loan[]> {
    const where: Prisma.LoanWhereInput = {};
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

  public async create(data: Prisma.LoanUncheckedCreateInput): Promise<Loan> {
    return this.prisma.loan.create({
      data,
      include: {
        product: true
      }
    });
  }

  public async update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan> {
    return this.prisma.loan.update({
      where: { id },
      data,
      include: {
        product: true
      }
    });
  }

  public async getOverdueLoans(): Promise<Loan[]> {
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

  public async delete(id: string): Promise<Loan> {
    return this.prisma.loan.delete({
      where: { id }
    });
  }
}
