import { createContext, useContext, useEffect, useState } from 'react';

type State = {
  theme: 'dark' | 'light';
  mode: 'optimistic' | 'conservative';
  dashboardState: any;
  obligations: any[];
  receivables: any[];
  loans: any[];
  fetchData: () => Promise<void>;
  toggleTheme: () => void;
  toggleMode: () => void;
};

const AppContext = createContext<State | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<'optimistic' | 'conservative'>('optimistic');
  const [dashboardState, setDashboardState] = useState({ currentD2Z: 14, bankBalance: 80000 });
  const [obligations, setObligations] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [loans, setLoans] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch('https://thavanai-backend.onrender.com/api/dashboard');
      if (!res.ok) return;
      const data = await res.json();
      setDashboardState(data.dashboardState);
      setObligations(data.obligations);
      setReceivables(data.receivables);
      setLoans(data.loans);
    } catch (e) {
      console.error('API Error:', e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleMode = () => setMode(m => m === 'optimistic' ? 'conservative' : 'optimistic');

  return (
    <AppContext.Provider value={{ theme, mode, dashboardState, obligations, receivables, loans, fetchData, toggleTheme, toggleMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be within AppProvider');
  return ctx;
};
