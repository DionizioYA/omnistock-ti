"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
// Padrão Singleton para evitar conexões múltiplas em desenvolvimento (Hot reload)
exports.prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
async function connectDatabase() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('✅ Conexão com o banco de dados PostgreSQL (Prisma) estabelecida com sucesso.');
    }
    catch (error) {
        logger_1.logger.error('❌ Falha ao conectar ao PostgreSQL. Verifique se o container docker-compose está rodando ou verifique DATABASE_URL no arquivo .env', { error: error.message });
    }
}
