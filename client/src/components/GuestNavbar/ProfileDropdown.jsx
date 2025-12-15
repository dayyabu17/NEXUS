const ProfileDropdown = ({
  isOpen,
  avatarUrl,
  unreadCount,
  onToggle,
  onNavigate,
  onSignOut,
}) => (
  <div className="relative">
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-[#121824] dark:text-white/70 dark:hover:bg-[#1b2335]"
      onClick={onToggle}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
    </button>
    {isOpen && (
      <div className="absolute right-0 top-12 w-48 rounded-2xl border border-slate-200 bg-white py-2 text-sm text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#101725]/95 dark:text-white/80 dark:shadow-[0_20px_50px_rgba(5,10,20,0.65)]">
        <button
          type="button"
          className="block w-full px-4 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => onNavigate('/guest/profile')}
        >
          Profile
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => onNavigate('/guest/notifications')}
        >
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-3 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600 dark:bg-red-500/20 dark:text-red-200">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="block w-full px-4 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => onNavigate('/guest/tickets')}
        >
          My Tickets
        </button>
        <button
          type="button"
          className="block w-full px-4 py-2 text-left text-red-600 transition hover:bg-slate-100 dark:text-red-300 dark:hover:bg-white/10"
          onClick={onSignOut}
        >
          Sign Out
        </button>
      </div>
    )}
  </div>
);

export default ProfileDropdown;
