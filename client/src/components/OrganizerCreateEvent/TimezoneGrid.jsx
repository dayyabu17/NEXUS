import React from 'react';

const TimezoneGrid = ({ value, onSelect, timezoneOptions }) => (
  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
    {timezoneOptions.map((option) => {
      const isSelected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          className={`flex w-full flex-col items-start rounded-2xl border px-4 py-3 text-left text-sm transition ${
            isSelected
              ? 'border-white bg-white text-black'
              : 'border-white/10 bg-[#18202d] text-white/85 hover:border-white/30'
          }`}
          onClick={() => onSelect(option.value)}
        >
          <span className="font-semibold">{option.label}</span>
          <span className="text-xs text-white/60">{option.location}</span>
        </button>
      );
    })}
  </div>
);

export default TimezoneGrid;
