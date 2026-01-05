import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedSvg from '../../assets/icons/search_outlined.svg';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to parse stored user', error);
    return null;
  }
};

const resolveProfilePicture = (profilePicture) => {
  if (!profilePicture) {
    return DEFAULT_AVATAR;
  }

  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }

  return `http://localhost:5000/public${profilePicture}`;
};

const ProfileButton = ({ className = '', onClick, profilePicture }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative overflow-hidden rounded-full border border-gray-200 bg-gray-300 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 ${className}`}
  >
    <img
      src={profilePicture}
      alt="Profile"
      className="h-full w-full object-cover"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = DEFAULT_AVATAR;
      }}
    />
  </button>
);

const AdminHeader = ({ searchTerm, onSearchChange, onMenuToggle, theme = 'light', onThemeToggle }) => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(() => getStoredUser() || {});

  const userName = useMemo(() => storedUser?.name || 'Admin', [storedUser]);

  const profilePicture = useMemo(
    () => resolveProfilePicture(storedUser?.profilePicture),
    [storedUser?.profilePicture]
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredUser(getStoredUser() || {});
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleProfileClick = () => {
    navigate('/admin/settings');
  };

  const showSearch = typeof onSearchChange === 'function';

  const isDark = theme === 'dark';
  const handleThemeToggle = useCallback(() => {
    onThemeToggle?.();
  }, [onThemeToggle]);
  const themeToggleLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  const handleMenuToggle = () => {
    onMenuToggle?.();
  };

  return (
    <header className="border-b border-gray-200 pb-4 transition-colors duration-300 mt-4 ml-4 dark:border-gray-800 md:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3 md:block">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMenuToggle}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800 md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-nexus-dark dark:text-white md:text-3xl">Hello {userName} 👋</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">Nexus Admin Dashboard</p>
            </div>
          </div>
          <ProfileButton
            className="h-10 w-10 md:hidden"
            onClick={handleProfileClick}
            profilePicture={profilePicture}
          />
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end md:gap-4">
          {showSearch && (
            <div className="relative w-full md:w-72">
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm || ''}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-nexus-primary dark:focus:ring-blue-500/40"
              />
              <img
                src={SearchOutlinedSvg}
                alt="Search"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800 md:h-11 md:w-11"
            aria-label={themeToggleLabel}
            aria-pressed={isDark}
          >
            {isDark ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 0111.21 3a7 7 0 002.58 13.5A9 9 0 0021 12.79z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.071-7.071l-1.414 1.414M9.343 17.657l-1.414 1.414m12.728 0l-1.414-1.414M9.343 6.343L7.929 4.929" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <ProfileButton
            className="hidden h-12 w-12 md:block"
            onClick={handleProfileClick}
            profilePicture={profilePicture}
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
