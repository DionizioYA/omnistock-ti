"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditMiddleware = void 0;
const createAuditMiddleware = (prisma) => {
    return async (req, res, next) => {
        // Intercept finish para capturar se a requisição foi bem sucedida
        res.on('finish', async () => {
            // Registrar apenas requisições de alteração (POST, PUT, DELETE, PATCH) bem sucedidas
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const action = req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : 'DELETE';
                    const entity = req.baseUrl.split('/').pop()?.toUpperCase() || 'GENERAL';
                    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
                    await prisma.auditLog.create({
                        data: {
                            action,
                            entity,
                            userId: req.user?.id || null,
                            ipAddress,
                            details: JSON.stringify({
                                path: req.originalUrl,
                                method: req.method,
                                status: res.statusCode
                            })
                        }
                    });
                }
                catch (err) {
                    console.error('Falha ao gravar log de auditoria no banco:', err);
                }
            }
        });
        next();
    };
};
exports.createAuditMiddleware = createAuditMiddleware;
