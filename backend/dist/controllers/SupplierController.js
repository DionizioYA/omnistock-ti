"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const schemas_1 = require("../domain/schemas");
class SupplierController {
    supplierRepo;
    constructor(supplierRepo) {
        this.supplierRepo = supplierRepo;
    }
    getSuppliers = async (req, res, next) => {
        try {
            const suppliers = await this.supplierRepo.findAll();
            res.status(200).json(suppliers);
        }
        catch (err) {
            next(err);
        }
    };
    getSupplierById = async (req, res, next) => {
        try {
            const supplier = await this.supplierRepo.findById(req.params.id);
            if (!supplier) {
                res.status(404).json({ error: 'Fornecedor não encontrado.' });
                return;
            }
            res.status(200).json(supplier);
        }
        catch (err) {
            next(err);
        }
    };
    createSupplier = async (req, res, next) => {
        try {
            const validated = schemas_1.supplierSchema.parse(req.body);
            const supplier = await this.supplierRepo.create(validated);
            res.status(201).json(supplier);
        }
        catch (err) {
            next(err);
        }
    };
    updateSupplier = async (req, res, next) => {
        try {
            const supplier = await this.supplierRepo.update(req.params.id, req.body);
            res.status(200).json(supplier);
        }
        catch (err) {
            next(err);
        }
    };
    deleteSupplier = async (req, res, next) => {
        try {
            await this.supplierRepo.delete(req.params.id);
            res.status(200).json({ message: 'Fornecedor desativado com sucesso (exclusão lógica ERP).' });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.SupplierController = SupplierController;
