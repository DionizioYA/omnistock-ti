import { IProductRepository, IAlertRepository } from '../repositories/interfaces';
import { PaginationParams, PaginatedResult } from '../domain/types';
import { BarcodeUtil } from '../utils/barcode';
import { ExcelUtil } from '../utils/excel';

export class ProductService {
  constructor(
    private productRepo: IProductRepository,
    private alertRepo: IAlertRepository
  ) {}

  public async getProducts(params: PaginationParams): Promise<PaginatedResult<any>> {
    const result = await this.productRepo.findAll(params);

    // Enriquecer com código de barras visual ou QR code gerado para exibição rápida
    const enrichedData = result.data.map((product: any) => ({
      ...product,
      barcodeSvgUrl: BarcodeUtil.generateBarcodeDataUrl(product.barcode || product.code),
      qrCodeSvgUrl: BarcodeUtil.generateQrCodeDataUrl(`OMNISTOCK-${product.code}-${product.name}`)
    }));

    return {
      ...result,
      data: enrichedData
    };
  }

  public async getProductById(id: string): Promise<any> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return {
      ...product,
      barcodeSvgUrl: BarcodeUtil.generateBarcodeDataUrl(product.barcode || product.code),
      qrCodeSvgUrl: BarcodeUtil.generateQrCodeDataUrl(`OMNISTOCK-${product.code}-${product.name}`)
    };
  }

  public async createProduct(data: any): Promise<any> {
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

  public async updateProduct(id: string, data: any): Promise<any> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new Error('Produto não encontrado');
    }

    const updated = await this.productRepo.update(id, data);
    await this.checkAndGenerateAlerts(updated);

    return updated;
  }

  public async deleteProduct(id: string): Promise<any> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new Error('Produto não encontrado');
    }

    // A exclusão lógica garante que o histórico de movimentações jamais perca referência
    return this.productRepo.delete(id);
  }

  public async exportProductsToExcel(): Promise<Buffer> {
    const result = await this.productRepo.findAll({ limit: 10000 });
    return ExcelUtil.generateProductsExcel(result.data);
  }

  public async importProductsFromExcel(buffer: Buffer): Promise<{ importedCount: number; errors: string[] }> {
    const parsed = await ExcelUtil.parseProductsImport(buffer);
    let importedCount = 0;
    const errors: string[] = [];

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
      } catch (err: any) {
        errors.push(`Erro ao importar item ${item.code}: ${err.message}`);
      }
    }

    return { importedCount, errors };
  }

  /**
   * Verifica se o produto atingiu saldo crítico, zerado ou próximo da validade e emite alerta
   */
  public async checkAndGenerateAlerts(product: any): Promise<void> {
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
