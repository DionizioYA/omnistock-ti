"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
function errorHandler(err, req, res, next) {
    logger_1.logger.error('Erro na requisição Express:', {
        method: req.method,
        url: req.originalUrl,
        message: err.message,
        stack: err.stack,
    });
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || 'Erro interno do servidor',
        code: err.code || 'INTERNAL_ERROR',
    });
}
