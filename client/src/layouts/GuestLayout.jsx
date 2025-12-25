import React from 'react';
import GuestNavbar from '../components/GuestNavbar';

const WRAPPER_BASE_CLASSES =
  'min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white';
const MAIN_BASE_CLASSES = 'mx-auto max-w-6xl px-6 pb-16 pt-24';

const joinClasses = (...values) => values.filter(Boolean).join(' ');

/**
 * Shared layout shell for guest-facing pages. Ensures consistent background,
 * navbar placement, and default content spacing while allowing overrides.
 */
const GuestLayout = ({
  children,
  className = '',
  mainClassName = '',
  useDefaultMainStyles = true,
  mainProps = {},
}) => {
  const wrapperClasses = joinClasses(WRAPPER_BASE_CLASSES, className);
  const mainClasses = useDefaultMainStyles
    ? joinClasses(MAIN_BASE_CLASSES, mainClassName)
    : joinClasses(mainClassName);

  return (
    <div className={wrapperClasses}>
      <GuestNavbar />
      <main {...mainProps} className={mainClasses}>
        {children}
      </main>
    </div>
  );
};

export default GuestLayout;
