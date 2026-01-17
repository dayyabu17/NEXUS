/**
 * Interest Management Utilities
 * Handles user interest preferences with LIFO (Last In First Out) logic
 */

/**
 * Add a new interest to the user's interest list with LIFO constraint.
 * If the interest already exists, it's moved to the end (most recent).
 * If adding a new interest would exceed the max limit, the oldest is removed.
 *
 * @param {string[]} currentInterests - Current array of user interests
 * @param {string} newCategory - Category to add
 * @param {number} maxLimit - Maximum number of interests to keep (default: 5)
 * @returns {string[]} Updated interests array with new category added/moved
 *
 * @example
 * // User's current: ["Sports", "Music", "Business"]
 * // Add: "Technology"
 * // Result: ["Sports", "Music", "Business", "Technology"]
 *
 * @example
 * // User's current: ["Tech", "Sports", "Music", "Business", "Arts"] (at max 5)
 * // Add: "Health"
 * // Result: ["Sports", "Music", "Business", "Arts", "Health"] (oldest "Tech" removed)
 */
const addInterestWithLIFO = (currentInterests = [], newCategory, maxLimit = 5) => {
  if (!newCategory || typeof newCategory !== 'string') {
    return currentInterests;
  }

  // Remove if already exists (will be re-added at end)
  let updated = currentInterests.filter(
    (interest) => interest.toLowerCase() !== newCategory.toLowerCase()
  );

  // Add the new category to the end
  updated.push(newCategory);

  // If exceeds max, keep only the last 'maxLimit' items (LIFO)
  if (updated.length > maxLimit) {
    updated = updated.slice(-maxLimit);
  }

  return updated;
};

/**
 * Validate if an interest list meets requirements
 *
 * @param {string[]} interests - Array of interests to validate
 * @param {number} minRequired - Minimum required interests (default: 3)
 * @param {number} maxAllowed - Maximum allowed interests (default: 5)
 * @returns {object} Validation result { isValid, message }
 */
const validateInterests = (interests = [], minRequired = 3, maxAllowed = 5) => {
  if (!Array.isArray(interests)) {
    return { isValid: false, message: 'Interests must be an array.' };
  }

  const filtered = interests.filter(Boolean);

  if (filtered.length < minRequired) {
    return {
      isValid: false,
      message: `Please select at least ${minRequired} interests.`,
    };
  }

  if (filtered.length > maxAllowed) {
    return {
      isValid: false,
      message: `You can select a maximum of ${maxAllowed} interests.`,
    };
  }

  return { isValid: true, message: 'Valid interests.' };
};

/**
 * Normalize interest categories (trim whitespace, ensure valid format)
 *
 * @param {string[]} interests - Array of interests
 * @returns {string[]} Normalized array
 */
const normalizeInterests = (interests = []) => {
  if (!Array.isArray(interests)) {
    return [];
  }

  return interests
    .filter((interest) => typeof interest === 'string' && interest.trim().length > 0)
    .map((interest) => interest.trim());
};

module.exports = {
  addInterestWithLIFO,
  validateInterests,
  normalizeInterests,
};
