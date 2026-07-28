import { IMovementRepository, IProductRepository, IAlertRepository } from '../repositories/interfaces';
import { MovementType } from '../domain/types';

export class MovementService {
  constructor(
    private movementRepo: IMovementRepository,
    private productRepo: IProductRepository,
    private alertRepo: IAlertRepository
  ) {}

  public async getMovements(params: { productId?: string; type?: string; limit?: number }): Promise<any[]> {
    return this.movementRepo.findAll(params);
  }

  public async getMovementById(id: string): Promise<any> {
    const m = await this.movementRepo.findById(id);
    if (!m) {
      throw new Error('Movimentação de estoque não encontrada');
    }
    return m;
  }

  /**
   * Registra movimentação imutável de estoque (Entrada, Saída, Transferência, Ajuste, Devolução)
   * Suporta identificação direta por código de barras ou UUID do produto.
   */
  public async registerMovement(data: {
    type: MovementType;
    productId: string;
    quantity: number;
    userId: string;
    reason: string;
    documentFiscal?: string | null;
    observation?: string | null;
    originLocation?: string | null;
    destinationLocation?: string | null;
  }): Promise<any> {
    if (data.quantity <= 0) {
      throw new Error('A quantidade deve ser maior que zero');
    }

    // Identificar produto (suporta ID UUID ou Código / Barcode direto da leitora óptica)
    let product = await this.productRepo.findById(data.productId);
    if (!product) {
      product = await this.productRepo.findByBarcode(data.productId);
      if (!product) {
        product = await this.productRepo.findByCode(data.productId);
      }
    }

    if (!product || !product.isActive) {
      throw new Error('Produto não encontrado ou inativo no catálogo');
    }

    const previousStock = product.currentStock;
    let newStock = previousStock;

    switch (data.type) {
      case 'ENTRADA':
      case 'DEVOLUCAO':
        newStock = previousStock + data.quantity;
        break;
      case 'SAIDA':
        if (previousStock < data.quantity) {
          throw new Error(`Saldo insuficiente! Estoque atual: ${previousStock} ${product.unit}, solicitado: ${data.quantity} ${product.unit}`);
        }
        newStock = previousStock - data.quantity;
        break;
      case 'AJUSTE':
        // No Ajuste, a quantidade informada pode ser o novo saldo ou o saldo incrementado.
        // Padrão ERP: novo saldo = quantity informada se for override ou diferencial
        newStock = data.quantity;
        break;
      case 'TRANSFERENCIA':
        // Transferência entre locais atualiza a string de localização
        newStock = previousStock;
        break;
      default:
        throw new Error('Tipo de movimentação inválido');
    }

    // 1. Criar registro histórico imutável
    const movement = await this.movementRepo.create({
      type: data.type,
      productId: product.id,
      quantity: data.quantity,
      previousStock,
      newStock,
      userId: data.userId,
      reason: data.reason,
      documentFiscal: data.documentFiscal || null,
      observation: data.observation || null,
      originLocation: data.originLocation || null,
      destinationLocation: data.destinationLocation || null
    });

    // 2. Atualizar saldo no produto (se mudou)
    if (newStock !== previousStock) {
      await this.productRepo.updateStock(product.id, newStock);
    }

    // 3. Atualizar localização no produto em caso de transferência
    if (data.type === 'TRANSFERENCIA' && data.destinationLocation) {
      await this.productRepo.update(product.id, { location: data.destinationLocation });
    }

    // 4. Checar Alertas Pós-Movimentação (Zero ou Baixo Estoque)
    if (newStock === 0) {
      await this.alertRepo.create({
        type: 'ZERO_STOCK',
        productId: product.id,
        title: 'Estoque Zerado por Saída',
        message: `O produto "${product.name}" (Cód. ${product.code}) zerou o estoque após a saída/ajuste.`
      });
    } else if (newStock <= product.minStock) {
      await this.alertRepo.create({
        type: 'LOW_STOCK',
        productId: product.id,
        title: 'Alerta de Estoque Mínimo',
        message: `O saldo atual de "${product.name}" caiu para ${newStock} ${product.unit} (Mínimo recomendado: ${product.minStock} ${product.unit}).`
      });
    }

    return movement;
  }
}
