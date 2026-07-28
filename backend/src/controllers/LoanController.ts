import { Request, Response } from 'express';
import { ILoanRepository, IProductRepository, IMovementRepository } from '../repositories/interfaces';
import { loanSchema } from '../domain/schemas';
import { PrismaClient } from '@prisma/client';

const prismaHelper = new PrismaClient();
const getValidUserId = async (reqUser: any): Promise<string> => {
  if (reqUser && reqUser.id && reqUser.id !== 'admin' && reqUser.id !== 'default-user-id') {
    return reqUser.id;
  }
  const u = await prismaHelper.user.findFirst();
  return u?.id || '';
};

export class LoanController {
  constructor(
    private loanRepo: ILoanRepository,
    private productRepo: IProductRepository,
    private movementRepo: IMovementRepository
  ) {}

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = req.query.status as string | undefined;
      const loans = await this.loanRepo.findAll(status);
      res.status(200).json(loans);
    } catch (error) {
      console.error('Erro ao listar empréstimos:', error);
      res.status(500).json({ error: 'Erro interno ao listar empréstimos.' });
    }
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const loan = await this.loanRepo.findById(id);
      if (!loan) {
        res.status(404).json({ error: 'Empréstimo não encontrado.' });
        return;
      }
      res.status(200).json(loan);
    } catch (error) {
      console.error('Erro ao buscar empréstimo:', error);
      res.status(500).json({ error: 'Erro ao buscar empréstimo.' });
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = loanSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const data = parseResult.data;
      const product = await this.productRepo.findById(data.productId);
      if (!product) {
        res.status(404).json({ error: 'Equipamento selecionado não encontrado.' });
        return;
      }

      if (product.currentStock <= 0) {
        res.status(400).json({ error: 'Produto indisponível em estoque para empréstimo.' });
        return;
      }

      const loan = await this.loanRepo.create({
        userName: data.userName,
        department: data.department,
        equipmentName: data.equipmentName || product.name,
        productId: product.id,
        patrimony: data.patrimony || product.patrimony || null,
        loanDate: data.loanDate ? new Date(data.loanDate) : new Date(),
        expectedReturnDate: new Date(data.expectedReturnDate),
        returnDate: data.returnDate ? new Date(data.returnDate) : null,
        deliveredBy: data.deliveredBy,
        status: data.status || 'ACTIVE',
        notes: data.notes || null
      });

      // Subtrai do estoque e registra movimentação
      const newStock = product.currentStock - 1;
      await this.productRepo.updateStock(product.id, newStock);

      const validId = await getValidUserId((req as any).user);
      await this.movementRepo.create({
        type: 'EMPRESTIMO',
        productId: product.id,
        quantity: 1,
        previousStock: product.currentStock,
        newStock,
        userId: validId,
        reason: `Empréstimo para ${data.userName} (${data.department}) - Entregue por ${data.deliveredBy}`,
        observation: data.notes || `Patrimônio: ${data.patrimony || product.patrimony || 'N/A'}`
      } as any);

      res.status(201).json(loan);
    } catch (error: any) {
      console.error('Erro ao registrar empréstimo:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar empréstimo.' });
    }
  };

  public returnLoan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const loan = await this.loanRepo.findById(id);
      if (!loan) {
        res.status(404).json({ error: 'Empréstimo não encontrado.' });
        return;
      }

      if (loan.status === 'RETURNED') {
        res.status(400).json({ error: 'Este equipamento já foi devolvido anteriormente.' });
        return;
      }

      const product = await this.productRepo.findById(loan.productId);
      const prevStock = product ? product.currentStock : 0;
      const newStock = prevStock + 1;

      const updated = await this.loanRepo.update(id, {
        status: 'RETURNED',
        returnDate: new Date()
      });

      if (product) {
        await this.productRepo.updateStock(product.id, newStock);

        const validId = await getValidUserId((req as any).user);
        await this.movementRepo.create({
          type: 'DEVOLUCAO',
          productId: product.id,
          quantity: 1,
          previousStock: prevStock,
          newStock,
          userId: validId,
          reason: `Devolução de equipamento - ${loan.userName} (${loan.department})`,
          observation: `Recebido no Service Desk.`
        } as any);
      }

      res.status(200).json(updated);
    } catch (error: any) {
      console.error('Erro ao devolver equipamento:', error);
      res.status(500).json({ error: error.message || 'Erro ao registrar devolução.' });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.loanRepo.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir empréstimo:', error);
      res.status(500).json({ error: 'Erro ao excluir empréstimo.' });
    }
  };
}
