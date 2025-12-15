import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';

const RecommendedSection = ({ events, onViewAll, onViewEvent }) => {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    const totalScroll = element.scrollWidth - element.clientWidth;

    if (totalScroll <= 0) {
      setScrollProgress(0);
      return;
    }

    const ratio = element.scrollLeft / totalScroll;
    const clamped = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
    setScrollProgress(clamped);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      handleScroll();
    };

    const rafId = window.requestAnimationFrame(() => {
      handleScroll();
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(rafId);
    };
  }, [handleScroll, events.length]);

  const progressValue = Number.isFinite(scrollProgress) ? scrollProgress : 0;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended for You</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
        >
          View all
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-[#101624]/80 dark:text-slate-400">
          No recommendations yet. Try another category to discover new experiences.
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x"
          >
            {events.map((event, index) => {
              const eventId = event?.eventId ?? null;
              const cardKey = eventId ?? `recommended-${index}`;
              return (
                <Motion.article
                  key={`recommended-${cardKey}`}
                  layout
                  className="relative min-w-[300px] w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-[rgba(17,24,38,0.88)] dark:shadow-[0_25px_60px_rgba(5,10,20,0.55)]"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-[18px]">
                    {event.imageUrl ? (
                      <Motion.img
                        layout
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-40 w-full rounded-t-xl object-cover"
                      />
                    ) : (
                      <div className="h-40 w-full rounded-t-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                    )}
                    {event.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.date
                        ? new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Date coming soon'}
                      {' • '}
                      {event.location || 'Location TBA'}
                    </p>
                    <button
                      type="button"
                      onClick={() => onViewEvent(eventId)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-white/10 dark:text-white dark:hover:border-slate-600"
                      disabled={!eventId}
                    >
                      View details
                    </button>
                  </div>
                </Motion.article>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-3">
            <div className="mx-auto h-[2px] w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <span
                className="block h-full origin-left bg-slate-900 transition-transform duration-200 ease-out dark:bg-white/70"
                style={{ transform: `scaleX(${progressValue})` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendedSection;
