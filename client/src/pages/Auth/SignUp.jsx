import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import nexusLogoDark from '../../assets/nexus-logo.svg';
import nexusLogoWhite from '../../assets/nexus-logo-white.svg';

const SignUp = () => {
  // 'student' or 'organizer'
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    regNo: '',
    address: '',
    password: '',
    confirmPassword: '',
    organization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const logoSrc = activeTheme === 'dark' ? nexusLogoWhite : nexusLogoDark;
  const isOrganizer = userType === 'organizer';
  const isStudent = userType === 'student';
  const MotionContainer = motion.div;
  const inputClasses = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

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

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (isStudent && (!formData.regNo.trim() || !formData.address.trim())) {
      setError('Registration number and address are required for students.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: userType,
      phoneNumber: formData.phoneNumber.trim(),
    };

    if (isOrganizer && formData.organization.trim()) {
      payload.organization = formData.organization.trim();
    }

    if (isStudent) {
      payload.regNo = formData.regNo.trim();
      payload.address = formData.address.trim();
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', payload);
      
      // If student role, store temp data and redirect to interests
      if (isStudent) {
        // Auto-login after signup for students
        try {
          const loginResponse = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          
          const { data } = loginResponse;
          
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
          }
          
          // Redirect to interest selection
          navigate('/onboarding/interests');
          return;
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
          // Fall back to normal sign-in redirect
        }
      }
      
      navigate('/sign-in');
    } catch (err) {
      const message = err?.response?.data?.message;
      setError(message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showCornerLogo={false}>
      <MotionContainer
        className="relative w-full max-w-2xl space-y-8 rounded-3xl bg-white p-8 text-slate-900 shadow-xl transition-colors dark:bg-slate-950 dark:text-white sm:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="space-y-6">
          <img src={logoSrc} alt="Nexus logo" className="w-32" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Join Nexus</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
            Get connected to every event, group, and opportunity.
            </p>
          </div>
        </div>

        <div className="flex w-full rounded-xl bg-slate-100 p-1 transition-colors dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-nexus-primary'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('organizer')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              userType === 'organizer'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-nexus-primary'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
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
            className={inputClasses}
          />
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
          />
          <input
            type="tel"
            placeholder="Enter your phone number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={inputClasses}
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
                  className={inputClasses}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isStudent && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Enter your registration number"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Enter your address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputClasses}
          />
          <input
            type="password"
            placeholder="Confirm your password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClasses}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-nexus-primary text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?
          <Link
            to="/sign-in"
            className="ml-1 font-semibold text-nexus-primary transition-colors hover:text-blue-700 dark:hover:text-blue-500"
          >
            Sign In
          </Link>
        </p>
      </MotionContainer>
    </AuthLayout>
  );
};

export default SignUp;
