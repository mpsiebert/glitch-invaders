import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'classic' | 'mlh';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'glitch_invaders_theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'classic' || saved === 'mlh') return saved;
    } catch {
      // Fallback if localStorage unavailable
    }
    return 'classic';
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Fallback
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'classic' ? 'mlh' : 'classic';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Fallback
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
