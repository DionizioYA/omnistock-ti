"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const schemas_1 = require("../domain/schemas");
class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    getProducts = async (req, res, next) => {
        try {
            const { page = 1, limit = 20, search, categoryId, supplierId, sortBy, sortOrder, lowStock, zeroStock } = req.query;
            const result = await this.productService.getProducts({
                page: Number(page),
                limit: Number(limit),
                search: search,
                categoryId: categoryId,
                supplierId: supplierId,
                sortBy: sortBy,
                sortOrder: sortOrder,
                lowStock: lowStock === 'true',
                zeroStock: zeroStock === 'true'
            });
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            const product = await this.productService.getProductById(req.params.id);
            res.status(200).json(product);
        }
        catch (err) {
            next(err);
        }
    };
    createProduct = async (req, res, next) => {
        try {
            const validated = schemas_1.productSchema.parse(req.body);
            const product = await this.productService.createProduct(validated);
            res.status(201).json(product);
        }
        catch (err) {
            next(err);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            const product = await this.productService.updateProduct(req.params.id, req.body);
            res.status(200).json(product);
        }
        catch (err) {
            next(err);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            await this.productService.deleteProduct(req.params.id);
            res.status(200).json({ message: 'Produto desativado com sucesso (exclusão lógica ERP).' });
        }
        catch (err) {
            next(err);
        }
    };
    exportExcel = async (req, res, next) => {
        try {
            const buffer = await this.productService.exportProductsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=omnistock-produtos-${Date.now()}.xlsx`);
            res.send(buffer);
        }
        catch (err) {
            next(err);
        }
    };
    importExcel = async (req, res, next) => {
        try {
            // Nota: Em cenários com multer, o buffer está em req.file.buffer.
            // Aqui aceitamos req.body em base64 ou multipart simulado para facilidade de teste local.
            const base64Data = req.body.fileData;
            if (!base64Data) {
                res.status(400).json({ error: 'Arquivo Excel não fornecido para importação.' });
                return;
            }
            const buffer = Buffer.from(base64Data, 'base64');
            const result = await this.productService.importProductsFromExcel(buffer);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ProductController = ProductController;
