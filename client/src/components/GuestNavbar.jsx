import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import NexusIcon from '../assets/icons/nexus-icon.svg';
import SearchIcon from '../assets/icons/Search.svg';
import BellIcon from '../assets/icons/Bell.svg';
import { reverseGeocode } from '../services/locationService';
import GlobalSearch from './GlobalSearch';
import api from '../api/axios';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const resolveProfileImage = (value) => {
  if (!value) {
    return DEFAULT_AVATAR;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `http://localhost:5000/public${value}`;
};

const NAV_LINKS = [
  { label: 'Explore', to: '/guest/dashboard' },
  { label: 'Map View', to: '/guest/map' },
  { label: 'My Tickets', to: '/guest/tickets' },
];

const STORAGE_KEY = 'userLocation';

const relativeTimeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const ranges = [
    { limit: minute, value: diff / 1000, unit: 'second' },
    { limit: hour, value: diff / minute, unit: 'minute' },
    { limit: day, value: diff / hour, unit: 'hour' },
    { limit: Infinity, value: diff / day, unit: 'day' },
  ];

  const range = ranges.find((item) => abs < item.limit) || ranges[ranges.length - 1];
  const rounded = Math.round(range.value);

  if (relativeTimeFormatter) {
    return relativeTimeFormatter.format(rounded, range.unit);
  }

  const suffix = diff < 0 ? 'ago' : 'from now';
  const amount = Math.abs(rounded);
  const plural = amount === 1 ? range.unit : `${range.unit}s`;
  return `${amount} ${plural} ${suffix}`;
};

const GuestNavbar = () => {
  const navigate = useNavigate();
  const hasRequestedRef = useRef(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBrandInfoOpen, setIsBrandInfoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locationName, setLocationName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedRaw = window.sessionStorage.getItem(STORAGE_KEY);
        if (storedRaw) {
          const stored = JSON.parse(storedRaw);
          if (stored?.name) {
            return stored.name;
          }
        }
      } catch (error) {
        console.warn('Failed to parse stored location', error);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return 'Detecting...';
    }

    return 'Campus';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [guestUnreadCount, setGuestUnreadCount] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }
    const stored = Number(window.localStorage.getItem('guest:notifications:unread'));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const notificationsRef = useRef(null);
  const brandInfoRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const loadAvatar = () => {
      try {
        const storedRaw = window.localStorage.getItem('user');
        if (!storedRaw) {
          setAvatarUrl(DEFAULT_AVATAR);
          return;
        }
        const stored = JSON.parse(storedRaw);
        setAvatarUrl(resolveProfileImage(stored?.profilePicture));
      } catch (error) {
        console.warn('Unable to parse stored user for avatar', error);
        setAvatarUrl(DEFAULT_AVATAR);
      }
    };

    loadAvatar();

    const handleStorage = (event) => {
      if (event.key === 'user' || !event.key) {
        loadAvatar();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncUnread = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        setGuestUnreadCount(Math.max(value, 0));
        return;
      }
      const stored = Number(window.localStorage.getItem('guest:notifications:unread'));
      setGuestUnreadCount(Number.isFinite(stored) && stored > 0 ? stored : 0);
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === 'guest:notifications:unread') {
        syncUnread();
      }
    };

    const handleCustom = (event) => {
      syncUnread(event?.detail);
    };

    syncUnread();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('guest:notifications:unread', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('guest:notifications:unread', handleCustom);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return undefined;
    }

    const handleClickAway = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isBrandInfoOpen) {
      return undefined;
    }

    const handleClickAway = (event) => {
      if (brandInfoRef.current && !brandInfoRef.current.contains(event.target)) {
        setIsBrandInfoOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsBrandInfoOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isBrandInfoOpen]);

  const guestQuickLinks = useMemo(
    () => [
      {
        title: 'Notifications',
        icon: () => <span className="text-base">🔔</span>,
        action: () => navigate('/guest/notifications'),
      },
      {
        title: 'Map View',
        icon: () => <span className="text-base">🗺️</span>,
        action: () => navigate('/guest/map'),
      },
      {
        title: 'My Tickets',
        icon: () => <span className="text-base">🎟️</span>,
        action: () => navigate('/guest/tickets'),
      },
      {
        title: 'Trending',
        icon: () => <span className="text-base">🔥</span>,
        action: () => navigate('/guest/dashboard?filter=trending'),
      },
    ],
    [navigate],
  );

  const brandHighlights = useMemo(
    () => [
      {
        title: 'All-in-One Campus Hub',
        description:
          'Discover events, secure tickets, and stay connected with everything happening on campus.',
      },
      {
        title: 'Smart Personalization',
        description:
          'Recommendations adapt in real time to your interests, location, and participation history.',
      },
      {
        title: 'Secure & Reliable',
        description:
          'Powered by trusted payments, resilient infrastructure, and a modern design system.',
      },
    ],
    [],
  );

  const fetchGuestNotifications = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError('');

    try {
      const response = await api.get('/events/guest/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(response.data?.notifications)
        ? response.data.notifications.slice(0, 5)
        : [];

      setNotificationItems(list);

      const unreadCount = typeof response.data?.unreadCount === 'number'
        ? response.data.unreadCount
        : list.filter((notification) => !notification.isRead).length;

      const sanitized = Math.max(unreadCount, 0);
      setGuestUnreadCount(sanitized);
      window.localStorage.setItem('guest:notifications:unread', String(sanitized));
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('guest:notifications:unread', { detail: sanitized }));
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load notifications.';
      setNotificationsError(message);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        navigate('/sign-in');
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchGuestNotifications();
    }
  }, [isNotificationsOpen, fetchGuestNotifications]);

  const clearPersistedLocation = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored location', error);
    }
  }, []);

  const persistLocation = useCallback((name, coords) => {
    setLocationName(name);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          lat: Number.isFinite(coords?.lat) ? coords.lat : null,
          lng: Number.isFinite(coords?.lng) ? coords.lng : null,
        }),
      );
    } catch (error) {
      console.warn('Failed to persist location', error);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('BROWSER GPS:', position.coords.latitude, position.coords.longitude);
        const resolveLocation = async () => {
          try {
            const city = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            persistLocation(city || 'Nearby', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          } catch (error) {
            console.error('Failed to reverse geocode user location', error);
            persistLocation('Nearby', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        };

        resolveLocation();
      },
      (error) => {
        console.warn('Geolocation Error:', error?.message || error);
        if (error?.code === 1) {
          setLocationName('Location Denied');
        } else if (error?.code === 2) {
          setLocationName('GPS Error');
        } else {
          setLocationName('Kano (Default)');
        }
        clearPersistedLocation();
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [clearPersistedLocation, persistLocation]);

  useEffect(() => {
    if (locationName !== 'Detecting...') {
      return;
    }

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;
    requestLocation();
  }, [locationName, requestLocation]);

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsBrandInfoOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setIsBrandInfoOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAll = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setIsBrandInfoOpen(false);
  };

  const handleNavigate = (path) => {
    closeAll();
    navigate(path);
  };

  const handleSignOut = () => {
    closeAll();
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Unable to clear stored credentials', error);
    }
    navigate('/sign-in');
  };

  const handleLocationClick = () => {
    if (
      locationName === 'Location Denied' ||
      locationName === 'Detecting...' ||
      locationName === 'GPS Error'
    ) {
      setLocationName('Detecting...');
      requestLocation();
    }
    setIsModalOpen(true);
    setIsBrandInfoOpen(false);
  };

  const handleUseGps = () => {
    setIsModalOpen(false);
    setLocationName('Detecting...');
    requestLocation();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSelectShoprite = () => {
    persistLocation('Shoprite Kano', { lat: 11.9746, lng: 8.5323 });
    setIsModalOpen(false);
  };

  const handleBrandInfoToggle = () => {
    setIsBrandInfoOpen((prev) => !prev);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,15,25,0.75)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBrandInfoToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-[#141c2c]/90 p-2 transition-all duration-300 ${
              isBrandInfoOpen
                ? 'border-white/30 shadow-[0_8px_30px_rgba(132,94,247,0.45)]'
                : 'border-white/10 hover:border-white/20 hover:shadow-[0_6px_22px_rgba(132,94,247,0.35)]'
            }`}
            aria-label="About Nexus"
          >
            <img src={NexusIcon} alt="Nexus" className="h-full w-full" />
          </button>
          <button
            type="button"
            onClick={handleLocationClick}
            className="hidden md:flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-[#141c2c]/80 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-white/20"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
          >
            <span aria-hidden>📍</span>
            <span className="max-w-[120px] truncate" title={locationName}>{locationName}</span>
            <span aria-hidden className="text-[10px] text-white/60">▾</span>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="transition hover:text-white"
              onClick={closeAll}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/70 transition hover:text-white"
              onClick={openSearch}
              aria-label="Open search"
            >
              <img src={SearchIcon} alt="Search" className="h-4 w-4" />
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setIsDropdownOpen(false);
                  setIsSearchOpen(false);
                  setIsBrandInfoOpen(false);
                }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/70 transition hover:text-white ${
                  isNotificationsOpen ? 'border-white/25 text-white' : ''
                }`}
                aria-haspopup="true"
                aria-expanded={isNotificationsOpen}
                aria-label="Notifications"
              >
                <img src={BellIcon} alt="Notifications" className="h-4 w-4" />
                {guestUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-[2px] text-[10px] font-semibold text-white">
                    {guestUnreadCount > 9 ? '9+' : guestUnreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                    className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-[#101725]/95 p-4 text-sm text-white/80 shadow-[0_20px_60px_rgba(6,10,20,0.75)]"
                  >
                  <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.32em] text-white/50">
                    <span>Notifications</span>
                    <span>{guestUnreadCount} unread</span>
                  </div>

                  {notificationsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`notif-skeleton-${index}`}
                          className="animate-pulse rounded-xl border border-white/10 bg-[#151c2b] p-3"
                        >
                          <div className="h-3 w-1/3 rounded bg-white/10" />
                          <div className="mt-2 h-4 w-3/4 rounded bg-white/12" />
                        </div>
                      ))}
                    </div>
                  ) : notificationsError ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-4 text-xs text-red-200">
                      {notificationsError}
                    </div>
                  ) : notificationItems.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#131c2a] px-3 py-6 text-center text-xs text-white/55">
                      No notifications yet. We will keep you posted.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notificationItems.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            navigate(`/events/${notification.eventId}`);
                          }}
                          className={`w-full rounded-xl border border-white/10 bg-[#131c2a] px-3 py-3 text-left transition hover:border-white/25 ${
                            notification.isRead ? 'opacity-70' : 'opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.32em] text-white/55">
                            <span>{notification.headline || 'Update'}</span>
                            {notification.createdAt && (
                              <span>{formatRelativeTime(notification.createdAt)}</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {notification.eventTitle || 'Event update'}
                          </p>
                          {notification.message && (
                            <p className="mt-1 max-h-10 overflow-hidden text-xs text-white/60">{notification.message}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/guest/notifications');
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/80 transition hover:border-white/35 hover:text-white"
                    >
                      View all
                    </button>
                    <button
                      type="button"
                      onClick={fetchGuestNotifications}
                      className="text-xs font-semibold text-white/50 transition hover:text-white"
                    >
                      Refresh
                    </button>
                  </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#121824]"
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl border border-white/10 bg-[#101725]/95 py-2 text-sm text-white/80 shadow-[0_20px_50px_rgba(5,10,20,0.65)]">
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left transition hover:bg-white/10"
                    onClick={() => handleNavigate('/guest/profile')}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-white/10"
                    onClick={() => handleNavigate('/guest/notifications')}
                  >
                    <span>Notifications</span>
                    {guestUnreadCount > 0 && (
                      <span className="ml-3 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200">
                        {guestUnreadCount > 9 ? '9+' : guestUnreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left transition hover:bg-white/10"
                    onClick={() => handleNavigate('/guest/tickets')}
                  >
                    My Tickets
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-red-300 transition hover:bg-white/10"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/80 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
              setIsDropdownOpen(false);
              setIsNotificationsOpen(false);
              setIsSearchOpen(false);
              setIsBrandInfoOpen(false);
            }}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

    </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex flex-col bg-[rgba(8,12,20,0.88)] backdrop-blur-md md:hidden"
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:border-white/40 hover:bg-white/20"
              aria-label="Close menu"
            >
              ✕
            </button>

            <div className="flex h-full flex-col px-6 pb-10 pt-20 text-white">
              <Motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/45 hover:bg-white/15"
                  aria-haspopup="dialog"
                  aria-expanded={isModalOpen}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>📍</span>
                    <span className="truncate">{locationName}</span>
                  </span>
                  <span aria-hidden className="text-xs">▾</span>
                </button>
              </Motion.div>

              <Motion.nav
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                className="mt-16 flex flex-col items-center gap-8"
              >
                {NAV_LINKS.map(({ label, to }) => (
                  <button
                    key={`mobile-overlay-${label}`}
                    type="button"
                    onClick={() => handleNavigate(to)}
                    className="text-2xl font-semibold uppercase tracking-[0.24em] text-white/85 transition hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </Motion.nav>

              <Motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                className="mt-auto flex items-center justify-center gap-6"
              >
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 transition hover:border-white/50 hover:bg-white/25"
                  aria-label="Open search"
                >
                  <img src={SearchIcon} alt="Search" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/guest/notifications')}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 transition hover:border-white/50 hover:bg-white/25"
                  aria-label="View notifications"
                >
                  <img src={BellIcon} alt="Notifications" className="h-5 w-5" />
                  {guestUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-[2px] text-[10px] font-semibold text-white">
                      {guestUnreadCount > 9 ? '9+' : guestUnreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/guest/profile')}
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 transition hover:border-white/50 hover:bg-white/25"
                  aria-label="View profile"
                >
                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                </button>
              </Motion.div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBrandInfoOpen && (
          <Motion.div
            ref={brandInfoRef}
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
            className="fixed inset-x-4 bottom-6 z-[70] w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#4263eb]/90 via-[#845ef7]/90 to-[#f06595]/90 p-6 text-white shadow-[0_24px_70px_rgba(10,20,60,0.55)] backdrop-blur-xl sm:inset-auto sm:bottom-auto sm:right-6 sm:top-24 sm:w-[min(320px,calc(100vw-32px))]"
            aria-live="polite"
          >
            <div className="pointer-events-none absolute -top-20 right-[-40px] h-48 w-48 rounded-full bg-white/35 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[-50px] left-[-60px] h-40 w-40 rounded-full bg-[#3bc9db]/30 blur-3xl" aria-hidden="true" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-white/70">
                    Inside Nexus
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-tight">Nexus Experience</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBrandInfoOpen(false)}
                  className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:bg-white/20 hover:text-white"
                  aria-label="Close Nexus information"
                >
                  ✕
                </button>
              </div>

              <p className="mt-3 text-sm text-white/85">
                Nexus blends live events, ticketing, and campus discovery into a single colorful journey tailored
                for students and organizers.
              </p>

              <div className="mt-5 space-y-3">
                {brandHighlights.map(({ title, description }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg transition hover:border-white/25 hover:bg-white/15"
                  >
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-white/80">{description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsBrandInfoOpen(false);
                    navigate('/guest/dashboard');
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#1f1b2e] transition hover:bg-white"
                >
                  Explore Events
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBrandInfoOpen(false);
                    openSearch();
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/85 transition hover:border-white/60 hover:text-white"
                >
                  Search Campus
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {isModalOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={handleModalClose} />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Choose Location</h3>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="text-slate-400 transition hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 px-6 py-6">
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-blue-500 hover:bg-slate-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-600 group-hover:text-white">
                    📍
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Use My Current Location</p>
                    <p className="text-xs text-slate-400">Enable GPS</p>
                  </div>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or Select Campus</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectShoprite}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-purple-500 hover:bg-slate-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-600 group-hover:text-white">
                    🛍️
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Shoprite (Kano)</p>
                    <p className="text-xs text-slate-400">Ado Bayero Mall</p>
                  </div>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        quickLinks={guestQuickLinks}
      />
    </>
  );
};

export default GuestNavbar;
