"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const prisma_1 = require("../config/prisma");
const audit_1 = require("../utils/audit");
class KnowledgeService {
    /**
     * Lista artigos com opção de busca inteligente por palavras-chave em título, resumo, tags ou conteúdo
     */
    async listArticles(filters) {
        const whereClause = { isPublished: true };
        if (filters.category) {
            whereClause.category = filters.category;
        }
        if (filters.isFaq !== undefined) {
            whereClause.isFaq = filters.isFaq;
        }
        if (filters.search) {
            whereClause.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { summary: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } },
                { tags: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return await prisma_1.prisma.knowledgeArticle.findMany({
            where: whereClause,
            include: {
                author: {
                    select: { id: true, name: true, role: true, avatar: true },
                },
            },
            orderBy: { views: 'desc' },
        });
    }
    /**
     * Obtém artigo por ID e incrementa o contador de visualizações
     */
    async getArticleById(id) {
        const article = await prisma_1.prisma.knowledgeArticle.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, role: true, department: true },
                },
            },
        });
        if (!article) {
            throw { status: 404, message: 'Artigo da Base de Conhecimento não encontrado.' };
        }
        await prisma_1.prisma.knowledgeArticle.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        return article;
    }
    /**
     * Cria novo artigo ou FAQ na Base de Conhecimento
     */
    async createArticle(data, authorId) {
        const article = await prisma_1.prisma.knowledgeArticle.create({
            data: {
                title: data.title,
                summary: data.summary || null,
                content: data.content,
                category: data.category,
                tags: data.tags || null,
                authorId,
                isFaq: data.isFaq || false,
                isPublished: true,
            },
            include: {
                author: {
                    select: { id: true, name: true },
                },
            },
        });
        await (0, audit_1.createAuditLog)({
            userId: authorId,
            action: 'CREATE_KNOWLEDGE_ARTICLE',
            resource: 'KNOWLEDGE',
            resourceId: article.id,
            details: { title: article.title, category: article.category },
        });
        return article;
    }
    /**
     * Marca artigo como útil (+1 no contador de votos úteis)
     */
    async markHelpful(id) {
        return await prisma_1.prisma.knowledgeArticle.update({
            where: { id },
            data: { helpfulCount: { increment: 1 } },
        });
    }
}
exports.KnowledgeService = KnowledgeService;
