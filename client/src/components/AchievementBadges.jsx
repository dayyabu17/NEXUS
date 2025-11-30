import React from 'react';
import { motion as Motion } from 'framer-motion';

const hexagonClass =
  'relative flex h-24 w-24 items-center justify-center rounded-[22px] border transition [clip-path:polygon(25%_3%,75%_3%,97%_50%,75%_97%,25%_97%,3%_50%)]';

const GlowingIcon = ({ unlocked, children }) => (
  <Motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`${hexagonClass} ${
      unlocked
        ? 'border-emerald-200 bg-emerald-50 shadow-[0_0_25px_rgba(45,255,196,0.25)] dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:shadow-[0_0_25px_rgba(45,255,196,0.35)]'
        : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30'
    }`}
  >
    <div className={`h-10 w-10 ${unlocked ? 'text-emerald-500 dark:text-emerald-200' : 'text-slate-400 dark:text-white/25'}`}>{children}</div>
  </Motion.div>
);

const FirstStepsIcon = ({ unlocked }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`h-full w-full ${unlocked ? 'stroke-emerald-500 dark:stroke-emerald-200' : 'stroke-current'}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 20v-6l2-2" />
    <path d="M4 16l3-2 2 2 3-5 2 2 3-6 3 3" />
  </svg>
);

const ExplorerIcon = ({ unlocked }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`h-full w-full ${unlocked ? 'stroke-amber-500 dark:stroke-amber-200' : 'stroke-current'}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 7 16 12 12 17 8 12" />
  </svg>
);

const badgesConfig = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Scanned your first Nexus event.',
    unlocked: (stats) => stats.total > 0,
    icon: (unlocked) => <FirstStepsIcon unlocked={unlocked} />,
  },
  {
    id: 'event-explorer',
    title: 'Event Explorer',
    description: 'Visited more than five events.',
    unlocked: (stats) => stats.total > 5,
    icon: (unlocked) => <ExplorerIcon unlocked={unlocked} />,
  },
];

const AchievementBadges = ({ stats, loading }) => (
  <div className="space-y-6">
    <header className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/55">Achievements</p>
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Badge cabinet</h3>
      <p className="text-sm text-slate-600 dark:text-white/45">Collect badges as you explore campus experiences.</p>
    </header>

    {loading ? (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: badgesConfig.length }).map((_, index) => (
          <div
            key={`badge-skeleton-${index}`}
            className="h-32 rounded-[26px] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
          >
            <div className="h-full animate-pulse rounded-[24px] border border-slate-200 bg-slate-200 dark:border-white/10 dark:bg-[#121c30]/80" />
          </div>
        ))}
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {badgesConfig.map((badge) => {
          const unlocked = badge.unlocked(stats);
          return (
            <Motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.8, 0.5, 1] }}
              className={`relative overflow-hidden rounded-[26px] border p-4 transition-colors ${
                unlocked
                  ? 'border-emerald-200 bg-emerald-50 dark:border-white/20 dark:bg-white/8'
                  : 'border-slate-200 bg-white dark:border-white/5 dark:bg-white/3'
              }`}
            >
              <div className="flex items-center gap-4">
                <GlowingIcon unlocked={unlocked}>{badge.icon(unlocked)}</GlowingIcon>
                <div className="space-y-1">
                  <p className={`text-sm font-semibold ${unlocked ? 'text-emerald-600 dark:text-white' : 'text-slate-700 dark:text-white/55'}`}>
                    {badge.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/45">{badge.description}</p>
                </div>
              </div>
              {!unlocked && (
                <div className="absolute inset-0 rounded-[26px] border border-slate-200/70 bg-slate-100/80 dark:border-white/5 dark:bg-black/30" aria-hidden />
              )}
            </Motion.div>
          );
        })}
      </div>
    )}
  </div>
);

export default AchievementBadges;
