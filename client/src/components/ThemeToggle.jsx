import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/20 dark:hover:text-white ${className}`.trim()}
    >
      <span className="sr-only">{label}</span>
      <span className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transform transition duration-200 ${
            isDark ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transform transition duration-200 ${
            isDark ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
