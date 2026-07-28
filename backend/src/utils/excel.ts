import ExcelJS from 'exceljs';

export class ExcelUtil {
  /**
   * Gera planilha Excel (.xlsx) com a listagem de produtos do controle de estoque
   */
  public static async generateProductsExcel(products: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OmniStock ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Produtos em Estoque', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Cód. Barras', key: 'barcode', width: 18 },
      { header: 'Nome do Produto', key: 'name', width: 35 },
      { header: 'Categoria', key: 'category', width: 22 },
      { header: 'Marca', key: 'brand', width: 18 },
      { header: 'Unidade', key: 'unit', width: 10 },
      { header: 'Estoque Atual', key: 'currentStock', width: 15 },
      { header: 'Estoque Mín.', key: 'minStock', width: 14 },
      { header: 'Estoque Máx.', key: 'maxStock', width: 14 },
      { header: 'Preço de Compra (R$)', key: 'purchasePrice', width: 20 },
      { header: 'Preço de Venda (R$)', key: 'salesPrice', width: 20 },
      { header: 'Valor Total Estoque (R$)', key: 'totalValue', width: 22 },
      { header: 'Fornecedor', key: 'supplier', width: 25 },
      { header: 'Localização', key: 'location', width: 18 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Estilizar cabeçalho
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark slate ERP color
    };

    products.forEach((p) => {
      sheet.addRow({
        code: p.code,
        barcode: p.barcode || '-',
        name: p.name,
        category: p.category?.name || 'Geral',
        brand: p.brand || '-',
        unit: p.unit,
        currentStock: p.currentStock,
        minStock: p.minStock,
        maxStock: p.maxStock,
        purchasePrice: p.purchasePrice,
        salesPrice: p.salesPrice,
        totalValue: p.currentStock * p.purchasePrice,
        supplier: p.supplier?.nomeFantasia || '-',
        location: p.location || '-',
        status: p.isActive ? 'Ativo' : 'Inativo'
      });
    });

    // Formatação condicional e bordas
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell('purchasePrice').numFmt = '"R$"#,##0.00';
        row.getCell('salesPrice').numFmt = '"R$"#,##0.00';
        row.getCell('totalValue').numFmt = '"R$"#,##0.00';
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as any);
  }

  public static async generateLoansExcel(loans: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OmniStock Service Desk';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Equipamentos Emprestados', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'Colaborador', key: 'userName', width: 25 },
      { header: 'Setor', key: 'department', width: 22 },
      { header: 'Equipamento', key: 'equipmentName', width: 35 },
      { header: 'Patrimônio', key: 'patrimony', width: 18 },
      { header: 'Data Empréstimo', key: 'loanDate', width: 18 },
      { header: 'Previsão Devolução', key: 'expectedReturnDate', width: 18 },
      { header: 'Data Devolução', key: 'returnDate', width: 18 },
      { header: 'Entregue Por', key: 'deliveredBy', width: 22 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Observação', key: 'notes', width: 35 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };

    loans.forEach((l) => {
      sheet.addRow({
        userName: l.userName,
        department: l.department,
        equipmentName: l.equipmentName,
        patrimony: l.patrimony || '-',
        loanDate: l.loanDate ? new Date(l.loanDate).toLocaleDateString('pt-BR') : '-',
        expectedReturnDate: l.expectedReturnDate ? new Date(l.expectedReturnDate).toLocaleDateString('pt-BR') : '-',
        returnDate: l.returnDate ? new Date(l.returnDate).toLocaleDateString('pt-BR') : '-',
        deliveredBy: l.deliveredBy,
        status: l.status === 'ACTIVE' ? 'Ativo' : l.status === 'OVERDUE' ? 'Atrasado (>30d)' : 'Devolvido',
        notes: l.notes || '-'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as any);
  }

  public static async generateMovementsExcel(movements: any[], title = 'Histórico de Movimentações'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OmniStock Service Desk';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Movimentações TI', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'Data e Hora', key: 'datetime', width: 20 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Cód. Produto', key: 'code', width: 15 },
      { header: 'Equipamento', key: 'productName', width: 35 },
      { header: 'Patrimônio', key: 'patrimony', width: 18 },
      { header: 'Qtd.', key: 'quantity', width: 10 },
      { header: 'Estoque Ant.', key: 'previousStock', width: 14 },
      { header: 'Novo Estoque', key: 'newStock', width: 14 },
      { header: 'Responsável / Colaborador', key: 'user', width: 25 },
      { header: 'Motivo / Observação', key: 'reason', width: 40 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };

    movements.forEach((m) => {
      sheet.addRow({
        datetime: m.datetime ? new Date(m.datetime).toLocaleString('pt-BR') : '-',
        type: m.type,
        code: m.product?.code || '-',
        productName: m.product?.name || '-',
        patrimony: m.product?.patrimony || '-',
        quantity: m.quantity,
        previousStock: m.previousStock,
        newStock: m.newStock,
        user: m.user?.name || '-',
        reason: `${m.reason || ''} ${m.observation ? '| ' + m.observation : ''}`
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as any);
  }

  /**
   * Parse planilha Excel enviada para importação de produtos
   */
  public static async parseProductsImport(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    const imported: any[] = [];
    if (!sheet) return imported;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Ignore header

      const code = row.getCell(1).text?.trim();
      const name = row.getCell(3).text?.trim();
      if (!code || !name) return;

      imported.push({
        code,
        barcode: row.getCell(2).text?.trim() || null,
        name,
        categoryName: row.getCell(4).text?.trim() || 'Geral',
        brand: row.getCell(5).text?.trim() || null,
        unit: row.getCell(6).text?.trim() || 'UN',
        currentStock: Number(row.getCell(7).value) || 0,
        minStock: Number(row.getCell(8).value) || 5,
        maxStock: Number(row.getCell(9).value) || 100,
        purchasePrice: Number(row.getCell(10).value) || 0,
        salesPrice: Number(row.getCell(11).value) || 0,
        supplierName: row.getCell(13).text?.trim() || null,
        location: row.getCell(14).text?.trim() || null
      });
    });

    return imported;
  }
}
