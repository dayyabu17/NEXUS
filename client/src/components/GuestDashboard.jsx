import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import api from '../api/axios';

const GuestDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold">n</span>
            <span className="text-2xl font-semibold tracking-tight">exus</span>
          </div>
          <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Discover Events</h1>
            <p className="mt-1 text-slate-400">Browse curated happenings across campus tailored for guests.</p>
          </div>

          <Motion.div
            layout
            className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar"
          >
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <Motion.button
                  key={category}
                  layout
                  onClick={() => setActiveCategory(category)}
                  className={[
                    'whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white',
                  ].join(' ')}
                >
                  {category}
                </Motion.button>
              );
            })}
          </Motion.div>

          <Motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/60"
                >
                  <div className="h-48 w-full animate-pulse bg-slate-800/60" />
                  <div className="space-y-4 px-5 py-6">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/70" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-800/50" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/40" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/40" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800/40" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800/40" />
                    </div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/50" />
                  </div>
                </div>
              ))}

            {!isLoading && filteredEvents.length === 0 && !errorMessage && (
              <Motion.div
                layout
                className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center text-slate-400"
              >
                <p className="text-lg font-medium text-white">No events found</p>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Try selecting a different category or check back later for upcoming campus experiences.
                </p>
              </Motion.div>
            )}

            {!isLoading && errorMessage && (
              <Motion.div
                layout
                className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center"
              >
                <p className="text-lg font-medium text-white">{errorMessage}</p>
              </Motion.div>
            )}

            {!isLoading &&
              filteredEvents.map((event) => (
                <Motion.article
                  key={event._id}
                  layout
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/40"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Motion.img
                      layout
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    {event.category && (
                      <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4 px-5 py-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">{event.title}</h2>
                      {event.description && (
                        <p className="text-sm text-slate-400">{event.description}</p>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date</span>
                        <span>
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location</span>
                        <span>{event.location || 'TBD'}</span>
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
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-sm text-slate-300">
                      <span>
                        {typeof event.capacity === 'number' && typeof event.rsvpCount === 'number'
                          ? `${Math.max(event.capacity - event.rsvpCount, 0)} spots left`
                          : 'RSVPs open'}
                      </span>
                      <span>{event.registrationFee > 0 ? `$${event.registrationFee}` : 'Free'}</span>
                    </div>
                  </div>
                </Motion.article>
              ))}
          </Motion.div>
        </section>
      </main>
    </div>
  );
};

export default GuestDashboard;
