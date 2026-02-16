const {
  addInterestWithLIFO,
  validateInterests,
  normalizeInterests,
} = require('../../utils/interestHelpers');

describe('interestHelpers', () => {
  describe('addInterestWithLIFO', () => {
    test('adds new interest to empty array', () => {
      const result = addInterestWithLIFO([], 'Technology', 5);
      expect(result).toEqual(['Technology']);
    });

    test('adds new interest to existing array', () => {
      const result = addInterestWithLIFO(['Sports', 'Music'], 'Technology', 5);
      expect(result).toEqual(['Sports', 'Music', 'Technology']);
    });

    test('moves existing interest to end', () => {
      const result = addInterestWithLIFO(['Sports', 'Music', 'Technology'], 'Sports', 5);
      expect(result).toEqual(['Music', 'Technology', 'Sports']);
    });

    test('removes oldest when exceeding max limit', () => {
      const interests = ['Tech', 'Sports', 'Music', 'Business', 'Arts'];
      const result = addInterestWithLIFO(interests, 'Health', 5);
      expect(result).toEqual(['Sports', 'Music', 'Business', 'Arts', 'Health']);
      expect(result).toHaveLength(5);
      expect(result).not.toContain('Tech');
    });

    test('handles case-insensitive duplicates', () => {
      const result = addInterestWithLIFO(['Technology', 'Music'], 'technology', 5);
      expect(result).toEqual(['Music', 'technology']);
    });

    test('returns current interests for invalid category', () => {
      const current = ['Sports', 'Music'];
      expect(addInterestWithLIFO(current, null, 5)).toEqual(current);
      expect(addInterestWithLIFO(current, undefined, 5)).toEqual(current);
      expect(addInterestWithLIFO(current, '', 5)).toEqual(current);
      expect(addInterestWithLIFO(current, 123, 5)).toEqual(current);
    });

    test('respects custom max limit', () => {
      const interests = ['A', 'B', 'C'];
      const result = addInterestWithLIFO(interests, 'D', 3);
      expect(result).toEqual(['B', 'C', 'D']);
      expect(result).toHaveLength(3);
    });

    test('handles max limit of 1', () => {
      const result = addInterestWithLIFO(['Sports'], 'Music', 1);
      expect(result).toEqual(['Music']);
    });

    test('preserves order when under limit', () => {
      const result = addInterestWithLIFO(['First', 'Second'], 'Third', 5);
      expect(result).toEqual(['First', 'Second', 'Third']);
    });
  });

  describe('validateInterests', () => {
    test('validates minimum requirement', () => {
      const result = validateInterests(['Tech', 'Sports', 'Music'], 3, 5);
      expect(result.isValid).toBe(true);
    });

    test('rejects below minimum', () => {
      const result = validateInterests(['Tech', 'Sports'], 3, 5);
      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/at least 3/i);
    });

    test('rejects above maximum', () => {
      const result = validateInterests(['A', 'B', 'C', 'D', 'E', 'F'], 3, 5);
      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/maximum of 5/i);
    });

    test('filters empty strings before validation', () => {
      const result = validateInterests(['Tech', '', 'Sports', null, 'Music'], 3, 5);
      expect(result.isValid).toBe(true);
    });

    test('rejects non-array input', () => {
      const result = validateInterests('not-an-array', 3, 5);
      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/must be an array/i);
    });

    test('accepts exactly minimum', () => {
      const result = validateInterests(['A', 'B', 'C'], 3, 5);
      expect(result.isValid).toBe(true);
    });

    test('accepts exactly maximum', () => {
      const result = validateInterests(['A', 'B', 'C', 'D', 'E'], 3, 5);
      expect(result.isValid).toBe(true);
    });

    test('respects custom min and max', () => {
      const result = validateInterests(['A', 'B'], 2, 4);
      expect(result.isValid).toBe(true);
    });
  });

  describe('normalizeInterests', () => {
    test('trims whitespace from interests', () => {
      const result = normalizeInterests(['  Tech  ', 'Sports', '  Music  ']);
      expect(result).toEqual(['Tech', 'Sports', 'Music']);
    });

    test('filters out empty strings', () => {
      const result = normalizeInterests(['Tech', '', '  ', 'Sports']);
      expect(result).toEqual(['Tech', 'Sports']);
    });

    test('filters out non-string values', () => {
      const result = normalizeInterests(['Tech', 123, null, 'Sports', undefined]);
      expect(result).toEqual(['Tech', 'Sports']);
    });

    test('returns empty array for non-array input', () => {
      expect(normalizeInterests(null)).toEqual([]);
      expect(normalizeInterests(undefined)).toEqual([]);
      expect(normalizeInterests('not-array')).toEqual([]);
      expect(normalizeInterests(123)).toEqual([]);
    });

    test('handles empty array', () => {
      expect(normalizeInterests([])).toEqual([]);
    });

    test('preserves valid interests', () => {
      const result = normalizeInterests(['Technology', 'Music', 'Sports']);
      expect(result).toEqual(['Technology', 'Music', 'Sports']);
    });

    test('removes whitespace-only strings', () => {
      const result = normalizeInterests(['Tech', '   ', '\t', '\n', 'Sports']);
      expect(result).toEqual(['Tech', 'Sports']);
    });
  });
});
