import React from 'react';
import AdminLayout from './AdminLayout';
import SettingsPanel from './SettingsPanel';
import SettingsDark from './SettingsDark';
import useAdminSettings from '../hooks/useAdminSettings';
import useAdminTheme from '../hooks/useAdminTheme';

const Settings = () => {
  const settingsState = useAdminSettings();
  const { theme, setTheme } = useAdminTheme();

  return (
    <div className="relative min-h-screen">
      <div
        className={`transition-opacity duration-500 ease-in-out ${
          theme === 'light'
            ? 'opacity-100 relative pointer-events-auto'
            : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
      >
        <AdminLayout>
          <SettingsPanel theme="light" onThemeToggle={setTheme} {...settingsState} />
        </AdminLayout>
      </div>

      <div
        className={`transition-opacity duration-500 ease-in-out ${
          theme === 'dark'
            ? 'opacity-100 relative pointer-events-auto'
            : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
      >
        <SettingsDark settings={settingsState} onThemeToggle={setTheme} />
      </div>
    </div>
  );
};

export default Settings;