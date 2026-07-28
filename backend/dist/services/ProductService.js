"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const barcode_1 = require("../utils/barcode");
const excel_1 = require("../utils/excel");
class ProductService {
    productRepo;
    alertRepo;
    constructor(productRepo, alertRepo) {
        this.productRepo = productRepo;
        this.alertRepo = alertRepo;
    }
    async getProducts(params) {
        const result = await this.productRepo.findAll(params);
        // Enriquecer com código de barras visual ou QR code gerado para exibição rápida
        const enrichedData = result.data.map((product) => ({
            ...product,
            barcodeSvgUrl: barcode_1.BarcodeUtil.generateBarcodeDataUrl(product.barcode || product.code),
            qrCodeSvgUrl: barcode_1.BarcodeUtil.generateQrCodeDataUrl(`OMNISTOCK-${product.code}-${product.name}`)
        }));
        return {
            ...result,
            data: enrichedData
        };
    }
    async getProductById(id) {
        const product = await this.productRepo.findById(id);
        if (!product) {
            throw new Error('Produto não encontrado');
        }
        return {
            ...product,
            barcodeSvgUrl: barcode_1.BarcodeUtil.generateBarcodeDataUrl(product.barcode || product.code),
            qrCodeSvgUrl: barcode_1.BarcodeUtil.generateQrCodeDataUrl(`OMNISTOCK-${product.code}-${product.name}`)
        };
    }
    async createProduct(data) {
        // Verificação de duplicidade por código ou código de barras
        const existingCode = await this.productRepo.findByCode(data.code);
        if (existingCode) {
            throw new Error(`Já existe um produto cadastrado com o código "${data.code}"`);
        }
        if (data.barcode) {
            const existingBarcode = await this.productRepo.findByBarcode(data.barcode);
            if (existingBarcode) {
                // Alerta de produto duplicado na central de alertas
                await this.alertRepo.create({
                    type: 'DUPLICATE_PRODUCT',
                    productId: existingBarcode.id,
                    title: 'Alerta de Duplicidade de Cadastro',
                    message: `Código de barras "${data.barcode}" em "${data.name}" confere com o produto "${existingBarcode.name}"`
                });
                throw new Error(`Já existe um produto com o código de barras "${data.barcode}" (${existingBarcode.name})`);
            }
        }
        const created = await this.productRepo.create(data);
        // Verificar alertas imediatos após criação
        await this.checkAndGenerateAlerts(created);
        return created;
    }
    async updateProduct(id, data) {
        const existing = await this.productRepo.findById(id);
        if (!existing) {
            throw new Error('Produto não encontrado');
        }
        const updated = await this.productRepo.update(id, data);
        await this.checkAndGenerateAlerts(updated);
        return updated;
    }
    async deleteProduct(id) {
        const existing = await this.productRepo.findById(id);
        if (!existing) {
            throw new Error('Produto não encontrado');
        }
        // A exclusão lógica garante que o histórico de movimentações jamais perca referência
        return this.productRepo.delete(id);
    }
    async exportProductsToExcel() {
        const result = await this.productRepo.findAll({ limit: 10000 });
        return excel_1.ExcelUtil.generateProductsExcel(result.data);
    }
    async importProductsFromExcel(buffer) {
        const parsed = await excel_1.ExcelUtil.parseProductsImport(buffer);
        let importedCount = 0;
        const errors = [];
        for (const item of parsed) {
            try {
                const existing = await this.productRepo.findByCode(item.code);
                if (!existing) {
                    await this.productRepo.create({
                        code: item.code,
                        barcode: item.barcode || null,
                        name: item.name,
                        unit: item.unit || 'UN',
                        currentStock: item.currentStock || 0,
                        minStock: item.minStock || 5,
                        maxStock: item.maxStock || 100,
                        purchasePrice: item.purchasePrice || 0,
                        salesPrice: item.salesPrice || 0,
                        location: item.location || null,
                        category: {
                            connectOrCreate: {
                                where: { id: 'default-cat' },
                                create: { name: item.categoryName || 'Geral' }
                            }
                        }
                    });
                    importedCount++;
                }
            }
            catch (err) {
                errors.push(`Erro ao importar item ${item.code}: ${err.message}`);
            }
        }
        return { importedCount, errors };
    }
    /**
     * Verifica se o produto atingiu saldo crítico, zerado ou próximo da validade e emite alerta
     */
    async checkAndGenerateAlerts(product) {
        // 1. Alerta Estoque Zerado
        if (product.currentStock === 0) {
            await this.alertRepo.create({
                type: 'ZERO_STOCK',
                productId: product.id,
                title: 'Estoque Zerado',
                message: `O produto "${product.name}" (Cód. ${product.code}) está com estoque zerado no almoxarifado.`
            });
        }
        // 2. Alerta Estoque Baixo
        else if (product.currentStock <= product.minStock) {
            await this.alertRepo.create({
                type: 'LOW_STOCK',
                productId: product.id,
                title: 'Estoque Abaixo do Mínimo',
                message: `Estoque de "${product.name}" (${product.currentStock} ${product.unit}) atingiu ou caiu abaixo da cota mínima de ${product.minStock} ${product.unit}.`
            });
        }
        // 3. Alerta Vencimento em até 30 dias
        if (product.expiryDate) {
            const expiry = new Date(product.expiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30) {
                await this.alertRepo.create({
                    type: 'EXPIRING_SOON',
                    productId: product.id,
                    title: diffDays <= 0 ? 'Produto Vencido' : 'Produto Próximo do Vencimento',
                    message: `A validade do produto "${product.name}" vence em ${expiry.toLocaleDateString('pt-BR')} (${diffDays <= 0 ? 'VENCIDO' : `${diffDays} dias restantes`}).`
                });
            }
        }
    }
}
exports.ProductService = ProductService;
