"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.Logger.error(`Erro na rota ${req.method} ${req.originalUrl}: ${err.message || 'Erro desconhecido'}`, err);
    // Validação Zod (400 Bad Request)
    if (err instanceof zod_1.ZodError) {
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
    if (err.message && (err.message.includes('inválido') ||
        err.message.includes('não encontrado') ||
        err.message.includes('Já existe') ||
        err.message.includes('Saldo insuficiente') ||
        err.message.includes('negado') ||
        err.message.includes('obrigatório'))) {
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
exports.errorHandler = errorHandler;
