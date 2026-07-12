import { createContext, useContext, ReactNode, useState } from 'react';
import { theme } from '@/theme';

interface ThemeContextType {
  theme: typeof theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark] = useState(false); // Strictly premium nature light/cream theme for Phase 1

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
