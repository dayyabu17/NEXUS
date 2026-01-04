import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
  {
    id: 'light',
    title: 'Light',
    description: 'Bright and airy experience.',
    previewClass: 'bg-white',
  },
  {
    id: 'dark',
    title: 'Dark',
    description: 'Moody and power efficient.',
    previewClass: 'bg-[#0b1220]',
  },
];

const PreviewSkeleton = ({ mode }) => {
  const baseLine = 'rounded-full';
  const common = mode === 'dark' ? 'bg-white/15' : 'bg-slate-300/60';
  const accent = mode === 'dark' ? 'bg-white/40' : 'bg-slate-600/70';

  return (
    <div className="flex h-16 w-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-100 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
      <div className={`h-3 w-1/3 ${baseLine} ${accent}`} />
      <div className={`h-2 w-2/3 ${baseLine} ${common}`} />
      <div className="flex items-center gap-2">
        <div className={`h-6 w-10 rounded-xl ${accent}`} />
        <div className={`h-2 flex-1 ${baseLine} ${common}`} />
      </div>
    </div>
  );
};

const ThemeCard = ({ option, isActive, onSelect }) => {
  const resolvedPreviewMode = option.id;

  return (
    <Motion.button
      type="button"
      onClick={() => onSelect(option.id)}
      whileHover={{ scale: isActive ? 1.02 : 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${
        isActive
          ? 'border-blue-500/60 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/40 dark:bg-white/10 dark:shadow-[0_20px_60px_rgba(11,17,30,0.45)]'
          : 'border-slate-200 bg-white hover:border-blue-400/40 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10'
      }`}
    >
      <div className="relative">
        <div
          className={`mx-4 mt-4 rounded-2xl border border-slate-200 p-4 transition-[border-color] duration-300 ${
            option.id === 'light'
              ? 'bg-slate-50 dark:border-white/10 dark:bg-white/10'
              : 'bg-[#0f1729] text-white dark:border-white/10'
          }`}
        >
          <PreviewSkeleton mode={resolvedPreviewMode} />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{option.title}</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-white/55">{option.description}</p>
        </div>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
            isActive
              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
              : 'border-slate-200 text-slate-400 dark:border-white/20 dark:text-white/40'
          }`}
        >
          {isActive ? '✔' : ''}
        </span>
      </div>
    </Motion.button>
  );
};

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const activeThemeLabel = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/70 dark:shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-white/60">Display</p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Choose your desired Nexus interface.</h2>
        <p className="text-xs text-slate-500 dark:text-white/45">
          Toggle between light and dark modes. Current mode:{' '}
          <span className="font-semibold text-slate-800 dark:text-white/75">{activeThemeLabel}</span>.
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {THEME_OPTIONS.map((option) => (
          <ThemeCard
            key={option.id}
            option={option}
            isActive={theme === option.id}
            onSelect={setTheme}
          />
        ))}
      </div>
    </section>
  );
};

export default ThemeSelector;
