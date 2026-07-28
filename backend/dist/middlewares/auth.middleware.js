"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../config/jwt");
const logger_1 = require("../config/logger");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Acesso negado. Token JWT não fornecido ou inválido.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.logger.warn('Tentativa de acesso com token JWT inválido ou expirado', { error: error.message });
        res.status(401).json({ error: 'Token JWT expirado ou inválido.' });
    }
}
