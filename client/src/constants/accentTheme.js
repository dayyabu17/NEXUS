export const ACCENT_STORAGE_KEY = 'organizer:preferences:accent-color';
export const DEFAULT_ACCENT = 'blue';
export const DEFAULT_BRAND_COLOR = '#2563EB';

export const ACCENT_PALETTES = {
  blue: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  purple: {
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
  },
  green: {
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  orange: {
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
  },
};

export const ACCENT_OPTIONS = [
  {
    id: 'blue',
    label: 'Nexus Blue',
    description: 'Default accent applied across the dashboard.',
  },
  {
    id: 'purple',
    label: 'Neon Purple',
    description: 'Futuristic glow for midnight events.',
  },
  {
    id: 'green',
    label: 'Emerald Green',
    description: 'Calm, confident, and eco-forward.',
  },
  {
    id: 'orange',
    label: 'Sunset Orange',
    description: 'High-energy venues and launch parties.',
  },
];

export const applyAccentVariables = (accentId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const palette = ACCENT_PALETTES[accentId] || ACCENT_PALETTES[DEFAULT_ACCENT];
  const root = document.documentElement;
  root.style.setProperty('--color-primary-500', palette[500]);
  root.style.setProperty('--color-primary-600', palette[600]);
  root.style.setProperty('--color-primary-700', palette[700]);
};

export const resolveAccentPalette = (accentId) => ACCENT_PALETTES[accentId] || ACCENT_PALETTES[DEFAULT_ACCENT];
