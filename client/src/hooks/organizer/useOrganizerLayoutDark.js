import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAccentColorSync from '../useAccentColorSync';
import useOrganizerProfile from './useOrganizerProfile';
import useOrganizerNotifications from './useOrganizerNotifications';
import useLayoutUI from '../useLayoutUI';
import { NAV_ITEMS } from '../../layouts/OrganizerLayout/layoutConstants';
import { getNotificationInitial, notificationToneStyles } from '../../layouts/OrganizerLayout/layoutUtils';

const useOrganizerLayoutDark = (suppressInitialLoader = false) => {
  useAccentColorSync();

  const navigate = useNavigate();

  const {
    organizerProfile,
    displayName,
    profileImageSrc,
    fetchProfile,
    handleLogout: baseHandleLogout,
    handlePreferences: baseHandlePreferences,
    handleAppPreferences: baseHandleAppPreferences,
  } = useOrganizerProfile();

  const {
    location,
    currentTime,
    showSearch,
    openSearch,
    closeSearch,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef,
    showInitialLoader,
    showBrandSpotlight,
    handleBrandSpotlight,
    handleCloseBrandSpotlight,
  } = useLayoutUI(suppressInitialLoader);

  const {
    notifications,
    unreadBadge,
    loading: notificationsLoading,
    loaded: notificationsLoaded,
    error: notificationsError,
    showNotifications,
    notificationsVisible,
    notificationsMenuRef,
    handleToggleNotifications: baseHandleToggleNotifications,
    handleClearNotifications,
    handleRefreshNotifications,
    closeNotifications,
  } = useOrganizerNotifications();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const formatNotificationTimestamp = useCallback((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleToggleProfileMenu = useCallback(() => {
    setShowProfileMenu((prev) => !prev);
    closeNotifications();
  }, [closeNotifications, setShowProfileMenu]);

  const handleToggleNotifications = useCallback(() => {
    setShowProfileMenu(false);
    baseHandleToggleNotifications();
  }, [baseHandleToggleNotifications, setShowProfileMenu]);

  const handleLogout = useCallback(() => {
    setShowProfileMenu(false);
    baseHandleLogout();
  }, [baseHandleLogout, setShowProfileMenu]);

  const handlePreferences = useCallback(() => {
    setShowProfileMenu(false);
    baseHandlePreferences();
  }, [baseHandlePreferences, setShowProfileMenu]);

  const handleAppPreferences = useCallback(() => {
    setShowProfileMenu(false);
    baseHandleAppPreferences();
  }, [baseHandleAppPreferences, setShowProfileMenu]);

  const organizerQuickLinks = useMemo(
    () => [
      {
        title: 'Create Event',
        icon: '+',
        action: () => navigate('/organizer/events/create'),
      },
      {
        title: 'Upcoming Events',
        icon: '↗',
        action: () => navigate('/organizer/events'),
      },
    ],
    [navigate],
  );

  return {
    location,
    currentTime,
    navItems: NAV_ITEMS,
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
    notificationsLoaded,
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
    suppressInitialLoader,
    organizerProfile,
    setShowProfileMenu,
  };
};

export default useOrganizerLayoutDark;
