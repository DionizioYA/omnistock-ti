import { PrismaClient, User, Prisma } from '@prisma/client';
import { IUserRepository } from '../interfaces';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  public async findAll(): Promise<User[]> {
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

  public async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }
}
