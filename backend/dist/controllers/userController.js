"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = require("../config/prisma");
const audit_1 = require("../utils/audit");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Nome é obrigatório'),
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    role: zod_1.z.enum(['ADMIN', 'COORDINATOR', 'TECHNICIAN', 'USER']),
    department: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
class UserController {
    async list(req, res) {
        try {
            const { role, search } = req.query;
            const whereClause = { isActive: true };
            if (role) {
                whereClause.role = role;
            }
            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ];
            }
            const users = await prisma_1.prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    title: true,
                    phone: true,
                    avatar: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { name: 'asc' },
            });
            res.status(200).json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao listar usuários.' });
        }
    }
    async create(req, res) {
        try {
            const data = createUserSchema.parse(req.body);
            const existing = await prisma_1.prisma.user.findUnique({
                where: { email: data.email.toLowerCase() },
            });
            if (existing) {
                res.status(400).json({ error: 'E-mail já está em uso.' });
                return;
            }
            const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email.toLowerCase(),
                    passwordHash,
                    role: data.role,
                    department: data.department || 'Geral',
                    title: data.title || 'Colaborador',
                    phone: data.phone || null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    title: true,
                    phone: true,
                },
            });
            await (0, audit_1.createAuditLog)({
                userId: req.user?.id,
                action: 'CREATE_USER',
                resource: 'USER',
                resourceId: user.id,
                details: { email: user.email, role: user.role },
            });
            res.status(201).json(user);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: error.errors[0].message });
                return;
            }
            res.status(error.status || 500).json({ error: error.message || 'Erro ao criar usuário.' });
        }
    }
    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const updated = await prisma_1.prisma.user.update({
                where: { id },
                data: { role: role },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                },
            });
            await (0, audit_1.createAuditLog)({
                userId: req.user?.id,
                action: 'UPDATE_USER_ROLE',
                resource: 'USER',
                resourceId: id,
                details: { newRole: role },
            });
            res.status(200).json(updated);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao alterar perfil do usuário.' });
        }
    }
    async getCategories(req, res) {
        try {
            const categories = await prisma_1.prisma.category.findMany({
                include: { subcategories: true },
                orderBy: { name: 'asc' },
            });
            res.status(200).json(categories);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao buscar categorias do Service Desk.' });
        }
    }
}
exports.UserController = UserController;
