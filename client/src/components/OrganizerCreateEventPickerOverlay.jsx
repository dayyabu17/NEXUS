import React, { useEffect, useMemo, useRef, useState } from 'react';

const QUICK_PRICE_OPTIONS = ['500', '1000', '2000', '5000', '10000', '20000'];

const OrganizerCreateEventPickerOverlay = ({
  activePicker,
  onClose,
  formData,
  setFormData,
  pickerMonthAnchor,
  setPickerMonthAnchor,
  timezoneOptions,
}) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (activePicker) {
      window.addEventListener('keydown', handleKey);
    }

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [activePicker, onClose]);

  useEffect(() => {
    if (!activePicker) {
      return undefined;
    }

    const handleScroll = (event) => {
      event.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', handleScroll, { passive: false });
    document.addEventListener('touchmove', handleScroll, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
    };
  }, [activePicker]);

  if (!activePicker) {
    return null;
  }

  const isDatePicker = activePicker === 'date' || activePicker === 'endDate';
  const isTimePicker = activePicker === 'time' || activePicker === 'endTime';
  const isTimezonePicker = activePicker === 'timezone';
  const isTitleEditor = activePicker === 'title';
  const isCapacityEditor = activePicker === 'capacity';
  const isTicketPriceEditor = activePicker === 'ticketPrice';

  const targetField = {
    title: 'title',
    date: 'date',
    time: 'time',
    endDate: 'endDate',
    endTime: 'endTime',
    timezone: 'timezone',
    capacity: 'capacity',
    ticketPrice: 'price',
  }[activePicker];

  if (!targetField) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[rgba(13,17,27,0.95)] p-6 text-white shadow-[0_30px_90px_rgba(5,10,20,0.65)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90">
            {isDatePicker
              ? targetField === 'date'
                ? 'Select start date'
                : 'Select end date'
              : isTimePicker
              ? targetField === 'time'
                ? 'Select start time'
                : 'Select end time'
              : isTimezonePicker
              ? 'Select timezone'
              : isTitleEditor
              ? 'Set event name'
              : isCapacityEditor
              ? 'Set capacity'
              : isTicketPriceEditor
              ? 'Set ticket price'
              : ''}
          </h2>
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {isDatePicker ? (
          <DateGrid
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, [targetField]: nextValue }));
              onClose();
            }}
            anchorDate={pickerMonthAnchor}
            setAnchorDate={setPickerMonthAnchor}
          />
        ) : isTimePicker ? (
          <TimeGrid
            key={`${activePicker}-${formData[targetField] || 'unset'}`}
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, [targetField]: nextValue }));
              onClose();
            }}
          />
        ) : isTimezonePicker ? (
          <TimezoneGrid
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, timezone: nextValue }));
              onClose();
            }}
            timezoneOptions={timezoneOptions}
          />
        ) : isTitleEditor ? (
          <TitleEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, title: nextValue }));
              onClose();
            }}
          />
        ) : isCapacityEditor ? (
          <CapacityEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, capacity: nextValue }));
              onClose();
            }}
          />
        ) : isTicketPriceEditor ? (
          <TicketPriceEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, price: nextValue }));
              onClose();
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

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

const TitleEditor = ({ value, onSave, onCancel }) => {
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(draft.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="event-title-input" className="block text-sm font-medium text-white/70">
          Event name
        </label>
        <input
          id="event-title-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Give your event a standout name"
          className="mt-3 w-full rounded-2xl border border-white/15 bg-[#161b27] px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
        />
      </div>

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
        <legend className="text-sm font-medium text-white/70">Ticket pricing</legend>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setMode('free');
              setPrice('');
            }}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === 'free'
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-[#151b27] text-white/85 hover:border-white/30'
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
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-[#151b27] text-white/85 hover:border-white/30'
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
            <label htmlFor="ticket-price" className="text-xs font-medium uppercase tracking-wide text-white/45">
              Price per ticket (₦)
            </label>
            <input
              id="ticket-price"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter ticket price"
              className="w-full rounded-2xl border border-white/15 bg-[#161b27] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/35 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_PRICE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => applyQuickPrice(option)}
                className="rounded-xl border border-white/15 px-3 py-1 text-xs font-medium text-white/75 transition hover:border-white/35 hover:text-white"
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

export default OrganizerCreateEventPickerOverlay;
