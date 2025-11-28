import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
import api from '../api/axios';

const toneStyles = {
  success: {
    badge: 'bg-emerald-500/20 text-emerald-100',
    card: 'border-emerald-500/20 hover:border-emerald-500/35',
  },
  highlight: {
    badge: 'bg-amber-500/25 text-amber-100',
    card: 'border-amber-500/25 hover:border-amber-500/40',
  },
  info: {
    badge: 'bg-accent-500/20 text-white/80',
    card: 'border-accent-500/25 hover:border-accent-500/40',
  },
  default: {
    badge: 'bg-white/12 text-white/70',
    card: 'border-white/12 hover:border-white/20',
  },
};

const relativeTimeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const ranges = [
    { limit: minute, value: diff / 1000, unit: 'second' },
    { limit: hour, value: diff / minute, unit: 'minute' },
    { limit: day, value: diff / hour, unit: 'hour' },
    { limit: week, value: diff / day, unit: 'day' },
    { limit: month, value: diff / week, unit: 'week' },
    { limit: year, value: diff / month, unit: 'month' },
    { limit: Infinity, value: diff / year, unit: 'year' },
  ];

  const range = ranges.find((item) => abs < item.limit) || ranges[ranges.length - 1];
  const valueRounded = Math.round(range.value);

  if (relativeTimeFormatter) {
    return relativeTimeFormatter.format(valueRounded, range.unit);
  }

  const suffix = diff < 0 ? 'ago' : 'from now';
  const amount = Math.abs(valueRounded);
  const plural = amount === 1 ? range.unit : `${range.unit}s`;
  return `${amount} ${plural} ${suffix}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const broadcastUnread = (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized = Math.max(0, Number(value) || 0);
  window.localStorage.setItem('guest:notifications:unread', String(sanitized));

  if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new window.CustomEvent('guest:notifications:unread', { detail: sanitized }));
  }
};

const GuestNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('unread');
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (viewMode === 'unread') {
      return notifications.filter((notification) => !notification.isRead);
    }

    if (viewMode === 'read') {
      return notifications.filter((notification) => notification.isRead);
    }

    return notifications;
  }, [notifications, viewMode]);

  const fetchNotifications = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get('/events/guest/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : [];

      setNotifications(list);
      const nextUnread = typeof response.data?.unreadCount === 'number'
        ? response.data.unreadCount
        : list.filter((notification) => !notification.isRead).length;
      broadcastUnread(nextUnread);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load notifications right now.';
      setErrorMessage(message);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        navigate('/sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id) => {
    if (!id) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    const wasUnread = notifications.some((notification) => notification.id === id && !notification.isRead);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );

    if (wasUnread) {
      broadcastUnread(Math.max(unreadCount - 1, 0));
    }

    try {
      const response = await api.post(
        '/events/guest/notifications/read',
        { id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (typeof response.data?.unreadCount === 'number') {
        broadcastUnread(response.data.unreadCount);
      }
    } catch (error) {
      console.warn('Failed to mark notification as read', error);
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    setMarkingAll(true);
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    broadcastUnread(0);

    try {
      const response = await api.post(
        '/events/guest/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const nextUnread = typeof response.data?.unreadCount === 'number' ? response.data.unreadCount : 0;
      broadcastUnread(nextUnread);
    } catch (error) {
      console.warn('Failed to mark all notifications as read', error);
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleViewEvent = (eventId) => {
    if (!eventId) {
      return;
    }
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GuestNavbar />

      <main className="mx-auto max-w-5xl px-6 pb-16 pt-24">
        <section className="space-y-12">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
                Notifications
              </p>
              <h1 className="text-3xl font-semibold text-white">Stay updated</h1>
              <p className="text-sm text-white/60">
                All alerts about your tickets, upcoming events, and follow-ups live here.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                {unreadCount} unread
              </span>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <button
                  type="button"
                  onClick={() => setViewMode('unread')}
                  className={`rounded-full px-4 py-1 transition ${
                    viewMode === 'unread' ? 'bg-white/15 text-white' : 'text-white/60'
                  }`}
                  aria-pressed={viewMode === 'unread'}
                >
                  Unread
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`rounded-full px-4 py-1 transition ${
                    viewMode === 'all' ? 'bg-white/15 text-white' : 'text-white/60'
                  }`}
                  aria-pressed={viewMode === 'all'}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('read')}
                  className={`rounded-full px-4 py-1 transition ${
                    viewMode === 'read' ? 'bg-white/15 text-white' : 'text-white/60'
                  }`}
                  aria-pressed={viewMode === 'read'}
                >
                  Read
                </button>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll || unreadCount === 0}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </header>

          {errorMessage && !isLoading && (
            <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`notification-skeleton-${index}`}
                  className="animate-pulse rounded-3xl border border-white/10 bg-[#141b2a] p-6"
                >
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-white/12" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-white/8" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[rgba(14,18,28,0.85)] px-6 py-14 text-center text-sm text-white/55">
              No notifications yet. We will let you know when something needs your attention.
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[rgba(14,18,28,0.85)] px-6 py-14 text-center text-sm text-white/55">
              {viewMode === 'unread'
                ? 'You have read every notification. Nice!'
                : 'No notifications in this view right now.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const tone = toneStyles[notification.tone] || toneStyles.default;
                return (
                  <Motion.article
                    key={notification.id}
                    layout
                    className={`flex flex-col gap-5 rounded-3xl border bg-[rgba(16,21,32,0.85)] px-6 py-5 transition ${tone.card} ${
                      notification.isRead ? 'opacity-70' : 'opacity-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${tone.badge}`}
                        >
                          {notification.headline || 'Update'}
                        </span>
                        {notification.createdAt && (
                          <span className="text-white/50">{formatRelativeTime(notification.createdAt)}</span>
                        )}
                      </div>
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-semibold text-accent-400 transition hover:text-accent-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 text-sm text-white/75">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {notification.eventTitle || 'Event update'}
                        </p>
                        {notification.message && (
                          <p className="mt-1 text-white/70">{notification.message}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-white/60">
                        {notification.eventDate && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span aria-hidden>📅</span>
                            <span>{formatDateTime(notification.eventDate)}</span>
                          </span>
                        )}
                        {notification.location && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span aria-hidden>📍</span>
                            <span className="max-w-[12rem] truncate" title={notification.location}>
                              {notification.location}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                      {notification.createdAt && (
                        <span>
                          Logged {formatDateTime(notification.createdAt)}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewEvent(notification.eventId)}
                          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/30"
                        >
                          View event
                        </button>
                      </div>
                    </div>
                  </Motion.article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GuestNotifications;
