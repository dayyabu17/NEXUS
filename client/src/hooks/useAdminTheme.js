import { useCallback, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from './useAdminSettings';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const broadcastThemeChange = (theme) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('storage'));

  try {
    window.dispatchEvent(
      new CustomEvent('admin-theme-change', { detail: { theme } }),
    );
  } catch {
    // Ignore custom event errors.
  }
};

const useAdminTheme = () => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document?.documentElement;
    if (!root) {
      return;
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }

    root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const handleStorage = () => {
      setThemeState(getInitialTheme());
    };

    const handleCustomEvent = (event) => {
      const nextTheme = event?.detail?.theme === 'dark' ? 'dark' : 'light';
      setThemeState(nextTheme);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('admin-theme-change', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admin-theme-change', handleCustomEvent);
    };
  }, []);

  const setTheme = useCallback((nextTheme) => {
    const normalized = nextTheme === 'dark' ? 'dark' : 'light';
    setThemeState(normalized);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, normalized);
      } catch {
        // Ignore localStorage write errors.
      }

      broadcastThemeChange(normalized);
    }
  }, []);

  return { theme, setTheme };
};

export default useAdminTheme;
export { getInitialTheme };
