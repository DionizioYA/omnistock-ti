import { PrismaClient, Category, Prisma } from '@prisma/client';
import { ICategoryRepository } from '../interfaces';

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<Category | null> {
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

  public async findAll(): Promise<Category[]> {
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

  public async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  public async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
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

  public async delete(id: string): Promise<Category> {
    return this.prisma.category.delete({
      where: { id }
    });
  }
}
