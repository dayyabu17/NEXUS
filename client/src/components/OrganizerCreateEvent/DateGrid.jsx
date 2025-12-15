import React, { useMemo } from 'react';

const DateGrid = ({ value, onSelect, anchorDate, setAnchorDate }) => {
  const workingDate = useMemo(() => {
    const base = new Date(anchorDate);
    base.setDate(1);
    base.setHours(0, 0, 0, 0);
    return base;
  }, [anchorDate]);

  const year = workingDate.getFullYear();
  const month = workingDate.getMonth();

  const startWeekday = (workingDate.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarCells.push(day);
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const monthLabel = workingDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const selectedDate = value ? new Date(value) : null;

  const isSameDay = (candidateDay) => {
    if (!selectedDate) {
      return false;
    }

    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === candidateDay
    );
  };

  const makeDateValue = (day) => {
    const dt = new Date(year, month, day, 0, 0, 0, 0);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-white/80">
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1 text-sm transition hover:bg-white/10"
          onClick={() => {
            const next = new Date(workingDate);
            next.setMonth(next.getMonth() - 1);
            setAnchorDate(next);
          }}
        >
          Prev
        </button>
        <span className="text-base font-medium">{monthLabel}</span>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1 text-sm transition hover:bg-white/10"
          onClick={() => {
            const next = new Date(workingDate);
            next.setMonth(next.getMonth() + 1);
            setAnchorDate(next);
          }}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-white/40">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {calendarCells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="h-11 w-full rounded-2xl bg-transparent" />;
          }

          const isSelected = isSameDay(day);
          return (
            <button
              key={day}
              type="button"
              className={`h-11 w-full rounded-2xl border border-transparent text-sm transition ${
                isSelected ? 'bg-white text-black' : 'bg-[#1a212d] text-white/85 hover:border-white/30'
              }`}
              onClick={() => {
                onSelect(makeDateValue(day));
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateGrid;
