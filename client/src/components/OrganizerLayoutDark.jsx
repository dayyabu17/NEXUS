import React from 'react';
import GlobalSearch from './GlobalSearch';
import OrganizerLayoutHeader from './OrganizerLayout/OrganizerLayoutHeader';
import OrganizerBrandSpotlight from './OrganizerLayout/OrganizerBrandSpotlight';
import OrganizerInitialLoader from './OrganizerLayout/OrganizerInitialLoader';
import useOrganizerLayoutDark from '../hooks/useOrganizerLayoutDark';

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
      <OrganizerLayoutHeader
        currentTime={currentTime}
        navItems={navItems}
        pathname={location.pathname}
        onBrandSpotlight={handleBrandSpotlight}
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

      <main className="pt-[132px]">
        <div className="mx-auto flex w-full max-w-[1455px] gap-8 px-10 pb-16">
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
