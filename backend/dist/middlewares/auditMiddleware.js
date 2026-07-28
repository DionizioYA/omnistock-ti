"use strict";
// ============================================================================
// MIDDLEWARE DE AUDITORIA (AUDIT TRAIL) - NEXUS DESK
// Registra ações realizadas na API no histórico de auditoria (tabela AuditLog).
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logAudit = (action, entity) => {
    return async (req, res, next) => {
        // Escuta o encerramento da resposta para gravar o log somente se houve sucesso
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
                try {
                    await prisma_1.default.auditLog.create({
                        data: {
                            userId: req.user.id,
                            action,
                            entity,
                            entityId: (req.params.id || req.body.id) ? String(req.params.id || req.body.id) : undefined,
                            details: `Método ${req.method} em ${req.originalUrl}`,
                            ipAddress: req.ip || req.socket.remoteAddress || 'Desconhecido'
                        }
                    });
                }
                catch (error) {
                    console.error('Falha ao registrar log de auditoria:', error);
                }
            }
        });
        next();
    };
};
exports.logAudit = logAudit;
