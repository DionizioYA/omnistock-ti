"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementController = void 0;
const schemas_1 = require("../domain/schemas");
class MovementController {
    movementService;
    constructor(movementService) {
        this.movementService = movementService;
    }
    getMovements = async (req, res, next) => {
        try {
            const { productId, type, limit = 50 } = req.query;
            const movements = await this.movementService.getMovements({
                productId: productId,
                type: type,
                limit: Number(limit)
            });
            res.status(200).json(movements);
        }
        catch (err) {
            next(err);
        }
    };
    getMovementById = async (req, res, next) => {
        try {
            const movement = await this.movementService.getMovementById(req.params.id);
            res.status(200).json(movement);
        }
        catch (err) {
            next(err);
        }
    };
    registerMovement = async (req, res, next) => {
        try {
            const validated = schemas_1.movementSchema.parse(req.body);
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const movement = await this.movementService.registerMovement({
                ...validated,
                userId: req.user.id
            });
            res.status(201).json(movement);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.MovementController = MovementController;
