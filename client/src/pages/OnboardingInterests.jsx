import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PillButton from '../components/PillButton';
import { INTEREST_CATEGORIES, MIN_INTERESTS, MAX_INTERESTS } from '../constants/interestCategories';
import { toast } from 'react-hot-toast';

const OnboardingInterests = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleInterest = (categoryId) => {
    setSelectedInterests((prev) => {
      if (prev.includes(categoryId)) {
        // Remove if already selected
        return prev.filter((id) => id !== categoryId);
      } else {
        // Add if under max limit
        if (prev.length < MAX_INTERESTS) {
          return [...prev, categoryId];
        } else {
          toast.error(`You can select a maximum of ${MAX_INTERESTS} interests`);
          return prev;
        }
      }
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length < MIN_INTERESTS) {
      toast.error(`Please select at least ${MIN_INTERESTS} interests`);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to continue');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/interests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interests: selectedInterests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update interests');
      }

      toast.success('Interests saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating interests:', error);
      toast.error(error.message || 'Failed to save interests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = selectedInterests.length < MIN_INTERESTS;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Section - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Discover Events<br />You'll Love
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Help us personalize your experience by selecting your interests.
              We'll recommend events that match your passions.
            </p>
          </motion.div>
          
          {/* Decorative icon grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-12 grid grid-cols-5 gap-4"
          >
            {INTEREST_CATEGORIES.slice(0, 10).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.05, type: 'spring' }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl"
              >
                {cat.icon}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Select Your Interests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Choose {MIN_INTERESTS} to {MAX_INTERESTS} categories that interest you most
            </p>
          </div>

          {/* Selection Counter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Interests
              </span>
              <span
                className={`text-sm font-semibold ${
                  selectedInterests.length >= MIN_INTERESTS
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {selectedInterests.length} / {MAX_INTERESTS}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(selectedInterests.length / MAX_INTERESTS) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${
                  selectedInterests.length >= MIN_INTERESTS
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
              />
            </div>
          </div>

          {/* Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {INTEREST_CATEGORIES.map((category) => {
              const isSelected = selectedInterests.includes(category.id);
              const isDisabled =
                !isSelected && selectedInterests.length >= MAX_INTERESTS;

              return (
                <PillButton
                  key={category.id}
                  category={category}
                  isSelected={isSelected}
                  onClick={handleToggleInterest}
                  disabled={isDisabled}
                />
              );
            })}
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: isButtonDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isButtonDisabled ? 1 : 0.98 }}
            onClick={handleContinue}
            disabled={isButtonDisabled || isLoading}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${
                isButtonDisabled || isLoading
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Continue to Dashboard'
            )}
          </motion.button>

          {/* Helper text */}
          {isButtonDisabled && (
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Please select at least {MIN_INTERESTS - selectedInterests.length} more{' '}
              {MIN_INTERESTS - selectedInterests.length === 1 ? 'interest' : 'interests'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingInterests;
