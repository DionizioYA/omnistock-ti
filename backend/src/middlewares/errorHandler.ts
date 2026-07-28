import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  Logger.error(`Erro na rota ${req.method} ${req.originalUrl}: ${err.message || 'Erro desconhecido'}`, err);

  // Validação Zod (400 Bad Request)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    res.status(400).json({
      error: 'Erro de validação nos dados enviados',
      details: formattedErrors
    });
    return;
  }

  // Erros de negócio / regras
  if (err.message && (
    err.message.includes('inválido') ||
    err.message.includes('não encontrado') ||
    err.message.includes('Já existe') ||
    err.message.includes('Saldo insuficiente') ||
    err.message.includes('negado') ||
    err.message.includes('obrigatório')
  )) {
    const statusCode = err.message.includes('não encontrado') ? 404 : 400;
    res.status(statusCode).json({
      error: err.message
    });
    return;
  }

  // Erro 500 para falhas internas
  res.status(500).json({
    error: 'Ocorreu um erro interno no servidor do OmniStock ERP.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
