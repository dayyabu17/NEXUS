import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AuthLayout from './AuthLayout';

/**
 * SignUp component.
 * Provides a registration form for new users.
 * Supports switching between 'guest' and 'organizer' roles.
 * Organizers have an additional field for organization name.
 *
 * @component
 * @returns {JSX.Element} The rendered SignUp component.
 */
const SignUp = () => {
  // 'guest' or 'organizer'
  const [userType, setUserType] = useState('guest'); 
  const isOrganizer = userType === 'organizer';
  const MotionContainer = motion.div;

  return (
    <AuthLayout>
      <MotionContainer
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Join Nexus</h1>
          <p className="text-base text-slate-400">
            Get connected to every event, group, and opportunity.
          </p>
        </div>

        <div className="flex w-full rounded-lg bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setUserType('guest')}
            className={`flex-1 rounded-md py-2 transition-colors ${
              userType === 'guest'
                ? 'bg-slate-800 text-white shadow-sm font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => setUserType('organizer')}
            className={`flex-1 rounded-md py-2 transition-colors ${
              userType === 'organizer'
                ? 'bg-slate-800 text-white shadow-sm font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Organizer
          </button>
        </div>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your full name"
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />

          <AnimatePresence initial={false}>
            {isOrganizer && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                style={{ overflow: 'hidden' }}
              >
                <input
                  type="text"
                  placeholder="Enter your organization"
                  className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="password"
            placeholder="Enter your password"
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Confirm your password"
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Continue
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?
          <Link to="/sign-in" className="ml-1 font-semibold text-blue-400 transition hover:text-blue-300">
            Sign In
          </Link>
        </p>
      </MotionContainer>
    </AuthLayout>
  );
};

export default SignUp;
