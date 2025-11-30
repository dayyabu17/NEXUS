import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GuestNavbar from './GuestNavbar';

const HeroSpotlight = ({ heroEvent, heroDisplay, onViewEvent, extractId }) => {
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
            onClick={() => onViewEvent(extractId(heroDisplay))}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none"
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

const RecommendedSection = ({ events, onViewAll, onViewEvent, extractId }) => {
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
              const eventId = extractId(event);
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
                      onClick={() => eventId && onViewEvent(eventId)}
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

const GuestDashboard = () => {
  const [heroEvent, setHeroEvent] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleViewEvent = (eventId) => {
    if (!eventId) {
      return;
    }
    navigate(`/events/${eventId}`);
  };

  const getEventId = (event) => {
    if (!event) {
      return null;
    }
    if (event._id) {
      try {
        return event._id.toString();
      } catch {
        return `${event._id}`;
      }
    }
    if (event.id) {
      try {
        return event.id.toString();
      } catch {
        return `${event.id}`;
      }
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setIsLoading(true);

      let userId;
      if (typeof window !== 'undefined') {
        try {
          const storedRaw = window.localStorage.getItem('user');
          if (storedRaw) {
            const stored = JSON.parse(storedRaw);
            userId = stored?._id;
          }
        } catch (error) {
          console.warn('Unable to parse stored user details', error);
        }
      }

      const requestConfig = {};
      if (userId) {
        requestConfig.params = { userId };
      }

      try {
        const response = await api.get('/events/dashboard', requestConfig);
        if (!isMounted) {
          return;
        }

        const { heroEvent: hero, recommendedEvents, recentEvents } = response.data || {};

        const heroId = getEventId(hero);

        const dedupeById = (list = []) => {
          if (!Array.isArray(list)) {
            return [];
          }
          const seen = new Set();
          return list.filter((item) => {
            const id = getEventId(item);
            if (!id) {
              return true;
            }
            if (seen.has(id)) {
              return false;
            }
            seen.add(id);
            return true;
          });
        };

        const excludeHero = (list = []) =>
          list.filter((item) => {
            if (!heroId) {
              return true;
            }
            return getEventId(item) !== heroId;
          });

        const sanitizedRecommended = excludeHero(dedupeById(recommendedEvents)).slice(0, 6);
        const sanitizedRecent = excludeHero(dedupeById(recentEvents));

        setHeroEvent(hero || null);
        setRecommended(sanitizedRecommended);
        setAllEvents(sanitizedRecent);
        setErrorMessage('');
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        if (isMounted) {
          setHeroEvent(null);
          setRecommended([]);
          setAllEvents([]);
          setErrorMessage('Unable to load events right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const combinedEvents = useMemo(() => {
    const map = new Map();
    const addToMap = (event) => {
      const id = getEventId(event);
      if (!id) {
        return;
      }
      map.set(id, event);
    };

    if (heroEvent) {
      addToMap(heroEvent);
    }
    recommended.forEach(addToMap);
    allEvents.forEach(addToMap);

    return Array.from(map.values());
  }, [heroEvent, recommended, allEvents]);

  const categories = useMemo(() => {
    if (!combinedEvents.length) {
      return ['All'];
    }
    const distinct = new Set(
      combinedEvents
        .map((event) => event?.category)
        .filter((category) => typeof category === 'string' && category.trim().length > 0),
    );
    return ['All', ...distinct];
  }, [combinedEvents]);

  useEffect(() => {
    if (activeCategory === 'All') {
      return;
    }

    const categoryExists = combinedEvents.some((event) => event?.category === activeCategory);
    if (!categoryExists) {
      setActiveCategory('All');
    }
  }, [combinedEvents, activeCategory]);

  const visibleRecommended = useMemo(() => {
    if (activeCategory === 'All') {
      return recommended;
    }
    return recommended.filter((event) => event?.category === activeCategory);
  }, [activeCategory, recommended]);

  const heroDisplay = useMemo(() => {
    if (heroEvent) {
      return heroEvent;
    }
    if (visibleRecommended.length) {
      return visibleRecommended[0];
    }
    if (allEvents.length) {
      return allEvents[0];
    }
    return null;
  }, [heroEvent, visibleRecommended, allEvents]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <GuestNavbar />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
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
            <HeroSpotlight
              heroEvent={heroEvent}
              heroDisplay={heroDisplay}
              onViewEvent={handleViewEvent}
              extractId={getEventId}
            />
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
              extractId={getEventId}
            />
          )}

          {errorMessage && !isLoading && (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-[#101624]/80">
              <p className="text-sm font-medium text-slate-700 dark:text-white">{errorMessage}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GuestDashboard;
