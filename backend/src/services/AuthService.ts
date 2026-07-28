import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/interfaces';
import { JWTPayload, Role } from '../domain/types';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'omnistock_super_secret_jwt_key_2026';

  constructor(private userRepo: IUserRepository) {}

  public async login(email: string, passwordPlain: string): Promise<{ token: string; user: any }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Usuário ou senha inválidos, ou conta inativa');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Usuário ou senha inválidos');
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        department: user.department
      }
    };
  }

  public verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload;
  }
}
