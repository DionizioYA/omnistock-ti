"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
class BackupController {
    backupService;
    constructor(backupService) {
        this.backupService = backupService;
    }
    getFullBackup = async (req, res, next) => {
        try {
            const backup = await this.backupService.generateFullBackup();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-backup-${Date.now()}.json`);
            res.status(200).json(backup);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.BackupController = BackupController;
