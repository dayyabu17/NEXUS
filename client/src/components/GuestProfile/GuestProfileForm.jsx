import React from 'react';

const GuestProfileForm = ({
  profile,
  savingProfile,
  onSubmit,
  onFieldChange,
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0d1423]/65 dark:shadow-[0_24px_70px_rgba(5,10,25,0.45)]">
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/55">Account</p>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Profile settings</h3>
      <p className="text-xs text-slate-500 dark:text-white/45">Tune your identity details and keep your credentials fresh.</p>
    </div>

    <form onSubmit={onSubmit} className="mt-8 space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50" htmlFor="guest-name">
            Display name
          </label>
          <input
            id="guest-name"
            name="name"
            value={profile.name}
            onChange={onFieldChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500"
            placeholder="Add your name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50" htmlFor="guest-email">
            Email
          </label>
          <input
            id="guest-email"
            name="email"
            type="email"
            value={profile.email}
            onChange={onFieldChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-white/55">Security</h4>
          <p className="mt-2 text-xs text-slate-500 dark:text-white/45">Update your password to keep your account secure.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50" htmlFor="guest-password">
              New password
            </label>
            <input
              id="guest-password"
              name="password"
              type="password"
              value={profile.password}
              onChange={onFieldChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50" htmlFor="guest-confirm-password">
              Confirm password
            </label>
            <input
              id="guest-confirm-password"
              name="confirmPassword"
              type="password"
              value={profile.confirmPassword}
              onChange={onFieldChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500"
              placeholder="Repeat new password"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-black/30 dark:text-white/50">
        <p>Tip: Use a mix of letters, numbers, and symbols for stronger security.</p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-2xl border border-transparent bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  </section>
);

export default GuestProfileForm;
