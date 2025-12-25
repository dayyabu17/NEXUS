import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import HeroSpotlight from '../components/GuestDashboard/HeroSpotlight';
import RecommendedSection from '../components/GuestDashboard/RecommendedSection';
import useGuestDashboard from '../hooks/useGuestDashboard';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const {
    heroEvent,
    heroDisplay,
    visibleRecommended,
    categories,
    activeCategory,
    setActiveCategory,
    isLoading,
    errorMessage,
    handleViewEvent,
  } = useGuestDashboard();

  return (
    <GuestLayout>
      <section className="space-y-10">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Discover Events</h1>
            <p className="max-w-2xl text-base text-slate-500 dark:text-slate-400">
              Browse curated happenings across campus designed for guests. Unlock premium experiences, curated recommendations, and immersive journeys tailored to your interests.
            </p>
          </Motion.div>

          {isLoading ? (
            <div className="h-64 w-full animate-pulse rounded-[28px] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#131b2a]/70" />
          ) : heroDisplay ? (
            <HeroSpotlight heroEvent={heroEvent} heroDisplay={heroDisplay} onViewEvent={handleViewEvent} />
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-[#131b2a]/70 dark:text-slate-400">
              <p className="text-base font-medium text-slate-700 dark:text-white">No featured events yet</p>
              <p className="mt-1 text-sm">Events you create will appear here once approved.</p>
            </div>
          )}

          <Motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 95, damping: 19, mass: 0.6 }}
            viewport={{ once: true, amount: 0.4 }}
            className="sticky top-20 z-40 rounded-[24px] border border-slate-200 bg-white/85 px-5 py-4 shadow-md backdrop-blur dark:border-slate-800 dark:bg-[#0d1524]/80 dark:shadow-[0_18px_50px_rgba(5,10,20,0.55)]"
          >
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-white/55">Browse by category</p>
              <Motion.div
                layout
                className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar"
              >
                {categories.map((category) => {
                  const isActive = category === activeCategory;
                  return (
                    <Motion.button
                      key={category}
                      layout
                      onClick={() => setActiveCategory(category)}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition focus:outline-none ${
                        isActive
                          ? 'border border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {category}
                    </Motion.button>
                  );
                })}
              </Motion.div>
            </div>
          </Motion.div>

          {isLoading ? (
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended for You</h3>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading…</span>
              </div>

              <div className="flex gap-6 overflow-hidden pb-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`recommend-skeleton-${index}`}
                    className="min-w-[260px] flex-shrink-0 rounded-[22px] border border-slate-200 bg-slate-100 p-4 shadow-sm dark:border-slate-800 dark:bg-[#141b2a] dark:shadow-[0_20px_50px_rgba(5,10,20,0.55)]"
                  >
                    <div className="h-36 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-[#1c2537]" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[#1f283a]" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-[#223048]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <RecommendedSection
              events={visibleRecommended}
              onViewAll={() => navigate('/guest/events')}
              onViewEvent={handleViewEvent}
            />
          )}

          {errorMessage && !isLoading && (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-[#101624]/80">
              <p className="text-sm font-medium text-slate-700 dark:text-white">{errorMessage}</p>
            </div>
          )}
      </section>
    </GuestLayout>
  );
};

export default GuestDashboard;
