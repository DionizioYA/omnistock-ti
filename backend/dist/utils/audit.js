"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
const prisma_1 = require("../config/prisma");
const logger_1 = require("../config/logger");
/**
 * Grava de forma assíncrona uma entrada na tabela de logs de auditoria
 */
async function createAuditLog(entry) {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: entry.userId || null,
                action: entry.action,
                resource: entry.resource,
                resourceId: entry.resourceId || null,
                details: entry.details || {},
                ipAddress: entry.ipAddress || null,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Falha ao registrar log de auditoria no PostgreSQL:', { error: error.message });
    }
}
