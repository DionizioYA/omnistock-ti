import React, { useState } from 'react';
import { markAlertAsRead, downloadFile } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Check, 
  RefreshCw
} from 'lucide-react';
import type { NavTab } from '../components/Sidebar';

interface AlertsPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigate }) => {
  const { alerts, refreshAlerts } = useApp();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await refreshAlerts();
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAlertAsRead(id);
      refreshAlerts();
    } catch (err) {
      console.error('Erro ao marcar alerta:', err);
    }
  };

  const handleDownloadPdf = () => {
    downloadFile('/reports/pdf/low-stock', `omnistock-estoque-critico-${Date.now()}.pdf`);
  };

  const getAlertIcon = (type: string) => {
    if (type === 'OVERDUE_LOAN') {
      return <Clock className="w-5 h-5 text-rose-500 animate-pulse" />;
    }
    if (type === 'ZERO_STOCK') {
      return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  const getBadge = (type: string) => {
    if (type === 'OVERDUE_LOAN') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">Empréstimo &gt;30 Dias</span>;
    }
    if (type === 'ZERO_STOCK') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200">Sem Estoque</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">Estoque Mínimo</span>;
  };

  return (
    <div className="space-y-6">
      {/* Topo: Título e Exportação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Central de Alertas & Notificações (TI)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Avisos automáticos de estoque crítico e empréstimos que excederam o prazo de 30 dias.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-lg shadow-rose-600/25"
          >
            <FileText className="w-4 h-4" />
            <span>Baixar PDF de Alertas</span>
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tudo sob controle no Service Desk!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhum alerta de estoque crítico ou empréstimos em atraso (&gt;30 dias) neste momento.
            </p>
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#111827] border shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alt.type === 'OVERDUE_LOAN' || alt.type === 'ZERO_STOCK'
                  ? 'border-rose-200 dark:border-rose-900/60'
                  : 'border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
                  {getAlertIcon(alt.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getBadge(alt.type)}
                    <span className="text-xs text-slate-400">
                      {new Date(alt.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {alt.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {alt.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onNavigate(alt.type === 'OVERDUE_LOAN' ? 'loans' : 'inventory')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Ver no {alt.type === 'OVERDUE_LOAN' ? 'Empréstimos' : 'Estoque'} &rarr;
                </button>
                <button
                  onClick={() => handleMarkAsRead(alt.id)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  title="Marcar Alerta como Concluído"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolvido</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
