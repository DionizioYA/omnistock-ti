"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const schemas_1 = require("../domain/schemas");
class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getAudits = async (req, res, next) => {
        try {
            const audits = await this.inventoryService.getAudits();
            res.status(200).json(audits);
        }
        catch (err) {
            next(err);
        }
    };
    getAuditById = async (req, res, next) => {
        try {
            const audit = await this.inventoryService.getAuditById(req.params.id);
            res.status(200).json(audit);
        }
        catch (err) {
            next(err);
        }
    };
    createAudit = async (req, res, next) => {
        try {
            const validated = schemas_1.inventoryAuditSchema.parse(req.body);
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const audit = await this.inventoryService.createAudit({
                ...validated,
                userId: req.user.id
            });
            res.status(201).json(audit);
        }
        catch (err) {
            next(err);
        }
    };
    registerConferenceCount = async (req, res, next) => {
        try {
            const { productId, physicalCount } = schemas_1.inventoryConferenceItemSchema.parse(req.body);
            const updatedItem = await this.inventoryService.registerItemCount(req.params.id, productId, physicalCount);
            res.status(200).json(updatedItem);
        }
        catch (err) {
            next(err);
        }
    };
    autoAdjustDivergences = async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const completedAudit = await this.inventoryService.autoAdjustAndComplete(req.params.id, req.user.id);
            res.status(200).json(completedAudit);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.InventoryController = InventoryController;
