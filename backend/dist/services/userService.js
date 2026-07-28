"use strict";
// ============================================================================
// SERVIÇO DE USUÁRIOS (USER & RBAC MANAGEMENT) - NEXUS DESK
// Gerencia colaboradores, permissões de perfil e listagem segura.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../middlewares/errorHandler");
class UserService {
    async getUsers(role) {
        return userRepository_1.default.findAll(role);
    }
    async getUserById(id) {
        const user = await userRepository_1.default.findById(id);
        if (!user) {
            throw new errorHandler_1.AppError('Usuário não encontrado.', 404);
        }
        const { password, ...safeUser } = user;
        return safeUser;
    }
    async createUser(data) {
        const existing = await userRepository_1.default.findByEmail(data.email);
        if (existing) {
            throw new errorHandler_1.AppError('Já existe um usuário cadastrado com este e-mail.', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password || '123456', 10);
        const created = await userRepository_1.default.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            department: data.department || 'Geral'
        });
        const { password, ...safeUser } = created;
        return safeUser;
    }
    async updateUserRole(id, role) {
        await this.getUserById(id);
        return userRepository_1.default.update(id, { role });
    }
}
exports.UserService = UserService;
exports.default = new UserService();
