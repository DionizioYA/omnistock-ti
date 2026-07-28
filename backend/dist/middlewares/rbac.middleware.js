"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
/**
 * Middleware para controle de permissão por Perfil (RBAC).
 * Aceita uma lista de perfis permitidos para a rota.
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Acesso proibido. Requer um dos seguintes perfis: ${allowedRoles.join(', ')}. Seu perfil atual: ${req.user.role}`,
            });
            return;
        }
        next();
    };
}
