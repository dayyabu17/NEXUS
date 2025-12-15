import React from 'react';

const ProfileForm = ({
  profile,
  savingProfile,
  onSubmit,
  onFieldChange,
}) => (
  <form
    onSubmit={onSubmit}
    className="space-y-8 rounded-3xl border border-white/10 bg-[rgba(14,17,25,0.88)] p-8 shadow-[0_24px_90px_rgba(5,8,18,0.55)]"
  >
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="name">
          Display name
        </label>
        <input
          id="name"
          name="name"
          value={profile.name}
          onChange={onFieldChange}
          className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
          placeholder="Enter your name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={profile.email}
          onChange={onFieldChange}
          className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">Security</h2>
        <p className="mt-2 text-xs text-white/45">
          Update your password regularly to keep your account safe.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={profile.password}
            onChange={onFieldChange}
            className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
            placeholder="Leave blank to keep current"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-white/50" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={profile.confirmPassword}
            onChange={onFieldChange}
            className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
            placeholder="Repeat new password"
          />
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={savingProfile}
        className="rounded-2xl border border-white/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {savingProfile ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  </form>
);

export default ProfileForm;
