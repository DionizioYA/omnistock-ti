"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeController = void 0;
const KnowledgeService_1 = require("../services/KnowledgeService");
const zod_1 = require("zod");
const knowledgeService = new KnowledgeService_1.KnowledgeService();
const createArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    summary: zod_1.z.string().optional(),
    content: zod_1.z.string().min(20, 'Conteúdo deve ter pelo menos 20 caracteres'),
    category: zod_1.z.string().min(2, 'Categoria é obrigatória'),
    tags: zod_1.z.string().optional(),
    isFaq: zod_1.z.boolean().optional(),
});
class KnowledgeController {
    async list(req, res) {
        try {
            const { category, isFaq, search } = req.query;
            const articles = await knowledgeService.listArticles({
                category: category,
                isFaq: isFaq === 'true' ? true : isFaq === 'false' ? false : undefined,
                search: search,
            });
            res.status(200).json(articles);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao listar artigos.' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const article = await knowledgeService.getArticleById(id);
            res.status(200).json(article);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao buscar artigo.' });
        }
    }
    async create(req, res) {
        try {
            const data = createArticleSchema.parse(req.body);
            const user = req.user;
            const article = await knowledgeService.createArticle(data, user.id);
            res.status(201).json(article);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: error.errors[0].message });
                return;
            }
            res.status(error.status || 500).json({ error: error.message || 'Erro ao criar artigo na Base de Conhecimento.' });
        }
    }
    async markHelpful(req, res) {
        try {
            const { id } = req.params;
            const result = await knowledgeService.markHelpful(id);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(error.status || 500).json({ error: error.message || 'Erro ao registrar avaliação.' });
        }
    }
}
exports.KnowledgeController = KnowledgeController;
