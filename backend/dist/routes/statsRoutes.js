"use strict";
// ============================================================================
// ROTAS DE ESTATÍSTICAS DO DASHBOARD - NEXUS DESK
// Mapeia endpoints para KPIs em tempo real, ranking e gráficos.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = __importDefault(require("../controllers/statsController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateJWT);
// GET /api/v1/stats/overview - Resumo geral para o Dashboard Intune/Jira
router.get('/overview', statsController_1.default.getOverview);
exports.default = router;
