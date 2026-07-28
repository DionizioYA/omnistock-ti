"use strict";
// ============================================================================
// SERVIÇO DE AUDITORIA E NOTIFICAÇÕES - NEXUS DESK
// Provê listagem e registro no Audit Trail do sistema, e gerencia alertas.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const auditRepository_1 = __importDefault(require("../repositories/auditRepository"));
class AuditService {
    async getAuditLogs(limit = 100) {
        return auditRepository_1.default.getAuditLogs(limit);
    }
    async getNotifications(userId) {
        return auditRepository_1.default.getNotifications(userId);
    }
    async markNotificationAsRead(id) {
        return auditRepository_1.default.markNotificationRead(id);
    }
}
exports.AuditService = AuditService;
exports.default = new AuditService();
