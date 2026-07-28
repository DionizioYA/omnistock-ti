"use strict";
// ============================================================================
// REPOSITÓRIO DE INVENTÁRIO - NEXUS DESK
// Encapsula acesso do Prisma para equipamentos de TI e histórico de movimentações.
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class InventoryRepository {
    async findById(id) {
        return prisma_1.default.inventoryItem.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, department: true }
                },
                history: {
                    include: {
                        performedBy: {
                            select: { id: true, name: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async findAll(filters) {
        return prisma_1.default.inventoryItem.findMany({
            where: {
                category: filters?.category,
                status: filters?.status,
                OR: filters?.search ? [
                    { name: { contains: filters.search } },
                    { assetCode: { contains: filters.search } },
                    { serialNumber: { contains: filters.search } }
                ] : undefined
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, department: true }
                }
            },
            orderBy: { assetCode: 'asc' }
        });
    }
    async create(data) {
        return prisma_1.default.inventoryItem.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.inventoryItem.update({
            where: { id },
            data
        });
    }
    async addHistory(data) {
        return prisma_1.default.inventoryHistory.create({ data });
    }
    async getInventoryStats() {
        const total = await prisma_1.default.inventoryItem.count();
        const inUse = await prisma_1.default.inventoryItem.count({ where: { status: client_1.InventoryStatus.IN_USE } });
        const available = await prisma_1.default.inventoryItem.count({ where: { status: client_1.InventoryStatus.AVAILABLE } });
        const maintenance = await prisma_1.default.inventoryItem.count({ where: { status: client_1.InventoryStatus.MAINTENANCE } });
        const byCategory = await prisma_1.default.inventoryItem.groupBy({
            by: ['category'],
            _count: { category: true }
        });
        return { total, inUse, available, maintenance, byCategory };
    }
}
exports.InventoryRepository = InventoryRepository;
exports.default = new InventoryRepository();
