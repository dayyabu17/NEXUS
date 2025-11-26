import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const NOTIFICATION_ANIMATION_MS = 280;

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

const notificationToneStyles = {
  success: {
    accent: 'bg-emerald-500/15',
    iconColor: 'text-emerald-200',
    dot: 'bg-emerald-400',
  },
  highlight: {
    accent: 'bg-amber-500/12',
    iconColor: 'text-amber-200',
    dot: 'bg-amber-400',
  },
  info: {
    accent: 'bg-sky-500/12',
    iconColor: 'text-sky-200',
    dot: 'bg-sky-400',
  },
  default: {
    accent: 'bg-white/8',
    iconColor: 'text-white/70',
    dot: 'bg-white/50',
  },
};

const getNotificationInitial = (value) => {
  if (!value || typeof value !== 'string') {
    return 'N';
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'N';
};

const OrganizerLayoutDark = ({ children, suppressInitialLoader = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [unreadBadge, setUnreadBadge] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(() => {
    if (suppressInitialLoader || typeof window === 'undefined') {
      return false;
    }

    if (!location.state?.fromSignIn) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Ignore access issues from private browsing modes
      }
      return false;
    }

    try {
      return window.sessionStorage.getItem('organizer:show-loader') === 'true';
    } catch {
      return false;
    }
  });
  const [showBrandSpotlight, setShowBrandSpotlight] = useState(false);
  const brandTimeoutRef = useRef(null);
  const notificationsAnimationRef = useRef(null);
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

  const handleBrandSpotlight = () => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
    }

    setShowBrandSpotlight(true);
    brandTimeoutRef.current = setTimeout(() => {
      setShowBrandSpotlight(false);
      brandTimeoutRef.current = null;
    }, 10000);
  };

  const openNotifications = useCallback(() => {
    if (notificationsAnimationRef.current) {
      clearTimeout(notificationsAnimationRef.current);
      notificationsAnimationRef.current = null;
    }

    setNotificationsVisible(true);

    if (typeof window === 'undefined') {
      setShowNotifications(true);
      return;
    }

    window.requestAnimationFrame(() => {
      setShowNotifications(true);
    });
  }, []);

  const closeNotifications = useCallback(() => {
    if (!notificationsVisible && !showNotifications) {
      return;
    }

    setShowNotifications(false);

    if (notificationsAnimationRef.current) {
      clearTimeout(notificationsAnimationRef.current);
    }

    notificationsAnimationRef.current = setTimeout(() => {
      setNotificationsVisible(false);
      notificationsAnimationRef.current = null;
    }, NOTIFICATION_ANIMATION_MS);
  }, [notificationsVisible, showNotifications]);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      setNotificationsLoaded(false);
      setNotificationsError('');
      openNotifications();
    } else {
      closeNotifications();
    }
    setShowProfileMenu(false);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setNotificationsError('');
    setNotificationsLoaded(true);
    setUnreadBadge(0);
    localStorage.setItem('organizer:notifications:unread', '0');
    window.dispatchEvent(new CustomEvent('organizer:notifications:unread', { detail: 0 }));
  };

  const handleRefreshNotifications = () => {
    setNotifications([]);
    setNotificationsError('');
    setNotificationsLoaded(false);
  };

  useEffect(() => {
    if (!notificationsVisible) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        closeNotifications();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    if (showNotifications && !notificationsLoaded && !notificationsLoading) {
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
            const allNotifications = Array.isArray(response.data?.notifications)
              ? response.data.notifications
              : Array.isArray(response.data?.activities)
                ? response.data.activities
                : [];
            const unreadNotifications = allNotifications.filter((item) => !item.isRead);
            setNotifications(unreadNotifications.slice(0, 5));
            if (typeof response.data?.unreadCount === 'number') {
              const sanitized = Math.max(0, Number(response.data.unreadCount) || 0);
              setUnreadBadge(sanitized);
              localStorage.setItem('organizer:notifications:unread', String(sanitized));
              window.dispatchEvent(new CustomEvent('organizer:notifications:unread', { detail: sanitized }));
            }
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
  }, [notificationsVisible, showNotifications, notificationsLoaded, notificationsLoading, navigate, closeNotifications]);

  const formatNotificationTimestamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const handleStorageUpdate = (event) => {
      if (event.key === 'organizer:notifications:unread') {
        const value = Number(event.newValue);
        if (!Number.isNaN(value)) {
          setUnreadBadge(Math.max(0, value));
        }
      }
    };

    const handleCustomUpdate = (event) => {
      const value = Number(event.detail);
      if (!Number.isNaN(value)) {
        setUnreadBadge(Math.max(0, value));
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('organizer:notifications:unread', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('organizer:notifications:unread', handleCustomUpdate);
    };
  }, []);

  useEffect(() => {
    const stored = Number(localStorage.getItem('organizer:notifications:unread'));
    if (!Number.isNaN(stored)) {
      setUnreadBadge(Math.max(0, stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (suppressInitialLoader) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Ignore storage issues
      }
      return undefined;
    }

    if (!showInitialLoader) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Continue gracefully if storage is unavailable
      }
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [showInitialLoader, suppressInitialLoader]);

  useEffect(() => {
    if (location.state?.fromSignIn) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => () => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
      brandTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (notificationsAnimationRef.current) {
      clearTimeout(notificationsAnimationRef.current);
      notificationsAnimationRef.current = null;
    }
  }, []);

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
            <button
              type="button"
              onClick={handleBrandSpotlight}
              className="rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="About Nexus"
              data-node-id="143:48"
            >
              <img src={nexusIcon} alt="Nexus" className="h-8 w-8" />
            </button>

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
                onClick={handleToggleNotifications}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-transparent transition ${
                  showNotifications ? 'border-white/60' : 'hover:border-white/45'
                }`}
                aria-haspopup="menu"
                aria-expanded={showNotifications}
                aria-label="Notifications"
              >
                <img src={bellIcon} alt="Notifications" className="h-5 w-5 opacity-80" />
                {unreadBadge > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ff6289] px-1 text-[10px] font-semibold text-white">
                    {unreadBadge > 9 ? '9+' : unreadBadge}
                  </span>
                )}
              </button>
              {notificationsVisible && (
                <div
                  className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/10 bg-[rgba(12,15,22,0.95)] p-4 text-sm text-white shadow-[0_22px_80px_rgba(4,8,18,0.6)] backdrop-blur will-change-transform"
                  style={{
                    transform: showNotifications ? 'translateY(0)' : 'translateY(-12px)',
                    opacity: showNotifications ? 1 : 0,
                    transition: `transform ${NOTIFICATION_ANIMATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity 224ms cubic-bezier(0.16, 1, 0.3, 1)`,
                    pointerEvents: showNotifications ? 'auto' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                      Latest updates
                    </h3>
                    <div className="flex items-center gap-2">
                      {notificationsLoading && <span className="text-xs text-white/40">Loading…</span>}
                      {!notificationsLoading && (
                        <>
                          <button
                            type="button"
                            onClick={handleRefreshNotifications}
                            disabled={notificationsLoading}
                            className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 transition hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Refresh
                          </button>
                          {notifications.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearNotifications}
                              disabled={notificationsLoading}
                              className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 transition hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Clear
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {!notificationsLoading && notificationsError && (
                    <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-3 text-xs text-red-200">
                      {notificationsError}
                    </p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-black/40 px-3 py-4 text-xs text-white/60">
                      No notifications yet.
                    </p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length > 0 && (
                    <div className="relative mt-4">
                      <ul className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full dark:scrollbar-thumb-gray-600 dark:scrollbar-track-transparent">
                        {notifications.map((item) => {
                        const tone = notificationToneStyles[item.tone] || notificationToneStyles.default;
                        const headline = item.headline || item.type || 'Update';
                        const headlineLabel = typeof headline === 'string'
                          ? headline.toUpperCase()
                          : 'UPDATE';
                        const primaryTitle = item.eventTitle || item.title || 'New activity';
                        const timestampLabel = formatNotificationTimestamp(item.createdAt);
                        const showTimestamp = Boolean(timestampLabel);

                        return (
                          <li
                            key={item.id || item._id || `${primaryTitle}-${item.createdAt}`}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[rgba(18,21,30,0.9)] px-4 py-3 text-left text-sm text-white/80 shadow-[0_15px_45px_rgba(6,10,20,0.45)] transition hover:border-white/25 hover:bg-[rgba(22,26,36,0.95)]"
                          >
                            <div
                                className={`relative h-12 w-12 overflow-hidden rounded-xl bg-black/60`}
                            >
                              {item.imageUrl ? (
                                <>
                                  <img
                                    src={item.imageUrl}
                                    alt={primaryTitle}
                                    className="h-full w-full object-cover"
                                  />
                                  <span
                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0b0f18] ${tone.dot}`}
                                  />
                                </>
                              ) : (
                                <div
                                  className={`flex h-full w-full items-center justify-center ${tone.accent}`}
                                >
                                  <span className={`text-base font-semibold ${tone.iconColor}`}>
                                    {getNotificationInitial(primaryTitle)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] uppercase tracking-[0.25em] text-white/55">
                                  {headlineLabel}
                                </span>
                                {showTimestamp && (
                                  <span className="text-[11px] text-white/45">
                                    {timestampLabel}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {primaryTitle}
                              </p>
                              {item.message && (
                                <p className="mt-1 text-xs leading-relaxed text-white/65">
                                  {item.message}
                                </p>
                              )}
                              {item.tone === 'highlight' && item.stats?.ticketsSold && (
                                <p className="mt-2 text-xs text-white/70">
                                  {item.stats.ticketsSold} total ticket{item.stats.ticketsSold === 1 ? '' : 's'} sold so far.
                                </p>
                              )}
                              {item.tone === 'info' && item.stats?.rsvpTotal && (
                                <p className="mt-2 text-xs text-white/70">
                                  {item.stats.rsvpTotal} RSVP{item.stats.rsvpTotal === 1 ? '' : 's'} recorded.
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                      <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent dark:from-[rgba(12,15,22,0.95)]" />
                      <button
                        type="button"
                        onClick={() => {
                          closeNotifications();
                          navigate('/organizer/notifications');
                        }}
                        className="mt-4 w-full rounded-2xl border border-white/20 bg-white/5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 transition hover:border-white/40 hover:text-white"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  closeNotifications();
                }}
                className="h-10 w-10 overflow-hidden rounded-full border border-white/30 transition hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <img src={avatarImage} alt="Profile" className="h-full w-full object-cover" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/30 bg-[rgba(21,26,36,0.85)] p-3 text-sm text-white shadow-[0_18px_60px_rgba(5,8,17,0.65)] backdrop-blur">
                  <button
                    type="button"
                    onClick={handlePreferences}
                    className="flex w-full items-center justify-between rounded-xl border border-white/0 px-3 py-2 text-left text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
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

      {showBrandSpotlight && (
        <BrandSpotlight onClose={() => setShowBrandSpotlight(false)} />
      )}

      {showInitialLoader && !suppressInitialLoader && (
        <InitialLoader />
      )}
    </div>
  );
};

function SearchOverlay({
  query,
  onQueryChange,
  onClose,
  loading,
  error,
  upcomingPreview,
  results,
  hasQuery,
}) {
  const inputRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const closeTimerRef = useRef(null);

  const handleRequestClose = useCallback(() => {
    if (closeTimerRef.current) {
      return;
    }

    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleRequestClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleRequestClose]);

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

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleRequestClose();
    }
  };
  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

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
      className={`fixed inset-0 z-[1200] flex items-start justify-center px-4 py-10 transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 bg-black/60 backdrop-blur' : 'opacity-0 bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border border-white/10 bg-[rgba(15,19,29,0.92)] px-6 py-6 text-white shadow-[0_30px_120px_rgba(4,8,18,0.7)] transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
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
            onClick={handleRequestClose}
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

            <div
              className="mt-3 space-y-2"
              onMouseMove={handleParallaxMove}
              onMouseLeave={resetParallax}
            >
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

              {!loading && !error &&
                results.slice(0, hasQuery ? 6 : 3).map((event, index) => {
                  const depth = index + 1;
                  const translateX = parallaxOffset.x * depth * 6;
                  const translateY = parallaxOffset.y * depth * 6;
                  const style = hasQuery
                    ? { transition: 'transform 150ms ease-out' }
                    : {
                        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
                        transition: 'transform 150ms ease-out',
                      };

                  return (
                    <Link
                      key={event.id}
                      to={`/organizer/events/${event.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161b27] px-4 py-3 text-sm text-white transition hover:border-white/25 hover:bg-[#1e2433]"
                      style={style}
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
                  );
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BrandSpotlight({ onClose }) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntering(true);
      setTimeout(onClose, 250);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleManualClose = () => {
    setEntering(true);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[1300] flex items-center justify-center px-6 transition-opacity duration-250 ease-out ${
        entering ? 'opacity-0 bg-black/40 backdrop-blur-sm' : 'opacity-100 bg-black/70 backdrop-blur'
      }`}
    >
      <div
        className={`relative flex w-full max-w-lg flex-col items-center gap-6 overflow-hidden rounded-[32px] border border-white/15 bg-[rgba(10,14,24,0.9)] px-10 py-12 text-center text-white shadow-[0_40px_120px_rgba(4,8,20,0.55)] transition-transform duration-250 ease-out ${
          entering ? 'translate-y-6 scale-[0.96]' : 'translate-y-0 scale-100'
        }`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#5b8bff] blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-80px] h-56 w-56 rounded-full bg-[#ff6f91] blur-3xl" />
        </div>

        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <img
            src={nexusIcon}
            alt="Nexus icon"
            className={`h-10 w-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              entering ? 'scale-50 opacity-0 rotate-[-12deg]' : 'scale-100 opacity-100 rotate-0'
            }`}
          />
        </div>

        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
            Nexus Event Management System
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Orchestrate unforgettable experiences.
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            Nexus centralizes your event workflows—planning, ticketing, team collaboration, and live performance insights—inside a single, beautifully intuitive command center.
          </p>
        </div>

        <div className="relative flex w-full flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-center">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3">
            <span className="font-semibold text-white">Adaptive Dashboards</span>
            <span className="text-white/50">Realtime momentum & revenue signals</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3">
            <span className="font-semibold text-white">Organizer DNA</span>
            <span className="text-white/50">Personalized automations for your brand</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualClose}
          className="relative rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/75 transition hover:border-white/40 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function InitialLoader() {
  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#050811]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <img
            src={nexusIcon}
            alt="Nexus loading"
            className="h-10 w-10 animate-spin"
            style={{ animationDuration: '1.6s' }}
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Loading</p>
      </div>
    </div>
  );
}

export default OrganizerLayoutDark;
