import React from 'react';

const TimezoneGrid = ({ value, onSelect, timezoneOptions }) => (
  <div className="flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10">
    <div className="flex items-center justify-between bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/50">
      <span>Timezone</span>
      <span>GMT</span>
    </div>
    <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#121824]">
      {timezoneOptions.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
              isSelected ? 'bg-white text-black font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span>{option.label}</span>
            <span className="text-xs text-white/60">{option.offset}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default TimezoneGrid;
