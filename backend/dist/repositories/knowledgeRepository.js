"use strict";
// ============================================================================
// REPOSITÓRIO DA BASE DE CONHECIMENTO - NEXUS DESK
// Encapsula acesso para Artigos, Tutoriais, FAQs e Pesquisa Inteligente.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class KnowledgeRepository {
    async findById(id) {
        return prisma_1.default.knowledgeArticle.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, role: true, avatarUrl: true }
                }
            }
        });
    }
    async findAll(query) {
        return prisma_1.default.knowledgeArticle.findMany({
            where: {
                category: query?.category ? query.category : undefined,
                isPublished: query?.isPublished !== undefined ? query.isPublished : true,
                OR: query?.search ? [
                    { title: { contains: query.search } },
                    { summary: { contains: query.search } },
                    { tags: { contains: query.search } },
                    { content: { contains: query.search } }
                ] : undefined
            },
            include: {
                author: {
                    select: { id: true, name: true, role: true, avatarUrl: true }
                }
            },
            orderBy: { views: 'desc' }
        });
    }
    async create(data) {
        return prisma_1.default.knowledgeArticle.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.knowledgeArticle.update({
            where: { id },
            data
        });
    }
    async incrementViews(id) {
        return prisma_1.default.knowledgeArticle.update({
            where: { id },
            data: {
                views: { increment: 1 }
            }
        });
    }
    async delete(id) {
        return prisma_1.default.knowledgeArticle.delete({
            where: { id }
        });
    }
}
exports.KnowledgeRepository = KnowledgeRepository;
exports.default = new KnowledgeRepository();
