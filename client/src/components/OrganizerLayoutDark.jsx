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
import GlobalSearch from './GlobalSearch';
import useAccentColorSync from '../hooks/useAccentColorSync';

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
    accent: 'bg-accent-500/12',
    iconColor: 'text-accent-500',
    dot: 'bg-accent-500',
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

const NAV_ITEMS = [
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

const OrganizerLayoutDark = ({ children, suppressInitialLoader = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [showSearch, setShowSearch] = useState(false);
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
        // Ignore storage issues
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

  useAccentColorSync();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatNotificationTimestamp = useCallback((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }, []);

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
    navigate('/organizer/account');
  };

  const handleAppPreferences = () => {
    setShowProfileMenu(false);
    navigate('/organizer/preferences');
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
        // Ignore storage issues
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

  const organizerQuickLinks = useMemo(
    () => [
      {
        title: 'Create Event',
        icon: '+',
        action: () => navigate('/organizer/events/create'),
      },
      {
        title: 'Upcoming Events',
        icon: '↗',
        action: () => navigate('/organizer/events'),
      },
    ],
    [navigate],
  );

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
              {NAV_ITEMS.map(({ label, path, iconActive, iconInactive }) => {
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
              className="font-medium text-white transition-colors hover:text-accent-500"
              data-node-id="156:84"
            >
              Create Event
            </Link>
            <button
              type="button"
              onClick={() => setShowSearch(true)}
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
                              key={item.id ?? `${primaryTitle}-${item.createdAt}`}
                              className={`group flex items-start gap-3 rounded-3xl border border-transparent bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.08] ${tone.accent}`}
                            >
                              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-xs font-semibold">
                                <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${tone.dot}`} />
                                <span className={`text-base font-bold ${tone.iconColor}`}>
                                  {getNotificationInitial(item.organizerName || item.title || item.eventTitle)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50">
                                    {headlineLabel}
                                  </p>
                                  {showTimestamp && (
                                    <span className="text-[10px] font-medium text-white/40">
                                      {timestampLabel}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm font-semibold text-white/90">{primaryTitle}</p>
                                {item.message && (
                                  <p className="mt-1 text-xs text-white/60">{item.message}</p>
                                )}
                                {item.actionLabel && item.actionHref && (
                                  <Link
                                    to={item.actionHref}
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-500 transition hover:text-accent-600"
                                  >
                                    {item.actionLabel}
                                    <span aria-hidden="true">↗</span>
                                  </Link>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
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
                className={`flex items-center gap-2 rounded-full border border-white/15 px-1 py-1 transition hover:border-white/35 ${
                  showProfileMenu ? 'border-white/35 bg-white/5' : ''
                }`}
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <img
                  src={avatarImage}
                  alt="Organizer avatar"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="hidden text-left text-xs sm:block">
                  <p className="font-semibold text-white">Maria Daniels</p>
                  <p className="text-white/55">Organizer</p>
                </div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 min-w-[180px] rounded-3xl border border-white/10 bg-[#0A0F16]/95 p-3 text-sm shadow-xl backdrop-blur">
                  <button
                    type="button"
                    onClick={handlePreferences}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Account Settings
                    <span className="text-[10px] text-white/40">Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAppPreferences}
                    className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    App Preferences
                    <span className="text-[10px] text-white/40">⌘ + ,</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
                  >
                    Log out
                    <span className="text-[10px] text-white/40">⇧ ⌘ Q</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[132px]">
        <div className="mx-auto flex w-full max-w-[1455px] gap-8 px-10 pb-16">
          <section className="relative flex-1">
            {children}
          </section>

          {showBrandSpotlight && (
            <aside className="hidden w-[320px] flex-shrink-0 xl:block">
              <div className="sticky top-[132px] space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(5,8,20,0.45)]">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.38em] text-white/50">
                    Brand Spotlight
                  </h2>
                  <p className="mt-4 text-sm text-white/70">
                    Nexus is the command center for your live experiences. Draft, launch, and scale events with
                    full creative control and real-time analytics.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (brandTimeoutRef.current) {
                        clearTimeout(brandTimeoutRef.current);
                        brandTimeoutRef.current = null;
                      }
                      setShowBrandSpotlight(false);
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/45 hover:text-white"
                  >
                    Close spotlight
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="rounded-[32px] border border-white/5 bg-white/[0.04] p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                    Quick actions
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {organizerQuickLinks.map((item) => (
                      <li key={item.title}>
                        <button
                          type="button"
                          onClick={item.action}
                          className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-transparent px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                          <span>{item.title}</span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-white/60 transition group-hover:border-white/45 group-hover:text-white">
                            {item.iconLabel}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        quickLinks={organizerQuickLinks}
      />

      {showInitialLoader && !suppressInitialLoader && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020305]">
          <div className="flex flex-col items-center gap-4">
            <img src={nexusIcon} alt="Nexus" className="h-12 w-12 animate-pulse" />
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Preparing dashboard</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerLayoutDark;
