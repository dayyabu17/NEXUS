import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import NexusIcon from '../assets/icons/nexus-icon.svg';
import SearchIcon from '../assets/icons/Search.svg';
import BellIcon from '../assets/icons/Bell.svg';
import { reverseGeocode } from '../services/locationService';
import GlobalSearch from './GlobalSearch';

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

const GuestNavbar = () => {
  const navigate = useNavigate();
  const hasRequestedRef = useRef(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const guestQuickLinks = useMemo(
    () => [
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
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsSearchOpen(false);
  };

  const closeAll = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,15,25,0.75)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/80"
            aria-label="Toggle navigation"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="text-lg">☰</span>
          </button>

          <div className="flex items-center gap-3">
            <img src={NexusIcon} alt="Nexus" className="h-10 w-10" />
            <button
              type="button"
              onClick={handleLocationClick}
              className="hidden sm:flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-[#141c2c]/80 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-white/20"
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
            >
              <span aria-hidden>📍</span>
              <span className="max-w-[100px] truncate" title={locationName}>{locationName}</span>
              <span aria-hidden className="text-[10px] text-white/60">▾</span>
            </button>
          </div>
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
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/70 transition hover:text-white"
            onClick={openSearch}
            aria-label="Open search"
          >
            <img src={SearchIcon} alt="Search" className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#121824] text-white/70 transition hover:text-white"
            aria-label="Notifications"
          >
            <img src={BellIcon} alt="Notifications" className="h-4 w-4" />
          </button>

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
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[rgba(10,15,25,0.95)] px-4 py-4 text-sm text-white/70">
          <nav className="space-y-2">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={`mobile-${label}`}
                to={to}
                className="block rounded-xl border border-white/10 bg-[#121824] px-3 py-2 transition hover:border-white/25 hover:text-white"
                onClick={closeAll}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              className="block w-full rounded-xl border border-white/10 bg-[#121824] px-3 py-2 text-left transition hover:border-white/25 hover:text-white"
              onClick={() => handleNavigate('/guest/profile')}
            >
              Profile
            </button>
            <button
              type="button"
              className="block w-full rounded-xl border border-white/10 bg-[#121824] px-3 py-2 text-left text-red-300 transition hover:border-white/25 hover:text-red-200"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>

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
