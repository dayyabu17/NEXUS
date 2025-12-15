import React from 'react';

const AvatarSection = ({
  avatarPreview,
  avatarFile,
  uploadingAvatar,
  onAvatarSelection,
  onAvatarUpload,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[rgba(14,17,25,0.88)] p-8 shadow-[0_24px_90px_rgba(5,8,18,0.55)]">
    <span className="text-xs uppercase tracking-[0.3em] text-white/50">Profile image</span>
    <div className="mt-6 flex flex-col items-center gap-6">
      <div className="relative h-36 w-36 overflow-hidden rounded-3xl border border-white/10 bg-black/60">
        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
      </div>
      <div className="flex w-full flex-col gap-4">
        <label
          htmlFor="avatar-upload"
          className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/35 hover:text-white"
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
          className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadingAvatar ? 'Uploading…' : 'Update avatar'}
        </button>
        <p className="text-xs text-white/45">
          Use a square image at least 400px wide to keep things crisp.
        </p>
      </div>
    </div>
  </div>
);

export default AvatarSection;
