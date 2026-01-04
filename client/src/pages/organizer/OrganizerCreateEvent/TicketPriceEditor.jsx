import React, { useState } from 'react';

const QUICK_PRICE_OPTIONS = ['500', '1000', '2000', '5000', '10000', '20000'];

const TicketPriceEditor = ({ value, onSave, onCancel }) => {
  const initialMode = !value || Number(value) <= 0 ? 'free' : 'paid';
  const [mode, setMode] = useState(initialMode);
  const [price, setPrice] = useState(initialMode === 'paid' ? String(value) : '');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === 'free') {
      onSave('0');
      return;
    }

    const numeric = Number(price);
    if (Number.isNaN(numeric) || numeric <= 0) {
      return;
    }

    onSave(String(Math.floor(numeric)));
  };

  const applyQuickPrice = (amount) => {
    setMode('paid');
    setPrice(String(amount));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900 dark:text-white/70">Ticket pricing</legend>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setMode('free');
              setPrice('');
            }}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'free'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/15 dark:bg-[#151b27] dark:text-white/85 dark:hover:border-white/30'
            }`}
          >
            <span className="font-semibold">Free</span>
            {mode === 'free' && <span className="text-xs">Selected</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('paid');
              if (!price || Number(price) <= 0) {
                setPrice('');
              }
            }}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'paid'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/15 dark:bg-[#151b27] dark:text-white/85 dark:hover:border-white/30'
            }`}
          >
            <span className="font-semibold">Paid</span>
            {mode === 'paid' && <span className="text-xs">Selected</span>}
          </button>
        </div>
      </fieldset>

      {mode === 'paid' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ticket-price" className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/45">
              Price per ticket (₦)
            </label>
            <input
              id="ticket-price"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter ticket price"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/15 dark:bg-[#161b27] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_PRICE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => applyQuickPrice(option)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/15 dark:text-white/75 dark:hover:border-white/35 dark:hover:text-white"
              >
                ₦{Number(option).toLocaleString()}
              </button>
            ))}
          </div>
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

export default TicketPriceEditor;
