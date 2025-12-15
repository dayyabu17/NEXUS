import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NexusIcon from '../assets/icons/nexus-icon.svg';
import SearchIcon from '../assets/icons/Search.svg';
import GlobalSearch from './GlobalSearch';
import useGuestLocation from '../hooks/useGuestLocation';
import useGuestNotifications from '../hooks/useGuestNotifications';
import LocationModal from './GuestNavbar/LocationModal';
import NotificationsDropdown from './GuestNavbar/NotificationsDropdown';
import ProfileDropdown from './GuestNavbar/ProfileDropdown';
import BrandInfoPanel from './GuestNavbar/BrandInfoPanel';
import MobileMenu from './GuestNavbar/MobileMenu';

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

const BRAND_HIGHLIGHTS = [
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
];

const GuestNavbar = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBrandInfoOpen, setIsBrandInfoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const notificationsRef = useRef(null);
  const brandInfoRef = useRef(null);

  const {
    locationName,
    isModalOpen,
    handleLocationClick,
    handleUseGps,
    handleSelectShoprite,
    handleModalClose,
  } = useGuestLocation();

  const {
    guestUnreadCount,
    notificationItems,
    notificationsLoading,
    notificationsError,
    isNotificationsOpen,
    setIsNotificationsOpen,
    fetchGuestNotifications,
  } = useGuestNotifications(navigate);

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
    [navigate]
  );

  const closeAll = useCallback(() => {
    setIsSearchOpen(false);
    setIsProfileOpen(false);
    setIsBrandInfoOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [setIsNotificationsOpen]);

  const handleNavigate = useCallback(
    (path) => {
      closeAll();
      navigate(path);
    },
    [closeAll, navigate]
  );

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    setIsProfileOpen(false);
    setIsBrandInfoOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [setIsNotificationsOpen]);

  const handleBrandInfoToggle = useCallback(() => {
    setIsBrandInfoOpen((prev) => !prev);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [setIsNotificationsOpen]);

  const handleNotificationsToggle = useCallback(() => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileOpen(false);
    setIsBrandInfoOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [setIsNotificationsOpen]);

  const handleProfileToggle = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationsOpen(false);
    setIsBrandInfoOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [setIsNotificationsOpen]);

  const handleLocationButtonClick = useCallback(() => {
    setIsBrandInfoOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    handleLocationClick();
  }, [handleLocationClick, setIsNotificationsOpen]);

  const handleMobileToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    setIsBrandInfoOpen(false);
  }, [setIsNotificationsOpen]);

  const handleSignOut = useCallback(() => {
    closeAll();
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Unable to clear stored credentials', error);
    }
    navigate('/sign-in');
  }, [closeAll, navigate]);

  const handleNotificationsNavigate = useCallback(
    (target) => {
      setIsNotificationsOpen(false);
      if (target === 'ALL') {
        navigate('/guest/notifications');
        return;
      }
      if (target) {
        navigate(`/events/${target}`);
      }
    },
    [navigate, setIsNotificationsOpen]
  );

  const handleMobileNavigate = useCallback(
    (path) => {
      handleNavigate(path);
    },
    [handleNavigate]
  );

  const handleOpenSearchMobile = useCallback(() => {
    openSearch();
  }, [openSearch]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBrandInfoToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-white p-2 text-slate-900 transition-all duration-300 dark:bg-[#141c2c]/90 dark:text-white ${
              isBrandInfoOpen
                ? 'border-blue-400 shadow-[0_8px_30px_rgba(132,94,247,0.35)] dark:border-white/30'
                : 'border-slate-200 hover:border-blue-400 hover:shadow-[0_6px_22px_rgba(132,94,247,0.35)] dark:border-white/10 dark:hover:border-white/20'
            }`}
            aria-label="About Nexus"
          >
            <img src={NexusIcon} alt="Nexus" className="h-full w-full" />
          </button>
          <button
            type="button"
            onClick={handleLocationButtonClick}
            className="hidden md:flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
          >
            <span aria-hidden>📍</span>
            <span className="max-w-[120px] truncate" title={locationName}>{locationName}</span>
            <span aria-hidden className="text-[10px] text-slate-500 dark:text-slate-400">▾</span>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-[#121824] dark:text-white/70 dark:hover:bg-[#1b2335]"
               onClick={openSearch}
              aria-label="Open search"
            >
              <img src={SearchIcon} alt="Search" className="h-4 w-4" />
            </button>

            <NotificationsDropdown
              ref={notificationsRef}
              isOpen={isNotificationsOpen}
              unreadCount={guestUnreadCount}
              items={notificationItems}
              isLoading={notificationsLoading}
              error={notificationsError}
              onToggle={handleNotificationsToggle}
              onRefresh={fetchGuestNotifications}
              onNavigate={handleNotificationsNavigate}
            />

            <ProfileDropdown
              isOpen={isProfileOpen}
              avatarUrl={avatarUrl}
              unreadCount={guestUnreadCount}
              onToggle={handleProfileToggle}
              onNavigate={handleNavigate}
              onSignOut={handleSignOut}
            />
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-[#121824] dark:text-white/80 dark:hover:bg-[#1b2335] md:hidden"
            aria-label="Toggle navigation"
            onClick={handleMobileToggle}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

    </header>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        locationName={locationName}
        isModalOpen={isModalOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLocationClick={handleLocationButtonClick}
        onSignOut={handleSignOut}
        onNavigate={handleMobileNavigate}
        onOpenSearch={handleOpenSearchMobile}
        navLinks={NAV_LINKS}
        unreadCount={guestUnreadCount}
        avatarUrl={avatarUrl}
      />

      <BrandInfoPanel
        isOpen={isBrandInfoOpen}
        panelRef={brandInfoRef}
        highlights={BRAND_HIGHLIGHTS}
        onClose={() => setIsBrandInfoOpen(false)}
        onExplore={() => handleNavigate('/guest/dashboard')}
        onSearch={() => {
          setIsBrandInfoOpen(false);
          openSearch();
        }}
      />

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUseGps={handleUseGps}
        onSelectShoprite={handleSelectShoprite}
      />

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        quickLinks={guestQuickLinks}
      />
    </>
  );
};

export default GuestNavbar;
