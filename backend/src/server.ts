import { PrismaClient } from '@prisma/client';
import { createApp } from './app';
import { Logger } from './utils/logger';

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

const startServer = async () => {
  try {
    await prisma.$connect();
    Logger.info('Banco de dados PostgreSQL/SQLite conectado com sucesso via Prisma ORM.');

    const app = createApp(prisma);

    app.listen(PORT, () => {
      Logger.info(`Servidor OmniStock ERP rodando com sucesso na porta ${PORT}`);
      Logger.info(`Documentação da API acessível em http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    Logger.error('Erro ao iniciar o servidor do OmniStock ERP:', err);
    process.exit(1);
  }
};

startServer();

// Tratamento de encerramento amigável
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  Logger.info('Servidor encerrado e conexão com banco desconectada.');
  process.exit(0);
});
