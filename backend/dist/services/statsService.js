"use strict";
// ============================================================================
// SERVIÇO DE ESTATÍSTICAS E DASHBOARD - NEXUS DESK
// Provê métricas em tempo real, SLA Médio, gráficos por categoria e ranking de técnicos.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const ticketRepository_1 = __importDefault(require("../repositories/ticketRepository"));
const inventoryRepository_1 = __importDefault(require("../repositories/inventoryRepository"));
const client_1 = require("@prisma/client");
class StatsService {
    async getDashboardOverview() {
        const ticketStats = await ticketRepository_1.default.getDashboardStats();
        const inventoryStats = await inventoryRepository_1.default.getInventoryStats();
        // 1. Cálculo de SLA Médio de Resolução em Horas
        const resolvedTickets = await prisma_1.default.ticket.findMany({
            where: {
                slaResolvedAt: { not: null }
            },
            select: {
                createdAt: true,
                slaResolvedAt: true,
                isSlaBreached: true
            }
        });
        let avgSlaHours = 0;
        let slaComplianceRate = 100;
        if (resolvedTickets.length > 0) {
            const totalHours = resolvedTickets.reduce((acc, ticket) => {
                if (!ticket.slaResolvedAt)
                    return acc;
                const diffMs = ticket.slaResolvedAt.getTime() - ticket.createdAt.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                return acc + diffHours;
            }, 0);
            avgSlaHours = Number((totalHours / resolvedTickets.length).toFixed(1));
            const breachedCount = resolvedTickets.filter(t => t.isSlaBreached).length;
            slaComplianceRate = Number(((1 - breachedCount / resolvedTickets.length) * 100).toFixed(1));
        }
        // 2. Ranking de Técnicos (Volume resolvido e taxa de cumprimento SLA)
        const technicians = await prisma_1.default.user.findMany({
            where: {
                OR: [{ role: client_1.Role.TECHNICIAN }, { role: client_1.Role.COORDINATOR }]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                department: true,
                assignedTickets: {
                    select: {
                        id: true,
                        status: true,
                        isSlaBreached: true
                    }
                }
            }
        });
        const technicianRanking = technicians
            .map(t => {
            const totalAssigned = t.assignedTickets.length;
            const resolvedCount = t.assignedTickets.filter(tk => tk.status === client_1.TicketStatus.RESOLVED || tk.status === client_1.TicketStatus.CLOSED).length;
            const onTimeCount = t.assignedTickets.filter(tk => (tk.status === client_1.TicketStatus.RESOLVED || tk.status === client_1.TicketStatus.CLOSED) && !tk.isSlaBreached).length;
            const slaRate = resolvedCount > 0 ? Number(((onTimeCount / resolvedCount) * 100).toFixed(0)) : 100;
            return {
                id: t.id,
                name: t.name,
                email: t.email,
                avatarUrl: t.avatarUrl,
                department: t.department,
                totalAssigned,
                resolvedCount,
                slaRate
            };
        })
            .sort((a, b) => b.resolvedCount - a.resolvedCount);
        return {
            tickets: ticketStats,
            inventory: inventoryStats,
            sla: {
                averageResolutionHours: avgSlaHours,
                complianceRatePercentage: slaComplianceRate,
                totalResolvedEvaluated: resolvedTickets.length
            },
            technicianRanking
        };
    }
}
exports.StatsService = StatsService;
exports.default = new StatsService();
