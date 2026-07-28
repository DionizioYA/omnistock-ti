import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do OmniStock Service Desk - Controle de Estoque de TI...');

  // 1. Limpeza do banco em ordem por chaves estrangeiras
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.inventoryAuditItem.deleteMany();
  await prisma.inventoryAudit.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // 2. Usuários de TI (Perfis: Administrador, Técnico, Consulta)
  const defaultPassHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Roberto Silveira (Coordenador TI)',
      email: 'admin@omnistock.com.br',
      passwordHash: defaultPassHash,
      role: 'ADMIN',
      department: 'Governança & Infraestrutura de TI',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const tecnico = await prisma.user.create({
    data: {
      name: 'Carlos Eduardo (Analista de Service Desk)',
      email: 'tecnico@omnistock.com.br',
      passwordHash: defaultPassHash,
      role: 'TECNICO',
      department: 'Suporte Nível 2 - Service Desk',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const consulta = await prisma.user.create({
    data: {
      name: 'Juliana Costa (Auditoria de Ativos)',
      email: 'consulta@omnistock.com.br',
      passwordHash: defaultPassHash,
      role: 'CONSULTA',
      department: 'Controladoria & Ativos de TI',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  });

  // 3. Fornecedores Parceiros de TI
  const supDell = await prisma.supplier.create({
    data: {
      razaoSocial: 'Dell Computadores do Brasil Ltda',
      nomeFantasia: 'Dell Brasil B2B',
      cnpj: '72.381.189/0001-10',
      telefone: '(11) 4004-3355',
      email: 'vendas_corporativas@dell.com.br',
      endereco: 'Av. Industrial, 700 - Hortolândia, SP',
      contato: 'Marcelo Santos (Gerente ProSupport)'
    }
  });

  const supCisco = await prisma.supplier.create({
    data: {
      razaoSocial: 'Cisco Systems do Brasil Ltda',
      nomeFantasia: 'Cisco Networking SP',
      cnpj: '01.374.972/0001-44',
      telefone: '(11) 3050-4000',
      email: 'network.enterprise@cisco.com.br',
      contato: 'Luciano Albuquerque'
    }
  });

  const supLenovo = await prisma.supplier.create({
    data: {
      razaoSocial: 'Lenovo Tecnologia Brasil Ltda',
      nomeFantasia: 'Lenovo ThinkPad',
      cnpj: '09.316.105/0001-90',
      telefone: '(11) 3140-5000',
      email: 'b2b.brasil@lenovo.com',
      contato: 'Ana Paula Reis'
    }
  });

  const supLogitech = await prisma.supplier.create({
    data: {
      razaoSocial: 'Logitech do Brasil Comércio de Acessórios',
      nomeFantasia: 'Logitech Business',
      cnpj: '08.680.825/0001-99',
      telefone: '(11) 3306-0000',
      email: 'empresas@logitech.com.br',
      contato: 'Fernando Souza'
    }
  });

  // 4. Todas as 19 Categorias Padrão de TI requisitadas
  const catNotebook = await prisma.category.create({ data: { name: 'Notebook', description: 'Portáteis, ultrabooks e notebooks corporativos', icon: 'laptop', color: '#3B82F6' } });
  const catDesktop = await prisma.category.create({ data: { name: 'Desktop', description: 'Estações de trabalho e computadores de mesa', icon: 'cpu', color: '#6366F1' } });
  const catMonitor = await prisma.category.create({ data: { name: 'Monitor', description: 'Monitores e telas auxiliares', icon: 'monitor', color: '#0EA5E9' } });
  const catMouse = await prisma.category.create({ data: { name: 'Mouse', description: 'Mouses sem fio, ópticos e ergonômicos', icon: 'mouse-pointer', color: '#10B981' } });
  const catTeclado = await prisma.category.create({ data: { name: 'Teclado', description: 'Teclados corporativos ABNT2 USB/Wireless', icon: 'keyboard', color: '#14B8A6' } });
  const catHeadset = await prisma.category.create({ data: { name: 'Headset', description: 'Fones corporativos com cancelamento de ruído', icon: 'headphones', color: '#8B5CF6' } });
  const catWebcam = await prisma.category.create({ data: { name: 'Webcam', description: 'Webcams Full HD / 4K para videoconferência', icon: 'camera', color: '#EC4899' } });
  const catImpressora = await prisma.category.create({ data: { name: 'Impressora', description: 'Multifuncionais laser e impressoras corporativas', icon: 'printer', color: '#F59E0B' } });
  const catTablet = await prisma.category.create({ data: { name: 'Tablet', description: 'Tablets institucionais para campo e diretoria', icon: 'tablet', color: '#D97706' } });
  const catCelular = await prisma.category.create({ data: { name: 'Celular', description: 'Smartphones corporativos', icon: 'smartphone', color: '#E11D48' } });
  const catSwitch = await prisma.category.create({ data: { name: 'Switch', description: 'Switches gerenciáveis Gigabit e PoE+', icon: 'network', color: '#059669' } });
  const catAP = await prisma.category.create({ data: { name: 'Access Point', description: 'Pontos de acesso Wi-Fi 6 corporativos', icon: 'wifi', color: '#2563EB' } });
  const catCabo = await prisma.category.create({ data: { name: 'Cabo de Rede', description: 'Cabos CAT6, CAT6A e patch cords', icon: 'cable', color: '#64748B' } });
  const catFonte = await prisma.category.create({ data: { name: 'Fonte', description: 'Fontes ATX e carregadores originais para notebooks', icon: 'plug', color: '#7C3AED' } });
  const catSSD = await prisma.category.create({ data: { name: 'SSD', description: 'Armazenamento em SSD SATA e NVMe M.2', icon: 'hard-drive', color: '#0D9488' } });
  const catHD = await prisma.category.create({ data: { name: 'HD', description: 'Discos rígidos internos e externos', icon: 'disc', color: '#475569' } });
  const catMemoria = await prisma.category.create({ data: { name: 'Memória RAM', description: 'Módulos de memória DDR4 / DDR5', icon: 'cpu', color: '#EA580C' } });
  const catAdaptador = await prisma.category.create({ data: { name: 'Adaptador', description: 'Hubs USB-C, adaptadores HDMI/VGA/DisplayPort', icon: 'tool', color: '#4F46E5' } });
  const catOutro = await prisma.category.create({ data: { name: 'Outro', description: 'Periféricos e acessórios de suporte diversos', icon: 'folder', color: '#94A3B8' } });

  // 5. Produtos de TI (15+ itens de estoque da equipe de suporte de TI)
  const prodNotebook1 = await prisma.product.create({
    data: {
      code: 'TI-NB-001',
      barcode: '7891011220011',
      name: 'Notebook Dell Latitude 5430 Intel Core i7 16GB 512GB SSD',
      description: 'Ultrabook corporativo com Windows 11 Pro, teclado iluminado e 3 anos de garantia ProSupport.',
      categoryId: catNotebook.id,
      brand: 'Dell',
      model: 'Latitude 5430',
      unit: 'UN',
      location: 'Armário TI - Prateleira A1 (Laptops)',
      minStock: 3,
      maxStock: 30,
      currentStock: 12,
      purchasePrice: 4890.00,
      salesPrice: 6200.00,
      supplierId: supDell.id,
      serialNumber: 'DL-LAT-5430-X9',
      patrimony: 'PAT-TI-0001',
      photoUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
      observations: 'Notebook de alto padrão para diretoria e engenharia de sistemas.'
    }
  });

  const prodNotebook2 = await prisma.product.create({
    data: {
      code: 'TI-NB-002',
      barcode: '7891011220028',
      name: 'Notebook Lenovo ThinkPad L14 Intel Core i5 16GB 256GB SSD',
      description: 'Notebook resistente para estações administrativas e suporte de campo.',
      categoryId: catNotebook.id,
      brand: 'Lenovo',
      model: 'ThinkPad L14 Gen 3',
      unit: 'UN',
      location: 'Armário TI - Prateleira A2',
      minStock: 4,
      maxStock: 25,
      currentStock: 8,
      purchasePrice: 3850.00,
      salesPrice: 4900.00,
      supplierId: supLenovo.id,
      serialNumber: 'LNV-TP-L14-2026',
      patrimony: 'PAT-TI-0002',
      photoUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodMonitor = await prisma.product.create({
    data: {
      code: 'TI-MN-001',
      barcode: '7891011220035',
      name: 'Monitor Dell 27" UltraSharp 4K USB-C Hub (U2723QE)',
      description: 'Monitor profissional com painel IPS Black 4K e alimentação Power Delivery 90W via cabo USB-C.',
      categoryId: catMonitor.id,
      brand: 'Dell',
      model: 'U2723QE',
      unit: 'UN',
      location: 'Estante TI - Prateleira B1 (Monitores)',
      minStock: 5,
      maxStock: 40,
      currentStock: 18,
      purchasePrice: 2850.00,
      salesPrice: 3600.00,
      supplierId: supDell.id,
      serialNumber: 'DL-MON-U27-991',
      patrimony: 'PAT-TI-0003',
      photoUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodMouse = await prisma.product.create({
    data: {
      code: 'TI-MS-001',
      barcode: '7891011220042',
      name: 'Mouse Sem Fio Logitech MX Anywhere 3S Ambidestro',
      description: 'Mouse silencioso com precisão 8.000 DPI e carregamento USB-C para uso em qualquer superfície.',
      categoryId: catMouse.id,
      brand: 'Logitech',
      model: 'MX Anywhere 3S',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 01 (Mouses)',
      minStock: 10,
      maxStock: 50,
      currentStock: 24,
      purchasePrice: 320.00,
      salesPrice: 450.00,
      supplierId: supLogitech.id,
      photoUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodTeclado = await prisma.product.create({
    data: {
      code: 'TI-TC-001',
      barcode: '7891011220059',
      name: 'Teclado Sem Fio Logitech MX Keys S ABNT2 Iluminado',
      description: 'Teclado ergonômico em alumínio com teclas esféricas silenciosas e conexão Bluetooth/Logi Bolt.',
      categoryId: catTeclado.id,
      brand: 'Logitech',
      model: 'MX Keys S',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 02 (Teclados)',
      minStock: 8,
      maxStock: 40,
      currentStock: 16,
      purchasePrice: 580.00,
      salesPrice: 790.00,
      supplierId: supLogitech.id,
      photoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodHeadset = await prisma.product.create({
    data: {
      code: 'TI-HS-001',
      barcode: '7891011220066',
      name: 'Headset Corporativo Jabra Evolve2 65 MS Teams USB-A',
      description: 'Fone de ouvido profissional com cancelamento passivo de ruído e áudio estéreo com microfone de braço.',
      categoryId: catHeadset.id,
      brand: 'Jabra',
      model: 'Evolve2 65',
      unit: 'UN',
      location: 'Armário TI - Prateleira C1 (Áudio/Vídeo)',
      minStock: 5,
      maxStock: 30,
      currentStock: 14,
      purchasePrice: 950.00,
      salesPrice: 1300.00,
      patrimony: 'PAT-TI-0006',
      photoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodWebcam = await prisma.product.create({
    data: {
      code: 'TI-WC-001',
      barcode: '7891011220073',
      name: 'Webcam Logitech C920e Full HD 1080p microfone estéreo',
      description: 'Webcam corporativa otimizada para reuniões em MS Teams, Zoom e Google Meet com tampa de privacidade.',
      categoryId: catWebcam.id,
      brand: 'Logitech',
      model: 'C920e',
      unit: 'UN',
      location: 'Armário TI - Prateleira C2',
      minStock: 6,
      maxStock: 35,
      currentStock: 11,
      purchasePrice: 380.00,
      salesPrice: 520.00,
      supplierId: supLogitech.id,
      photoUrl: 'https://images.unsplash.com/photo-1587826500084-3b0c14b9c1d9?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodSwitch = await prisma.product.create({
    data: {
      code: 'TI-SW-001',
      barcode: '7891011220080',
      name: 'Switch Cisco Catalyst 2960-X 24 Portas Gigabit PoE+ (WS-C2960X)',
      description: 'Switch corporativo para rack 19" com 24 portas RJ45 Power over Ethernet e 4 portas SFP.',
      categoryId: catSwitch.id,
      brand: 'Cisco',
      model: 'WS-C2960X-24PS-L',
      unit: 'UN',
      location: 'Rack Técnico Central - Sala TI 02',
      minStock: 2,
      maxStock: 10,
      currentStock: 3,
      purchasePrice: 7900.00,
      salesPrice: 9800.00,
      supplierId: supCisco.id,
      serialNumber: 'FOC2419Z0T8',
      patrimony: 'PAT-TI-0008',
      photoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodAP = await prisma.product.create({
    data: {
      code: 'TI-AP-001',
      barcode: '7891011220097',
      name: 'Access Point Cisco Meraki MR46 Wi-Fi 6 Cloud Managed',
      description: 'Ponto de acesso corporativo dual-band 4x4 MU-MIMO com gerenciamento total em nuvem.',
      categoryId: catAP.id,
      brand: 'Cisco Meraki',
      model: 'MR46-HW',
      unit: 'UN',
      location: 'Armário TI - Prateleira D1 (Redes)',
      minStock: 5,
      maxStock: 25,
      currentStock: 2, // ESTOQUE BAIXO PROPOSITAL PARA TESTE DE ALERTA
      purchasePrice: 4200.00,
      salesPrice: 5500.00,
      supplierId: supCisco.id,
      patrimony: 'PAT-TI-0009',
      photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodSSD = await prisma.product.create({
    data: {
      code: 'TI-SSD-001',
      barcode: '7891011220103',
      name: 'SSD Kingston NVMe M.2 1TB KC3000 PCIe 4.0 (7000 MB/s)',
      description: 'SSD de alta performance para upgrade em notebooks de engenharia e servidores de build.',
      categoryId: catSSD.id,
      brand: 'Kingston',
      model: 'KC3000 1TB',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 03 (Hardware)',
      minStock: 5,
      maxStock: 30,
      currentStock: 0, // ESTOQUE ZERADO PROPOSITAL PARA TESTE DE ALERTA INDISPONÍVEL
      purchasePrice: 520.00,
      salesPrice: 750.00,
      photoUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodRam = await prisma.product.create({
    data: {
      code: 'TI-RAM-001',
      barcode: '7891011220110',
      name: 'Memória RAM SODIMM DDR4 16GB 3200MHz Kingston Fury Impact',
      description: 'Módulo de memória RAM para expansão de notebooks Dell e Lenovo.',
      categoryId: catMemoria.id,
      brand: 'Kingston',
      model: 'Fury Impact 16GB',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 03',
      minStock: 6,
      maxStock: 40,
      currentStock: 14,
      purchasePrice: 280.00,
      salesPrice: 400.00,
      photoUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodCabo = await prisma.product.create({
    data: {
      code: 'TI-CB-001',
      barcode: '7891011220127',
      name: 'Cabo de Rede CAT6 Furukawa Gigalan Patch Cord 3 metros Azul',
      description: 'Patch cord certificado Gigabit CAT6 com conectores RJ45 blindados.',
      categoryId: catCabo.id,
      brand: 'Furukawa',
      model: 'CAT6 3m Azul',
      unit: 'UN',
      location: 'Estante TI - Caixote Rede 01',
      minStock: 20,
      maxStock: 150,
      currentStock: 75,
      purchasePrice: 25.00,
      salesPrice: 40.00,
      photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodAdaptador = await prisma.product.create({
    data: {
      code: 'TI-AD-001',
      barcode: '7891011220134',
      name: 'Adaptador Hub Multi-Portas USB-C 7 em 1 4K HDMI PD 100W',
      description: 'Hub USB-C compacto com saída HDMI 4K, 3 portas USB 3.0, leitor de cartões e passthrough USB-C.',
      categoryId: catAdaptador.id,
      brand: 'Dell',
      model: 'DA310 USB-C Hub',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 04 (Adaptadores)',
      minStock: 8,
      maxStock: 50,
      currentStock: 22,
      purchasePrice: 380.00,
      salesPrice: 520.00,
      supplierId: supDell.id,
      photoUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodTablet = await prisma.product.create({
    data: {
      code: 'TI-TB-001',
      barcode: '7891011220141',
      name: 'iPad Pro 11" M2 256GB Wi-Fi Cinza-Espacial com Apple Pencil',
      description: 'Tablet institucional para executivos, assinatura digital de documentos e demonstrações em campo.',
      categoryId: catTablet.id,
      brand: 'Apple',
      model: 'iPad Pro M2',
      unit: 'UN',
      location: 'Armário TI - Prateleira A3 (Cofre)',
      minStock: 2,
      maxStock: 15,
      currentStock: 5,
      purchasePrice: 6500.00,
      salesPrice: 8200.00,
      patrimony: 'PAT-TI-0014',
      photoUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80'
    }
  });

  const prodFonte = await prisma.product.create({
    data: {
      code: 'TI-FT-001',
      barcode: '7891011220158',
      name: 'Fonte Carregador Original Dell 65W USB-C Bivolt (LA65NM170)',
      description: 'Fonte de alimentação sobressalente com ponta USB-C para notebooks Dell Latitude e XPS.',
      categoryId: catFonte.id,
      brand: 'Dell',
      model: '65W USB-C',
      unit: 'UN',
      location: 'Gaveteiro TI - Gaveta 05 (Carregadores)',
      minStock: 10,
      maxStock: 60,
      currentStock: 28,
      purchasePrice: 220.00,
      salesPrice: 340.00,
      supplierId: supDell.id,
      photoUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80'
    }
  });

  // 6. Movimentações Históricas de TI (Entrada, Saída, Empréstimo, Devolução, Baixa)
  await prisma.stockMovement.createMany({
    data: [
      {
        type: 'ENTRADA',
        productId: prodNotebook1.id,
        quantity: 15,
        previousStock: 0,
        newStock: 15,
        userId: admin.id,
        reason: 'Compra inicial de lote Dell Latitude 5430 - NF 44589',
        documentFiscal: 'NF-e 44589',
        observation: 'Notebooks testados e homologados pela equipe de infraestrutura.'
      },
      {
        type: 'SAIDA',
        productId: prodNotebook1.id,
        quantity: 3,
        previousStock: 15,
        newStock: 12,
        userId: tecnico.id,
        reason: 'Entrega para novas contratações - Setor de Arquitetura de Software',
        observation: 'Entregue com bolsa e mouse sem fio.'
      },
      {
        type: 'ENTRADA',
        productId: prodMonitor.id,
        quantity: 20,
        previousStock: 0,
        newStock: 20,
        userId: admin.id,
        reason: 'Renovação do parque de monitores do escritório principal - NF 88019',
        documentFiscal: 'NF-e 88019'
      },
      {
        type: 'EMPRESTIMO',
        productId: prodMonitor.id,
        quantity: 2,
        previousStock: 20,
        newStock: 18,
        userId: tecnico.id,
        reason: 'Empréstimo de 2 monitores 4K para projeto especial na sala de reuniões',
        observation: 'Solicitado por Mariana Albuquerque.'
      },
      {
        type: 'ENTRADA',
        productId: prodMouse.id,
        quantity: 30,
        previousStock: 0,
        newStock: 30,
        userId: tecnico.id,
        reason: 'Aquisição em lote da Logitech - NF 11234'
      },
      {
        type: 'SAIDA',
        productId: prodMouse.id,
        quantity: 6,
        previousStock: 30,
        newStock: 24,
        userId: tecnico.id,
        reason: 'Substituição de mouses com defeito no Call Center'
      },
      {
        type: 'BAIXA',
        productId: prodHeadset.id,
        quantity: 1,
        previousStock: 15,
        newStock: 14,
        userId: admin.id,
        reason: 'Descarte por dano físico irreversível (haste quebrada e cabo rompido)',
        observation: 'Gerado laudo técnico interno de baixa patrimonial.'
      },
      {
        type: 'DEVOLUCAO',
        productId: prodTablet.id,
        quantity: 1,
        previousStock: 4,
        newStock: 5,
        userId: tecnico.id,
        reason: 'Devolução de iPad Pro após encerramento do feira de eventos SP Tech',
        observation: 'Aparelho conferido: sem arranhões e carregador na caixa.'
      }
    ]
  });

  // 7. Empréstimos (Loans) - com teste explícito para Empréstimo Atrasado (> 30 dias)
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 36); // Emprestado há 36 dias!
  const expectedReturnOverdue = new Date();
  expectedReturnOverdue.setDate(expectedReturnOverdue.getDate() - 6); // Venceu há 6 dias

  await prisma.loan.create({
    data: {
      userName: 'Marcos Vasconcelos',
      department: 'Jurídico & Contratos',
      equipmentName: 'Notebook Dell Latitude 5430 Core i7',
      productId: prodNotebook1.id,
      patrimony: 'PAT-TI-0001',
      loanDate: overdueDate,
      expectedReturnDate: expectedReturnOverdue,
      returnDate: null,
      deliveredBy: tecnico.name,
      status: 'OVERDUE',
      notes: 'EMPRÉSTIMO ATRASADO! Colaborador viajou para julgamento regional em Brasília e ainda não devolveu.'
    }
  });

  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);
  const expectedReturnRecent = new Date();
  expectedReturnRecent.setDate(expectedReturnRecent.getDate() + 14);

  await prisma.loan.create({
    data: {
      userName: 'Fernanda Lima Souza',
      department: 'Diretoria Executiva',
      equipmentName: 'iPad Pro 11" M2 256GB Wi-Fi',
      productId: prodTablet.id,
      patrimony: 'PAT-TI-0014',
      loanDate: recentDate,
      expectedReturnDate: expectedReturnRecent,
      returnDate: null,
      deliveredBy: admin.name,
      status: 'ACTIVE',
      notes: 'iPad para apresentações na convenção anual de acionistas.'
    }
  });

  const loanHeadset = new Date();
  loanHeadset.setDate(loanHeadset.getDate() - 3);
  const expectedHeadset = new Date();
  expectedHeadset.setDate(expectedHeadset.getDate() + 10);

  await prisma.loan.create({
    data: {
      userName: 'Lucas Mendes Ribeiro',
      department: 'Comercial & Novos Negócios',
      equipmentName: 'Headset Corporativo Jabra Evolve2 65',
      productId: prodHeadset.id,
      patrimony: 'PAT-TI-0006',
      loanDate: loanHeadset,
      expectedReturnDate: expectedHeadset,
      returnDate: null,
      deliveredBy: tecnico.name,
      status: 'ACTIVE',
      notes: 'Headset de substituição provisória enquanto o fone titular está na assistência técnica.'
    }
  });

  const returnedLoanDate = new Date();
  returnedLoanDate.setDate(returnedLoanDate.getDate() - 20);
  const returnDateDone = new Date();
  returnDateDone.setDate(returnDateDone.getDate() - 2);

  await prisma.loan.create({
    data: {
      userName: 'Beatriz Rocha Magalhães',
      department: 'Engenharia de Dados',
      equipmentName: 'Monitor Dell 27" UltraSharp 4K USB-C Hub',
      productId: prodMonitor.id,
      patrimony: 'PAT-TI-0003',
      loanDate: returnedLoanDate,
      expectedReturnDate: returnDateDone,
      returnDate: returnDateDone,
      deliveredBy: tecnico.name,
      status: 'RETURNED',
      notes: 'Equipamento devolvido perfeitamente limpo e com cabo original.'
    }
  });

  // 8. Alertas Automáticos do Sistema de Estoque e Empréstimos
  await prisma.alert.createMany({
    data: [
      {
        type: 'ZERO_STOCK',
        productId: prodSSD.id,
        title: 'Item Indisponível no Estoque',
        message: `O item "SSD Kingston NVMe M.2 1TB KC3000" está com estoque zerado no Service Desk.`,
        isRead: false
      },
      {
        type: 'LOW_STOCK',
        productId: prodAP.id,
        title: 'Estoque Abaixo do Mínimo',
        message: `Saldo do Access Point Cisco Meraki MR46 (2 UN) está abaixo do estoque mínimo estabelecido (5 UN).`,
        isRead: false
      },
      {
        type: 'OVERDUE_LOAN',
        productId: prodNotebook1.id,
        title: 'Equipamento Emprestado há mais de 30 dias',
        message: `O Notebook Dell Latitude 5430 (Patrimônio PAT-TI-0001) está emprestado para Marcos Vasconcelos (Setor Jurídico & Contratos) há mais de 30 dias.`,
        isRead: false
      }
    ]
  });

  // 9. Auditoria Inicial
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entity: 'CATALOG_TI',
        userId: admin.id,
        ipAddress: '192.168.1.50',
        details: '{"message": "Seed inicial com 19 categorias padrão de TI e 15+ equipamentos concluído"}'
      }
    ]
  });

  console.log('✅ Seed de TI finalizado com sucesso! OmniStock Service Desk pronto para uso diário da equipe de suporte!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
