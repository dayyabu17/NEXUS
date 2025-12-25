import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import useKonamiCode from '../hooks/useKonamiCode';
import useSignIn from '../hooks/useSignIn';

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

  return (
    <AuthLayout>
      <Motion.div
        className="relative w-full max-w-sm space-y-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {triggered && (
          <div className="absolute -top-16 left-1/2 w-max -translate-x-1/2 rounded-full bg-blue-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
            DEV MODE ENABLED 🎮
          </div>
        )}

        <div className="space-y-2 text-white">
          <h1 className="text-4xl font-semibold">Welcome Back</h1>
          <p className="text-base text-slate-400">
            Your campus, connected. Log in to experience it.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="email">
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-blue-600/60"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          <span>New User? </span>
          <Link to="/sign-up" className="font-semibold text-blue-400 transition hover:text-blue-300">
            Sign Up!
          </Link>
        </p>
      </Motion.div>
    </AuthLayout>
  );
};

export default SignIn;