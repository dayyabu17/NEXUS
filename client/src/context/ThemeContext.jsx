import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';

const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'nexus-theme';
const USER_STORAGE_KEY = 'user';
const AUTH_EVENT = 'nexus-auth:changed';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const VALID_THEMES = new Set(['light', 'dark', 'system']);

const getBrowserPreference = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const readStoredTheme = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEMES.has(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access issues.
  }

  return null;
};

const readStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Ignore parse issues to avoid crashing the provider.
  }

  return null;
};

const resolveInitialTheme = () => {
  const storedTheme = readStoredTheme();
  if (storedTheme === 'system') {
    return 'system';
  }

  const storedUser = readStoredUser();
  if (storedUser?.theme && VALID_THEMES.has(storedUser.theme) && storedUser.theme !== 'system') {
    return storedUser.theme;
  }

  if (storedTheme && VALID_THEMES.has(storedTheme)) {
    return storedTheme;
  }

  return getBrowserPreference();
};

const broadcastAuthChange = (user) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user } }));
};

const resolveThemePreference = (preference) => (preference === 'system' ? getBrowserPreference() : preference);

export const ThemeProvider = ({ children }) => {
  const initialUser = readStoredUser();
  const [theme, setThemeState] = useState(() => resolveInitialTheme());
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveThemePreference(resolveInitialTheme()));
  const firstRenderRef = useRef(true);
  const skipServerSyncRef = useRef(false);
  const authUserRef = useRef(initialUser);
  const pendingRequestRef = useRef(null);

  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
      return undefined;
    }

    const updateResolvedTheme = () => {
      setResolvedTheme(getBrowserPreference());
    };

    updateResolvedTheme();

    if (typeof window === 'undefined') {
      return undefined;
    }

    let mediaQuery;
    try {
      mediaQuery = window.matchMedia(MEDIA_QUERY);
    } catch {
      return undefined;
    }

    const handleChange = (event) => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }

    return undefined;
  }, [theme]);

  const applyThemeToDom = useCallback((mode) => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    if (!root) {
      return;
    }

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const persistThemePreference = useCallback((mode) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const handleUserThemeSync = useCallback((candidate) => {
    const nextUser = candidate ?? readStoredUser();
    authUserRef.current = nextUser;

    if (!nextUser || !VALID_THEMES.has(nextUser.theme)) {
      return;
    }

    setThemeState((current) => {
      if (current === nextUser.theme) {
        return current;
      }

      skipServerSyncRef.current = true;
      return nextUser.theme;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleAuthEvent = (event) => {
      handleUserThemeSync(event?.detail?.user ?? null);
    };

    const handleStorageEvent = (event) => {
      if (event && event.key && event.key !== USER_STORAGE_KEY) {
        return;
      }

      handleUserThemeSync();
    };

    window.addEventListener(AUTH_EVENT, handleAuthEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleUserThemeSync]);

  useEffect(() => {
    applyThemeToDom(resolvedTheme);
    persistThemePreference(theme);

    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      skipServerSyncRef.current = false;
      return;
    }

    if (skipServerSyncRef.current) {
      skipServerSyncRef.current = false;
      return;
    }

    const activeUser = authUserRef.current;
    const hasSession = Boolean(activeUser && activeUser._id);

    if (!hasSession || theme === 'system') {
      return;
    }

    const controller = new AbortController();
    pendingRequestRef.current = controller;

    const persistTheme = async () => {
      try {
        await api.put(
          '/users/theme',
          { theme: resolvedTheme },
          { signal: controller.signal },
        );

        if (typeof window === 'undefined') {
          return;
        }

        try {
          const storedRaw = window.localStorage.getItem(USER_STORAGE_KEY);
          if (!storedRaw) {
            return;
          }

          const parsed = JSON.parse(storedRaw);
          if (!parsed || typeof parsed !== 'object') {
            return;
          }

          const updatedUser = { ...parsed, theme: resolvedTheme };
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          broadcastAuthChange(updatedUser);
        } catch {
          // Ignore storage sync issues after updating theme.
        }
      } catch (error) {
        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError') {
          return;
        }

        console.warn('Unable to persist theme preference', error);
      } finally {
        if (pendingRequestRef.current === controller) {
          pendingRequestRef.current = null;
        }
      }
    };

    persistTheme();

    return () => {
      controller.abort();
      if (pendingRequestRef.current === controller) {
        pendingRequestRef.current = null;
      }
    };
  }, [applyThemeToDom, persistThemePreference, resolvedTheme, theme]);

  const setTheme = useCallback((mode, options = {}) => {
    if (!VALID_THEMES.has(mode)) {
      return;
    }

    if (options.skipServerSync) {
      skipServerSyncRef.current = true;
    }

    setThemeState((current) => (current === mode ? current : mode));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      if (current === 'system') {
        return resolvedTheme === 'dark' ? 'light' : 'dark';
      }

      return current === 'dark' ? 'light' : 'dark';
    });
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme, toggleTheme],
  );

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
