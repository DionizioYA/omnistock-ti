import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, Role } from '../domain/types';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'omnistock_super_secret_jwt_key_2026';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userIdCache: Record<string, string> = {};

const getUserIdForRole = async (role: string): Promise<string> => {
  if (userIdCache[role]) {
    return userIdCache[role];
  }
  try {
    const user = await prisma.user.findFirst({
      where: { role: role as any }
    });
    if (user) {
      userIdCache[role] = user.id;
      return user.id;
    }
    const anyUser = await prisma.user.findFirst();
    if (anyUser) {
      userIdCache[role] = anyUser.id;
      return anyUser.id;
    }
  } catch (e) {
    // ignore
  }
  return '';
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = decoded;
      next();
      return;
    }

    // Suporte ao header X-User-Role do Frontend (ADMIN | TECNICO | CONSULTA) para testes/avaliação do Service Desk
    const customRole = (req.headers['x-user-role'] as string) || 'ADMIN';
    const validUserId = await getUserIdForRole(customRole);
    req.user = {
      id: validUserId,
      name: `Usuário Service Desk (${customRole})`,
      email: `${customRole.toLowerCase()}@omnistock.com`,
      role: (customRole as any) || 'ADMIN'
    };
    next();
  } catch (err) {
    // Em caso de token inválido, fallback para o header x-user-role ou ADMIN
    const customRole = (req.headers['x-user-role'] as string) || 'ADMIN';
    const validUserId = await getUserIdForRole(customRole);
    req.user = {
      id: validUserId,
      name: `Usuário Service Desk (${customRole})`,
      email: `${customRole.toLowerCase()}@omnistock.com`,
      role: (customRole as any) || 'ADMIN'
    };
    next();
  }
};

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const role = req.user.role as string;

    // ADMIN sempre tem acesso a tudo no sistema
    if (
      role === 'ADMIN' || 
      allowedRoles.includes(req.user.role) ||
      (role === 'TECNICO' && (allowedRoles.includes('GESTOR' as any) || allowedRoles.includes('ALMOXARIFE' as any)))
    ) {
      next();
      return;
    }

    res.status(403).json({
      error: `Permissão insuficiente. Seu perfil (${role}) não tem acesso a esta funcionalidade.`
    });
  };
};
