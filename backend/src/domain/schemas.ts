import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres')
});

export const productSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  barcode: z.string().optional().nullable(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid('Categoria inválida'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  unit: z.string().default('UN'),
  location: z.string().optional().nullable(),
  minStock: z.number().int().min(0).default(5),
  maxStock: z.number().int().min(1).default(100),
  currentStock: z.number().int().min(0).default(0),
  purchasePrice: z.number().min(0).default(0),
  salesPrice: z.number().min(0).default(0),
  supplierId: z.string().uuid('Fornecedor inválido').optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  patrimony: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  icon: z.string().default('folder'),
  color: z.string().default('#3B82F6'),
  parentId: z.string().uuid().optional().nullable()
});

export const supplierSchema = z.object({
  razaoSocial: z.string().min(2, 'Razão Social é obrigatória'),
  nomeFantasia: z.string().min(2, 'Nome Fantasia é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 dígitos'),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  endereco: z.string().optional().nullable(),
  contato: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const movementSchema = z.object({
  type: z.enum(['ENTRADA', 'SAIDA', 'EMPRESTIMO', 'DEVOLUCAO', 'BAIXA', 'TRANSFERENCIA', 'AJUSTE']),
  productId: z.string().uuid('Produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  reason: z.string().min(3, 'Motivo é obrigatório (mín. 3 caracteres)'),
  documentFiscal: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  originLocation: z.string().optional().nullable(),
  destinationLocation: z.string().optional().nullable()
});

export const inventoryAuditSchema = z.object({
  title: z.string().min(3, 'Título é obrigatório'),
  type: z.enum(['GERAL', 'POR_CATEGORIA', 'POR_LOCALIZACAO']).default('GERAL'),
  targetFilter: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const inventoryConferenceItemSchema = z.object({
  productId: z.string().uuid(),
  physicalCount: z.number().int().min(0)
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'TECNICO', 'CONSULTA', 'GESTOR', 'ALMOXARIFE']).default('CONSULTA'),
  department: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const loanSchema = z.object({
  userName: z.string().min(2, 'Nome do usuário é obrigatório'),
  department: z.string().min(1, 'Setor é obrigatório'),
  equipmentName: z.string().min(1, 'Equipamento é obrigatório'),
  productId: z.string().uuid('Produto inválido'),
  patrimony: z.string().optional().nullable(),
  loanDate: z.string().optional().nullable(),
  expectedReturnDate: z.string().min(1, 'Data prevista é obrigatória'),
  returnDate: z.string().optional().nullable(),
  deliveredBy: z.string().min(1, 'Responsável pela entrega é obrigatório'),
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE']).default('ACTIVE'),
  notes: z.string().optional().nullable()
});

