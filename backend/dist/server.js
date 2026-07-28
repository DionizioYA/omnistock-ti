"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const PORT = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
const startServer = async () => {
    try {
        await prisma.$connect();
        logger_1.Logger.info('Banco de dados PostgreSQL/SQLite conectado com sucesso via Prisma ORM.');
        const app = (0, app_1.createApp)(prisma);
        app.listen(PORT, () => {
            logger_1.Logger.info(`Servidor OmniStock ERP rodando com sucesso na porta ${PORT}`);
            logger_1.Logger.info(`Documentação da API acessível em http://localhost:${PORT}/api/docs`);
        });
    }
    catch (err) {
        logger_1.Logger.error('Erro ao iniciar o servidor do OmniStock ERP:', err);
        process.exit(1);
    }
};
startServer();
// Tratamento de encerramento amigável
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    logger_1.Logger.info('Servidor encerrado e conexão com banco desconectada.');
    process.exit(0);
});
