"use strict";
// ============================================================================
// REPOSITÓRIO DE CHAMADOS (TICKETS) - NEXUS DESK
// Encapsula acesso ao Prisma para chamados, comentários, anexos e histórico.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class TicketRepository {
    async findById(id) {
        return prisma_1.default.ticket.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true, role: true, avatarUrl: true, department: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true, avatarUrl: true, department: true }
                },
                comments: {
                    include: {
                        author: {
                            select: { id: true, name: true, role: true, avatarUrl: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                attachments: true,
                history: {
                    include: {
                        changedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async findAll(filters) {
        return prisma_1.default.ticket.findMany({
            where: {
                status: filters?.status,
                priority: filters?.priority,
                category: filters?.category,
                assignedToId: filters?.assignedToId,
                createdById: filters?.createdById
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true, avatarUrl: true, department: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true, avatarUrl: true, department: true }
                },
                _count: {
                    select: { comments: true, attachments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async create(data) {
        return prisma_1.default.ticket.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.ticket.update({
            where: { id },
            data
        });
    }
    async createComment(data) {
        return prisma_1.default.ticketComment.create({
            data,
            include: {
                author: {
                    select: { id: true, name: true, role: true, avatarUrl: true }
                }
            }
        });
    }
    async addHistory(data) {
        return prisma_1.default.ticketHistory.create({ data });
    }
    async getDashboardStats() {
        const total = await prisma_1.default.ticket.count();
        const open = await prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.OPEN } });
        const inProgress = await prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.IN_PROGRESS } });
        const resolved = await prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.RESOLVED } });
        const closed = await prisma_1.default.ticket.count({ where: { status: client_1.TicketStatus.CLOSED } });
        // Chamados agrupados por categoria
        const byCategory = await prisma_1.default.ticket.groupBy({
            by: ['category'],
            _count: { category: true }
        });
        // Chamados agrupados por prioridade
        const byPriority = await prisma_1.default.ticket.groupBy({
            by: ['priority'],
            _count: { priority: true }
        });
        return { total, open, inProgress, resolved, closed, byCategory, byPriority };
    }
}
exports.TicketRepository = TicketRepository;
exports.default = new TicketRepository();
