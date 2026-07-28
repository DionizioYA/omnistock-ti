import React from 'react';
import { downloadFile } from '../services/api';
import { 
  FileText, 
  FileSpreadsheet, 
  Package, 
  UserCheck, 
  AlertTriangle, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reportCards = [
    {
      title: 'Inventário Geral de TI & Valuation',
      desc: 'Lista de todos os equipamentos, periféricos, localização, patrimônio, série e valor total em estoque.',
      icon: <Package className="w-6 h-6 text-blue-500" />,
      pdfEndpoint: '/reports/pdf/stock',
      pdfFilename: `omnistock-estoque-geral-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/stock',
      excelFilename: `omnistock-estoque-geral-${Date.now()}.xlsx`
    },
    {
      title: 'Controle de Empréstimos & Periféricos',
      desc: 'Colaborador, departamento, equipamento emprestado, data, previsão de devolução e status (ativos/atrasados).',
      icon: <UserCheck className="w-6 h-6 text-indigo-500" />,
      pdfEndpoint: '/reports/pdf/loans',
      pdfFilename: `omnistock-emprestimos-ti-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/loans',
      excelFilename: `omnistock-emprestimos-ti-${Date.now()}.xlsx`
    },
    {
      title: 'Estoque Crítico / Baixo Mínimo',
      desc: 'Itens que atingiram o limite mínimo de estoque ou estão zerados no Service Desk e necessitam reposição.',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      pdfEndpoint: '/reports/pdf/low-stock',
      pdfFilename: `omnistock-estoque-critico-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/stock',
      excelFilename: `omnistock-estoque-critico-${Date.now()}.xlsx`
    },
    {
      title: 'Histórico Completo de Movimentações',
      desc: 'Auditoria de todas as entradas, saídas, empréstimos, devoluções e baixas efetuadas pela equipe.',
      icon: <History className="w-6 h-6 text-emerald-500" />,
      pdfEndpoint: '/reports/pdf/movements',
      pdfFilename: `omnistock-historico-movimentacoes-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/movements',
      excelFilename: `omnistock-historico-movimentacoes-${Date.now()}.xlsx`
    },
    {
      title: 'Relatório de Entradas (Compras/Recebimentos)',
      desc: 'Filtrado apenas com entradas de equipamentos, lotes recebidos, quantidade e responsável.',
      icon: <ArrowDownLeft className="w-6 h-6 text-teal-500" />,
      pdfEndpoint: '/reports/pdf/entries',
      pdfFilename: `omnistock-entradas-ti-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/entries',
      excelFilename: `omnistock-entradas-ti-${Date.now()}.xlsx`
    },
    {
      title: 'Relatório de Saídas e Baixas',
      desc: 'Equipamentos entregues, consumidos ou baixados/descartados do estoque do Service Desk.',
      icon: <ArrowUpRight className="w-6 h-6 text-rose-500" />,
      pdfEndpoint: '/reports/pdf/exits',
      pdfFilename: `omnistock-saidas-baixas-ti-${Date.now()}.pdf`,
      excelEndpoint: '/reports/excel/exits',
      excelFilename: `omnistock-saidas-baixas-ti-${Date.now()}.xlsx`
    }
  ];

  const handleDownload = (endpoint: string, filename: string) => {
    downloadFile(endpoint, filename);
  };

  return (
    <div className="space-y-6">
      {/* Topo da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Relatórios & Exportação de TI (PDF / Excel)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gere relatórios gerenciais e operacionais prontos para impressão ou análise em planilhas.
        </p>
      </div>

      {/* Grid de 6 Relatórios Service Desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  {card.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {card.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDownload(card.pdfEndpoint, card.pdfFilename)}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleDownload(card.excelEndpoint, card.excelFilename)}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Box explicativa Microsoft Intune */}
      <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 dark:bg-blue-950/20 flex items-start space-x-4">
        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Exportação Neta em PDF e Excel
          </h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Todos os arquivos PDF são construídos em orientação paisagem com formatação executiva. As planilhas Excel (<strong>.xlsx</strong>) são exportadas com cabeçalho azul escuro congelado, pronto para filtros no Microsoft Excel ou Google Sheets.
          </p>
        </div>
      </div>
    </div>
  );
};
