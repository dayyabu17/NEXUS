import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

const STORAGE_KEY = 'guest:notifications:unread';

const getInitialUnread = () => {
  if (typeof window === 'undefined') {
    return 0;
  }
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
};

const useGuestNotifications = (navigate) => {
  const [guestUnreadCount, setGuestUnreadCount] = useState(getInitialUnread);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const setAndBroadcastUnread = useCallback((value, shouldPersist = true) => {
    const sanitized = Math.max(Number(value) || 0, 0);
    setGuestUnreadCount(sanitized);

    if (!shouldPersist || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(sanitized));
    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new window.CustomEvent(STORAGE_KEY, { detail: sanitized }));
    }
  }, []);

  const syncUnread = useCallback(
    (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        setAndBroadcastUnread(value, false);
        return;
      }

      if (typeof window === 'undefined') {
        setAndBroadcastUnread(0, false);
        return;
      }

      const stored = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored) && stored > 0) {
        setAndBroadcastUnread(stored, false);
      } else {
        setAndBroadcastUnread(0, false);
      }
    },
    [setAndBroadcastUnread]
  );

  const fetchGuestNotifications = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError('');

    try {
      const response = await api.get('/events/guest/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(response.data?.notifications)
        ? response.data.notifications.slice(0, 5)
        : [];

      setNotificationItems(list);

      const unreadCount = typeof response.data?.unreadCount === 'number'
        ? response.data.unreadCount
        : list.filter((notification) => !notification.isRead).length;

      setAndBroadcastUnread(unreadCount, true);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load notifications.';
      setNotificationsError(message);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('user');
        }
        navigate('/sign-in');
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [navigate, setAndBroadcastUnread]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === STORAGE_KEY) {
        syncUnread();
      }
    };

    const handleCustom = (event) => {
      syncUnread(event?.detail);
    };

    syncUnread();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener(STORAGE_KEY, handleCustom);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(STORAGE_KEY, handleCustom);
      }
    };
  }, [syncUnread]);

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchGuestNotifications();
    }
  }, [isNotificationsOpen, fetchGuestNotifications]);

  return {
    guestUnreadCount,
    notificationItems,
    notificationsLoading,
    notificationsError,
    isNotificationsOpen,
    setIsNotificationsOpen,
    fetchGuestNotifications,
  };
};

export default useGuestNotifications;
