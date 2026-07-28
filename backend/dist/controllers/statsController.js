"use strict";
// ============================================================================
// CONTROLLER DE ESTATÍSTICAS DO DASHBOARD - NEXUS DESK
// Fornece KPIs agregados, SLA Médio, gráficos e ranking de técnicos.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const statsService_1 = __importDefault(require("../services/statsService"));
class StatsController {
    async getOverview(req, res, next) {
        try {
            const data = await statsService_1.default.getDashboardOverview();
            res.status(200).json({
                success: true,
                data
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StatsController = StatsController;
exports.default = new StatsController();
