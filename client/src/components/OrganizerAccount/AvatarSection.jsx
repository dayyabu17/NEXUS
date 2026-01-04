import React from 'react';

const AvatarSection = ({
  avatarPreview,
  avatarFile,
  uploadingAvatar,
  onAvatarSelection,
  onAvatarUpload,
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(14,17,25,0.88)] dark:text-white dark:shadow-[0_24px_90px_rgba(5,8,18,0.55)]">
    <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Profile image</span>
    <div className="mt-6 flex flex-col items-center gap-6">
      <div className="relative h-36 w-36 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/60">
        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
      </div>
      <div className="flex w-full flex-col gap-4">
        <label
          htmlFor="avatar-upload"
          className="flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Choose new avatar
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onAvatarSelection}
          className="hidden"
        />
        <button
          type="button"
          onClick={onAvatarUpload}
          disabled={!avatarFile || uploadingAvatar}
          className="rounded-2xl border border-transparent bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {uploadingAvatar ? 'Uploading…' : 'Update avatar'}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use a square image at least 400px wide to keep things crisp.
        </p>
      </div>
    </div>
  </div>
);

export default AvatarSection;
