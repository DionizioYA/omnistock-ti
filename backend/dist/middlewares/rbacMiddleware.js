"use strict";
// ============================================================================
// MIDDLEWARE DE CONTROLE DE PERMISSÕES (RBAC) - NEXUS DESK
// Garante que o usuário autenticado possua um dos perfis autorizados
// para executar a rota (ADMIN, COORDINATOR, TECHNICIAN, USER).
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Não autenticado. Faça login primeiro.'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Permissão negada: O seu perfil (${req.user.role}) não tem permissão para esta ação.`
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
