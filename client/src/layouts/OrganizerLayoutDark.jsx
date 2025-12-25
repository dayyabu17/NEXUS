import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
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
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const timer = typeof window !== 'undefined'
      ? window.setTimeout(() => setIsMobileMenuOpen(false), 0)
      : null;

    return () => {
      if (timer !== null && typeof window !== 'undefined') {
        window.clearTimeout(timer);
      }
    };
  }, [routerLocation.pathname, isMobileMenuOpen]);

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
            className="relative flex h-full w-full flex-col items-center justify-center px-8"
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

            <nav className="flex flex-col items-center gap-7 text-center" aria-label="Organizer mobile navigation">
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
