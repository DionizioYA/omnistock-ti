"use strict";
// ============================================================================
// REPOSITÓRIO DE AUDITORIA E NOTIFICAÇÕES - NEXUS DESK
// Encapsula acesso para histórico do sistema (AuditLog) e Notificações.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AuditRepository {
    async getAuditLogs(limit = 100) {
        return prisma_1.default.auditLog.findMany({
            take: limit,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getNotifications(userId) {
        return prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 25
        });
    }
    async createNotification(data) {
        return prisma_1.default.notification.create({ data });
    }
    async markNotificationRead(id) {
        return prisma_1.default.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }
}
exports.AuditRepository = AuditRepository;
exports.default = new AuditRepository();
