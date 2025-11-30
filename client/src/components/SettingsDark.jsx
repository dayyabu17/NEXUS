import React from 'react';
import AdminLayiutDark from './AdminLayiutDark';
import SettingsPanel from './SettingsPanel';

const SettingsDark = ({ settings, onThemeToggle }) => {
  const panelProps = settings || {};

  return (
    <AdminLayiutDark>
      <SettingsPanel theme="dark" onThemeToggle={onThemeToggle} {...panelProps} />
    </AdminLayiutDark>
  );
};

export default SettingsDark;
