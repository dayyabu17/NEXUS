import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ANIMATION_DURATION = 220;
const UPCOMING_PREVIEW_LIMIT = 3;
const SEARCH_RESULTS_LIMIT = 6;

const getStoredUserRole = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
};

const normalizeEvent = (event) => {
  const fallbackId = event?._id && typeof event._id === 'string' ? event._id : undefined;
  const derivedId = typeof event?.id === 'string' ? event.id : fallbackId;

  return {
    ...event,
    id: derivedId,
    _id: fallbackId || derivedId,
    title: event?.title || 'Untitled Experience',
    category: event?.category,
    tags: Array.isArray(event?.tags) ? event.tags : [],
    date: event?.date,
    location: event?.location,
    imageUrl: event?.imageUrl,
  };
};

const formatEventMeta = (value) => {
  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) {
    return 'Date to be announced';
  }

  const dateLabel = eventDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const timeLabel = eventDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateLabel} • ${timeLabel}`;
};

const QuickLinkIcon = ({ icon }) => {
  if (React.isValidElement(icon)) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white" aria-hidden>
        {React.cloneElement(icon, {
          className: `${icon.props.className || ''} h-5 w-5`.trim(),
        })}
      </span>
    );
  }

  if (typeof icon === 'function') {
    const IconComponent = icon;
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white" aria-hidden>
        <IconComponent className="h-5 w-5" />
      </span>
    );
  }

  if (typeof icon === 'string') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 dark:bg-white/10 dark:text-white" aria-hidden>
        {icon}
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 dark:bg-white/10 dark:text-white" aria-hidden>
      ★
    </span>
  );
};

const GlobalSearch = ({ isOpen, onClose, quickLinks = [] }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);
  const roleRef = useRef('guest');
  const navigate = useNavigate();

  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setIsVisible(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose?.();
    }, ANIMATION_DURATION);
  }, [onClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setQuery('');
      setParallaxOffset({ x: 0, y: 0 });

      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });

      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = setTimeout(() => {
      setShouldRender(false);
      closingRef.current = false;
    }, ANIMATION_DURATION);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) {
      return undefined;
    }

    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, requestClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isActive = true;

    const fetchEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const role = getStoredUserRole();
        roleRef.current = role === 'organizer' ? 'organizer' : 'guest';

        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        let data = [];

        if (roleRef.current === 'organizer' && token) {
          try {
            const response = await api.get('/organizer/events', {
              headers: { Authorization: `Bearer ${token}` },
            });
            data = Array.isArray(response.data) ? response.data : [];
          } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              roleRef.current = 'guest';
            } else {
              throw error;
            }
          }
        }

        if (data.length === 0) {
          const response = await api.get('/events');
          data = Array.isArray(response.data) ? response.data : [];
        }

        if (!isActive) {
          return;
        }

        setEvents(data.map(normalizeEvent));
        setError('');
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error?.response?.data?.message || 'Unable to load events right now.';
        setError(message);
        setEvents([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isActive = false;
    };
  }, [isOpen]);

  const trimmedQuery = query.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;

  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }

    const now = Date.now();
    return [...events]
      .filter((event) => {
        const when = event?.date ? new Date(event.date).getTime() : Number.NaN;
        return !Number.isNaN(when) && when >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!hasQuery) {
      return upcomingEvents;
    }

    const baseQuery = trimmedQuery;
    return events.filter((event) => {
      const haystack = [
        event?.title,
        event?.category,
        Array.isArray(event?.tags) ? event.tags.join(' ') : '',
        event?.location,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(baseQuery);
    });
  }, [events, upcomingEvents, hasQuery, trimmedQuery]);

  const displayEvents = hasQuery
    ? filteredEvents.slice(0, SEARCH_RESULTS_LIMIT)
    : upcomingEvents.slice(0, UPCOMING_PREVIEW_LIMIT);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  };

  const handleQuickLinkClick = (link) => {
    if (typeof link?.action === 'function') {
      link.action();
    }
    requestClose();
  };

  const handleResultSelect = (eventItem) => {
    const eventId = eventItem?.id || eventItem?._id;
    if (!eventId) {
      return;
    }

    const destination = roleRef.current === 'organizer'
      ? `/organizer/events/${eventId}`
      : `/events/${eventId}`;

    navigate(destination);
    requestClose();
  };

  const handleParallaxMove = (event) => {
    if (hasQuery) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    const normalizedX = Math.max(-1, Math.min(1, relativeX * 2 - 1));
    const normalizedY = Math.max(-1, Math.min(1, relativeY * 2 - 1));

    setParallaxOffset({ x: normalizedX, y: normalizedY });
  };

  const resetParallax = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  const emptyMessage = hasQuery
    ? 'No events matched your search.'
    : 'No upcoming events are available yet.';

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-start justify-center px-4 py-10 transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 bg-black/60 backdrop-blur' : 'opacity-0 bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-slate-700 shadow-2xl transition-all duration-300 ease-out dark:border-white/10 dark:bg-[rgba(15,19,29,0.92)] dark:text-white dark:shadow-[0_30px_120px_rgba(4,8,18,0.7)] ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, categories, or tags..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-[rgba(20,24,34,0.85)] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
          />
          <button
            type="button"
            onClick={requestClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-white/15 dark:bg-transparent dark:text-white/70 dark:hover:border-white/35 dark:hover:text-white"
          >
            Esc
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {quickLinks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/45">
                Shortcuts
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.title}
                    type="button"
                    onClick={() => handleQuickLinkClick(link)}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-[rgba(28,33,44,0.85)] dark:text-white dark:hover:border-white/25 dark:hover:bg-[rgba(35,40,52,0.9)]"
                  >
                    <span className="flex items-center gap-3">
                      <QuickLinkIcon icon={link.icon} />
                      {link.title}
                    </span>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      Enter
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/45">
                {hasQuery ? 'Search results' : 'Upcoming'}
              </h3>
              {!hasQuery && displayEvents.length > 0 && (
                <span className="text-xs text-slate-500 dark:text-white/50">Next {displayEvents.length} events</span>
              )}
            </div>

            <div
              className="mt-3 space-y-2"
              onMouseMove={!hasQuery ? handleParallaxMove : undefined}
              onMouseLeave={!hasQuery ? resetParallax : undefined}
            >
              {loading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-[#161b27] dark:text-white/60">
                  Loading events...
                </div>
              )}

              {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}

              {!loading && !error && displayEvents.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-[#161b27] dark:text-white/60">
                  {emptyMessage}
                </div>
              )}

              {!loading && !error &&
                displayEvents.map((eventItem, index) => {
                  const depth = index + 1;
                  const translateX = parallaxOffset.x * depth * 6;
                  const translateY = parallaxOffset.y * depth * 6;
                  const style = hasQuery
                    ? { transition: 'transform 150ms ease-out' }
                    : {
                        transform: `translate3d(${translateX}px, ${translateY}px, 0)` ,
                        transition: 'transform 150ms ease-out',
                      };

                  return (
                    <button
                      key={eventItem.id || eventItem._id || `${eventItem.title}-${index}`}
                      type="button"
                      onClick={() => handleResultSelect(eventItem)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-[#161b27] dark:text-white dark:hover:border-white/25 dark:hover:bg-[#1e2433]"
                      style={style}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">{eventItem.title}</span>
                        <span className="text-xs text-slate-500 dark:text-white/55">
                          {eventItem.category ? `${eventItem.category} • ` : ''}
                          {formatEventMeta(eventItem.date)}
                        </span>
                      </div>
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        View
                      </span>
                    </button>
                  );
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
