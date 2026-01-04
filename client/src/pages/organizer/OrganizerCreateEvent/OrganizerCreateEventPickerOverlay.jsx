import React, { useEffect } from 'react';
import CapacityEditor from './CapacityEditor';
import DateGrid from './DateGrid';
import TicketPriceEditor from './TicketPriceEditor';
import TimeGrid from './TimeGrid';
import TimezoneGrid from './TimezoneGrid';
import TitleEditor from './TitleEditor';

const targetFields = {
  title: 'title',
  date: 'date',
  time: 'time',
  endDate: 'endDate',
  endTime: 'endTime',
  timezone: 'timezone',
  capacity: 'capacity',
  ticketPrice: 'price',
};

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

  const targetField = targetFields[activePicker];
  if (!targetField) {
    return null;
  }

  const isDatePicker = activePicker === 'date' || activePicker === 'endDate';
  const isTimePicker = activePicker === 'time' || activePicker === 'endTime';
  const isTimezonePicker = activePicker === 'timezone';
  const isTitleEditor = activePicker === 'title';
  const isCapacityEditor = activePicker === 'capacity';
  const isTicketPriceEditor = activePicker === 'ticketPrice';

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const heading = (() => {
    if (isDatePicker) {
      return targetField === 'date' ? 'Select start date' : 'Select end date';
    }

    if (isTimePicker) {
      return targetField === 'time' ? 'Select start time' : 'Select end time';
    }

    if (isTimezonePicker) {
      return 'Select timezone';
    }

    if (isTitleEditor) {
      return 'Set event name';
    }

    if (isCapacityEditor) {
      return 'Set capacity';
    }

    if (isTicketPriceEditor) {
      return 'Set ticket price';
    }

    return '';
  })();

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur dark:bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-xl transition dark:border-white/10 dark:bg-[rgba(13,17,27,0.95)] dark:text-white dark:shadow-[0_30px_90px_rgba(5,10,20,0.65)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white/90">{heading}</h2>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {isDatePicker && (
          <DateGrid
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, [targetField]: nextValue }));
              onClose();
            }}
            anchorDate={pickerMonthAnchor}
            setAnchorDate={setPickerMonthAnchor}
          />
        )}

        {isTimePicker && (
          <TimeGrid
            key={`${activePicker}-${formData[targetField] || 'unset'}`}
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, [targetField]: nextValue }));
              onClose();
            }}
          />
        )}

        {isTimezonePicker && (
          <TimezoneGrid
            value={formData[targetField]}
            onSelect={(nextValue) => {
              setFormData((prev) => ({ ...prev, timezone: nextValue }));
              onClose();
            }}
            timezoneOptions={timezoneOptions}
          />
        )}

        {isTitleEditor && (
          <TitleEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, title: nextValue }));
              onClose();
            }}
          />
        )}

        {isCapacityEditor && (
          <CapacityEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, capacity: nextValue }));
              onClose();
            }}
          />
        )}

        {isTicketPriceEditor && (
          <TicketPriceEditor
            value={formData[targetField]}
            onCancel={onClose}
            onSave={(nextValue) => {
              setFormData((prev) => ({ ...prev, price: nextValue }));
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizerCreateEventPickerOverlay;
