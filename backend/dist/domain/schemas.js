"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanSchema = exports.userSchema = exports.inventoryConferenceItemSchema = exports.inventoryAuditSchema = exports.movementSchema = exports.supplierSchema = exports.categorySchema = exports.productSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(4, 'A senha deve ter pelo menos 4 caracteres')
});
exports.productSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Código é obrigatório'),
    barcode: zod_1.z.string().optional().nullable(),
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional().nullable(),
    categoryId: zod_1.z.string().uuid('Categoria inválida'),
    brand: zod_1.z.string().optional().nullable(),
    model: zod_1.z.string().optional().nullable(),
    unit: zod_1.z.string().default('UN'),
    location: zod_1.z.string().optional().nullable(),
    minStock: zod_1.z.number().int().min(0).default(5),
    maxStock: zod_1.z.number().int().min(1).default(100),
    currentStock: zod_1.z.number().int().min(0).default(0),
    purchasePrice: zod_1.z.number().min(0).default(0),
    salesPrice: zod_1.z.number().min(0).default(0),
    supplierId: zod_1.z.string().uuid('Fornecedor inválido').optional().nullable(),
    expiryDate: zod_1.z.string().optional().nullable(),
    serialNumber: zod_1.z.string().optional().nullable(),
    patrimony: zod_1.z.string().optional().nullable(),
    photoUrl: zod_1.z.string().optional().nullable(),
    observations: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true)
});
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional().nullable(),
    icon: zod_1.z.string().default('folder'),
    color: zod_1.z.string().default('#3B82F6'),
    parentId: zod_1.z.string().uuid().optional().nullable()
});
exports.supplierSchema = zod_1.z.object({
    razaoSocial: zod_1.z.string().min(2, 'Razão Social é obrigatória'),
    nomeFantasia: zod_1.z.string().min(2, 'Nome Fantasia é obrigatório'),
    cnpj: zod_1.z.string().min(14, 'CNPJ deve ter pelo menos 14 dígitos'),
    telefone: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    endereco: zod_1.z.string().optional().nullable(),
    contato: zod_1.z.string().optional().nullable(),
    observacoes: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true)
});
exports.movementSchema = zod_1.z.object({
    type: zod_1.z.enum(['ENTRADA', 'SAIDA', 'EMPRESTIMO', 'DEVOLUCAO', 'BAIXA', 'TRANSFERENCIA', 'AJUSTE']),
    productId: zod_1.z.string().uuid('Produto inválido'),
    quantity: zod_1.z.number().int().positive('Quantidade deve ser maior que zero'),
    reason: zod_1.z.string().min(3, 'Motivo é obrigatório (mín. 3 caracteres)'),
    documentFiscal: zod_1.z.string().optional().nullable(),
    observation: zod_1.z.string().optional().nullable(),
    originLocation: zod_1.z.string().optional().nullable(),
    destinationLocation: zod_1.z.string().optional().nullable()
});
exports.inventoryAuditSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Título é obrigatório'),
    type: zod_1.z.enum(['GERAL', 'POR_CATEGORIA', 'POR_LOCALIZACAO']).default('GERAL'),
    targetFilter: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable()
});
exports.inventoryConferenceItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    physicalCount: zod_1.z.number().int().min(0)
});
exports.userSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(['ADMIN', 'TECNICO', 'CONSULTA', 'GESTOR', 'ALMOXARIFE']).default('CONSULTA'),
    department: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true)
});
exports.loanSchema = zod_1.z.object({
    userName: zod_1.z.string().min(2, 'Nome do usuário é obrigatório'),
    department: zod_1.z.string().min(1, 'Setor é obrigatório'),
    equipmentName: zod_1.z.string().min(1, 'Equipamento é obrigatório'),
    productId: zod_1.z.string().uuid('Produto inválido'),
    patrimony: zod_1.z.string().optional().nullable(),
    loanDate: zod_1.z.string().optional().nullable(),
    expectedReturnDate: zod_1.z.string().min(1, 'Data prevista é obrigatória'),
    returnDate: zod_1.z.string().optional().nullable(),
    deliveredBy: zod_1.z.string().min(1, 'Responsável pela entrega é obrigatório'),
    status: zod_1.z.enum(['ACTIVE', 'RETURNED', 'OVERDUE']).default('ACTIVE'),
    notes: zod_1.z.string().optional().nullable()
});
