import { PrismaClient, AuditLog, Prisma } from '@prisma/client';
import { IAuditRepository } from '../interfaces';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private prisma: PrismaClient) {}

  public async log(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  public async findAll(limit = 100): Promise<AuditLog[]> {
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
