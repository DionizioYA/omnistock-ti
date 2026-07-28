"use strict";
// ============================================================================
// REPOSITÓRIO DE USUÁRIOS - NEXUS DESK
// Encapsula acesso ao banco de dados (Prisma) para operações da entidade User.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class UserRepository {
    async findById(id) {
        return prisma_1.default.user.findUnique({
            where: { id }
        });
    }
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email }
        });
    }
    async findAll(role) {
        return prisma_1.default.user.findMany({
            where: role ? { role } : undefined,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                password: true // incluído por conveniência, services filtram caso necessário
            }
        });
    }
    async create(data) {
        return prisma_1.default.user.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.user.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma_1.default.user.delete({
            where: { id }
        });
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
