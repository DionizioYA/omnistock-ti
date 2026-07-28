import React from 'react';
import { useApp, type UserRole } from '../context/AppContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Wrench, 
  Eye,
  Server,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAlerts }) => {
  const { theme, toggleTheme, role, setRole, activeAlertsCount } = useApp();

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    ADMIN: {
      label: 'Administrador',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      desc: 'Controle total, auditoria e exclusão'
    },
    TECNICO: {
      label: 'Técnico TI',
      icon: <Wrench className="w-4 h-4 text-blue-400" />,
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      desc: 'Movimentações, empréstimos e cadastro'
    },
    CONSULTA: {
      label: 'Consulta',
      icon: <Eye className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      desc: 'Modo leitura (Sem alteração)'
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Esquerda: Identidade Microsoft Intune / Service Desk */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              OmniStock <span className="text-blue-600 dark:text-blue-400 font-normal">Service Desk</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              TI Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Controle de Estoque e Periféricos de TI • Microsoft Intune Style
          </p>
        </div>
      </div>

      {/* Direita: Seletor de Perfil, Status do Servidor, Alertas e Toggle Tema */}
      <div className="flex items-center space-x-4">
        {/* Indicador de Conexão */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <Server className="w-3.5 h-3.5 text-emerald-500" />
          <span>SQLite • <strong className="text-emerald-600 dark:text-emerald-400">Online</strong></span>
        </div>

        {/* Seletor Rápido de Perfil (Para testar regras do Service Desk) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['ADMIN', 'TECNICO', 'CONSULTA'] as UserRole[]).map((r) => {
            const isSelected = role === r;
            const conf = roleConfig[r];
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                title={conf.desc}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {conf.icon}
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botão de Alertas com Badge Pulsante */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Central de Alertas e Notificações"
        >
          <Bell className="w-5 h-5" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse-soft">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Toggle Claro/Escuro */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>
    </header>
  );
};
