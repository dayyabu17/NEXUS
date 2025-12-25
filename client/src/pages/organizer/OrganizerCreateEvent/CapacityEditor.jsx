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
        <legend className="text-sm font-medium text-white/70">Capacity type</legend>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMode('unlimited')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'unlimited'
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-[#151b27] text-white/85 hover:border-white/30'
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
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-[#151b27] text-white/85 hover:border-white/30'
            }`}
          >
            <span className="font-semibold">Limited spots</span>
            {mode === 'limited' && <span className="text-xs">Selected</span>}
          </button>
        </div>
      </fieldset>

      {mode === 'limited' && (
        <div className="space-y-2">
          <label htmlFor="capacity-limit" className="text-xs font-medium uppercase tracking-wide text-white/45">
            Seats available
          </label>
          <input
            id="capacity-limit"
            type="number"
            min="1"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder="Enter number of seats"
            className="w-full rounded-2xl border border-white/15 bg-[#161b27] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/35 hover:text-white"
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
