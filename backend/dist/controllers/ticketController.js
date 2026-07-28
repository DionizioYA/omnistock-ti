"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const TicketService_1 = require("../services/TicketService");
const zod_1 = require("zod");
const ticketService = new TicketService_1.TicketService();
const createTicketSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'O título deve conter no mínimo 5 caracteres'),
    description: zod_1.z.string().min(10, 'A descrição deve conter no mínimo 10 caracteres'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    categoryId: zod_1.z.string().uuid('Categoria inválida'),
    subcategoryId: zod_1.z.string().uuid().optional(),
});
const closeWithSignatureSchema = zod_1.z.object({
    signatureData: zod_1.z.string().optional(),
    signatureName: zod_1.z.string().min(3, 'O nome da assinatura é obrigatório'),
    closingComment: zod_1.z.string().optional(),
});
class TicketController {
    async list(req, res) {
        try {
            const { status, priority, categoryId, myTickets, search } = req.query;
            let requesterId;
            if (myTickets === 'true' && req.user) {
                requesterId = req.user.id;
            }
            const tickets = await ticketService.listTickets({
                status: status,
                priority: priority,
                categoryId: categoryId,
                requesterId,
                search: search,
            });
            res.status(200).json(tickets);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao buscar chamados.' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const ticket = await ticketService.getTicketById(id, user.id, user.role);
            res.status(200).json(ticket);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao carregar detalhes do chamado.' });
        }
    }
    async create(req, res) {
        try {
            const data = createTicketSchema.parse(req.body);
            const user = req.user;
            const newTicket = await ticketService.createTicket({
                ...data,
                requesterId: user.id,
            });
            res.status(201).json(newTicket);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: error.errors[0].message });
                return;
            }
            res.status(error.status || 500).json({ error: error.message || 'Erro ao criar chamado.' });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body;
            const user = req.user;
            const updated = await ticketService.updateStatus(id, user.id, status, comment);
            res.status(200).json(updated);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao alterar status.' });
        }
    }
    async assign(req, res) {
        try {
            const { id } = req.params;
            const { technicianId } = req.body;
            const user = req.user;
            const targetTech = technicianId || user.id; // Se não informar, assume que o próprio técnico está assumindo
            const updated = await ticketService.assignTechnician(id, targetTech, user.id);
            res.status(200).json(updated);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao atribuir chamado.' });
        }
    }
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { comment, isInternal } = req.body;
            const user = req.user;
            const entry = await ticketService.addComment(id, user.id, comment, Boolean(isInternal));
            res.status(201).json(entry);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao adicionar comentário.' });
        }
    }
    async closeWithSignature(req, res) {
        try {
            const { id } = req.params;
            const data = closeWithSignatureSchema.parse(req.body);
            const user = req.user;
            const updated = await ticketService.closeTicketWithSignature({
                ticketId: id,
                actorId: user.id,
                signatureData: data.signatureData,
                signatureName: data.signatureName,
                closingComment: data.closingComment,
            });
            res.status(200).json(updated);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: error.errors[0].message });
                return;
            }
            res.status(error.status || 500).json({ error: error.message || 'Erro no encerramento com assinatura.' });
        }
    }
}
exports.TicketController = TicketController;
