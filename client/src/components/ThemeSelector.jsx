import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
  {
    id: 'system',
    title: 'System',
    description: 'Sync with your device preference.',
    previewClass: 'bg-gradient-to-br from-white via-white to-[#0b1220]',
  },
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
  const common = mode === 'dark' ? 'bg-white/20' : 'bg-slate-400/40';
  const accent = mode === 'dark' ? 'bg-white/50' : 'bg-slate-700/60';

  return (
    <div className="flex h-16 w-full flex-col justify-between rounded-2xl border border-white/10 bg-black/10 p-3 backdrop-blur">
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
  const resolvedPreviewMode = option.id === 'system' ? 'dark' : option.id;

  return (
    <Motion.button
      type="button"
      onClick={() => onSelect(option.id)}
      whileHover={{ scale: isActive ? 1.02 : 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${
        isActive
          ? 'border-white/40 bg-white/10 shadow-[0_20px_60px_rgba(11,17,30,0.45)]'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
      }`}
    >
      <div className="relative">
        <div
          className={`mx-4 mt-4 rounded-2xl border border-white/10 p-4 transition-[border-color] duration-300 ${
            option.id === 'system'
              ? 'bg-gradient-to-br from-white via-white/30 to-[#0b1220]'
              : option.id === 'light'
              ? 'bg-white'
              : 'bg-[#0f1729]'
          }`}
        >
          {option.id === 'system' ? (
            <div className="flex gap-4">
              <div className="w-1/2">
                <PreviewSkeleton mode="light" />
              </div>
              <div className="w-1/2">
                <PreviewSkeleton mode="dark" />
              </div>
            </div>
          ) : (
            <PreviewSkeleton mode={resolvedPreviewMode} />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">{option.title}</p>
          <p className="mt-1 text-xs text-white/55">{option.description}</p>
        </div>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
            isActive ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : 'border-white/20 text-white/40'
          }`}
        >
          {isActive ? '✔' : ''}
        </span>
      </div>
    </Motion.button>
  );
};

const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1423]/70 p-8 shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Display</p>
        <h2 className="text-xl font-semibold text-white">Choose your desired Nexus interface.</h2>
        <p className="text-xs text-white/45">
          Toggle between light, dark, or follow your system preference. Current mode:{' '}
          <span className="font-semibold text-white/75">{resolvedTheme}</span>.
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
