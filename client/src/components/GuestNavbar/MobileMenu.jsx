import { AnimatePresence, motion as Motion } from 'framer-motion';
import SearchIcon from '../../assets/icons/Search.svg';
import BellIcon from '../../assets/icons/Bell.svg';

const MobileMenu = ({
  isOpen,
  locationName,
  isModalOpen,
  onClose,
  onLocationClick,
  onSignOut,
  onNavigate,
  onOpenSearch,
  navLinks,
  unreadCount,
  avatarUrl,
}) => (
  <AnimatePresence>
    {isOpen && (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] flex flex-col bg-white/95 text-slate-900 backdrop-blur-md md:hidden dark:bg-[rgba(8,12,20,0.88)] dark:text-white"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/20"
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="flex h-full flex-col px-6 pb-10 pt-20 text-slate-900 dark:text-white">
          <Motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onLocationClick}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-white/25 dark:bg-white/10 dark:text-white/85 dark:hover:border-white/45 dark:hover:bg-white/15"
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>📍</span>
                <span className="truncate">{locationName}</span>
              </span>
              <span aria-hidden className="text-xs text-slate-500 dark:text-white/80">▾</span>
            </button>
          </Motion.div>

          <Motion.nav
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-16 flex flex-col items-center gap-8"
          >
            {navLinks.map(({ label, to }) => (
              <button
                key={`mobile-overlay-${label}`}
                type="button"
                onClick={() => onNavigate(to)}
                className="text-2xl font-semibold uppercase tracking-[0.24em] text-slate-800 transition hover:text-blue-500 dark:text-white/85 dark:hover:text-white"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onSignOut}
              className="text-lg font-semibold uppercase tracking-[0.24em] text-red-500 transition hover:text-red-600 dark:text-red-300 dark:hover:text-red-200"
            >
              Sign Out
            </button>
          </Motion.nav>

          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-auto flex items-center justify-center gap-6"
          >
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/30 dark:bg-white/15 dark:text-white/85 dark:hover:border-white/50 dark:hover:bg-white/25"
              aria-label="Open search"
            >
              <img src={SearchIcon} alt="Search" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/guest/notifications')}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/30 dark:bg-white/15 dark:text-white/85 dark:hover:border-white/50 dark:hover:bg-white/25"
              aria-label="View notifications"
            >
              <img src={BellIcon} alt="Notifications" className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-[2px] text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/guest/profile')}
              className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:bg-slate-100 dark:border-white/30 dark:bg-white/15 dark:hover:border-white/50 dark:hover:bg-white/25"
              aria-label="View profile"
            >
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            </button>
          </Motion.div>
        </div>
      </Motion.div>
    )}
  </AnimatePresence>
);

export default MobileMenu;
