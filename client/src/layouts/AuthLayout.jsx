import React from 'react';
import { useTheme } from '../context/ThemeContext';
import nexusLogoDark from '../assets/nexus-logo.svg';
import nexusLogoWhite from '../assets/nexus-logo-white.svg';

const AuthLayout = ({ children, showCornerLogo = true }) => {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const logoSrc = activeTheme === 'dark' ? nexusLogoWhite : nexusLogoDark;
  const logoAlt = activeTheme === 'dark' ? 'Nexus icon' : 'Nexus logo';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {showCornerLogo && (
            <div className="absolute left-8 top-8">
              <img src={logoSrc} alt={logoAlt} className="h-8" />
            </div>
          )}
          {children}
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <img
          src="/images/auth-bg-2.jpg"
          alt="Event Atmosphere"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/20" />
      </div>
    </div>
  );
};

export default AuthLayout;
