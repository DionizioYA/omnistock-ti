import { PrismaClient, Product, Prisma } from '@prisma/client';
import { IProductRepository } from '../interfaces';
import { PaginationParams, PaginatedResult } from '../../domain/types';

export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true
      }
    });
  }

  public async findByCode(code: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { code },
      include: { category: true, supplier: true }
    });
  }

  public async findByBarcode(barcode: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { barcode },
      include: { category: true, supplier: true }
    });
  }

  public async findAll(params: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
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

  public async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
      include: { category: true, supplier: true }
    });
  }

  public async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, supplier: true }
    });
  }

  public async delete(id: string): Promise<Product> {
    // Exclusão lógica (Enterprise ERP Best Practice)
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true, supplier: true }
    });
  }

  public async updateStock(id: string, newStock: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { currentStock: newStock },
      include: { category: true, supplier: true }
    });
  }

  public async getLowStockProducts(): Promise<Product[]> {
    const all = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true }
    });
    return all.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock);
  }

  public async getZeroStockProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true, currentStock: 0 },
      include: { category: true, supplier: true }
    });
  }

  public async getExpiringSoonProducts(days = 30): Promise<Product[]> {
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

  public async countAll(): Promise<number> {
    return this.prisma.product.count({ where: { isActive: true } });
  }
}
