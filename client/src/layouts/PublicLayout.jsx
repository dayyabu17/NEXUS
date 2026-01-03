import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import useScrollPosition from '../hooks/useScrollPosition';

const PublicLayout = ({ children }) => {
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-[#0b162a] dark:to-slate-950 dark:text-white">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          isScrolled
            ? 'border-b border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-emerald-500 dark:text-white"
          >
            Nexus
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#features" className="transition hover:text-emerald-500 dark:hover:text-white">
              Features
            </a>
            <Link to="/sign-in" className="transition hover:text-emerald-500 dark:hover:text-white">
              Sign In
            </Link>
            <Link to="/sign-up" className="transition hover:text-emerald-500 dark:hover:text-white">
              Register
            </Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/sign-up"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Get Started
            </Link>
          </div>
          <button
            type="button"
            className="md:hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur transition hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
            aria-label="Open navigation"
          >
            Menu
          </button>
        </div>
      </header>
      <main className="flex-1 pt-24">{children}</main>
      <footer className="border-t border-slate-200 bg-white/80 py-8 text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
          <span>&copy; {currentYear} Nexus. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="transition hover:text-emerald-500 dark:hover:text-white">
              Features
            </a>
            <Link to="/sign-in" className="transition hover:text-emerald-500 dark:hover:text-white">
              Sign In
            </Link>
            <Link to="/sign-up" className="transition hover:text-emerald-500 dark:hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicLayout;
