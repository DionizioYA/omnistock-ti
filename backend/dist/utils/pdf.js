"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFUtil = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFUtil {
    /**
     * Gera relatório PDF profissional de Estoque Geral / Valuation
     */
    static async generateStockReportPdf(products, title = 'Relatório de Controle de Estoque') {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'A4', layout: 'landscape' });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                // Cabeçalho ERP Moderno
                doc.fillColor('#0F172A').fontSize(18).text('OMNISTOCK ERP', { align: 'left' });
                doc.fontSize(12).fillColor('#475569').text(title, { align: 'left' });
                doc.fontSize(9).fillColor('#64748B').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'left' });
                doc.moveDown(1.5);
                // Resumo de KPIs na barra
                const totalItems = products.length;
                const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
                const totalVal = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.purchasePrice || 0)), 0);
                doc.fillColor('#1E293B').fontSize(10).text(`Total de Produtos: ${totalItems}   |   Total de Unidades em Estoque: ${totalUnits}   |   Valor Total de Compra: R$ ${totalVal.toFixed(2)}`, { align: 'left' });
                doc.moveDown(1);
                // Tabela - Cabeçalho
                const startX = 40;
                let currentY = doc.y;
                doc.rect(startX, currentY, 760, 22).fill('#1E293B');
                doc.fillColor('#FFFFFF').fontSize(9);
                doc.text('Cód.', startX + 5, currentY + 6, { width: 55 });
                doc.text('Produto', startX + 65, currentY + 6, { width: 220 });
                doc.text('Categoria', startX + 290, currentY + 6, { width: 110 });
                doc.text('Estoque', startX + 405, currentY + 6, { width: 55, align: 'right' });
                doc.text('Mín.', startX + 465, currentY + 6, { width: 45, align: 'right' });
                doc.text('Vlr. Compra', startX + 515, currentY + 6, { width: 75, align: 'right' });
                doc.text('Vlr. Venda', startX + 595, currentY + 6, { width: 75, align: 'right' });
                doc.text('Total Estoque', startX + 675, currentY + 6, { width: 80, align: 'right' });
                currentY += 26;
                // Tabela - Linhas
                products.forEach((p, idx) => {
                    if (currentY > 520) {
                        doc.addPage();
                        currentY = 40;
                    }
                    if (idx % 2 === 0) {
                        doc.rect(startX, currentY - 4, 760, 20).fill('#F8FAFC');
                    }
                    doc.fillColor('#1E293B').fontSize(8);
                    doc.text(p.code || '-', startX + 5, currentY, { width: 55 });
                    doc.text(p.name || '-', startX + 65, currentY, { width: 220, ellipsis: true });
                    doc.text(p.category?.name || 'Geral', startX + 290, currentY, { width: 110, ellipsis: true });
                    doc.text(String(p.currentStock || 0), startX + 405, currentY, { width: 55, align: 'right' });
                    doc.text(String(p.minStock || 0), startX + 465, currentY, { width: 45, align: 'right' });
                    doc.text(`R$ ${(p.purchasePrice || 0).toFixed(2)}`, startX + 515, currentY, { width: 75, align: 'right' });
                    doc.text(`R$ ${(p.salesPrice || 0).toFixed(2)}`, startX + 595, currentY, { width: 75, align: 'right' });
                    const totalItemVal = (p.currentStock || 0) * (p.purchasePrice || 0);
                    doc.text(`R$ ${totalItemVal.toFixed(2)}`, startX + 675, currentY, { width: 80, align: 'right' });
                    currentY += 20;
                });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Gera relatório PDF do Histórico de Movimentações
     */
    static async generateMovementsPdf(movements) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'A4', layout: 'landscape' });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                doc.fillColor('#0F172A').fontSize(18).text('OMNISTOCK ERP - HISTÓRICO DE MOVIMENTAÇÕES', { align: 'left' });
                doc.fontSize(10).fillColor('#64748B').text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, { align: 'left' });
                doc.moveDown(1.5);
                const startX = 40;
                let currentY = doc.y;
                doc.rect(startX, currentY, 760, 22).fill('#1E293B');
                doc.fillColor('#FFFFFF').fontSize(9);
                doc.text('Data/Hora', startX + 5, currentY + 6, { width: 110 });
                doc.text('Tipo', startX + 120, currentY + 6, { width: 95 });
                doc.text('Produto', startX + 220, currentY + 6, { width: 195 });
                doc.text('Qtd.', startX + 420, currentY + 6, { width: 45, align: 'right' });
                doc.text('Ant.', startX + 470, currentY + 6, { width: 45, align: 'right' });
                doc.text('Novo', startX + 520, currentY + 6, { width: 45, align: 'right' });
                doc.text('Motivo', startX + 575, currentY + 6, { width: 100 });
                doc.text('Responsável', startX + 680, currentY + 6, { width: 80 });
                currentY += 26;
                movements.forEach((m, idx) => {
                    if (currentY > 520) {
                        doc.addPage();
                        currentY = 40;
                    }
                    if (idx % 2 === 0) {
                        doc.rect(startX, currentY - 4, 760, 20).fill('#F8FAFC');
                    }
                    doc.fillColor('#1E293B').fontSize(8);
                    doc.text(new Date(m.datetime).toLocaleString('pt-BR'), startX + 5, currentY, { width: 110 });
                    doc.text(m.type, startX + 120, currentY, { width: 95 });
                    doc.text(m.product?.name || '-', startX + 220, currentY, { width: 195, ellipsis: true });
                    doc.text(String(m.quantity), startX + 420, currentY, { width: 45, align: 'right' });
                    doc.text(String(m.previousStock), startX + 470, currentY, { width: 45, align: 'right' });
                    doc.text(String(m.newStock), startX + 520, currentY, { width: 45, align: 'right' });
                    doc.text(m.reason || '-', startX + 575, currentY, { width: 100, ellipsis: true });
                    doc.text(m.user?.name || 'Sistema', startX + 680, currentY, { width: 80, ellipsis: true });
                    currentY += 20;
                });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static async generateLoansPdf(loans, title = 'Relatório de Equipamentos Emprestados') {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'A4', layout: 'landscape' });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                doc.fillColor('#0F172A').fontSize(18).text('OMNISTOCK SERVICE DESK', { align: 'left' });
                doc.fontSize(12).fillColor('#475569').text(title, { align: 'left' });
                doc.fontSize(9).fillColor('#64748B').text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, { align: 'left' });
                doc.moveDown(1.5);
                const startX = 40;
                let currentY = doc.y;
                doc.rect(startX, currentY, 760, 22).fill('#1E293B');
                doc.fillColor('#FFFFFF').fontSize(9);
                doc.text('Colaborador', startX + 5, currentY + 6, { width: 130 });
                doc.text('Setor', startX + 140, currentY + 6, { width: 100 });
                doc.text('Equipamento', startX + 245, currentY + 6, { width: 170 });
                doc.text('Patrimônio', startX + 420, currentY + 6, { width: 85 });
                doc.text('Data Emp.', startX + 510, currentY + 6, { width: 65 });
                doc.text('Previsão', startX + 580, currentY + 6, { width: 65 });
                doc.text('Status', startX + 650, currentY + 6, { width: 60 });
                doc.text('Técnico', startX + 715, currentY + 6, { width: 85 });
                currentY += 26;
                loans.forEach((l, idx) => {
                    if (currentY > 520) {
                        doc.addPage();
                        currentY = 40;
                    }
                    if (idx % 2 === 0) {
                        doc.rect(startX, currentY - 4, 760, 20).fill('#F8FAFC');
                    }
                    doc.fillColor('#1E293B').fontSize(8);
                    doc.text(l.userName, startX + 5, currentY, { width: 130, ellipsis: true });
                    doc.text(l.department, startX + 140, currentY, { width: 100, ellipsis: true });
                    doc.text(l.equipmentName, startX + 245, currentY, { width: 170, ellipsis: true });
                    doc.text(l.patrimony || '-', startX + 420, currentY, { width: 85, ellipsis: true });
                    doc.text(l.loanDate ? new Date(l.loanDate).toLocaleDateString('pt-BR') : '-', startX + 510, currentY, { width: 65 });
                    doc.text(l.expectedReturnDate ? new Date(l.expectedReturnDate).toLocaleDateString('pt-BR') : '-', startX + 580, currentY, { width: 65 });
                    doc.text(l.status === 'ACTIVE' ? 'Ativo' : l.status === 'OVERDUE' ? 'ATRASADO' : 'Devolvido', startX + 650, currentY, { width: 60 });
                    doc.text(l.deliveredBy || '-', startX + 715, currentY, { width: 85, ellipsis: true });
                    currentY += 20;
                });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.PDFUtil = PDFUtil;
