import React from 'react';
import { INTEREST_CATEGORIES } from '../constants/interestCategories';

/**
 * InterestBadges - Display user's interests as badges
 * 
 * @param {Object} props
 * @param {string[]} props.interests - Array of interest category IDs
 * @param {boolean} props.showIcons - Whether to show category icons
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 */
const InterestBadges = ({ interests = [], showIcons = true, size = 'md' }) => {
  if (!interests || interests.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interestId) => {
        const category = INTEREST_CATEGORIES.find((cat) => cat.id === interestId);
        
        if (!category) return null;

        return (
          <span
            key={category.id}
            className={`
              inline-flex items-center gap-1.5 rounded-full
              bg-gradient-to-r ${category.color}
              text-white font-medium shadow-sm
              ${sizeClasses[size]}
            `}
          >
            {showIcons && <span className={iconSizes[size]}>{category.icon}</span>}
            <span>{category.name}</span>
          </span>
        );
      })}
    </div>
  );
};

export default InterestBadges;
