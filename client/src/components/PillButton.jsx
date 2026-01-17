import React from 'react';
import { motion } from 'framer-motion';

/**
 * PillButton - Selectable pill-shaped button for interest selection
 * 
 * @param {Object} props
 * @param {Object} props.category - Category object with id, name, icon, color
 * @param {boolean} props.isSelected - Whether this pill is selected
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the button is disabled
 */
const PillButton = ({ category, isSelected, onClick, disabled = false }) => {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onClick(category.id)}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative flex items-center gap-3 px-5 py-3.5 rounded-full
        border-2 transition-all duration-200
        ${
          isSelected
            ? `bg-gradient-to-r ${category.color} border-transparent text-white shadow-lg`
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        font-medium text-sm sm:text-base
      `}
    >
      {/* Icon */}
      <span className="text-2xl">{category.icon}</span>
      
      {/* Label */}
      <span className="flex-1 text-left">{category.name}</span>
      
      {/* Checkmark when selected */}
      {isSelected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="text-white text-xl"
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
};

export default PillButton;
