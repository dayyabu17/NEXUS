import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const THEME_SEGMENTS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

const ProfileForm = ({
  profile,
  savingProfile,
  onSubmit,
  onFieldChange,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleThemeSelect = (value) => {
    if (value === theme) {
      return;
    }

    if (value === 'system') {
      setTheme('system', { skipServerSync: true });
      return;
    }

    setTheme(value);
  };

  const activeThemeDescription = theme === 'system'
    ? `Following device · ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`
    : `Active · ${theme === 'dark' ? 'Dark' : 'Light'}`;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.1)] backdrop-blur dark:border-white/10 dark:bg-[rgba(14,17,25,0.88)] dark:shadow-[0_24px_90px_rgba(5,8,18,0.55)]"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50" htmlFor="name">
            Display name
          </label>
          <input
            id="name"
            name="name"
            value={profile.name}
            onChange={onFieldChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
            placeholder="Enter your name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={onFieldChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-white/55">App Preferences</h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-white/45">
            Personalize how Nexus should look on this device.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm transition-colors dark:border-white/10 dark:bg-black/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-800 dark:text-white">Interface Theme</p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/45">
              {activeThemeDescription}
            </span>
          </div>
          <div
            className="mt-4 flex flex-wrap gap-3"
            role="radiogroup"
            aria-label="Interface theme"
          >
            {THEME_SEGMENTS.map(({ value, label, Icon }) => {
              const isActive = theme === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleThemeSelect(value)}
                  className={`flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary/60 ${
                    isActive
                      ? 'bg-nexus-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {theme === 'system' && (
            <p className="mt-3 text-xs text-slate-500 dark:text-white/55">
              Adapts automatically when your device switches between light and dark.
            </p>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-white/55">Security</h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-white/45">
            Update your password regularly to keep your account safe.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={profile.password}
              onChange={onFieldChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-white/50" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={profile.confirmPassword}
              onChange={onFieldChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
              placeholder="Repeat new password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-2xl border border-slate-200 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
