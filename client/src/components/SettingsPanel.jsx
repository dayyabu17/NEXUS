import React from 'react';

const SettingsPanel = ({
  theme = 'light',
  onThemeToggle,
  formData,
  profilePicture,
  defaultAvatarUrl,
  selectedFile,
  message,
  loading,
  picLoading,
  handleChange,
  handleFileChange,
  handleProfileUpdate,
  handlePictureUpload,
}) => {
  const isDark = theme === 'dark';

  const containerClasses = 'max-w-4xl mx-auto py-6 transition-colors duration-500 ease-in-out';
  const cardClasses = `${isDark ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} border rounded-2xl shadow-lg px-8 py-10 transition-colors duration-500 ease-in-out`;
  const sectionHeading = `text-lg font-semibold transition-colors duration-500 ease-in-out ${isDark ? 'text-white' : 'text-gray-900'}`;
  const inputClasses = `${isDark ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:ring-nexus-primary' : 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-nexus-primary'} w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors duration-500 ease-in-out`;
  const labelClasses = `block text-sm font-medium mb-2 transition-colors duration-500 ease-in-out ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const helperTextClasses = `text-xs transition-colors duration-500 ease-in-out ${isDark ? 'text-gray-400' : 'text-gray-500'}`;

  const renderMessage = () => {
    if (!message?.content) {
      return null;
    }

    const baseClasses = 'px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 border transition-colors duration-500 ease-in-out';
    const palette = message.type === 'error'
      ? (isDark
        ? 'bg-red-900/40 text-red-200 border-red-700/70'
        : 'bg-red-50 text-red-700 border-red-200')
      : (isDark
        ? 'bg-emerald-900/30 text-emerald-200 border-emerald-700/60'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200');

    return (
      <div className={`${baseClasses} ${palette}`}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base">
          {message.type === 'error' ? '⚠️' : '✅'}
        </span>
        <span>{message.content}</span>
      </div>
    );
  };

  const handleToggleClick = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    onThemeToggle?.(nextTheme);
  };

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between transition-colors duration-500 ease-in-out">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 text-sm`}>
              Manage your personal information, security preferences, and dashboard appearance.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-400/30 px-4 py-3 transition-colors duration-500 ease-in-out">
            <div className="text-sm">
              <p className="font-semibold">Theme</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{isDark ? 'Dark' : 'Light'} mode</p>
            </div>
            <button
              type="button"
              onClick={handleToggleClick}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-500 ease-in-out ${isDark ? 'bg-nexus-primary/90' : 'bg-gray-300'}`}
              aria-label="Toggle admin theme"
              aria-pressed={isDark}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDark ? 'translate-x-8' : 'translate-x-2'}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6 transition-colors duration-500 ease-in-out">
          {renderMessage()}

          <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
            <div className={`${isDark ? 'bg-gray-950/40 border-gray-800' : 'bg-gray-50 border-gray-100'} rounded-2xl border px-6 py-8 text-center transition-colors duration-500 ease-in-out`}>
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
                <span className={`absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-500 ease-in-out ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`}>
                  📷
                </span>
              </div>

              <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Upload a square image for the best results (min 400x400px).
              </p>

              <label
                className={`${isDark ? 'bg-gray-900 text-gray-200 hover:bg-gray-800' : 'bg-white text-gray-700 hover:bg-gray-100'} mt-6 block cursor-pointer rounded-xl border border-dashed border-gray-500/40 px-4 py-3 text-sm font-medium transition-colors duration-500 ease-in-out`}
              >
                <input type="file" className="hidden" onChange={handleFileChange} />
                Browse files
              </label>

              {selectedFile && (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2 text-xs truncate`}>
                  {selectedFile.name}
                </p>
              )}

              <button
                type="button"
                onClick={handlePictureUpload}
                disabled={!selectedFile || picLoading}
                className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-500 ease-in-out ${picLoading ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'bg-nexus-primary/90 hover:bg-nexus-primary text-white' : 'bg-nexus-primary text-white hover:bg-blue-700'}`}
              >
                {picLoading ? 'Uploading…' : 'Upload new photo'}
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-8 transition-colors duration-500 ease-in-out">
              <section>
                <h3 className={sectionHeading}>Profile Information</h3>
                <p className={helperTextClasses}>Update how your details appear across the Nexus admin dashboard.</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className={labelClasses}>Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Email address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="e.g. admin@nexus.com"
                    />
                  </div>
                </div>
              </section>

              <section className="pt-4">
                <h3 className={sectionHeading}>Security</h3>
                <p className={helperTextClasses}>Choose a strong password that you haven’t used elsewhere.</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className={labelClasses}>New password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Confirm new password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Re-enter your new password"
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3 border-t border-dashed border-gray-500/30 pt-6 transition-colors duration-500 ease-in-out">
                <button
                  type="button"
                  onClick={() => onThemeToggle?.(isDark ? 'light' : 'dark')}
                  className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-sm font-medium transition-colors duration-500 ease-in-out`}
                >
                  Switch to {isDark ? 'light' : 'dark'} mode
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold transition-colors duration-500 ease-in-out ${loading ? 'opacity-60 cursor-wait' : ''} ${isDark ? 'bg-nexus-primary/90 hover:bg-nexus-primary text-white' : 'bg-nexus-primary text-white hover:bg-blue-700'}`}
                >
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
