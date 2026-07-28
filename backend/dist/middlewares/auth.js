"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'omnistock_super_secret_jwt_key_2026';
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido ou inválido.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Token de autenticação expirado ou inválido.' });
    }
};
exports.authMiddleware = authMiddleware;
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado.' });
            return;
        }
        // ADMIN sempre tem acesso a tudo no ERP
        if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
            next();
            return;
        }
        res.status(403).json({
            error: `Permissão insuficiente. Seu perfil (${req.user.role}) não tem acesso a esta funcionalidade.`
        });
    };
};
exports.requireRoles = requireRoles;
