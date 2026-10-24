import { createContext, useEffect } from 'react';

interface ThemeContextValue {
  theme: 'dark';
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark' });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return <ThemeContext.Provider value={{ theme: 'dark' }}>{children}</ThemeContext.Provider>;
};
