import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { loginSchema } from '../domain/schemas';
import { AuthenticatedRequest } from '../middlewares/auth';

export class AuthController {
  constructor(private authService: AuthService) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        user: req.user
      });
    } catch (err) {
      next(err);
    }
  };
}
