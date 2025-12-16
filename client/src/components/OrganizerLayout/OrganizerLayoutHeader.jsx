import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import nexusIcon from '../../assets/icons/nexus-icon.svg';
import searchIcon from '../../assets/icons/Search.svg';
import bellIcon from '../../assets/icons/Bell.svg';
import OrganizerNotificationsPanel from './OrganizerNotificationsPanel';
import OrganizerProfileMenu from './OrganizerProfileMenu';

const OrganizerLayoutHeader = ({
  currentTime,
  navItems,
  pathname,
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
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0F16]/70 px-4 pt-12 pb-3 backdrop-blur-md md:px-10 md:py-4">
    <div className="mx-auto flex w-full max-w-[1455px] items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:gap-10">
        <button
          type="button"
          onClick={onBrandSpotlight}
          className="rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="About Nexus"
        >
          <img src={nexusIcon} alt="Nexus" className="h-8 w-8" />
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map(({ label, path, iconActive, iconInactive }) => {
            const isActive = pathname.startsWith(path);
            const iconSrc = isActive ? iconActive ?? iconInactive : iconInactive ?? iconActive;

            return (
              <NavLink
                key={label}
                to={path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-[#7d7d7d] hover:text-white'
                }`}
              >
                {iconSrc && <img src={iconSrc} alt={`${label} icon`} className="h-6 w-6" />}
                <span>{label}</span>
                {isActive && <span className="sr-only">(current)</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-5 text-sm">
        <span className="hidden text-[#acacac] md:block">{currentTime}</span>

        <Link
          to="/organizer/events/create"
          className="hidden items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 md:flex"
        >
          Create Event
        </Link>

        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition hover:border-white/30 md:flex"
          aria-label="Search events"
        >
          <img src={searchIcon} alt="Search" className="h-4 w-4 opacity-80" />
        </button>

        <div className="relative hidden md:block" ref={notificationsMenuRef}>
          <button
            type="button"
            onClick={onToggleNotifications}
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
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
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
