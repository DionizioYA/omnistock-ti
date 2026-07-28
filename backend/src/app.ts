import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { buildApiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { createAuditMiddleware } from './middlewares/audit';

dotenv.config();

export const createApp = (prisma: PrismaClient): Application => {
  const app = express();

  // CORS de produção e desenvolvimento
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role']
  }));

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(morgan('dev'));

  // Middleware global para auditoria contínua das ações (POST, PUT, DELETE)
  app.use(createAuditMiddleware(prisma));

  // Rota de Healthcheck do ERP
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ONLINE',
      system: 'OmniStock ERP - Controle de Estoque & Gestão de Almoxarifado',
      timestamp: new Date().toISOString()
    });
  });

  // Rotas da API REST
  app.use('/api', buildApiRouter(prisma));

  // Global Error Handler (SOLID / Clean Code)
  app.use(errorHandler);

  return app;
};
