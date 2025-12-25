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
      className={`flex items-center gap-2 rounded-full border border-white/15 px-1 py-1 transition hover:border-white/35 ${
        showProfileMenu ? 'border-white/35 bg-white/5' : ''
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
        <p className="font-semibold text-white">{displayName}</p>
        <p className="text-white/55">Organizer</p>
      </div>
    </button>
    {showProfileMenu && (
      <div className="absolute right-0 mt-3 min-w-[180px] rounded-3xl border border-white/10 bg-[#0A0F16]/95 p-3 text-sm shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onPreferences}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Account Settings
          <span className="text-[10px] text-white/40">Profile</span>
        </button>
        <button
          type="button"
          onClick={onAppPreferences}
          className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          App Preferences
          <span className="text-[10px] text-white/40">⌘ + ,</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
        >
          Log out
          <span className="text-[10px] text-white/40">⇧ ⌘ Q</span>
        </button>
      </div>
    )}
  </div>
);

export default OrganizerProfileMenu;
