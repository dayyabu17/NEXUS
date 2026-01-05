import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import useKonamiCode from '../../hooks/useKonamiCode';
import useSignIn from '../../hooks/useSignIn';
import { useTheme } from '../../context/ThemeContext';
import nexusLogoDark from '../../assets/nexus-logo.svg';
import nexusLogoWhite from '../../assets/nexus-logo-white.svg';

const SignIn = () => {
  const { triggered } = useKonamiCode();
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleSubmit,
    loading,
  } = useSignIn();
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const logoSrc = activeTheme === 'dark' ? nexusLogoWhite : nexusLogoDark;

  return (
    <AuthLayout showCornerLogo={false}>
      <Motion.div
        className="relative w-full max-w-md space-y-10 rounded-3xl bg-white p-8 text-slate-900 shadow-xl transition-colors dark:bg-slate-950 dark:text-white sm:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {triggered && (
          <div className="absolute -top-16 left-1/2 w-max -translate-x-1/2 rounded-full bg-blue-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
            DEV MODE ENABLED 🎮
          </div>
        )}

        <div className="space-y-6">
          <img src={logoSrc} alt="Nexus logo" className="w-32" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Your campus, connected. Log in to experience it.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-nexus-primary text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          <span>New User? </span>
          <Link
            to="/sign-up"
            className="font-semibold text-nexus-primary transition-colors hover:text-blue-700 dark:hover:text-blue-500"
          >
            Sign Up!
          </Link>
        </p>
      </Motion.div>
    </AuthLayout>
  );
};

export default SignIn;
