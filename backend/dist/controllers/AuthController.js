"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const schemas_1 = require("../domain/schemas");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (req, res, next) => {
        try {
            const { email, password } = schemas_1.loginSchema.parse(req.body);
            const result = await this.authService.login(email, password);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getMe = async (req, res, next) => {
        try {
            res.status(200).json({
                user: req.user
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AuthController = AuthController;
