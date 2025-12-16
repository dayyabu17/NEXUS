import React from 'react';

const SettingsForm = ({
  theme,
  formData,
  profilePicture,
  defaultAvatarUrl,
  selectedFile,
  message,
  loading,
  picLoading,
  handleChange,
  handleFileChange,
  handleSubmit,
  handlePictureUpload,
  onThemeToggle,
}) => {
  const isDark = theme === 'dark';
  const messagePalette = message?.type === 'error'
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700/70'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/60';

  const handleThemeToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    onThemeToggle?.(nextTheme);
  };

  return (
    <section className="mx-auto max-w-4xl py-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-colors duration-300 dark:border-gray-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-nexus-dark dark:text-white">Account Settings</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your personal information, security preferences, and dashboard appearance.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-400/40 px-4 py-3">
            <div className="text-sm">
              <p className="font-semibold text-nexus-dark dark:text-white">Theme</p>
              <p className="text-gray-500 dark:text-gray-400">{isDark ? 'Dark' : 'Light'} mode</p>
            </div>
            <button
              type="button"
              onClick={handleThemeToggle}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${
                isDark ? 'bg-nexus-primary/90' : 'bg-gray-300'
              }`}
              aria-label="Toggle admin theme"
              aria-pressed={isDark}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isDark ? 'translate-x-8' : 'translate-x-2'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {message?.content && (
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${messagePalette}`}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base">
                {message.type === 'error' ? '⚠️' : '✅'}
              </span>
              <span>{message.content}</span>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center transition-colors duration-300 dark:border-gray-800 dark:bg-slate-950/40">
              <div className="relative mx-auto h-32 w-32">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover shadow-md shadow-black/20"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultAvatarUrl;
                  }}
                />
                <span className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors duration-300 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300">
                  📷
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Upload a square image for the best results (min 400x400px).
              </p>

              <label className="mt-6 block cursor-pointer rounded-xl border border-dashed border-gray-500/30 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800">
                <input type="file" className="hidden" onChange={handleFileChange} />
                Browse files
              </label>

              {selectedFile && (
                <p className="mt-2 truncate text-xs text-gray-600 dark:text-gray-400">{selectedFile.name}</p>
              )}

              <button
                type="button"
                onClick={handlePictureUpload}
                disabled={!selectedFile || picLoading}
                className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 ${
                  picLoading ? 'cursor-wait opacity-60' : 'hover:bg-blue-700'
                } bg-nexus-primary dark:bg-nexus-primary/90 dark:hover:bg-nexus-primary`}
              >
                {picLoading ? 'Uploading…' : 'Upload new photo'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-nexus-dark dark:text-white">Profile Information</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update how your details appear across the Nexus admin dashboard.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. admin@nexus.com"
                    />
                  </div>
                </div>
              </section>

              <section className="pt-4">
                <h3 className="text-lg font-semibold text-nexus-dark dark:text-white">Security</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose a strong password that you haven’t used elsewhere.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm new password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Re-enter your new password"
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3 border-t border-dashed border-gray-300 pt-6 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="text-sm font-medium text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  Switch to {isDark ? 'light' : 'dark'} mode
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold text-white transition-colors duration-300 ${
                    loading ? 'cursor-wait opacity-60' : 'hover:bg-blue-700'
                  } bg-nexus-primary dark:bg-nexus-primary/90 dark:hover:bg-nexus-primary`}
                >
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsForm;
