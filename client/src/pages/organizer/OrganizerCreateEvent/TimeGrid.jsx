import React, { useCallback, useEffect, useMemo, useState } from 'react';

const padTime = (input) => String(input).padStart(2, '0');

const normalizeTime = (raw) => {
  if (!raw) {
    return '';
  }

  const trimmed = raw.trim();
  const directMatch = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (directMatch) {
    return `${directMatch[1]}:${directMatch[2]}`;
  }

  const amPmMatch = trimmed.match(/^\s*(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)\s*$/i);
  if (!amPmMatch) {
    return '';
  }

  let hours = Number(amPmMatch[1]);
  const minutes = Number(amPmMatch[2] || 0);
  const modifier = amPmMatch[3].toLowerCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return '';
  }

  if (modifier === 'pm' && hours < 12) {
    hours += 12;
  }

  if (modifier === 'am' && hours === 12) {
    hours = 0;
  }

  return `${padTime(hours)}:${padTime(minutes)}`;
};

const TimeGrid = ({ value, onSelect }) => {
  const normalizedValue = useMemo(() => normalizeTime(value), [value]);
  const [draft, setDraft] = useState(normalizedValue || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(normalizedValue || '');
    setError('');
  }, [normalizedValue]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const processed = normalizeTime(draft);

      if (!processed) {
        setError('Enter a valid time (HH:MM or H:MM am/pm).');
        return;
      }

      onSelect(processed);
    },
    [draft, onSelect],
  );

  const handleChange = useCallback((event) => {
    setDraft(event.target.value);
    setError('');
  }, []);

  const handleUseNow = useCallback(() => {
    const now = new Date();
    const next = `${padTime(now.getHours())}:${padTime(now.getMinutes())}`;
    setDraft(next);
    setError('');
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-transparent"
    >
      <div className="space-y-3">
        <label htmlFor="nexus-time-input" className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/55">
          Time
        </label>
        <input
          id="nexus-time-input"
          type="time"
          step="60"
          value={draft}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-[#141a27] dark:text-white/90 dark:focus:border-white/30 dark:focus:ring-white/10"
        />
        <p className="text-xs text-slate-500 dark:text-white/55">Type any time or use am/pm format. We store it in 24-hour format.</p>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          Save time
        </button>
        <button
          type="button"
          onClick={handleUseNow}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition hover:bg-slate-100 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
        >
          Use current time
        </button>
      </div>
    </form>
  );
};

export default TimeGrid;
