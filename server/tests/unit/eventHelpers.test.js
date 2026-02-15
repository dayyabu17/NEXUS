const {
  safeDate,
  formatDateBlock,
  toOptionalNumber,
  formatCurrency,
  normalizeTags,
  buildEventUrl,
  buildGuestNotifications,
} = require('../../utils/eventHelpers');

describe('eventHelpers', () => {
  describe('safeDate', () => {
    test('returns null for invalid dates', () => {
      expect(safeDate(null)).toBeNull();
      expect(safeDate(undefined)).toBeNull();
      expect(safeDate('invalid-date')).toBeNull();
    });

    test('parses valid date strings', () => {
      const result = safeDate('2026-03-15T10:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    test('returns Date objects as-is', () => {
      const date = new Date('2026-03-15T10:00:00Z');
      expect(safeDate(date)).toBe(date);
    });
  });

  describe('formatDateBlock', () => {
    test('returns TBA message when date is missing', () => {
      const result = formatDateBlock({ date: null });
      expect(result.combined).toBe('Schedule to be announced.');
    });

    test('formats event with start date only', () => {
      const event = {
        date: new Date('2026-03-15T14:00:00Z'),
      };
      const result = formatDateBlock(event);
      expect(result.formattedDate).toMatch(/March 15, 2026/);
      expect(result.niceTime).toBeTruthy();
    });

    test('includes end time in range', () => {
      const event = {
        date: new Date('2026-03-15T14:00:00Z'),
        endTime: '6:00 PM',
      };
      const result = formatDateBlock(event);
      expect(result.niceTime).toMatch(/—/);
      expect(result.niceTime).toMatch(/6:00 PM/);
    });

    test('includes timezone when provided', () => {
      const event = {
        date: new Date('2026-03-15T14:00:00Z'),
        timezone: 'Africa/Lagos',
      };
      const result = formatDateBlock(event);
      expect(result.niceTime).toMatch(/Africa\/Lagos/);
    });
  });

  describe('toOptionalNumber', () => {
    test('returns undefined for empty values', () => {
      expect(toOptionalNumber(undefined)).toBeUndefined();
      expect(toOptionalNumber(null)).toBeUndefined();
      expect(toOptionalNumber('')).toBeUndefined();
    });

    test('parses valid numbers', () => {
      expect(toOptionalNumber(42)).toBe(42);
      expect(toOptionalNumber('42')).toBe(42);
      expect(toOptionalNumber('3.14')).toBe(3.14);
    });

    test('returns undefined for non-numeric strings', () => {
      expect(toOptionalNumber('abc')).toBeUndefined();
      expect(toOptionalNumber('12abc')).toBeUndefined();
    });
  });

  describe('formatCurrency', () => {
    test('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/0\.00/);
    });

    test('formats positive amounts', () => {
      const result = formatCurrency(1500);
      expect(result).toMatch(/1,500\.00/);
    });

    test('handles invalid amounts gracefully', () => {
      const result = formatCurrency('invalid');
      expect(result).toMatch(/0\.00/);
    });

    test('uses NGN currency by default', () => {
      const result = formatCurrency(100);
      expect(result).toMatch(/₦|NGN/);
    });
  });

  describe('normalizeTags', () => {
    test('normalizes array of tags', () => {
      const result = normalizeTags(['Tech', ' Music ', '', 'Sports']);
      expect(result).toEqual(['Tech', 'Music', 'Sports']);
    });

    test('splits comma-separated string', () => {
      const result = normalizeTags('Tech, Music, Sports');
      expect(result).toEqual(['Tech', 'Music', 'Sports']);
    });

    test('returns undefined for invalid input', () => {
      expect(normalizeTags(null)).toBeUndefined();
      expect(normalizeTags(123)).toBeUndefined();
    });

    test('filters out empty tags', () => {
      const result = normalizeTags(['Tech', '', '  ', 'Sports']);
      expect(result).toEqual(['Tech', 'Sports']);
    });
  });

  describe('buildEventUrl', () => {
    test('constructs event URL', () => {
      const result = buildEventUrl('event-123');
      expect(result).toMatch(/\/events\/event-123$/);
    });

    test('handles base URL without trailing slash', () => {
      const result = buildEventUrl('event-456');
      // Should work with the default or configured base URL
      expect(result).toContain('/events/event-456');
      expect(result).not.toContain('//events');
    });
  });

  describe('buildGuestNotifications', () => {
    test('returns empty array for empty tickets', () => {
      const result = buildGuestNotifications([]);
      expect(result).toEqual([]);
    });

    test('generates confirmation notification for new ticket', () => {
      const tickets = [
        {
          _id: 'ticket-1',
          createdAt: new Date('2026-02-10T10:00:00Z'),
          event: {
            _id: 'event-1',
            title: 'Test Event',
            date: new Date('2026-03-20T15:00:00Z'),
            location: 'Main Hall',
            status: 'approved',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((n) => n.type === 'ticket-confirmed')).toBe(true);
    });

    test('generates reminder for event within 24 hours', () => {
      const tomorrow = new Date(Date.now() + 12 * 60 * 60 * 1000);
      const tickets = [
        {
          _id: 'ticket-2',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          event: {
            _id: 'event-2',
            title: 'Tomorrow Event',
            date: tomorrow,
            location: 'Auditorium',
            status: 'approved',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result.some((n) => n.type === 'event-reminder')).toBe(true);
      expect(result.some((n) => n.headline === 'Happening soon')).toBe(true);
    });

    test('generates upcoming notification for event within week', () => {
      const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const tickets = [
        {
          _id: 'ticket-3',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          event: {
            _id: 'event-3',
            title: 'Next Week Event',
            date: nextWeek,
            location: 'Campus',
            status: 'approved',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result.some((n) => n.type === 'event-upcoming')).toBe(true);
    });

    test('generates completion notification for recent past events', () => {
      const yesterday = new Date(Date.now() - 20 * 60 * 60 * 1000);
      const tickets = [
        {
          _id: 'ticket-4',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          event: {
            _id: 'event-4',
            title: 'Past Event',
            date: yesterday,
            location: 'Hall',
            status: 'approved',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result.some((n) => n.type === 'event-complete')).toBe(true);
    });

    test('marks notifications as read when in readSet', () => {
      const tickets = [
        {
          _id: 'ticket-5',
          createdAt: new Date('2026-02-10T10:00:00Z'),
          event: {
            _id: 'event-5',
            title: 'Read Event',
            date: new Date('2026-03-20T15:00:00Z'),
            location: 'Location',
            status: 'approved',
          },
        },
      ];

      const readSet = new Set(['guest:ticket-5:confirmed']);
      const result = buildGuestNotifications(tickets, readSet);
      const confirmed = result.find((n) => n.type === 'ticket-confirmed');
      expect(confirmed?.isRead).toBe(true);
    });

    test('ignores non-approved events', () => {
      const tickets = [
        {
          _id: 'ticket-6',
          createdAt: new Date('2026-02-10T10:00:00Z'),
          event: {
            _id: 'event-6',
            title: 'Pending Event',
            date: new Date('2026-03-20T15:00:00Z'),
            location: 'Location',
            status: 'pending',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result).toEqual([]);
    });

    test('sorts notifications by date descending', () => {
      const tickets = [
        {
          _id: 'ticket-7',
          createdAt: new Date('2026-02-05T10:00:00Z'),
          event: {
            _id: 'event-7',
            title: 'First Event',
            date: new Date('2026-04-01T15:00:00Z'),
            location: 'Location',
            status: 'approved',
          },
        },
        {
          _id: 'ticket-8',
          createdAt: new Date('2026-02-12T10:00:00Z'),
          event: {
            _id: 'event-8',
            title: 'Second Event',
            date: new Date('2026-04-02T15:00:00Z'),
            location: 'Location',
            status: 'approved',
          },
        },
      ];

      const result = buildGuestNotifications(tickets);
      expect(result[0].createdAt >= result[result.length - 1].createdAt).toBe(true);
    });
  });
});
