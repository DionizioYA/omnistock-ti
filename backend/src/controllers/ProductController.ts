import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { productSchema } from '../domain/schemas';

export class ProductController {
  constructor(private productService: ProductService) {}

  public getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        supplierId,
        sortBy,
        sortOrder,
        lowStock,
        zeroStock
      } = req.query;

      const result = await this.productService.getProducts({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        categoryId: categoryId as string,
        supplierId: supplierId as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
        lowStock: lowStock === 'true',
        zeroStock: zeroStock === 'true'
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = productSchema.parse(req.body);
      const product = await this.productService.createProduct(validated);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(200).json({ message: 'Produto desativado com sucesso (exclusão lógica ERP).' });
    } catch (err) {
      next(err);
    }
  };

  public exportExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.productService.exportProductsToExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=omnistock-produtos-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public importExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Nota: Em cenários com multer, o buffer está em req.file.buffer.
      // Aqui aceitamos req.body em base64 ou multipart simulado para facilidade de teste local.
      const base64Data = req.body.fileData;
      if (!base64Data) {
        res.status(400).json({ error: 'Arquivo Excel não fornecido para importação.' });
        return;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const result = await this.productService.importProductsFromExcel(buffer);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
