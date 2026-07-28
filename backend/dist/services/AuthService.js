"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    userRepo;
    jwtSecret = process.env.JWT_SECRET || 'omnistock_super_secret_jwt_key_2026';
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async login(email, passwordPlain) {
        const user = await this.userRepo.findByEmail(email);
        if (!user || !user.isActive) {
            throw new Error('Usuário ou senha inválidos, ou conta inativa');
        }
        const isMatch = await bcryptjs_1.default.compare(passwordPlain, user.passwordHash);
        if (!isMatch) {
            throw new Error('Usuário ou senha inválidos');
        }
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        const token = jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: '24h' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                department: user.department
            }
        };
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.jwtSecret);
    }
}
exports.AuthService = AuthService;
