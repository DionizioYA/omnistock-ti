"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const prisma_1 = require("../config/prisma");
const sla_1 = require("../utils/sla");
const audit_1 = require("../utils/audit");
class TicketService {
    /**
     * Abre um novo chamado com cálculo automático de SLA
     */
    async createTicket(data) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id: data.categoryId },
        });
        if (!category) {
            throw { status: 404, message: 'Categoria não encontrada.' };
        }
        let slaHours = category.defaultSlaHours;
        if (data.subcategoryId) {
            const sub = await prisma_1.prisma.subcategory.findUnique({
                where: { id: data.subcategoryId },
            });
            if (sub) {
                slaHours = sub.slaHours;
            }
        }
        const slaDueAt = (0, sla_1.calculateSlaDueDate)(slaHours, data.priority);
        const ticket = await prisma_1.prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId || null,
                requesterId: data.requesterId,
                slaDueAt,
                slaStatus: 'ON_TIME',
                status: 'OPEN',
            },
            include: {
                category: true,
                subcategory: true,
                requester: {
                    select: { id: true, name: true, email: true, department: true },
                },
            },
        });
        // Registra evento de abertura no histórico do chamado
        await prisma_1.prisma.ticketHistory.create({
            data: {
                ticketId: ticket.id,
                actorId: data.requesterId,
                actionType: 'TICKET_CREATED',
                comment: 'Chamado aberto pelo usuário.',
            },
        });
        await (0, audit_1.createAuditLog)({
            userId: data.requesterId,
            action: 'CREATE_TICKET',
            resource: 'TICKET',
            resourceId: ticket.id,
            details: { title: ticket.title, priority: ticket.priority },
        });
        return ticket;
    }
    /**
     * Lista chamados com filtros para Dashboard, Técnicos ou Usuários
     */
    async listTickets(filters) {
        const whereClause = {};
        if (filters.status)
            whereClause.status = filters.status;
        if (filters.priority)
            whereClause.priority = filters.priority;
        if (filters.categoryId)
            whereClause.categoryId = filters.categoryId;
        if (filters.requesterId)
            whereClause.requesterId = filters.requesterId;
        if (filters.technicianId)
            whereClause.technicianId = filters.technicianId;
        if (filters.search) {
            whereClause.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const tickets = await prisma_1.prisma.ticket.findMany({
            where: whereClause,
            include: {
                category: true,
                subcategory: true,
                requester: {
                    select: { id: true, name: true, email: true, department: true },
                },
                technician: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Atualiza em memória e no retorno o SLA Status em tempo real
        return tickets.map((t) => ({
            ...t,
            slaStatus: (0, sla_1.determineSlaStatus)(t.slaDueAt, t.closedAt || t.resolvedAt),
        }));
    }
    /**
     * Obtém detalhes de um chamado por ID com seu histórico completo e anexos
     */
    async getTicketById(ticketId, currentUserId, currentUserRole) {
        const ticket = await prisma_1.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                category: true,
                subcategory: true,
                requester: {
                    select: { id: true, name: true, email: true, department: true, title: true, phone: true },
                },
                technician: {
                    select: { id: true, name: true, email: true, department: true },
                },
                histories: {
                    include: {
                        actor: {
                            select: { id: true, name: true, role: true, avatar: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
        });
        if (!ticket) {
            throw { status: 404, message: 'Chamado não encontrado.' };
        }
        // Filtra comentários internos caso o usuário seja apenas 'USER'
        const filteredHistories = ticket.histories.filter((h) => {
            if (h.isInternal && currentUserRole === 'USER') {
                return false;
            }
            return true;
        });
        return {
            ...ticket,
            histories: filteredHistories,
            slaStatus: (0, sla_1.determineSlaStatus)(ticket.slaDueAt, ticket.closedAt || ticket.resolvedAt),
        };
    }
    /**
     * Altera status do chamado e adiciona entrada ao histórico
     */
    async updateStatus(ticketId, actorId, newStatus, comment) {
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            throw { status: 404, message: 'Chamado não encontrado.' };
        }
        const oldStatus = ticket.status;
        const updateData = { status: newStatus };
        if (newStatus === 'RESOLVED' && !ticket.resolvedAt) {
            updateData.resolvedAt = new Date();
        }
        if (newStatus === 'CLOSED' && !ticket.closedAt) {
            updateData.closedAt = new Date();
        }
        const updatedTicket = await prisma_1.prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
        });
        await prisma_1.prisma.ticketHistory.create({
            data: {
                ticketId,
                actorId,
                actionType: 'STATUS_CHANGE',
                oldValue: oldStatus,
                newValue: newStatus,
                comment: comment || `Status alterado de ${oldStatus} para ${newStatus}.`,
            },
        });
        return updatedTicket;
    }
    /**
     * Atribui o chamado a um técnico responsável
     */
    async assignTechnician(ticketId, technicianId, actorId) {
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            throw { status: 404, message: 'Chamado não encontrado.' };
        }
        const updated = await prisma_1.prisma.ticket.update({
            where: { id: ticketId },
            data: {
                technicianId,
                status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
            },
        });
        await prisma_1.prisma.ticketHistory.create({
            data: {
                ticketId,
                actorId,
                actionType: 'ASSIGNMENT',
                comment: `Técnico responsável atribuído ao chamado.`,
            },
        });
        return updated;
    }
    /**
     * Adiciona comentário (público ou interno) no chamado
     */
    async addComment(ticketId, actorId, commentText, isInternal = false) {
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            throw { status: 404, message: 'Chamado não encontrado.' };
        }
        const entry = await prisma_1.prisma.ticketHistory.create({
            data: {
                ticketId,
                actorId,
                actionType: 'COMMENT',
                comment: commentText,
                isInternal,
            },
            include: {
                actor: {
                    select: { id: true, name: true, role: true },
                },
            },
        });
        return entry;
    }
    /**
     * Encerramento formal do chamado com Assinatura Digital do Usuário
     */
    async closeTicketWithSignature(data) {
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: data.ticketId } });
        if (!ticket) {
            throw { status: 404, message: 'Chamado não encontrado.' };
        }
        const now = new Date();
        const updated = await prisma_1.prisma.ticket.update({
            where: { id: data.ticketId },
            data: {
                status: 'CLOSED',
                closedAt: now,
                resolvedAt: ticket.resolvedAt || now,
                signatureData: data.signatureData || null,
                signatureName: data.signatureName,
                signatureDate: now,
            },
        });
        await prisma_1.prisma.ticketHistory.create({
            data: {
                ticketId: data.ticketId,
                actorId: data.actorId,
                actionType: 'CLOSED_WITH_SIGNATURE',
                oldValue: ticket.status,
                newValue: 'CLOSED',
                comment: data.closingComment || `Chamado encerrado pelo usuário com assinatura digital de: ${data.signatureName}`,
            },
        });
        await (0, audit_1.createAuditLog)({
            userId: data.actorId,
            action: 'CLOSE_TICKET_SIGNATURE',
            resource: 'TICKET',
            resourceId: data.ticketId,
            details: { signatureName: data.signatureName },
        });
        return updated;
    }
}
exports.TicketService = TicketService;
