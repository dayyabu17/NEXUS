import React, { useRef } from 'react';
import { motion as Motion, useScroll, useSpring, useTransform } from 'framer-motion';

const HeroSpotlight = ({ heroEvent, heroDisplay, onViewEvent }) => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end start'],
    layoutEffect: false,
  });

  const heroImageParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroContentParallax = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const heroAccentScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const heroImageY = useSpring(heroImageParallax, {
    stiffness: 80,
    damping: 18,
    mass: 0.35,
  });
  const heroContentY = useSpring(heroContentParallax, {
    stiffness: 90,
    damping: 20,
    mass: 0.32,
  });
  const heroAccent = useSpring(heroAccentScale, {
    stiffness: 120,
    damping: 22,
    mass: 0.28,
  });

  if (!heroDisplay) {
    return null;
  }

  const heroDisplayId = heroDisplay?.eventId ?? null;

  return (
    <Motion.section
      ref={sectionRef}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 85, damping: 16 }}
      className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111a27]/80 dark:shadow-[0_35px_80px_rgba(5,10,20,0.65)]"
    >
      <Motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroImageY }}>
        {heroDisplay.imageUrl ? (
          <Motion.img
            layout
            src={heroDisplay.imageUrl}
            alt={heroDisplay.title}
            className="absolute left-0 right-0 -top-[10%] h-[140%] w-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute left-0 right-0 -top-[10%] h-[120%] w-full bg-gradient-to-br from-[#10192a] via-[#101b30] to-[#0a1322] opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent dark:from-[#0b101b]/95 dark:via-[#0b101b]/75" />
      </Motion.div>
      <Motion.div
        className="relative flex min-h-[420px] flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-12"
        style={{ y: heroContentY }}
      >
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm dark:border-white/20 dark:bg-white/10 dark:text-white/80">
            {heroEvent ? 'Featured Event' : 'Spotlight Event'}
          </span>
          <h2 className="text-3xl font-semibold text-white drop-shadow sm:text-4xl">{heroDisplay.title}</h2>
          {heroDisplay.description && (
            <p className="text-base text-slate-200 drop-shadow dark:text-white/70">{heroDisplay.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-slate-100 drop-shadow dark:text-white/75">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#151d2b]/70 dark:text-white">
              <span aria-hidden>📅</span>
              <span>
                {heroDisplay.date
                  ? new Date(heroDisplay.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Date TBA'}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#151d2b]/70 dark:text-white">
              <span aria-hidden>📍</span>
              <span className="max-w-[16rem] truncate" title={heroDisplay.location}>
                {heroDisplay.location || 'Location TBA'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onViewEvent(heroDisplayId)}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none"
            disabled={!heroDisplayId}
          >
            Explore Details
          </button>
        </div>
        <div className="hidden flex-1 justify-end sm:flex">
          <Motion.div
            className="h-48 w-48 overflow-hidden rounded-[22px] border border-slate-200 bg-white/90 shadow-md dark:border-slate-800 dark:bg-[#0c1627]/80"
            style={{ scale: heroAccent }}
          >
            {heroDisplay.imageUrl ? (
              <Motion.img
                layout
                src={heroDisplay.imageUrl}
                alt={`${heroDisplay.title} spotlight`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
            )}
          </Motion.div>
        </div>
      </Motion.div>
    </Motion.section>
  );
};

export default HeroSpotlight;
