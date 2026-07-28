"use strict";
// ============================================================================
// SERVIÇO DE GESTÃO DE SLA (Service Level Agreement) - NEXUS DESK
// Calcula prazos limite e averiguação de cumprimento de SLA por prioridade.
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaService = void 0;
const client_1 = require("@prisma/client");
class SlaService {
    // Retorna horas limite conforme a prioridade ITIL/Service Desk
    getSlaHoursByPriority(priority) {
        switch (priority) {
            case client_1.Priority.CRITICAL:
                return 2; // 2 horas para emergências / parada total
            case client_1.Priority.HIGH:
                return 8; // 8 horas (1 dia útil)
            case client_1.Priority.MEDIUM:
                return 24; // 24 horas (3 dias úteis)
            case client_1.Priority.LOW:
            default:
                return 48; // 48 horas (1 semana útil)
        }
    }
    // Calcula a data máxima (target date) para resolução
    calculateTargetDate(priority, startDate = new Date()) {
        const hours = this.getSlaHoursByPriority(priority);
        const target = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
        return target;
    }
    // Verifica se o chamado ultrapassou o SLA no momento da resolução ou consulta
    isBreached(slaTargetDate, resolvedAt) {
        const compareDate = resolvedAt || new Date();
        return compareDate.getTime() > slaTargetDate.getTime();
    }
    // Retorna o status visual do SLA em formato amigável para o front-end
    getSlaStatus(slaTargetDate, isResolved, resolvedAt) {
        const breached = this.isBreached(slaTargetDate, resolvedAt);
        if (isResolved) {
            return {
                code: breached ? 'BREACHED_RESOLVED' : 'ON_TIME_RESOLVED',
                label: breached ? 'SLA Excedido (Resolvido)' : 'SLA Cumprido',
                color: breached ? 'red' : 'green'
            };
        }
        const now = new Date();
        const msRemaining = slaTargetDate.getTime() - now.getTime();
        const hoursRemaining = msRemaining / (1000 * 60 * 60);
        if (hoursRemaining < 0) {
            return {
                code: 'BREACHED',
                label: 'SLA Excedido',
                color: 'red'
            };
        }
        else if (hoursRemaining <= 2) {
            return {
                code: 'WARNING',
                label: 'SLA em Alerta (<2h)',
                color: 'amber'
            };
        }
        else {
            return {
                code: 'ON_TRACK',
                label: 'SLA no Prazo',
                color: 'blue'
            };
        }
    }
}
exports.SlaService = SlaService;
exports.default = new SlaService();
