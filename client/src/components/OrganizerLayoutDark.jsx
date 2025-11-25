import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import nexusIcon from '../assets/icons/nexus-icon.svg';
import DashboardActiveIcon from '../assets/icons/dashboard_active.svg';
import DashboardInactiveIcon from '../assets/icons/dashboard_notactive.svg';
import EventActiveIcon from '../assets/icons/event_active.svg';
import EventInactiveIcon from '../assets/icons/event_notactive.svg';
import EarningActiveIcon from '../assets/icons/earning_active.svg';
import EarningInactiveIcon from '../assets/icons/earning_notactive.svg';
import searchIcon from '../assets/icons/search.svg';
import bellIcon from '../assets/icons/Bell.svg';
import api from '../api/axios';

const avatarImage = '/images/default-avatar.jpeg';

const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const offsetSign = offsetMinutesTotal >= 0 ? '+' : '-';
  const offsetHours = Math.floor(Math.abs(offsetMinutesTotal) / 60);
  const offsetMinutes = Math.abs(offsetMinutesTotal) % 60;
  const offsetSuffix = offsetMinutes === 0
    ? `${offsetHours}`
    : `${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;

  return `${displayHour}:${minutes}${isPM ? 'PM' : 'AM'} GMT${offsetSign}${offsetSuffix}`;
};

const OrganizerLayoutDark = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showSearch) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearch]);

  useEffect(() => {
    if (!showSearch || eventsLoaded || eventsLoading) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setEventsError('Authentication required to search events.');
      return;
    }

    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError('');
        const response = await api.get('/organizer/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(Array.isArray(response.data) ? response.data : []);
        setEventsLoaded(true);
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Unable to load events right now.';
        setEventsError(message);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [showSearch, eventsLoaded, eventsLoading]);

  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }

    const now = Date.now();
    return [...events]
      .filter((event) => {
        const eventTime = new Date(event.date).getTime();
        return !Number.isNaN(eventTime) && eventTime >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return upcomingEvents;
    }

    return upcomingEvents.filter((event) => {
      const haystack = [
        event.title,
        event.category,
        Array.isArray(event.tags) ? event.tags.join(' ') : '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(trimmed);
    });
  }, [searchQuery, upcomingEvents]);

  const upcomingPreview = useMemo(
    () => upcomingEvents.slice(0, 3),
    [upcomingEvents],
  );

  useEffect(() => {
    if (!showProfileMenu) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowProfileMenu(false);
    navigate('/sign-in');
  };

  const handlePreferences = () => {
    setShowProfileMenu(false);
    navigate('/organizer/settings');
  };

  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    if (!notificationsLoaded && !notificationsLoading) {
      const token = localStorage.getItem('token');

      if (!token) {
        setNotificationsError('Sign in to view notifications.');
      } else {
        const fetchNotifications = async () => {
          try {
            setNotificationsLoading(true);
            setNotificationsError('');
            const response = await api.get('/organizer/dashboard', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const activities = Array.isArray(response.data?.activities)
              ? response.data.activities
              : [];
            setNotifications(activities.slice(0, 5));
            setNotificationsLoaded(true);
          } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/sign-in');
            } else {
              const message = error?.response?.data?.message || 'Unable to load notifications.';
              setNotificationsError(message);
            }
          } finally {
            setNotificationsLoading(false);
          }
        };

        fetchNotifications();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showNotifications, notificationsLoaded, notificationsLoading, navigate]);

  const formatNotificationTimestamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Just now';
    }

    return date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const navItems = [
    {
      label: 'Dashboard',
      iconActive: DashboardActiveIcon,
      iconInactive: DashboardInactiveIcon,
      path: '/organizer/dashboard',
    },
    {
      label: 'Events',
      iconInactive: EventInactiveIcon,
      iconActive: EventActiveIcon,
      path: '/organizer/events',
    },
    {
      label: 'Earnings',
      iconInactive: EarningInactiveIcon,
      iconActive: EarningActiveIcon,
      path: '/organizer/earnings',
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-[#0A121E] via-[#050912] to-[#020305] text-white"
      data-name="Organizer_Layout_Dark"
      data-node-id="138:24"
    >
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0A0F16]/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1455px] items-center justify-between px-10 py-6" data-node-id="173:25">
          <div className="flex flex-1 items-center gap-16" data-node-id="158:95">
            <img src={nexusIcon} alt="Nexus" className="h-8 w-8" data-node-id="143:48" />

            <nav className="flex items-center gap-6" data-node-id="156:81">
              {navItems.map(({ label, path, iconActive, iconInactive }) => {
                const isActive = location.pathname.startsWith(path);
                const iconSrc = isActive ? iconActive ?? iconInactive : iconInactive ?? iconActive;
                return (
                  <NavLink
                    key={label}
                    to={path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-[#7d7d7d] hover:text-white'
                    }`}
                    data-node-id={label === 'Dashboard' ? '156:69' : label === 'Events' ? '156:74' : '156:80'}
                  >
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={`${label} icon`}
                        className="h-6 w-6"
                        data-node-id={label === 'Dashboard' ? '156:65' : label === 'Events' ? '156:57' : '156:67'}
                      />
                    )}
                    <span>{label}</span>
                    {isActive && <span className="sr-only">(current)</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm" data-node-id="158:93">
            <span className="text-[#acacac]" data-node-id="156:85">
              {currentTime}
            </span>
            <Link
              to="/organizer/events/create"
              className="font-medium text-white transition-colors hover:text-[#a2cbff]"
              data-node-id="156:84"
            >
              Create Event
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearch(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition hover:border-white/30"
              aria-label="Search events"
              data-node-id="156:82"
            >
              <img src={searchIcon} alt="Search" className="h-4 w-4 opacity-80" />
            </button>
            <div className="relative" ref={notificationsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowProfileMenu(false);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-transparent transition ${
                  showNotifications ? 'border-white/40' : 'hover:border-white/30'
                }`}
                aria-haspopup="menu"
                aria-expanded={showNotifications}
                aria-label="Notifications"
              >
                <img src={bellIcon} alt="Notifications" className="h-5 w-5 opacity-80" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/12 bg-[rgba(18,22,32,0.9)] p-4 text-sm text-white shadow-[0_22px_80px_rgba(4,8,18,0.6)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                      Latest updates
                    </h3>
                    {notificationsLoading && <span className="text-xs text-white/40">Loading…</span>}
                  </div>
                  {!notificationsLoading && notificationsError && (
                    <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-3 text-xs text-red-200">
                      {notificationsError}
                    </p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-xs text-white/60">
                      No notifications yet.
                    </p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length > 0 && (
                    <ul className="mt-4 space-y-3">
                      {notifications.map((item) => (
                        <li
                          key={item.id || item._id || `${item.title}-${item.createdAt}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80"
                        >
                          <p className="font-medium text-white">{item.title || 'New activity'}</p>
                          <p className="mt-1 text-xs text-white/55">
                            {formatNotificationTimestamp(item.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="h-10 w-10 overflow-hidden rounded-full border border-white/20 transition hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <img src={avatarImage} alt="Profile" className="h-full w-full object-cover" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/15 bg-[rgba(21,26,36,0.85)] p-3 text-sm text-white shadow-[0_18px_60px_rgba(5,8,17,0.65)] backdrop-blur">
                  <button
                    type="button"
                    onClick={handlePreferences}
                    className="flex w-full items-center justify-between rounded-xl border border-white/0 px-3 py-2 text-left text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Preferences
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-[#ff6464] transition hover:border-[#ff6464]/40 hover:bg-[#ff6464]/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1455px] px-10 pb-16 pt-28">
        {children}
      </main>

      {showSearch && (
        <SearchOverlay
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => setShowSearch(false)}
          loading={eventsLoading && !eventsLoaded}
          error={eventsError}
          upcomingPreview={upcomingPreview}
          results={filteredEvents}
          hasQuery={Boolean(searchQuery.trim())}
        />
      )}
    </div>
  );
};

const SearchOverlay = ({
  query,
  onQueryChange,
  onClose,
  loading,
  error,
  upcomingPreview,
  results,
  hasQuery,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const formatEventMeta = (event) => {
    const eventDate = new Date(event.date);
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

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-start justify-center bg-black/60 px-4 py-10 backdrop-blur"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[rgba(15,19,29,0.92)] px-6 py-6 text-white shadow-[0_30px_120px_rgba(4,8,18,0.7)]">
        <div className="relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search events, categories, or tags..."
            className="w-full rounded-2xl border border-white/15 bg-[rgba(20,24,34,0.85)] px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/35 hover:text-white"
          >
            Esc
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Shortcuts
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/organizer/events/create"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(28,33,44,0.85)] px-4 py-3 text-sm font-medium text-white transition hover:border-white/25 hover:bg-[rgba(35,40,52,0.9)]"
                onClick={onClose}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg" aria-hidden>
                    +
                  </span>
                  Create event
                </span>
                <span className="text-xs text-white/50">Shortcut</span>
              </Link>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                {hasQuery ? 'Search results' : 'Upcoming'}
              </h3>
              {!hasQuery && upcomingPreview.length > 0 && (
                <span className="text-xs text-white/50">Next {upcomingPreview.length} events</span>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {loading && !error && (
                <div className="rounded-2xl border border-white/10 bg-[#161b27] px-4 py-3 text-sm text-white/60">
                  Loading events...
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#161b27] px-4 py-3 text-sm text-white/60">
                  {hasQuery
                    ? 'No events matched your search.'
                    : 'You have no upcoming events yet.'}
                </div>
              )}

              {!loading && !error && results.slice(0, hasQuery ? 6 : 3).map((event) => (
                <Link
                  key={event.id}
                  to={`/organizer/events/${event.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161b27] px-4 py-3 text-sm text-white transition hover:border-white/25 hover:bg-[#1e2433]"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{event.title}</span>
                    <span className="text-xs text-white/55">
                      {event.category ? `${event.category} • ` : ''}
                      {formatEventMeta(event)}
                    </span>
                  </div>
                  <span className="text-xs text-white/45">View</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayoutDark;
