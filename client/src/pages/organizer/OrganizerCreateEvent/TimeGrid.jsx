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
  <div className="flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10">
    <div className="flex items-center justify-between bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/50">
      <span>Time</span>
      <span>GMT +00:00</span>
    </div>
    <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#121824]">
      {times.map((time) => {
        const isSelected = time.value === value;
        return (
          <button
            key={time.value}
            type="button"
            onClick={() => onSelect(time.value)}
            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
              isSelected ? 'bg-white text-black font-semibold' : 'text-white/80 hover:bg-white/10'
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
