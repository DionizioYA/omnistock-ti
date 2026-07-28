import { Request, Response, NextFunction } from 'express';
import { ICategoryRepository } from '../repositories/interfaces';
import { categorySchema } from '../domain/schemas';

export class CategoryController {
  constructor(private categoryRepo: ICategoryRepository) {}

  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.categoryRepo.findAll();
      res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = categorySchema.parse(req.body);
      const category = await this.categoryRepo.create(validated);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  };

  public updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.categoryRepo.update(req.params.id, req.body);
      res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  };

  public deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.categoryRepo.delete(req.params.id);
      res.status(200).json({ message: 'Categoria removida com sucesso.' });
    } catch (err) {
      next(err);
    }
  };
}
