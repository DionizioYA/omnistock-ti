import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { authMiddleware } from '../middlewares/auth';

export const createLoanRoutes = (loanController: LoanController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', loanController.getAll);
  router.get('/:id', loanController.getById);
  router.post('/', loanController.create);
  router.post('/:id/return', loanController.returnLoan);
  router.delete('/:id', loanController.delete);

  return router;
};
