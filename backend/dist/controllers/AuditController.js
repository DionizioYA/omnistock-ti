"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
class AuditController {
    auditRepo;
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
    }
    getLogs = async (req, res, next) => {
        try {
            const { limit = 200 } = req.query;
            const logs = await this.auditRepo.findAll(Number(limit));
            res.status(200).json(logs);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AuditController = AuditController;
