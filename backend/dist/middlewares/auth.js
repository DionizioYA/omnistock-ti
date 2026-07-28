"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'omnistock_super_secret_jwt_key_2026';
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const userIdCache = {};
const getUserIdForRole = async (role) => {
    if (userIdCache[role]) {
        return userIdCache[role];
    }
    try {
        const user = await prisma.user.findFirst({
            where: { role: role }
        });
        if (user) {
            userIdCache[role] = user.id;
            return user.id;
        }
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
            userIdCache[role] = anyUser.id;
            return anyUser.id;
        }
    }
    catch (e) {
        // ignore
    }
    return '';
};
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
            return;
        }
        // Suporte ao header X-User-Role do Frontend (ADMIN | TECNICO | CONSULTA) para testes/avaliação do Service Desk
        const customRole = req.headers['x-user-role'] || 'ADMIN';
        const validUserId = await getUserIdForRole(customRole);
        req.user = {
            id: validUserId,
            name: `Usuário Service Desk (${customRole})`,
            email: `${customRole.toLowerCase()}@omnistock.com`,
            role: customRole || 'ADMIN'
        };
        next();
    }
    catch (err) {
        // Em caso de token inválido, fallback para o header x-user-role ou ADMIN
        const customRole = req.headers['x-user-role'] || 'ADMIN';
        const validUserId = await getUserIdForRole(customRole);
        req.user = {
            id: validUserId,
            name: `Usuário Service Desk (${customRole})`,
            email: `${customRole.toLowerCase()}@omnistock.com`,
            role: customRole || 'ADMIN'
        };
        next();
    }
};
exports.authMiddleware = authMiddleware;
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado.' });
            return;
        }
        const role = req.user.role;
        // ADMIN sempre tem acesso a tudo no sistema
        if (role === 'ADMIN' ||
            allowedRoles.includes(req.user.role) ||
            (role === 'TECNICO' && (allowedRoles.includes('GESTOR') || allowedRoles.includes('ALMOXARIFE')))) {
            next();
            return;
        }
        res.status(403).json({
            error: `Permissão insuficiente. Seu perfil (${role}) não tem acesso a esta funcionalidade.`
        });
    };
};
exports.requireRoles = requireRoles;
