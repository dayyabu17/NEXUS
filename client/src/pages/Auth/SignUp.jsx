import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import api from '../../api/axios';

const SignUp = () => {
  // 'student' or 'organizer'
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isOrganizer = userType === 'organizer';
  const MotionContainer = motion.div;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: userType,
    };

    if (isOrganizer && formData.organization.trim()) {
      payload.organization = formData.organization.trim();
    }

    setLoading(true);

    try {
      await api.post('/auth/register', payload);
      navigate('/sign-in');
    } catch (err) {
      const message = err?.response?.data?.message;
      setError(message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => setUserType('student')}
            className={`flex-1 rounded-md py-2 transition-colors ${
              userType === 'student'
                ? 'bg-slate-800 text-white shadow-sm font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student
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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Confirm your password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 px-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600"
          />

          {error && (
            <div className="rounded-lg border border-red-900/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Loading…' : 'Continue'}
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
