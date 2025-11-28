import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestNavbar from '../components/GuestNavbar';
import api from '../api/axios';

const GuestEvents = () => {
  const [events, setEvents] = useState([]);
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

    const fetchEvents = async () => {
      setIsLoading(true);
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
        .map((event) => event?.category)
        .filter((category) => typeof category === 'string' && category.trim().length > 0),
    );
    return ['All', ...distinct];
  }, [events]);

  useEffect(() => {
    if (activeCategory === 'All') {
      return;
    }
    const categoryExists = events.some((event) => event?.category === activeCategory);
    if (!categoryExists) {
      setActiveCategory('All');
    }
  }, [events, activeCategory]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') {
      return events;
    }
    return events.filter((event) => event?.category === activeCategory);
  }, [events, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GuestNavbar />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <section className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white">All Events</h1>
            <p className="max-w-2xl text-base text-white/60">
              Dive into every upcoming experience across campus. Filter by categories and find the perfect event to match your mood today.
            </p>
          </div>

          <div className="sticky top-20 z-40 rounded-[24px] border border-white/10 bg-[#0d1524]/80 px-5 py-4 shadow-[0_18px_50px_rgba(5,10,20,0.55)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/55">Browse by category</p>
              <Motion.div layout className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar">
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

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">Discover Experiences</h3>
              <p className="text-sm text-white/55">Showing {filteredEvents.length} events</p>
            </div>

            <Motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`events-skeleton-${index}`}
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
                    Try another category or check back later for more curated experiences.
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
                filteredEvents.map((event, index) => {
                  const eventId = getEventId(event);
                  const cardKey = eventId ?? `event-${index}`;
                  return (
                    <Motion.article
                      key={`guest-event-${cardKey}`}
                      layout
                      onClick={() => handleViewEvent(eventId)}
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
                  );
                })}
            </Motion.div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default GuestEvents;
