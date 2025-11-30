import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'nexus:theme-preference';
const PREFERRED_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const VALID_THEMES = new Set(['light', 'dark', 'system']);

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEMES.has(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Unable to read stored theme preference', error);
  }

  return 'system';
};

const resolveSystemPreference = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(PREFERRED_MEDIA_QUERY).matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState(() => (
    theme === 'system' ? resolveSystemPreference() : theme
  ));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to persist theme preference', error);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(PREFERRED_MEDIA_QUERY);

    const applyThemeToDom = (mode) => {
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    const syncTheme = () => {
      const nextResolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(nextResolved);
      applyThemeToDom(nextResolved);
    };

    syncTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', syncTheme);
      return () => {
        mediaQuery.removeEventListener('change', syncTheme);
      };
    }

    return undefined;
  }, [theme]);

  const setTheme = useCallback((value) => {
    const nextValue = VALID_THEMES.has(value) ? value : 'system';
    setThemeState(nextValue);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
