import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

const OrganizerSplashScreen = ({ showSplash, organizerProfile }) => (
  <AnimatePresence mode="wait">
    {showSplash && (
      <Motion.div
        key="splash"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      >
        <div className="absolute h-32 w-32 rounded-full bg-gradient-to-r from-accent-700 via-accent-600 to-accent-500 blur-2xl animate-[spin_12s_linear_infinite]" />
        <img
          src={organizerProfile.avatar}
          alt="Organizer profile"
          className="relative z-10 h-24 w-24 rounded-full border-4 border-white object-cover shadow-[0_10px_40px_rgba(46,134,222,0.45)] dark:border-slate-950"
        />
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
          className="relative z-10 mt-8 text-2xl font-bold text-slate-900 dark:text-white"
        >
          Welcome to Nexus, {organizerProfile.firstName}
        </Motion.h1>
      </Motion.div>
    )}
  </AnimatePresence>
);

export default OrganizerSplashScreen;
