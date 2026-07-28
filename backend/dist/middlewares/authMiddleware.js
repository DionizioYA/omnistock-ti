"use strict";
// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT - NEXUS DESK
// Verifica a validade do JSON Web Token no cabeçalho 'Authorization'
// e anexa o usuário autenticado à requisição.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Acesso negado: Token de autenticação (JWT) não fornecido no cabeçalho.'
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'NexusDesk_Super_Secret_Key_2026_TI_ServiceDesk';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Acesso negado: Token JWT inválido ou expirado.'
        });
    }
};
exports.authenticateJWT = authenticateJWT;
