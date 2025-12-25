import React from 'react';
import nexusLogo from '../assets/nexus-logo.svg';

const AuthLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
    <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-12">
      <div className="w-full max-w-md">
        <div className="absolute left-8 top-8">
          <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
        </div>
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

export default AuthLayout;
