import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import OrganizerLayoutHeader from './OrganizerLayout/OrganizerLayoutHeader';
import OrganizerBrandSpotlight from './OrganizerLayout/OrganizerBrandSpotlight';
import OrganizerInitialLoader from './OrganizerLayout/OrganizerInitialLoader';
import useOrganizerLayoutDark from '../hooks/organizer/useOrganizerLayoutDark';

const OrganizerLayoutDark = ({ children, suppressInitialLoader = false }) => {
  const {
    location,
    currentTime,
    navItems,
    showSearch,
    openSearch,
    closeSearch,
    showProfileMenu,
    profileMenuRef,
    handleToggleProfileMenu,
    displayName,
    profileImageSrc,
    handlePreferences,
    handleAppPreferences,
    handleLogout,
    showNotifications,
    notificationsVisible,
    notificationsMenuRef,
    unreadBadge,
    handleToggleNotifications,
    notificationsLoading,
    notificationsError,
    notifications,
    handleClearNotifications,
    handleRefreshNotifications,
    closeNotifications,
    formatNotificationTimestamp,
    notificationToneStyles,
    getNotificationInitial,
    showBrandSpotlight,
    handleBrandSpotlight,
    handleCloseBrandSpotlight,
    organizerQuickLinks,
    showInitialLoader,
  } = useOrganizerLayoutDark(suppressInitialLoader);

  const routerLocation = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobileMenuOpenRef = useRef(false);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpenRef.current) {
      return undefined;
    }

    const timer = typeof window !== 'undefined'
      ? window.setTimeout(() => {
          setIsMobileMenuOpen(false);
        }, 0)
      : null;

    return () => {
      if (timer !== null && typeof window !== 'undefined') {
        window.clearTimeout(timer);
      }
    };
  }, [routerLocation.pathname]);

  const profileMenuProps = {
    showProfileMenu,
    profileMenuRef,
    profileImageSrc,
    displayName,
    onToggleProfileMenu: handleToggleProfileMenu,
    onPreferences: handlePreferences,
    onAppPreferences: handleAppPreferences,
    onLogout: handleLogout,
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-[#0A121E] via-[#050912] to-[#020305] text-white"
      data-name="Organizer_Layout_Dark"
      data-node-id="138:24"
    >
      {isMobileMenuOpen && (
        <div
          id="organizer-mobile-menu"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md"
          onClick={handleCloseMobileMenu}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex h-full w-full flex-col justify-between px-8 pb-16 pt-20"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseMobileMenu}
              className="absolute right-6 top-12 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex h-full flex-col items-center gap-10">
              <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/5 px-6 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Current Time</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{currentTime}</p>
              </div>

              <nav className="flex w-full flex-col items-center gap-7 text-center" aria-label="Organizer mobile navigation">
                {navItems.map(({ label, path }) => (
                  <NavLink
                    key={label}
                    to={path}
                    onClick={handleMobileNavClick}
                    className={({ isActive }) =>
                      `text-2xl font-semibold tracking-wide transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-white/70 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>

              <NavLink
                to="/organizer/events/create"
                onClick={handleMobileNavClick}
                className="w-full max-w-sm rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_16px_45px_rgba(91,104,219,0.45)] transition hover:shadow-[0_20px_55px_rgba(91,104,219,0.55)]"
              >
                Create Event
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400 transition hover:text-red-300"
              >
                Sign Out
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSearch();
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/10"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleToggleNotifications();
                }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/10"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadBadge > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-[2px] text-[10px] font-semibold text-white">
                    {unreadBadge > 9 ? '9+' : unreadBadge}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <OrganizerLayoutHeader
        currentTime={currentTime}
        navItems={navItems}
        pathname={location.pathname}
        onBrandSpotlight={handleBrandSpotlight}
        onOpenMobileMenu={handleOpenMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenSearch={openSearch}
        unreadBadge={unreadBadge}
        showNotifications={showNotifications}
        notificationsVisible={notificationsVisible}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
        notifications={notifications}
        onToggleNotifications={handleToggleNotifications}
        onRefreshNotifications={handleRefreshNotifications}
        onClearNotifications={handleClearNotifications}
        onCloseNotifications={closeNotifications}
        formatNotificationTimestamp={formatNotificationTimestamp}
        notificationToneStyles={notificationToneStyles}
        getNotificationInitial={getNotificationInitial}
        notificationsMenuRef={notificationsMenuRef}
        profileMenuProps={profileMenuProps}
      />

      <main className="pt-6 md:pt-10">
        <div className="mx-auto flex w-full max-w-[1455px] gap-8 px-4 pb-16 md:gap-10 md:px-10">
          <section className="relative flex-1">
            {children}
          </section>

          <OrganizerBrandSpotlight
            show={showBrandSpotlight}
            onClose={handleCloseBrandSpotlight}
            organizerQuickLinks={organizerQuickLinks}
          />
        </div>
      </main>

      <GlobalSearch
        isOpen={showSearch}
        onClose={closeSearch}
        quickLinks={organizerQuickLinks}
      />

      <OrganizerInitialLoader
        show={showInitialLoader && !suppressInitialLoader}
      />
    </div>
  );
};

export default OrganizerLayoutDark;
