import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  ArrowLeftRight, 
  UserCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  History,
  ChevronRight,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavTab = 
  | 'dashboard' 
  | 'inventory' 
  | 'movements' 
  | 'loans' 
  | 'alerts' 
  | 'reports' 
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { role, activeAlertsCount } = useApp();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    restrictedTo?: string[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral (KPIs)',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'inventory',
      label: 'Equipamentos TI',
      icon: <Monitor className="w-5 h-5" />
    },
    {
      id: 'movements',
      label: 'Movimentações TI',
      icon: <ArrowLeftRight className="w-5 h-5" />
    },
    {
      id: 'loans',
      label: 'Empréstimos & Devoluções',
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      id: 'alerts',
      label: 'Alertas de Estoque',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      id: 'reports',
      label: 'Relatórios PDF/Excel',
      icon: <FileSpreadsheet className="w-5 h-5" />
    },
    {
      id: 'audit',
      label: 'Auditoria de Ações',
      icon: <History className="w-5 h-5" />,
      restrictedTo: ['ADMIN', 'TECNICO']
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-md flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      {/* Lista de Navegação Principal */}
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Gerenciamento TI
        </div>

        {navItems.map((item) => {
          if (item.restrictedTo && !item.restrictedTo.includes(role)) {
            return null;
          }

          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1">
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Rodapé com Informações do Banco e Service Desk */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Banco SQLite
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            19 Categorias padrão de TI, empréstimos ativos com alerta automático (&gt;30 dias).
          </p>
        </div>
      </div>
    </aside>
  );
};
