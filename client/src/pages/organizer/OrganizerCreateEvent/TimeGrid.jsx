import React from 'react';

const times = Array.from({ length: 24 * 2 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    label: new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
});

const TimeGrid = ({ value, onSelect }) => (
  <div className="flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-transparent">
    <div className="flex items-center justify-between bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:bg-white/5 dark:text-white/50">
      <span>Time</span>
      <span>GMT +00:00</span>
    </div>
    <div className="custom-scrollbar flex-1 overflow-y-auto bg-white dark:bg-[#121824]">
      {times.map((time) => {
        const isSelected = time.value === value;
        return (
          <button
            key={time.value}
            type="button"
            onClick={() => onSelect(time.value)}
            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
              isSelected
                ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-black'
                : 'text-slate-600 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/10'
            }`}
          >
            <span>{time.label}</span>
            {isSelected && <span className="text-xs uppercase tracking-[0.2em]">Selected</span>}
          </button>
        );
      })}
    </div>
  </div>
);

export default TimeGrid;
