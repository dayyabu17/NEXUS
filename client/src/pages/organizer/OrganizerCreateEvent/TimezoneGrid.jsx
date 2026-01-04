import React from 'react';

const TimezoneGrid = ({ value, onSelect, timezoneOptions }) => (
  <div className="flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-transparent">
    <div className="flex items-center justify-between bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:bg-white/5 dark:text-white/50">
      <span>Timezone</span>
      <span>GMT</span>
    </div>
    <div className="custom-scrollbar flex-1 overflow-y-auto bg-white dark:bg-[#121824]">
      {timezoneOptions.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
              isSelected
                ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-black'
                : 'text-slate-600 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/10'
            }`}
          >
            <span>{option.label}</span>
            <span className="text-xs text-slate-500 dark:text-white/60">{option.offset}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default TimezoneGrid;
