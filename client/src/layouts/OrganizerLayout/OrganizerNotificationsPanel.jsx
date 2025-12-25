import React from 'react';
import { Link } from 'react-router-dom';

const OrganizerNotificationsPanel = ({
  notificationsVisible,
  showNotifications,
  notificationsLoading,
  notificationsError,
  notifications,
  onRefresh,
  onClear,
  onClose,
  formatNotificationTimestamp,
  notificationToneStyles,
  getNotificationInitial,
}) => (
  notificationsVisible && (
    <div
      className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/10 bg-[rgba(12,15,22,0.95)] p-4 text-sm text-white shadow-[0_22px_80px_rgba(4,8,18,0.6)] backdrop-blur will-change-transform"
      style={{
        transform: showNotifications ? 'translateY(0)' : 'translateY(-12px)',
        opacity: showNotifications ? 1 : 0,
        transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 224ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: showNotifications ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Latest updates
        </h3>
        <div className="flex items-center gap-2">
          <Link
            to="/organizer/notifications"
            onClick={onClose}
            className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 transition hover:border-white/60 hover:text-white"
          >
            View all
          </Link>
          {notificationsLoading && <span className="text-xs text-white/40">Loading…</span>}
          {!notificationsLoading && (
            <>
              <button
                type="button"
                onClick={onRefresh}
                disabled={notificationsLoading}
                className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 transition hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Refresh
              </button>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={notificationsLoading}
                  className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 transition hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {!notificationsLoading && notificationsError && (
        <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-3 text-xs text-red-200">
          {notificationsError}
        </p>
      )}
      {!notificationsLoading && !notificationsError && notifications.length === 0 && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/40 px-3 py-4 text-xs text-white/60">
          No notifications yet.
        </p>
      )}
      {!notificationsLoading && !notificationsError && notifications.length > 0 && (
        <div className="relative mt-4">
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full dark:scrollbar-thumb-gray-600 dark:scrollbar-track-transparent">
            {notifications.map((item) => {
              const tone = notificationToneStyles[item.tone] || notificationToneStyles.default;
              const headline = item.headline || item.type || 'Update';
              const headlineLabel = typeof headline === 'string'
                ? headline.toUpperCase()
                : 'UPDATE';
              const primaryTitle = item.eventTitle || item.title || 'New activity';
              const timestampLabel = formatNotificationTimestamp(item.createdAt);
              const showTimestamp = Boolean(timestampLabel);

              return (
                <li
                  key={item.id ?? `${primaryTitle}-${item.createdAt}`}
                  className={`group flex items-start gap-3 rounded-3xl border border-transparent bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.08] ${tone.accent}`}
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-xs font-semibold">
                    <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${tone.dot}`} />
                    <span className={`text-base font-bold ${tone.iconColor}`}>
                      {getNotificationInitial(item.organizerName || item.title || item.eventTitle)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50">
                        {headlineLabel}
                      </p>
                      {showTimestamp && (
                        <span className="text-[10px] font-medium text-white/40">
                          {timestampLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white/90">{primaryTitle}</p>
                    {item.message && (
                      <p className="mt-1 text-xs text-white/60">{item.message}</p>
                    )}
                    {item.actionLabel && item.actionHref && (
                      <Link
                        to={item.actionHref}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-500 transition hover:text-accent-600"
                      >
                        {item.actionLabel}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  )
);

export default OrganizerNotificationsPanel;
