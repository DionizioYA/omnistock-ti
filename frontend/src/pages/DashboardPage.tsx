import React, { useEffect, useState } from 'react';
import { 
  getDashboardKPIs, 
  getDashboardCharts, 
  getMovements, 
  getLoans 
} from '../services/api';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ArrowDownLeft, 
  RefreshCw, 
  ShieldAlert,
  Laptop,
  Monitor,
  HardDrive,
  Cpu,
  Wifi,
  Printer
} from 'lucide-react';
import type { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes, movRes, loanRes] = await Promise.all([
        getDashboardKPIs(),
        getDashboardCharts(),
        getMovements({ limit: 6 }),
        getLoans('OVERDUE')
      ]);

      setKpis(kpiRes);
      setCharts(chartRes);
      setRecentMovements(movRes.data || []);
      setOverdueLoans(Array.isArray(loanRes) ? loanRes : []);
    } catch (err) {
      console.error('Erro ao carregar dados do Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Entrada</span>;
      case 'SAIDA':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Saída</span>;
      case 'EMPRESTIMO':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Empréstimo</span>;
      case 'DEVOLUCAO':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">Devolução</span>;
      case 'BAIXA':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Baixa</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  const getCategoryIcon = (catName?: string) => {
    const n = (catName || '').toLowerCase();
    if (n.includes('notebook')) return <Laptop className="w-4 h-4 text-blue-500" />;
    if (n.includes('monitor') || n.includes('desktop')) return <Monitor className="w-4 h-4 text-indigo-500" />;
    if (n.includes('ssd') || n.includes('hd') || n.includes('memória')) return <HardDrive className="w-4 h-4 text-purple-500" />;
    if (n.includes('switch') || n.includes('access') || n.includes('cabo')) return <Wifi className="w-4 h-4 text-emerald-500" />;
    if (n.includes('impressora')) return <Printer className="w-4 h-4 text-amber-500" />;
    return <Cpu className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página com Botão de Atualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Service Desk TI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visão geral e monitoramento de equipamentos, periféricos e empréstimos em tempo real.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25"
          >
            <Package className="w-4 h-4" />
            <span>Cadastrar Equipamento</span>
          </button>
        </div>
      </div>

      {/* 5 Cards de KPIs Microsoft Intune / GLPI Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total de Itens */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Cadastrado
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? '...' : kpis?.totalProducts || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equipamentos e Periféricos
          </p>
        </div>

        {/* Card 2: Itens Disponíveis */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disponível no SD
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : kpis?.inStockProducts || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prontos para uso imediato
          </p>
        </div>

        {/* Card 3: Itens Emprestados */}
        <div 
          onClick={() => onNavigate('loans')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Emprestados
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {loading ? '...' : (kpis?.loanedItemsCount || 4)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Com colaboradores/setores
          </p>
        </div>

        {/* Card 4: Estoque Baixo */}
        <div 
          onClick={() => onNavigate('alerts')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estoque Baixo
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">
            {loading ? '...' : kpis?.lowStockCount || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Abaixo da quantidade mínima
          </p>
        </div>

        {/* Card 5: Empréstimos Atrasados (>30 dias) */}
        <div 
          onClick={() => onNavigate('loans')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-rose-50/40 dark:from-[#111827] dark:to-rose-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Atrasados (&gt;30d)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {loading ? '...' : overdueLoans.length}
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
            Requer cobrança/devolução
          </p>
        </div>
      </div>

      {/* Seção 2: Empréstimos Atrasados em Destaque (Se houver) */}
      {overdueLoans.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 dark:bg-rose-950/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Alerta SD: {overdueLoans.length} Equipamento(s) com Empréstimo Superior a 30 Dias
              </h3>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Ver todos os empréstimos &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueLoans.slice(0, 3).map((loan: any) => (
              <div
                key={loan.id}
                className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-rose-200 dark:border-rose-800/60 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {loan.equipmentName} ({loan.patrimony || 'Sem patrimônio'})
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Colaborador: <strong>{loan.userName}</strong> • Setor: {loan.department}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                  Atrasado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 3: Gráficos e Distribuição por Categorias de TI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Categorias de TI */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Estoque por Categoria de TI
            </h3>
            <span className="text-xs text-slate-400">
              19 Categorias Padrão
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {(charts?.categoryDistribution || []).map((cat: any, i: number) => {
              const maxVal = Math.max(...(charts?.categoryDistribution || []).map((c: any) => c.count), 1);
              const percentage = Math.round((cat.count / maxVal) * 100);

              return (
                <div key={i} className="flex items-center justify-between space-x-3 text-xs">
                  <div className="flex items-center space-x-2.5 w-40 shrink-0">
                    {getCategoryIcon(cat.name)}
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color || '#3B82F6'
                      }}
                    />
                  </div>
                  <div className="w-16 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {cat.count} {cat.count === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              );
            })}

            {(!charts?.categoryDistribution || charts.categoryDistribution.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum equipamento cadastrado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Card de Resumo Rápido e Botões de Ação SD */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Ações Rápidas Service Desk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Registre entradas, empréstimos ou devoluções em um clique.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('movements')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Registrar Entrada / Compra
                    </div>
                    <div className="text-[10px] text-slate-500">Adicionar novo lote em estoque</div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('loans')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Emprestar Equipamento
                    </div>
                    <div className="text-[10px] text-slate-500">Notebook, headset, adaptador</div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Exportar Relatório SD (PDF/Excel)
                    </div>
                    <div className="text-[10px] text-slate-500">Inventário geral ou empréstimos</div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Dica Intune:</strong> Use o botão do topo para alternar entre os perfis <strong>ADMIN</strong>, <strong>Técnico</strong> e <strong>Consulta</strong> e conferir o controle de acesso.
          </div>
        </div>
      </div>

      {/* Seção 4: Últimas Movimentações */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Últimas Movimentações no Service Desk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Todas as entradas, empréstimos, devoluções e baixas registradas pela equipe.
            </p>
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver histórico completo &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Equipamento / Periférico</th>
                <th className="py-3 px-4">Qtd.</th>
                <th className="py-3 px-4">Estoque</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Motivo / Observação</th>
                <th className="py-3 px-4 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {recentMovements.map((mov: any) => (
                <tr 
                  key={mov.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getMovementBadge(mov.type)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(mov.product?.category?.name)}
                      <span>{mov.product?.name || 'Equipamento'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {mov.type === 'ENTRADA' || mov.type === 'DEVOLUCAO' ? `+${mov.quantity}` : `-${mov.quantity}`}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {mov.previousStock} &rarr; <strong>{mov.newStock}</strong>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {mov.user?.name || 'Sistema'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {mov.reason || '-'}{mov.observation ? ` (${mov.observation})` : ''}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                    {mov.datetime ? new Date(mov.datetime).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}

              {recentMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                    Nenhuma movimentação registrada nas últimas horas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
