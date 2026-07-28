import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAlerts } from '../services/api';

export type UserRole = 'ADMIN' | 'TECNICO' | 'CONSULTA';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeAlertsCount: number;
  refreshAlerts: () => Promise<void>;
  alerts: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('omnistock_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('omnistock_role');
    return (savedRole as UserRole) || 'ADMIN';
  });

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('omnistock_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('omnistock_role', newRole);
  };

  const refreshAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
    }
  };

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 30000); // Polling a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        role,
        setRole,
        activeAlertsCount: alerts.length,
        refreshAlerts,
        alerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
