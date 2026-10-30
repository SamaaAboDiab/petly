import { createContext, use, useCallback, useEffect, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

const ThemeContext = createContext(null);

const systemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = usePersistentState('theme', systemTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [setTheme],
  );

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
