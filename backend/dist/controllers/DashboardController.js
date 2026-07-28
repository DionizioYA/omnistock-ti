"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_1 = require("../services/DashboardService");
const dashboardService = new DashboardService_1.DashboardService();
class DashboardController {
    /**
     * @openapi
     * /api/dashboard/metrics:
     *   get:
     *     summary: Retorna métricas consolidadas para o painel executivo
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: KPIs retornados com sucesso
     */
    async getMetrics(req, res) {
        try {
            const metrics = await dashboardService.getDashboardMetrics();
            res.status(200).json(metrics);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao obter métricas do Dashboard.' });
        }
    }
}
exports.DashboardController = DashboardController;
