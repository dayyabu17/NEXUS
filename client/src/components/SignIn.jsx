import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import AuthLayout from './AuthLayout';
import api from '../api/axios';
import confetti from 'canvas-confetti';

/**
 * SignIn component.
 * Handles user authentication via email and password.
 * Redirects users to their respective dashboards based on their role upon successful login.
 * Includes a fun "Konami code" easter egg.
 *
 * @component
 * @returns {JSX.Element} The rendered SignIn component.
 */
const SignIn = () => {
  const navigate = useNavigate();
  
  // State to store input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showEasterEggToast, setShowEasterEggToast] = useState(false);
  const konamiIndexRef = useRef(0);
  const toastTimerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the page from reloading
    setError(''); // Clear previous errors

    try {
      // Send POST request to backend
      const response = await api.post('/auth/login', { email, password });

      // If successful:
      console.log('Login Success:', response.data);
      
      // 1. Save the token and user info to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // 2. Redirect based on role (For now, let's just go to a dashboard placeholder)
      if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.role === 'organizer') {
        try {
          sessionStorage.setItem('showWelcome', 'true');
        } catch {
          // Ignore storage access errors to avoid disrupting the flow
        }
        navigate('/organizer/dashboard', { state: { fromSignIn: true } });
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login Failed:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    const sequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    const resetToastTimer = () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };

    const handleKeyDown = (event) => {
      const currentIndex = konamiIndexRef.current;
      const expectedKey = sequence[currentIndex];

      if (event.key === expectedKey) {
        konamiIndexRef.current += 1;

        if (konamiIndexRef.current === sequence.length) {
          confetti({
            particleCount: 150,
            spread: 60,
            origin: { y: 0.6 },
          });

          setShowEasterEggToast(true);
          resetToastTimer();
          toastTimerRef.current = setTimeout(() => {
            setShowEasterEggToast(false);
            toastTimerRef.current = null;
          }, 2500);

          konamiIndexRef.current = 0;
        }
      } else {
        konamiIndexRef.current = event.key === sequence[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetToastTimer();
    };
  }, []);

  return (
    <AuthLayout>
      <Motion.div
        className="relative w-full max-w-sm space-y-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {showEasterEggToast && (
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
            className="h-12 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Continue
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
