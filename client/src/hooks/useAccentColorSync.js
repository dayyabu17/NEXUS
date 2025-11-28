import { useEffect } from 'react';
import { ACCENT_STORAGE_KEY, DEFAULT_ACCENT, applyAccentVariables } from '../constants/accentTheme';

const useAccentColorSync = () => {
  useEffect(() => {
    const applyFromValue = (value) => {
      const accent = typeof value === 'string' && value ? value : DEFAULT_ACCENT;
      applyAccentVariables(accent);
    };

    if (typeof window === 'undefined') {
      applyFromValue(DEFAULT_ACCENT);
      return undefined;
    }

    applyFromValue(window.localStorage.getItem(ACCENT_STORAGE_KEY));

    const handleStorage = (event) => {
      if (event.key === ACCENT_STORAGE_KEY) {
        applyFromValue(event.newValue);
      }
    };

    const handleCustom = (event) => {
      applyFromValue(event.detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('organizer:accent-color', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('organizer:accent-color', handleCustom);
    };
  }, []);
};

export default useAccentColorSync;
