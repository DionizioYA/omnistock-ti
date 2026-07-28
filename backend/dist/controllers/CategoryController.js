"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const schemas_1 = require("../domain/schemas");
class CategoryController {
    categoryRepo;
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
    }
    getCategories = async (req, res, next) => {
        try {
            const categories = await this.categoryRepo.findAll();
            res.status(200).json(categories);
        }
        catch (err) {
            next(err);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            const validated = schemas_1.categorySchema.parse(req.body);
            const category = await this.categoryRepo.create(validated);
            res.status(201).json(category);
        }
        catch (err) {
            next(err);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            const category = await this.categoryRepo.update(req.params.id, req.body);
            res.status(200).json(category);
        }
        catch (err) {
            next(err);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            await this.categoryRepo.delete(req.params.id);
            res.status(200).json({ message: 'Categoria removida com sucesso.' });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.CategoryController = CategoryController;
