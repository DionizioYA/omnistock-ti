"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
class AlertController {
    alertRepo;
    constructor(alertRepo) {
        this.alertRepo = alertRepo;
    }
    getActiveAlerts = async (req, res, next) => {
        try {
            const alerts = await this.alertRepo.findAllActive();
            res.status(200).json(alerts);
        }
        catch (err) {
            next(err);
        }
    };
    markAsRead = async (req, res, next) => {
        try {
            const alert = await this.alertRepo.markAsRead(req.params.id);
            res.status(200).json(alert);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AlertController = AlertController;
