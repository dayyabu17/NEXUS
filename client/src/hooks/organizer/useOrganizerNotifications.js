import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { NOTIFICATION_ANIMATION_MS } from '../../layouts/OrganizerLayout/layoutConstants';

const useOrganizerNotifications = () => {
  const navigate = useNavigate();
  const notificationsMenuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadBadge, setUnreadBadge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const animationRef = useRef(null);

  const openNotifications = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    setNotificationsVisible(true);

    if (typeof window === 'undefined') {
      setShowNotifications(true);
      return;
    }

    window.requestAnimationFrame(() => {
      setShowNotifications(true);
    });
  }, []);

  const closeNotifications = useCallback(() => {
    if (!notificationsVisible && !showNotifications) {
      return;
    }

    setShowNotifications(false);

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    animationRef.current = setTimeout(() => {
      setNotificationsVisible(false);
      animationRef.current = null;
    }, NOTIFICATION_ANIMATION_MS);
  }, [notificationsVisible, showNotifications]);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Sign in to view notifications.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get('/organizer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allNotifications = Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : Array.isArray(response.data?.activities)
          ? response.data.activities
          : [];
      const unreadNotifications = allNotifications.filter((item) => !item.isRead);
      setNotifications(unreadNotifications.slice(0, 5));

      if (typeof response.data?.unreadCount === 'number') {
        const sanitized = Math.max(0, Number(response.data.unreadCount) || 0);
        setUnreadBadge(sanitized);
        localStorage.setItem('organizer:notifications:unread', String(sanitized));
        window.dispatchEvent(
          new CustomEvent('organizer:notifications:unread', { detail: sanitized }),
        );
      }

      setLoaded(true);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
        navigate('/sign-in');
      } else {
        const message = err?.response?.data?.message || 'Unable to load notifications.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleToggleNotifications = useCallback(() => {
    if (!showNotifications) {
      setLoaded(false);
      setError('');
      openNotifications();
    } else {
      closeNotifications();
    }
  }, [closeNotifications, openNotifications, showNotifications]);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    setError('');
    setLoaded(true);
    setUnreadBadge(0);
    localStorage.setItem('organizer:notifications:unread', '0');
    window.dispatchEvent(new CustomEvent('organizer:notifications:unread', { detail: 0 }));
  }, []);

  const handleRefreshNotifications = useCallback(() => {
    setNotifications([]);
    setError('');
    setLoaded(false);
  }, []);

  useEffect(() => {
    if (!notificationsVisible) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        closeNotifications();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    if (showNotifications && !loaded && !loading) {
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeNotifications, fetchNotifications, loaded, loading, notificationsVisible, showNotifications]);

  useEffect(() => {
    const handleStorageUpdate = (event) => {
      if (event.key === 'organizer:notifications:unread') {
        const value = Number(event.newValue);
        if (!Number.isNaN(value)) {
          setUnreadBadge(Math.max(0, value));
        }
      }
    };

    const handleCustomUpdate = (event) => {
      const value = Number(event.detail);
      if (!Number.isNaN(value)) {
        setUnreadBadge(Math.max(0, value));
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('organizer:notifications:unread', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('organizer:notifications:unread', handleCustomUpdate);
    };
  }, []);

  useEffect(() => {
    const stored = Number(localStorage.getItem('organizer:notifications:unread'));
    if (!Number.isNaN(stored)) {
      setUnreadBadge(Math.max(0, stored));
    }
  }, []);

  useEffect(
    () => () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      notifications,
      unreadBadge,
      loading,
      loaded,
      error,
      showNotifications,
      notificationsVisible,
      notificationsMenuRef,
      handleToggleNotifications,
      handleClearNotifications,
      handleRefreshNotifications,
      closeNotifications,
      openNotifications,
    }),
    [
      notifications,
      unreadBadge,
      loading,
      loaded,
      error,
      showNotifications,
      notificationsVisible,
      handleToggleNotifications,
      handleClearNotifications,
      handleRefreshNotifications,
      closeNotifications,
      openNotifications,
    ],
  );
};

export default useOrganizerNotifications;
