import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';

// A simple arrow icon for the button
const ContinueIcon = () => (
  <svg 
    className="w-4 h-4 ml-2" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
  </svg>
);

/**
 * SignUp Component.
 * Allows new users to register for an account.
 * Supports registration as a 'guest' or 'organizer'.
 *
 * @component
 * @returns {JSX.Element} The rendered SignUp component.
 */
const SignUp = () => {
  // 'guest' or 'organizer'
  const [userType, setUserType] = useState('guest'); 

  return (
    <AuthLayout>
      <div className="w-full mt-10"> {/* Added margin-top */}
        <h1 className="text-3xl font-bold text-nexus-dark mb-2">
          Join Nexus
        </h1>
        <p className="text-gray-500 mb-6">
          Get connected to every event, group, and opportunity.
        </p>

        {/* User Type Toggle */}
        <div className="flex w-full bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setUserType('guest')}
            className={`w-1/2 py-2 rounded-md font-bold transition-all
              ${userType === 'guest' ? 'bg-white shadow text-nexus-primary' : 'text-gray-500'}
            `}
          >
            Guest
          </button>
          <button
            onClick={() => setUserType('organizer')}
            className={`w-1/2 py-2 rounded-md font-bold transition-all
              ${userType === 'organizer' ? 'bg-white shadow text-nexus-primary' : 'text-gray-500'}
            `}
          >
            Organizer
          </button>
        </div>

        {/* Sign Up Form */}
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
          />
          
          {/* Conditional field for Organizer */}
          {userType === 'organizer' && (
            <input
              type="text"
              placeholder="Enter your organization"
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
            />
          )}

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
          />
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
          />

          <button
            type="submit"
            className="w-full bg-nexus-primary text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            Continue
            <ContinueIcon />
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? 
          <Link to="/sign-in" className="font-bold text-nexus-primary hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
