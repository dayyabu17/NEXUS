import React, { useState } from 'react';

const TimeGrid = ({ value, onSelect }) => {
  const parseTime = (input) => {
    if (!input || typeof input !== 'string') {
      return { hours: 0, minutes: 0 };
    }

    const [rawHours, rawMinutes] = input.split(':');
    const hours = Number.parseInt(rawHours, 10);
    const minutes = Number.parseInt(rawMinutes, 10);

    return {
      hours: Number.isFinite(hours) && hours >= 0 && hours < 24 ? hours : 0,
      minutes: Number.isFinite(minutes) && minutes >= 0 && minutes < 60 ? minutes : 0,
    };
  };

  const [segments, setSegments] = useState(() => parseTime(value));
  const { hours, minutes } = segments;

  const formatSegment = (segment) => segment.toString().padStart(2, '0');

  const adjustHours = (delta) => {
    setSegments((prev) => {
      const wrapped = (prev.hours + delta) % 24;
      const hoursValue = wrapped < 0 ? wrapped + 24 : wrapped;
      return { ...prev, hours: hoursValue };
    });
  };

  const adjustMinutes = (delta) => {
    setSegments((prev) => {
      const wrapped = (prev.minutes + delta) % 60;
      const minutesValue = wrapped < 0 ? wrapped + 60 : wrapped;
      return { ...prev, minutes: minutesValue };
    });
  };

  const handleSetMinutes = (nextMinutes) => {
    setSegments((prev) => ({ ...prev, minutes: nextMinutes }));
  };

  const handleSave = () => {
    const nextValue = `${formatSegment(hours)}:${formatSegment(minutes)}`;
    onSelect(nextValue);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#181f2c] px-6 py-5 shadow-[0_12px_40px_rgba(8,12,24,0.45)]">
          <button
            type="button"
            aria-label="Increase hour"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
            onClick={() => adjustHours(1)}
          >
            <span aria-hidden className="text-lg leading-none">&#9650;</span>
          </button>
          <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-black/40 text-4xl font-semibold tracking-widest text-white">
            {formatSegment(hours)}
          </div>
          <button
            type="button"
            aria-label="Decrease hour"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
            onClick={() => adjustHours(-1)}
          >
            <span aria-hidden className="text-lg leading-none">&#9660;</span>
          </button>
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">Hours</span>
        </div>

        <span className="text-4xl font-semibold text-white/60">:</span>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#181f2c] px-6 py-5 shadow-[0_12px_40px_rgba(8,12,24,0.45)]">
          <button
            type="button"
            aria-label="Increase minutes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
            onClick={() => adjustMinutes(1)}
          >
            <span aria-hidden className="text-lg leading-none">&#9650;</span>
          </button>
          <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-black/40 text-4xl font-semibold tracking-widest text-white">
            {formatSegment(minutes)}
          </div>
          <button
            type="button"
            aria-label="Decrease minutes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
            onClick={() => adjustMinutes(-1)}
          >
            <span aria-hidden className="text-lg leading-none">&#9660;</span>
          </button>
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">Minutes</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[0, 15, 30, 45].map((minuteOption) => (
          <button
            key={minuteOption}
            type="button"
            className={`rounded-xl border px-3 py-1 text-xs font-medium transition ${
              minutes === minuteOption
                ? 'border-white bg-white text-black'
                : 'border-white/10 bg-[#171f2d] text-white/75 hover:border-white/30 hover:text-white'
            }`}
            onClick={() => handleSetMinutes(minuteOption)}
          >
            :{formatSegment(minuteOption)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Set time
        </button>
      </div>
    </div>
  );
};

export default TimeGrid;
