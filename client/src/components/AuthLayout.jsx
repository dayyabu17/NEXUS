import React from 'react';
import nexusLogo from '../assets/nexus-logo.svg'; // Uncomment when ready

const AuthLayout = ({ children }) => {
  return (
    // changed bg-nexus-light to bg-slate-950 to match your app theme
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Left Panel - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <div className="max-w-md w-full">
          {/* Logo - kept absolute but ensured it has space */}
          <div className="absolute top-8 left-8">
             <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
             {/* <span className="text-2xl font-bold text-blue-500">Nexus</span> */}
          </div>
          
          {/* Children (Sign-In/Sign-Up Form) */}
          {children}
        </div>
      </div>

      {/* Right Panel - Image Area */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="/images/auth-bg-2.jpg" // Ensure this path is correct
          alt="Event Atmosphere" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Optional: Dark Overlay so the image isn't too bright */}
        <div className="absolute inset-0 bg-slate-900/20"></div>
      </div>
    </div>
  );
};

export default AuthLayout;