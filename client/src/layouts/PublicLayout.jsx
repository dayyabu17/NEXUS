import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import useScrollPosition from '../hooks/useScrollPosition';
import { useTheme } from '../context/ThemeContext';

const PublicLayout = ({ children }) => {
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const currentYear = new Date().getFullYear();
  const { isDark, toggleTheme } = useTheme();
  const themeToggleLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
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
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeToggleLabel}
              aria-pressed={isDark}
              className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ThemeIcon className="h-5 w-5" />
            </button>
            <Link
              to="/sign-up"
              className="rounded-full bg-nexus-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-primary/30 transition hover:bg-nexus-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary/40"
            >
              Get Started
            </Link>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeToggleLabel}
              aria-pressed={isDark}
              className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ThemeIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur transition hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
              aria-label="Open navigation"
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-24">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
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
