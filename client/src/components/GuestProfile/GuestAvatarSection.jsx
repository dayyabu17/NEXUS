import React from 'react';

const GuestAvatarSection = ({
  renderNexusIdCard,
  avatarPreview,
  profile,
  memberSince,
  userHandle,
  badgeText,
  shareFeedback,
  onShare,
  onAvatarSelection,
  onAvatarUpload,
  avatarFile,
  uploadingAvatar,
}) => (
  <div className="space-y-6 lg:sticky lg:top-28">
    {renderNexusIdCard({
      avatar: avatarPreview,
      displayName: profile.name,
      memberSince,
      userHandle,
      onShare,
    })}

    {shareFeedback && (
      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-100 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100">
        {shareFeedback}
      </div>
    )}

    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/75 dark:shadow-[0_24px_70px_rgba(5,10,25,0.48)]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-[#10192f]">
          <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name || 'Guest Explorer'}</p>
          <p className="text-sm text-slate-600 dark:text-white/60">{profile.email || 'Add your email to personalize'}</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-white/5 dark:text-white/60">
            {badgeText}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <label
          htmlFor="guest-avatar-upload"
          className="block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-white/5 dark:text-white/80 dark:hover:border-slate-600 dark:hover:text-white"
        >
          Choose new photo
        </label>
        <input
          id="guest-avatar-upload"
          type="file"
          accept="image/*"
          onChange={onAvatarSelection}
          className="hidden"
        />
        <button
          type="button"
          onClick={onAvatarUpload}
          disabled={!avatarFile || uploadingAvatar}
          className="w-full rounded-2xl border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadingAvatar ? 'Uploading…' : 'Update photo'}
        </button>
        <p className="text-xs text-slate-500 dark:text-white/45">Use a square image at least 400px wide for best results.</p>
      </div>
    </section>
  </div>
);

export default GuestAvatarSection;
