import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import api from '../api/axios'; // Import our new API helper

// Simple arrow icon
const ContinueIcon = () => (
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
  </svg>
);

const SignIn = () => {
  const navigate = useNavigate();
  
  // State to store input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
        navigate('/organizer/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login Failed:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full mt-16">
        <h1 className="text-3xl font-bold text-nexus-dark mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-500 mb-8">
          Your campus, connected. Log in to experience it.
        </p>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on type
              required
            />
          </div>

          <div>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state on type
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-nexus-primary text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            Continue
            <ContinueIcon />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          New User? 
          <Link to="/sign-up" className="font-bold text-nexus-primary hover:underline ml-1">
            Sign Up!
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;