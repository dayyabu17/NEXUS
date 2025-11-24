import React from 'react';
import nexusLogo from '../assets/nexus-logo.svg'; // We'll create this soon

/**
 * AuthLayout Component.
 * Provides a split-screen layout for authentication pages (Sign In / Sign Up).
 * Left side contains the form, right side contains a decorative image.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The form content to display on the left side.
 * @returns {JSX.Element} The rendered AuthLayout component.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-nexus-light">
      {/* Left Panel - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="absolute top-8 left-8">
            <img src={nexusLogo} alt="Nexus Logo" className="h-8" />
          </div>
          
          {/* Children (Sign-In/Sign-Up Form will go here) */}
          {children}
        </div>
      </div>

      {/* Right Panel - Image Area */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/auth-bg.png')" }} // We'll add this image soon
      >
        {/* Placeholder for the large image */}
      </div>
    </div>
  );
};

export default AuthLayout;
