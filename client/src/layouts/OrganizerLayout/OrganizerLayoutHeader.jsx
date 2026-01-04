import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ORGANIZER_NAV_ITEMS } from '../../constants/navigation';
import nexusIcon from '../../assets/icons/nexus-icon.svg';
import searchIcon from '../../assets/icons/Search.svg';
import bellIcon from '../../assets/icons/Bell.svg';
import OrganizerNotificationsPanel from './OrganizerNotificationsPanel';
import OrganizerProfileMenu from './OrganizerProfileMenu';

const OrganizerLayoutHeader = ({
  currentTime,
  onBrandSpotlight,
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  onOpenSearch,
  unreadBadge,
  showNotifications,
  notificationsVisible,
  notificationsLoading,
  notificationsError,
  notifications,
  onToggleNotifications,
  onRefreshNotifications,
  onClearNotifications,
  onCloseNotifications,
  formatNotificationTimestamp,
  notificationToneStyles,
  getNotificationInitial,
  notificationsMenuRef,
  profileMenuProps,
}) => (
  <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 pt-3 pb-3 text-slate-900 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/50 dark:text-white md:px-10 md:py-4">
    <div className="mx-auto flex w-full max-w-[1455px] items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:gap-10">
        <button
          type="button"
          onClick={onBrandSpotlight}
          className="rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/60"
          aria-label="About Nexus"
        >
          <img src={nexusIcon} alt="Nexus" className="h-8 w-8" />
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {ORGANIZER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'border border-slate-200 bg-slate-100 text-nexus-primary shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <>
                      <img src={item.iconInactive} alt={item.label} className="block h-5 w-5 transition-transform group-hover:scale-105 dark:hidden" />
                      <img src={item.iconActive} alt={item.label} className="hidden h-5 w-5 transition-transform group-hover:scale-105 dark:block" />
                    </>
                  ) : (
                    <img
                      src={item.iconInactive}
                      alt={item.label}
                      className="h-5 w-5 opacity-70 transition-transform group-hover:scale-105 group-hover:opacity-100"
                    />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && <span className="sr-only">(current)</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-5 text-sm">
        <span className="hidden text-slate-500 dark:text-slate-400 md:block">{currentTime}</span>

        <Link
          to="/organizer/events/create"
          className="hidden items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-nexus-primary dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/40 md:flex"
        >
          Create Event
        </Link>

        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-400 hover:text-nexus-primary dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-white/30 md:flex"
          aria-label="Search events"
        >
          <img src={searchIcon} alt="Search" className="h-4 w-4 opacity-80" />
        </button>

        <div className="relative hidden md:block" ref={notificationsMenuRef}>
          <button
            type="button"
            onClick={onToggleNotifications}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition dark:border-white/30 dark:bg-transparent dark:text-white ${
              showNotifications
                ? 'border-nexus-primary text-nexus-primary dark:border-white dark:text-white'
                : 'hover:border-slate-400 hover:text-nexus-primary dark:hover:border-white/50 dark:hover:text-white'
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
          <OrganizerNotificationsPanel
            notificationsVisible={notificationsVisible}
            showNotifications={showNotifications}
            notificationsLoading={notificationsLoading}
            notificationsError={notificationsError}
            notifications={notifications}
            onRefresh={onRefreshNotifications}
            onClear={onClearNotifications}
            onClose={onCloseNotifications}
            formatNotificationTimestamp={formatNotificationTimestamp}
            notificationToneStyles={notificationToneStyles}
            getNotificationInitial={getNotificationInitial}
          />
        </div>

        <OrganizerProfileMenu
          showProfileMenu={profileMenuProps.showProfileMenu}
          profileMenuRef={profileMenuProps.profileMenuRef}
          profileImageSrc={profileMenuProps.profileImageSrc}
          displayName={profileMenuProps.displayName}
          onToggleProfileMenu={profileMenuProps.onToggleProfileMenu}
          onPreferences={profileMenuProps.onPreferences}
          onAppPreferences={profileMenuProps.onAppPreferences}
          onLogout={profileMenuProps.onLogout}
        />

        <button
          type="button"
          onClick={() => onOpenMobileMenu?.()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-nexus-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:focus-visible:ring-white/60 md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="organizer-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
);

export default OrganizerLayoutHeader;
