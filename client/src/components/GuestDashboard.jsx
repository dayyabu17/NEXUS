import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GuestNavbar from './GuestNavbar';

/**
 * GuestDashboard component.
 * Displays a dashboard for guests to discover, view, and search for events.
 * Features include:
 * - Featured event section
 * - Recommended events carousel
 * - Filterable list of all events by category
 *
 * @component
 * @returns {JSX.Element} The rendered GuestDashboard component.
 */
const GuestDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        if (!isMounted) {
          return;
        }
        setEvents(Array.isArray(response.data) ? response.data : []);
        setErrorMessage('');
      } catch (error) {
        console.error('Failed to fetch events', error);
        if (isMounted) {
          setEvents([]);
          setErrorMessage('Unable to load events right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    if (!events.length) {
      return ['All'];
    }
    const distinct = new Set(
      events
        .map((event) => event.category)
        .filter((category) => typeof category === 'string' && category.trim().length > 0),
    );
    return ['All', ...distinct];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') {
      return events;
    }
    return events.filter((event) => event.category === activeCategory);
  }, [activeCategory, events]);

  const sortedEvents = useMemo(() => {
    if (!events.length) {
      return [];
    }

    const toEpoch = (value) => {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return [...events].sort((a, b) => toEpoch(b.date) - toEpoch(a.date));
  }, [events]);

  const featuredEvent = useMemo(() => sortedEvents[0], [sortedEvents]);

  const recommendedEvents = useMemo(() => {
    const base = activeCategory === 'All'
      ? sortedEvents
      : sortedEvents.filter((event) => event.category === activeCategory);
    return base.slice(0, 6);
  }, [activeCategory, sortedEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GuestNavbar />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <section className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white">Discover Events</h1>
            <p className="max-w-2xl text-base text-white/60">
              Browse curated happenings across campus designed for guests. Unlock premium experiences, curated recommendations, and immersive journeys tailored to your interests.
            </p>
          </div>

          {isLoading ? (
            <div className="h-64 w-full animate-pulse rounded-[28px] border border-white/10 bg-[#131b2a]/70" />
          ) : featuredEvent ? (
            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111a27]/80 shadow-[0_35px_80px_rgba(5,10,20,0.65)]">
              <div className="absolute inset-0">
                <Motion.img
                  layout
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="h-full w-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b101b]/95 via-[#0b101b]/75 to-transparent" />
              </div>
              <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-12">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                    Featured Event
                  </span>
                  <h2 className="text-3xl font-semibold text-white sm:text-4xl">{featuredEvent.title}</h2>
                  {featuredEvent.description && (
                    <p className="text-base text-white/70">{featuredEvent.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-white/75">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#151d2b]/70 px-4 py-2">
                      <span aria-hidden>📅</span>
                      <span>
                        {featuredEvent.date
                          ? new Date(featuredEvent.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Date TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#151d2b]/70 px-4 py-2">
                      <span aria-hidden>📍</span>
                      <span className="max-w-[16rem] truncate" title={featuredEvent.location}>
                        {featuredEvent.location || 'Location TBA'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none"
                  >
                    Register Now
                  </button>
                </div>
                <div className="hidden flex-1 justify-end sm:flex">
                  <div className="h-48 w-48 overflow-hidden rounded-[22px] border border-white/10 bg-[#0c1627]/80">
                    <Motion.img
                      layout
                      src={featuredEvent.imageUrl}
                      alt={`${featuredEvent.title} spotlight`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-[#131b2a]/70 text-white/60">
              <p className="text-base font-medium">No featured events yet</p>
              <p className="mt-1 text-sm text-white/45">Events you create will appear here once approved.</p>
            </div>
          )}

          <div className="sticky top-20 z-40 rounded-[24px] border border-white/10 bg-[#0d1524]/80 px-5 py-4 shadow-[0_18px_50px_rgba(5,10,20,0.55)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/55">Browse by category</p>
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
                      className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition focus:outline-none ${
                        isActive
                          ? 'bg-blue-600 text-white border border-blue-600 shadow-lg shadow-blue-500/20'
                          : 'bg-[#151b27] text-white/65 border border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {category}
                    </Motion.button>
                  );
                })}
              </Motion.div>
            </div>
          </div>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">Recommended for You</h3>
              <button
                type="button"
                className="text-sm font-semibold text-white/60 transition hover:text-white"
              >
                View all
              </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`recommend-skeleton-${index}`}
                    className="min-w-[260px] flex-shrink-0 rounded-[22px] border border-white/10 bg-[#141b2a] p-4 shadow-[0_20px_50px_rgba(5,10,20,0.55)]"
                  >
                    <div className="h-36 w-full animate-pulse rounded-2xl bg-[#1c2537]" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#1f283a]" />
                      <div className="h-3 w-full animate-pulse rounded bg-[#223048]" />
                    </div>
                  </div>
                ))}

              {!isLoading && recommendedEvents.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-white/15 bg-[#101624]/80 px-6 py-12 text-center text-sm text-white/60">
                  No recommendations yet. Try another category to discover new experiences.
                </div>
              )}

              {!isLoading &&
                recommendedEvents.map((event) => (
                  <Motion.article
                    key={`recommended-${event._id}`}
                    layout
                    className="relative min-w-[300px] w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(17,24,38,0.88)] p-4 shadow-[0_25px_60px_rgba(5,10,20,0.55)]"
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
                        <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          {event.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-3">
                      <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                      <p className="text-xs text-white/55">
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
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium text-white transition hover:border-white/30"
                      >
                        View details
                      </button>
                    </div>
                  </Motion.article>
                ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">All Events</h3>
              <p className="text-sm text-white/55">Showing {filteredEvents.length} experiences</p>
            </div>

            <Motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#141b2a] shadow-[0_25px_60px_rgba(7,11,20,0.45)]"
                >
                  <div className="h-44 w-full animate-pulse bg-[#1c2537]" />
                  <div className="space-y-4 px-5 py-6">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#1f283a]" />
                      <div className="h-3 w-full animate-pulse rounded bg-[#1f283a]" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-[#223048]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#223048]" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-[#223048]" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-[#223048]" />
                    </div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#223048]" />
                  </div>
                </div>
              ))}

            {!isLoading && filteredEvents.length === 0 && !errorMessage && (
              <Motion.div
                layout
                className="col-span-full flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-[#101624]/80 px-6 py-16 text-center text-white/60"
              >
                <p className="text-lg font-semibold text-white">No events found</p>
                <p className="mt-2 max-w-md text-sm text-white/55">
                  Try selecting a different category or check back later for upcoming campus experiences.
                </p>
              </Motion.div>
            )}

            {!isLoading && errorMessage && (
              <Motion.div
                layout
                className="col-span-full flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-[#101624]/80 px-6 py-16 text-center"
              >
                <p className="text-lg font-medium text-white">{errorMessage}</p>
              </Motion.div>
            )}

            {!isLoading &&
              filteredEvents.map((event) => (
                <Motion.article
                  key={event._id}
                  layout
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="cursor-pointer overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(17,24,38,0.88)] shadow-[0_25px_70px_rgba(5,10,20,0.6)]"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Motion.img
                      layout
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    {event.category && (
                      <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <div className="space-y-5 px-6 py-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-white">{event.title}</h2>
                      {event.description && (
                        <p className="text-sm text-white/60">{event.description}</p>
                      )}
                    </div>
                    <div className="space-y-3 text-sm text-white/70">
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#151d2b]/70 px-4 py-3">
                        <span className="text-white/55">Date</span>
                        <span className="font-medium text-white/85">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#151d2b]/70 px-4 py-3">
                        <span className="text-white/55">Location</span>
                        <span className="max-w-[60%] truncate text-right font-medium text-white/85" title={event.location}>
                          {event.location || 'TBD'}
                        </span>
                      </div>
                    </div>
                    {Array.isArray(event.tags) && event.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300">
                        {event.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-blue-600/10 px-3 py-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/70">
                      <span>
                        {typeof event.capacity === 'number' && typeof event.rsvpCount === 'number'
                          ? `${Math.max(event.capacity - event.rsvpCount, 0)} spots left`
                          : 'RSVPs open'}
                      </span>
                      <span className="font-semibold text-white">
                        {event.registrationFee > 0 ? `₦${Number(event.registrationFee).toLocaleString()}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </Motion.article>
              ))}
            </Motion.div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default GuestDashboard;
