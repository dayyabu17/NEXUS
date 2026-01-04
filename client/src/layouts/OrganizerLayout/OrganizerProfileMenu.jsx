import React from 'react';

const OrganizerProfileMenu = ({
  showProfileMenu,
  profileMenuRef,
  profileImageSrc,
  displayName,
  onToggleProfileMenu,
  onPreferences,
  onAppPreferences,
  onLogout,
}) => (
  <div className="relative" ref={profileMenuRef}>
    <button
      type="button"
      onClick={onToggleProfileMenu}
      className={`flex items-center gap-2 rounded-full border border-slate-200 px-1 py-1 text-slate-700 transition hover:border-slate-400 dark:border-white/15 dark:text-white dark:hover:border-white/35 ${
        showProfileMenu ? 'bg-white/80 dark:bg-white/5' : ''
      }`}
      aria-haspopup="menu"
      aria-expanded={showProfileMenu}
    >
      <img
        src={profileImageSrc}
        alt="Organizer avatar"
        className="h-9 w-9 rounded-full object-cover"
      />
      <div className="hidden text-left text-xs sm:block">
        <p className="font-semibold text-slate-900 dark:text-white">{displayName}</p>
        <p className="text-slate-500 dark:text-white/55">Organizer</p>
      </div>
    </button>
    {showProfileMenu && (
      <div className="absolute right-0 mt-3 min-w-[180px] rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-[#0A0F16]/95 dark:text-white">
        <button
          type="button"
          onClick={onPreferences}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
        >
          Account Settings
          <span className="text-[10px] text-slate-400 dark:text-white/40">Profile</span>
        </button>
        <button
          type="button"
          onClick={onAppPreferences}
          className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
        >
          App Preferences
          <span className="text-[10px] text-slate-400 dark:text-white/40">⌘ + ,</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-rose-500 transition hover:bg-rose-100 hover:text-rose-600 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:hover:text-white"
        >
          Log out
          <span className="text-[10px] text-slate-400 dark:text-white/40">⇧ ⌘ Q</span>
        </button>
      </div>
    )}
  </div>
);

export default OrganizerProfileMenu;
