"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const importData = [
    { category: 'Mouse', model: 'MO-D533', patrimony: null, quantity: 22 },
    { category: 'Extensor USB 2.0', model: null, patrimony: null, quantity: 2 },
    { category: 'Case para Segundo Disco Notebook', model: null, patrimony: null, quantity: 1 },
    { category: 'Teclado Vinik', model: 'Na Caixa', patrimony: null, quantity: 4 },
    { category: 'Headset', model: 'Bright', patrimony: null, quantity: 1 },
    { category: 'Switch Enterasys', model: 'V2H124-24', patrimony: null, quantity: 1 },
    { category: 'Switch Enterasys', model: null, patrimony: 'PRODESP 113822', quantity: 1 },
    { category: 'Switch Enterasys', model: null, patrimony: 'PRODESP 113795', quantity: 1 },
    { category: 'Switch HP', model: '5500-24G', patrimony: null, quantity: 1 },
    { category: 'Switch Furukawa', model: '7125', patrimony: null, quantity: 1 },
    { category: 'Switch Furukawa', model: '6028', patrimony: 'SH14BL2', quantity: 1 },
    { category: 'Switch D-Link', model: 'DES-3226', patrimony: 'SH6771', quantity: 1 },
    { category: 'Switch D-Link', model: '3326SR', patrimony: '19672', quantity: 1 },
    { category: 'Switch Surecom', model: null, patrimony: 'SH10BL1-1', quantity: 1 },
    { category: 'Switch Surecom', model: null, patrimony: 'SH6636', quantity: 1 },
    { category: 'Switch Surecom', model: null, patrimony: 'SH10BL1-2', quantity: 1 },
    { category: 'Switch 3Com Baseline', model: '2928SFP Plus', patrimony: null, quantity: 1 },
    { category: 'Switch 3Com', model: '3C17304', patrimony: 'DEFEITO', quantity: 1 },
    { category: 'Switch 3Com', model: '2948SFP Plus', patrimony: null, quantity: 1 },
    { category: 'Switch 3Com', model: '3C17203', patrimony: null, quantity: 1 },
    { category: 'Switch 3Com', model: '3CBLSF50', patrimony: null, quantity: 1 },
    { category: 'Switch 3Com', model: '3CRBSG2893', patrimony: null, quantity: 1 },
    { category: 'Switch HP', model: 'SPS-BLC', patrimony: null, quantity: 1 },
    { category: 'Roteador TP-Link', model: 'TL-WR841N', patrimony: null, quantity: 1 },
    { category: 'DVR / Gateway VoIP', model: 'MP114 VOIP Gateway', patrimony: null, quantity: 1 },
    { category: 'Impressora HP DeskJet', model: '2136', patrimony: null, quantity: 1 },
    { category: 'Placa Wi-Fi D-Link', model: 'DWA-510', patrimony: null, quantity: 7 },
    { category: 'Adaptador USB para Porta Serial 9 Pinos', model: null, patrimony: null, quantity: 3 },
];
async function runImport() {
    console.log('--- INICIANDO IMPORTAÇÃO DO ESTOQUE INICIAL DE TI ---');
    // Buscar usuário do sistema para vincular histórico de movimentações
    let user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) {
        user = await prisma.user.findFirst();
    }
    const userId = user ? user.id : 'default';
    let totalItemTypes = 0;
    let totalUnits = 0;
    let itemsWithPatrimony = 0;
    let itemsWithoutPatrimony = 0;
    let defectiveItems = 0;
    for (let i = 0; i < importData.length; i++) {
        const item = importData[i];
        // 1. Resolver categoria (se não existir, criar automaticamente)
        const allCategories = await prisma.category.findMany();
        let category = allCategories.find((c) => c.name.toLowerCase() === item.category.trim().toLowerCase());
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: item.category.trim(),
                    icon: 'folder',
                    color: '#3B82F6'
                }
            });
            console.log(`[Categoria Criada] -> "${category.name}"`);
        }
        // 2. Tratar Patrimônio e status Defeito
        let realPatrimony = null;
        let isDefective = false;
        if (item.patrimony && item.patrimony.trim().toUpperCase() === 'DEFEITO') {
            realPatrimony = null;
            isDefective = true;
        }
        else if (item.patrimony && item.patrimony.trim() !== '') {
            realPatrimony = item.patrimony.trim();
        }
        // 3. Gerar Nome descritivo do Produto
        const nameParts = [item.category.trim()];
        if (item.model && item.model.trim())
            nameParts.push(item.model.trim());
        if (realPatrimony)
            nameParts.push(`(Patrimônio: ${realPatrimony})`);
        if (isDefective)
            nameParts.push('[DEFEITO]');
        const productName = nameParts.join(' ');
        // 4. Checar se produto já existe (por nome ou por patrimônio exclusivo)
        let existingProduct = await prisma.product.findFirst({
            where: {
                OR: [
                    { name: productName },
                    ...(realPatrimony ? [{ patrimony: realPatrimony }] : [])
                ]
            }
        });
        let product;
        const codeSeq = (i + 1).toString().padStart(3, '0');
        const defaultCode = `TI-EST-${codeSeq}`;
        if (existingProduct) {
            // Atualizar quantidade se já existe
            product = await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    currentStock: item.quantity,
                    location: 'Estoque TI',
                    isActive: true,
                    observations: isDefective ? 'DEFEITO' : existingProduct.observations
                }
            });
            console.log(`[Atualizado] ${productName} | Quantidade: ${item.quantity}`);
        }
        else {
            // Garantir que o código não colida
            let code = defaultCode;
            const codeExists = await prisma.product.findUnique({ where: { code } });
            if (codeExists) {
                code = `TI-EST-${Date.now()}-${i}`;
            }
            product = await prisma.product.create({
                data: {
                    code,
                    name: productName,
                    categoryId: category.id,
                    model: item.model ? item.model.trim() : null,
                    patrimony: realPatrimony,
                    serialNumber: null, // "Para itens sem número de série, deixe o campo vazio."
                    currentStock: item.quantity,
                    location: 'Estoque TI', // "A localização padrão será 'Estoque TI'."
                    isActive: true, // "Todos os itens devem ficar com status 'Disponível'."
                    observations: isDefective ? 'DEFEITO' : null,
                    minStock: 1
                }
            });
            console.log(`[Cadastrado] ${productName} (Cód: ${product.code}) | Quantidade: ${item.quantity}`);
        }
        // 5. Registrar movimentação única de Entrada de Estoque Inicial
        await prisma.stockMovement.create({
            data: {
                type: 'ENTRADA',
                productId: product.id,
                quantity: item.quantity,
                previousStock: 0,
                newStock: item.quantity,
                userId,
                reason: 'Entrada de Estoque Inicial',
                observation: `Importação em lote - ${isDefective ? 'Item marcado como DEFEITO' : 'Status: Disponível'}`
            }
        });
        // Contabilizar estatísticas para o resumo
        totalItemTypes++;
        totalUnits += item.quantity;
        if (realPatrimony) {
            itemsWithPatrimony++;
        }
        else {
            itemsWithoutPatrimony++;
        }
        if (isDefective) {
            defectiveItems++;
        }
    }
    console.log('\n======================================================');
    console.log('         RESUMO DA IMPORTAÇÃO DE ESTOQUE TI           ');
    console.log('======================================================');
    console.log(`• Total de tipos de itens cadastrados     : ${totalItemTypes}`);
    console.log(`• Quantidade total de unidades em estoque : ${totalUnits}`);
    console.log(`• Itens com patrimônio registrado         : ${itemsWithPatrimony}`);
    console.log(`• Itens sem patrimônio                    : ${itemsWithoutPatrimony}`);
    console.log(`• Itens marcados como defeituosos         : ${defectiveItems}`);
    console.log('======================================================\n');
}
runImport()
    .catch((e) => {
    console.error('Erro na importação:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
