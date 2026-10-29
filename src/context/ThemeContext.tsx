import { createContext, useEffect } from 'react';

interface ThemeContextValue {
  theme: 'light';
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: 'light' });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return <ThemeContext.Provider value={{ theme: 'light' }}>{children}</ThemeContext.Provider>;
};
