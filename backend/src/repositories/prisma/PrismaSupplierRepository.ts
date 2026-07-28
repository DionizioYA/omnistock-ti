import { PrismaClient, Supplier, Prisma } from '@prisma/client';
import { ISupplierRepository } from '../interfaces';

export class PrismaSupplierRepository implements ISupplierRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  public async findByCnpj(cnpj: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { cnpj }
    });
  }

  public async findAll(): Promise<Supplier[]> {
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

  public async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.prisma.supplier.create({
      data
    });
  }

  public async update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data
    });
  }

  public async delete(id: string): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
