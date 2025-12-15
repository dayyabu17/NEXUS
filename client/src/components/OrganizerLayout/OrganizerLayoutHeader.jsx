import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0A0F16]/70 backdrop-blur-md">
    <div className="mx-auto flex w-full max-w-[1455px] items-center justify-between px-10 py-6" data-node-id="173:25">
      <div className="flex flex-1 items-center gap-16" data-node-id="158:95">
        <button
          type="button"
          onClick={onBrandSpotlight}
          className="rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="About Nexus"
          data-node-id="143:48"
        >
          <img src={nexusIcon} alt="Nexus" className="h-8 w-8" />
        </button>

        <nav className="flex items-center gap-6" data-node-id="156:81">
          {navItems.map(({ label, path, iconActive, iconInactive }) => {
            const isActive = pathname.startsWith(path);
            const iconSrc = isActive ? iconActive ?? iconInactive : iconInactive ?? iconActive;
            const dataNodeId = label === 'Dashboard' ? '156:69' : label === 'Events' ? '156:74' : '156:80';
            const iconNodeId = label === 'Dashboard' ? '156:65' : label === 'Events' ? '156:57' : '156:67';
            return (
              <NavLink
                key={label}
                to={path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-[#7d7d7d] hover:text-white'
                }`}
                data-node-id={dataNodeId}
              >
                {iconSrc && (
                  <img
                    src={iconSrc}
                    alt={`${label} icon`}
                    className="h-6 w-6"
                    data-node-id={iconNodeId}
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
          onClick={onOpenSearch}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition hover:border-white/30"
          aria-label="Search events"
          data-node-id="156:82"
        >
          <img src={searchIcon} alt="Search" className="h-4 w-4 opacity-80" />
        </button>
        <div className="relative" ref={notificationsMenuRef}>
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
      </div>
    </div>
  </header>
);

export default OrganizerLayoutHeader;
