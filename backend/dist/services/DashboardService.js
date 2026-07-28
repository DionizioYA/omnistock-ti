"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../config/prisma");
const sla_1 = require("../utils/sla");
class DashboardService {
    /**
     * Retorna os indicadores e métricas do Dashboard executivo (estilo Microsoft Intune / Jira Service Management)
     */
    async getDashboardMetrics() {
        const tickets = await prisma_1.prisma.ticket.findMany({
            include: {
                category: true,
                subcategory: true,
                technician: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        // 1. Resumo de Chamados por Status
        const summary = {
            open: 0,
            inProgress: 0,
            waitingUser: 0,
            resolved: 0,
            closed: 0,
            canceled: 0,
            total: tickets.length,
        };
        let totalResolutionHours = 0;
        let resolvedCount = 0;
        let onTimeCount = 0;
        const byCategoryMap = {};
        const technicianStats = {};
        for (const t of tickets) {
            if (t.status === 'OPEN')
                summary.open++;
            else if (t.status === 'IN_PROGRESS')
                summary.inProgress++;
            else if (t.status === 'WAITING_USER')
                summary.waitingUser++;
            else if (t.status === 'RESOLVED')
                summary.resolved++;
            else if (t.status === 'CLOSED')
                summary.closed++;
            else if (t.status === 'CANCELED')
                summary.canceled++;
            // Avalia SLA real
            const currentSla = (0, sla_1.determineSlaStatus)(t.slaDueAt, t.closedAt || t.resolvedAt);
            if (currentSla === 'ON_TIME') {
                onTimeCount++;
            }
            // Média de horas de resolução
            if ((t.status === 'RESOLVED' || t.status === 'CLOSED') && t.resolvedAt) {
                const diffHours = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                totalResolutionHours += Math.max(0.5, diffHours);
                resolvedCount++;
            }
            // Gráficos por Categoria
            const catName = t.category?.name || 'Geral';
            if (!byCategoryMap[catName]) {
                byCategoryMap[catName] = { count: 0, name: catName };
            }
            byCategoryMap[catName].count++;
            // Ranking de Técnicos
            if (t.technician) {
                const techId = t.technician.id;
                if (!technicianStats[techId]) {
                    technicianStats[techId] = {
                        id: techId,
                        name: t.technician.name,
                        avatar: t.technician.avatar,
                        resolved: 0,
                        inProgress: 0,
                    };
                }
                if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
                    technicianStats[techId].resolved++;
                }
                else if (t.status === 'IN_PROGRESS') {
                    technicianStats[techId].inProgress++;
                }
            }
        }
        // 2. SLA Médio em horas e percentual de chamados no prazo
        const averageSlaHours = resolvedCount > 0 ? Number((totalResolutionHours / resolvedCount).toFixed(1)) : 4.5;
        const slaCompliancePercent = tickets.length > 0 ? Number(((onTimeCount / tickets.length) * 100).toFixed(1)) : 98.5;
        // 3. Gráficos de categorias
        const ticketsByCategory = Object.values(byCategoryMap);
        // 4. Ranking de Técnicos ordenado pelo número de chamados resolvidos
        const techniciansRanking = Object.values(technicianStats).sort((a, b) => b.resolved - a.resolved);
        // 5. Indicadores em Tempo Real
        const criticalTicketsCount = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
        const overdueSlaCount = tickets.filter((t) => (0, sla_1.determineSlaStatus)(t.slaDueAt, t.closedAt || t.resolvedAt) === 'OVERDUE').length;
        return {
            summary,
            slaMetrics: {
                averageResolutionHours: averageSlaHours,
                compliancePercentage: slaCompliancePercent,
                overdueCount: overdueSlaCount,
            },
            ticketsByCategory,
            techniciansRanking,
            realTimeIndicators: {
                criticalTickets: criticalTicketsCount,
                overdueSla: overdueSlaCount,
                activeIncidents: summary.open + summary.inProgress,
            },
        };
    }
}
exports.DashboardService = DashboardService;
