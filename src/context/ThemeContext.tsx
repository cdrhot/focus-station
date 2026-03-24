import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettingsWithFallback, saveSettingsWithFallback, type Theme } from '../api/settings';

const THEME_STORAGE_KEY = 'focus-station-theme';
const THEME_VALUES: Theme[] = ['night-blue', 'graphite', 'solar', 'arctic'];

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && THEME_VALUES.includes(value as Theme);
}

function applyThemeToDocument(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : 'night-blue';
  });

  useEffect(() => {
    void (async () => {
      const settings = await getSettingsWithFallback();
      if (isTheme(settings.currentTheme)) {
        setTheme(settings.currentTheme);
        applyThemeToDocument(settings.currentTheme);
        localStorage.setItem(THEME_STORAGE_KEY, settings.currentTheme);
      }
    })();
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const updateTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    applyThemeToDocument(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    void saveSettingsWithFallback({ currentTheme: nextTheme });
  };

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
