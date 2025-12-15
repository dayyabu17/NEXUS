import { forwardRef } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import BellIcon from '../../assets/icons/Bell.svg';
import { formatRelativeTime } from '../../utils/dateUtils';

const NotificationsDropdown = forwardRef(
  (
    {
      isOpen,
      unreadCount,
      items,
      isLoading,
      error,
      onToggle,
      onRefresh,
      onNavigate,
    },
    ref
  ) => (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-[#121824] dark:text-white/70 dark:hover:bg-[#1b2335] ${
          isOpen ? 'border-blue-400 text-blue-600 dark:border-white/25 dark:text-white' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Notifications"
      >
        <img src={BellIcon} alt="Notifications" className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-[2px] text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#101725]/95 dark:text-white/80 dark:shadow-[0_20px_60px_rgba(6,10,20,0.75)]"
          >
            <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-white/50">
              <span>Notifications</span>
              <span>{unreadCount} unread</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`notif-skeleton-${index}`}
                    className="animate-pulse rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-[#151c2b]"
                  >
                    <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-white/12" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-4 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-[#131c2a] dark:text-white/55">
                No notifications yet. We will keep you posted.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => onNavigate(notification.eventId)}
                    className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-[#131c2a] dark:text-white/80 dark:hover:border-white/25 ${
                      notification.isRead ? 'opacity-70' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.32em] text-slate-500 dark:text-white/55">
                      <span>{notification.headline || 'Update'}</span>
                      {notification.createdAt && <span>{formatRelativeTime(notification.createdAt)}</span>}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {notification.eventTitle || 'Event update'}
                    </p>
                    {notification.message && (
                      <p className="mt-1 max-h-10 overflow-hidden text-xs text-slate-600 dark:text-white/60">
                        {notification.message}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('ALL')}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/80 dark:hover:border-white/35 dark:hover:text-white"
              >
                View all
              </button>
              <button
                type="button"
                onClick={onRefresh}
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
              >
                Refresh
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
);

NotificationsDropdown.displayName = 'NotificationsDropdown';

export default NotificationsDropdown;
