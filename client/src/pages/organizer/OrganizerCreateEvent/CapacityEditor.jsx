import React, { useState } from 'react';

const CapacityEditor = ({ value, onSave, onCancel }) => {
  const [mode, setMode] = useState(value ? 'limited' : 'unlimited');
  const [limit, setLimit] = useState(value || '');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'unlimited') {
      onSave('');
      return;
    }

    const numeric = Number(limit);
    if (Number.isNaN(numeric) || numeric <= 0) {
      return;
    }
    onSave(String(Math.floor(numeric)));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900 dark:text-white/70">Capacity type</legend>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMode('unlimited')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'unlimited'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/15 dark:bg-[#151b27] dark:text-white/85 dark:hover:border-white/30'
            }`}
          >
            <span className="font-semibold">Unlimited</span>
            {mode === 'unlimited' && <span className="text-xs">Selected</span>}
          </button>

          <button
            type="button"
            onClick={() => setMode('limited')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'limited'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/15 dark:bg-[#151b27] dark:text-white/85 dark:hover:border-white/30'
            }`}
          >
            <span className="font-semibold">Limited spots</span>
            {mode === 'limited' && <span className="text-xs">Selected</span>}
          </button>
        </div>
      </fieldset>

      {mode === 'limited' && (
        <div className="space-y-2">
          <label htmlFor="capacity-limit" className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/45">
            Seats available
          </label>
          <input
            id="capacity-limit"
            type="number"
            min="1"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder="Enter number of seats"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-[#161b27] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/15 dark:text-white/70 dark:hover:border-white/35 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CapacityEditor;
