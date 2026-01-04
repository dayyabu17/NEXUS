import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import api from '../../api/axios';

const notificationToneStyles = {
  success: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    accent: 'hover:border-emerald-300 dark:border-emerald-500/20 dark:hover:border-emerald-500/30',
  },
  highlight: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    accent: 'hover:border-amber-300 dark:border-amber-500/25 dark:hover:border-amber-500/35',
  },
  info: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    accent: 'hover:border-blue-300 dark:border-accent-500/25 dark:hover:border-accent-500/40',
  },
  default: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70',
    accent: 'hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20',
  },
};

const formatDateLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const OrganizerNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [viewMode, setViewMode] = useState('unread');
  const broadcastUnreadCount = (value) => {
    if (typeof window === 'undefined') {
      return;
    }

    const sanitized = Math.max(0, Number(value) || 0);
    window.localStorage.setItem('organizer:notifications:unread', String(sanitized));

    if (typeof window.dispatchEvent === 'function') {
      const event = typeof window.CustomEvent === 'function'
        ? new window.CustomEvent('organizer:notifications:unread', { detail: sanitized })
        : undefined;

      if (event) {
        window.dispatchEvent(event);
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    if (viewMode === 'read') {
      return notifications.filter((notification) => notification.isRead);
    }

    if (viewMode === 'unread') {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [notifications, viewMode]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/sign-in');
      return;
    }

    try {
      const response = await api.get('/organizer/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(response.data?.notifications) ? response.data.notifications : []);
      const nextCount = Math.max(0, Number(response.data?.unreadCount) || 0);
      setUnreadCount(nextCount);
      broadcastUnreadCount(nextCount);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/sign-in');
        return;
      }
      const message = err?.response?.data?.message || 'Unable to load notifications.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    try {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      );

      const response = await api.post(
        '/organizer/notifications/read',
        { id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (typeof response.data?.unreadCount === 'number') {
        const next = Math.max(0, Number(response.data.unreadCount));
        setUnreadCount(next);
        broadcastUnreadCount(next);
      } else {
        setUnreadCount((prev) => {
          const next = Math.max(prev - 1, 0);
          broadcastUnreadCount(next);
          return next;
        });
      }
    } catch {
      await fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    try {
      setMarkingAll(true);
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      const response = await api.post(
        '/organizer/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (typeof response.data?.unreadCount === 'number') {
        const next = Math.max(0, Number(response.data.unreadCount));
        setUnreadCount(next);
        broadcastUnreadCount(next);
      } else {
        setUnreadCount(() => {
          broadcastUnreadCount(0);
          return 0;
        });
      }
    } catch {
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <OrganizerLayoutDark>
      <section className="pb-16">
        <header className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-white/50">Notifications</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Stay in the loop</h1>
            <p className="text-sm text-slate-500 dark:text-white/60">Review all updates from your events and tasks in one place.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 dark:border-white/10 dark:bg-transparent dark:text-white/60">
              {unreadCount} unread
            </span>
            <div className="relative flex w-full max-w-[220px] items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition dark:border-white/15 dark:bg-white/5">
              <span
                className={`absolute inset-y-1 w-1/2 rounded-full bg-slate-900 transition-transform duration-300 ease-out dark:bg-white/12 ${
                  viewMode === 'read' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                type="button"
                onClick={() => setViewMode('unread')}
                className={`relative z-10 flex-1 rounded-full py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  viewMode === 'unread'
                    ? 'text-white dark:text-white'
                    : 'text-slate-600 hover:text-accent-500 dark:text-slate-400 dark:hover:text-accent-400'
                }`}
                aria-pressed={viewMode === 'unread'}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setViewMode('read')}
                className={`relative z-10 flex-1 rounded-full py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  viewMode === 'read'
                    ? 'text-white dark:text-white'
                    : 'text-slate-600 hover:text-accent-500 dark:text-slate-400 dark:hover:text-accent-400'
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
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-accent-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
              >
                Mark all as read
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-center text-slate-500 dark:text-white/60">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-[rgba(12,15,20,0.8)] dark:text-white/55">
            Nothing to review yet. When updates arrive, you&apos;ll see them here.
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-[rgba(12,15,20,0.8)] dark:text-white/55">
            {viewMode === 'unread'
              ? 'You’ve caught up on all unread notifications.'
              : 'No read notifications yet. Mark updates as read to keep them here for reference.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const tone = notificationToneStyles[notification.tone] || notificationToneStyles.default;

              return (
                <article
                  key={notification.id}
                  className={`flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md ${
                    tone.accent
                  } ${
                    notification.isRead ? 'opacity-60' : 'opacity-100'
                  } dark:border-white/10 dark:bg-[rgba(18,21,30,0.8)]`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${tone.badge}`}>
                        {notification.headline || 'Update'}
                      </span>
                      <span className="text-slate-500 dark:text-white/50">{formatDateLabel(notification.createdAt)}</span>
                    </div>
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs font-medium text-accent-500 transition hover:text-accent-600"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-2 text-sm text-slate-600 dark:text-white/80">
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{notification.eventTitle || notification.title || 'Event update'}</p>
                      {notification.message && <p className="leading-relaxed text-slate-600 dark:text-white/70">{notification.message}</p>}
                      {notification.stats?.ticketsSold && (
                        <p className="text-xs text-slate-500 dark:text-white/65">
                          {notification.stats.ticketsSold} ticket{notification.stats.ticketsSold === 1 ? '' : 's'} sold in total.
                        </p>
                      )}
                      {notification.stats?.rsvpTotal && (
                        <p className="text-xs text-slate-500 dark:text-white/65">
                          {notification.stats.rsvpTotal} RSVP{notification.stats.rsvpTotal === 1 ? '' : 's'} so far.
                        </p>
                      )}
                    </div>
                    {notification.imageUrl && (
                      <div className="h-20 w-24 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                        <img src={notification.imageUrl} alt={notification.eventTitle} className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </OrganizerLayoutDark>
  );
};

export default OrganizerNotifications;
