import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import api from '../api/axios';

const TIMEZONE_OPTIONS = [
  { value: 'GMT', label: 'GMT +0:00', location: 'Greenwich' },
  { value: 'GMT+1', label: 'GMT +1:00', location: 'Lagos' },
  { value: 'GMT+2', label: 'GMT +2:00', location: 'Cape Town' },
  { value: 'GMT-5', label: 'GMT -5:00', location: 'New York' },
  { value: 'GMT+8', label: 'GMT +8:00', location: 'Singapore' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  location: '',
  category: '',
  capacity: '',
  registrationFee: '',
  imageUrl: '',
  tags: '',
  timezone: TIMEZONE_OPTIONS[0].value,
};

const TITLE_PLACEHOLDER = 'Event Name';

const QUICK_PRICE_OPTIONS = ['500', '1000', '2000', '5000', '10000', '20000'];

const FALLBACK_DATE = 'Select date';
const FALLBACK_TIME = 'Set time';

const capacityLabel = (value) => {
  if (!value) {
    return 'Unlimited';
  }

  return `${value} seats`;
};

const ticketPriceLabel = (value) => {
  if (!value || Number(value) <= 0) {
    return 'Free';
  }

  const formatted = Number(value).toLocaleString();
  return `₦${formatted}`;
};

const formatDateDisplay = (value) => {
  if (!value) {
    return FALLBACK_DATE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return FALLBACK_DATE;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  const parts = formatter.formatToParts(date).reduce(
    (acc, part) => {
      acc[part.type] = part.value;
      return acc;
    },
    {},
  );

  const { weekday, day, month } = parts;

  if (!weekday || !day || !month) {
    return FALLBACK_DATE;
  }

  return `${weekday}, ${day} ${month}`;
};

const formatTimeDisplay = (value) => {
  if (!value) {
    return FALLBACK_TIME;
  }

  const [hours, minutes] = value.split(':');
  if (hours === undefined || minutes === undefined) {
    return FALLBACK_TIME;
  }

  const numericHours = Number(hours);
  const numericMinutes = Number(minutes);

  if (Number.isNaN(numericHours) || Number.isNaN(numericMinutes)) {
    return FALLBACK_TIME;
  }

  const twoDigit = (input) => input.toString().padStart(2, '0');
  return `${twoDigit(numericHours)}:${twoDigit(numericMinutes)}`;
};

const OrganizerCreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({ ...INITIAL_FORM }));
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState(null);
  const [success, setSuccess] = useState('');
  const [pickerMonthAnchor, setPickerMonthAnchor] = useState(() => new Date());
  const [showTitleCaret, setShowTitleCaret] = useState(true);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShowTitleCaret((prev) => !prev);
    }, 650);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (success) {
      setSuccess('');
    }

    if (name === 'imageUrl') {
      setCoverPreview(value);
    }
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, imageUrl: result }));
      setCoverPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setCoverPreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const requiredFields = ['title', 'description', 'date', 'time', 'location'];
    const missing = requiredFields.filter((field) => !formData[field]);

    if (missing.length > 0) {
      setError('Please fill out all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    const startDate = new Date(`${formData.date}T${formData.time}`);
    if (Number.isNaN(startDate.getTime())) {
      setError('Invalid start date or time.');
      return;
    }

    if (startDate.getTime() < Date.now()) {
      setError('Start date and time must be in the future.');
      return;
    }

    let formattedEndDate;
    if (formData.endDate) {
      const candidate = new Date(`${formData.endDate}T${formData.endTime || '00:00'}`);
      if (!Number.isNaN(candidate.getTime())) {
        formattedEndDate = candidate.toISOString();
      }
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: startDate.toISOString(),
      location: formData.location.trim(),
      category: formData.category.trim() || undefined,
      capacity: formData.capacity,
      registrationFee: formData.registrationFee,
      imageUrl: formData.imageUrl,
      tags: formData.tags,
      timezone: formData.timezone,
    };

    if (formattedEndDate) {
      payload.endDate = formattedEndDate;
    }
    if (formData.endTime) {
      payload.endTime = formData.endTime;
    }

    setSubmitting(true);
    try {
      await api.post('/organizer/events', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ ...INITIAL_FORM });
      setCoverPreview('');
      setSuccess('Event submitted for approval. Pending status until admin review.');

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        navigate('/organizer/events');
      }, 1200);
    } catch (submissionError) {
      const message =
        submissionError?.response?.data?.message || 'Something went wrong while creating the event.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTimezone =
    TIMEZONE_OPTIONS.find((option) => option.value === formData.timezone) || TIMEZONE_OPTIONS[0];

  return (
    <OrganizerLayoutDark>
      <section className="pb-16">
        <header className="mb-10 space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-white/50">Create event</p>
          <h1 className="text-4xl font-semibold text-white">Design a new experience</h1>
          <p className="text-base text-white/60">
            Provide the details, pick the perfect time, and submit for approval. Newly created events stay
            pending until an admin reviews them.
          </p>
        </header>

          {success && (
            <div className="pointer-events-none fixed left-1/2 top-6 z-[1100] w-full max-w-xl -translate-x-1/2 rounded-3xl border border-white/15 bg-[rgba(20,26,36,0.85)] px-6 py-4 text-center text-sm font-medium text-white/90 shadow-[0_25px_70px_rgba(5,10,20,0.6)] backdrop-blur">
              {success}
            </div>
          )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-80 xl:w-96">
            <div className="rounded-[22px] border border-white/10 bg-[#0f121d] p-6 text-sm text-white/70 shadow-[0_30px_80px_rgba(2,9,18,0.45)]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Event cover</p>
              <div className="mt-4 overflow-hidden rounded-[18px] border border-dashed border-white/10 bg-[#171b27]">
                {coverPreview ? (
                  <img src={coverPreview} alt="Event cover preview" className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-white/40">
                    <span className="text-4xl" aria-hidden>
                      📁
                    </span>
                    <p className="text-sm">Upload a cover image</p>
                    <p className="text-xs text-white/30">Recommended 1200 × 630px</p>
                  </div>
                )}
              </div>

              <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#a7a7a7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b5b5b5]">
                <span className="text-lg" aria-hidden>
                  ⬆️
                </span>
                Upload cover
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>

              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="mt-3 w-full rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Remove image
                </button>
              )}

              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Or paste a link</p>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1f2c] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>

              <p className="mt-6 text-xs leading-relaxed text-white/50">
                Uploading a cover helps attendees recognise your event instantly. You can update this later,
                but approvals go faster when the visual is ready.
              </p>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            <button
              type="button"
              aria-label="Set event name"
              className="relative flex min-h-[72px] w-full items-center rounded-none bg-transparent text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
              onClick={() => {
                if (success) {
                  setSuccess('');
                }
                setActivePicker('title');
              }}
            >
              {!formData.title && (
                <span
                  className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/70 transition-opacity ${
                    showTitleCaret ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                >
                  |
                </span>
              )}
              <span
                className={`block pl-5 text-5xl font-semibold leading-tight sm:text-6xl ${
                  formData.title ? 'text-white' : 'text-white/40'
                }`}
              >
                {formData.title || TITLE_PLACEHOLDER}
              </span>
            </button>

            <div className="rounded-[22px] border border-white/10 bg-[rgba(17,24,38,0.88)] p-6 shadow-[0_25px_60px_rgba(7,11,20,0.6)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-5">
                  <div className="rounded-[18px] border border-white/5 bg-[rgba(25,27,29,0.78)] px-5 py-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-white/90">Start</span>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-[18px] sm:border sm:border-[#2f3741]">
                          <button
                            type="button"
                            className="group relative flex flex-1 items-center justify-between rounded-none bg-[#2b3239] px-4 py-3 text-left text-sm text-white transition hover:bg-[#333a43]"
                            onClick={() => {
                              const baseline = formData.date ? new Date(formData.date) : new Date();
                              setPickerMonthAnchor(baseline);
                              setActivePicker('date');
                            }}
                          >
                            <span className="pointer-events-none select-none font-semibold text-white/90">{formatDateDisplay(formData.date)}</span>
                          </button>
                          <button
                            type="button"
                            className="group relative flex flex-1 items-center justify-between rounded-none bg-[#2b3239] px-4 py-3 text-left text-sm text-white transition hover:bg-[#333a43] sm:border-l sm:border-[#38404a]"
                            onClick={() => {
                              setActivePicker('time');
                            }}
                          >
                            <span className="pointer-events-none select-none font-medium text-white/90">{formatTimeDisplay(formData.time)}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-white/90">End</span>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-[18px] sm:border sm:border-[#2f3741]">
                          <button
                            type="button"
                            className="group relative flex flex-1 items-center justify-between rounded-none bg-[#2b3239] px-4 py-3 text-left text-sm text-white transition hover:bg-[#333a43]"
                            onClick={() => {
                              const baseline = formData.endDate ? new Date(formData.endDate) : formData.date ? new Date(formData.date) : new Date();
                              setPickerMonthAnchor(baseline);
                              setActivePicker('endDate');
                            }}
                          >
                            <span className="pointer-events-none select-none font-semibold text-white/90">{formatDateDisplay(formData.endDate)}</span>
                          </button>
                          <button
                            type="button"
                            className="group relative flex flex-1 items-center justify-between rounded-none bg-[#2b3239] px-4 py-3 text-left text-sm text-white transition hover:bg-[#333a43] sm:border-l sm:border-[#38404a]"
                            onClick={() => {
                              setActivePicker('endTime');
                            }}
                          >
                            <span className="pointer-events-none select-none font-medium text-white/90">{formatTimeDisplay(formData.endTime)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="hidden h-[140px] w-px rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent lg:block" aria-hidden />

                <div className="relative min-w-[190px] rounded-2xl border border-white/10 bg-[rgba(13,17,27,0.92)] p-5 text-white/80 shadow-[0_25px_70px_rgba(5,10,20,0.6)]">
                  <span className="text-2xl" aria-hidden>
                    🌐
                  </span>
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/45">GMT offset</p>
                  <p className="mt-2 text-base font-semibold text-white">{selectedTimezone.label}</p>
                  <p className="text-xs text-white/60">{selectedTimezone.location}</p>
                  <button
                    type="button"
                    onClick={() => setActivePicker('timezone')}
                    className="absolute inset-0 z-10 h-full w-full rounded-2xl bg-transparent focus:outline-none"
                    aria-label="Select timezone"
                  >
                    <span className="sr-only">Select timezone</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#0c121d]/95 p-6 shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="location" className="text-sm font-medium text-white/80">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Add the venue or meeting link"
                    className="mt-3 w-full rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 text-base text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium text-white/80">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell attendees what to expect"
                    className="mt-3 w-full rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 text-base text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#0c121d]/95 p-6 shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/45">Event options</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <OptionCard
                  label="Capacity"
                  icon="🪑"
                  displayValue={capacityLabel(formData.capacity)}
                  onClick={() => setActivePicker('capacity')}
                />
                <OptionCard
                  label="Ticket price"
                  icon="🎟️"
                  displayValue={ticketPriceLabel(formData.registrationFee)}
                  onClick={() => setActivePicker('ticketPrice')}
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#0c121d]/95 p-6 shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/45">Extras ✨</p>
              <div className="mt-5 space-y-3">
                <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-white/85">
                    <span aria-hidden>🗂️</span>
                    <span>Category</span>
                  </div>
                  <input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Technology"
                    className="rounded-xl border border-white/10 bg-[#1b2330] px-4 py-2 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-white/85">
                    <span aria-hidden>🏷️</span>
                    <span>Tags</span>
                  </div>
                  <input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="hackathon, coding, students"
                    className="rounded-xl border border-white/10 bg-[#1b2330] px-4 py-2 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-[18px] bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Create event'}
              </button>
              <p className="text-center text-xs text-white/60">
                Events submit in a pending state while your admin team reviews the details.
              </p>
            </div>
          </div>
        </form>
      </section>

      <PickerOverlay
        activePicker={activePicker}
        onClose={() => setActivePicker(null)}
        formData={formData}
        setFormData={setFormData}
        pickerMonthAnchor={pickerMonthAnchor}
        setPickerMonthAnchor={setPickerMonthAnchor}
      />
    </OrganizerLayoutDark>
  );
};

const PickerOverlay = ({ activePicker, onClose, formData, setFormData, pickerMonthAnchor, setPickerMonthAnchor }) => {
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
      return;
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
    ticketPrice: 'registrationFee',
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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur" onClick={handleBackdropClick}>
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
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10" onClick={onClose}>
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
              setFormData((prev) => ({ ...prev, registrationFee: nextValue }));
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

  const startWeekday = (workingDate.getDay() + 6) % 7; // Monday-first week
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
  const options = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  return (
    <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
      {options.map((option) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
              isSelected
                ? 'border-white bg-white text-black'
                : 'border-white/10 bg-[#18202d] text-white/80 hover:border-white/30'
            }`}
            onClick={() => {
              onSelect(option);
            }}
          >
            <span>{option}</span>
            {isSelected && <span className="text-xs font-semibold">Selected</span>}
          </button>
        );
      })}
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
  const [mode, setMode] = useState(!value || Number(value) <= 0 ? 'free' : 'paid');
  const [price, setPrice] = useState(value || '');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === 'free') {
      onSave('');
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
            onClick={() => setMode('free')}
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
            onClick={() => setMode('paid')}
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

const TimezoneGrid = ({ value, onSelect }) => {
  return (
    <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
      {TIMEZONE_OPTIONS.map((option) => {
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
};

const OptionCard = ({ label, icon, displayValue, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-4 rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 text-left text-white/80 transition hover:border-white/25 hover:bg-[#1b2332]"
    >
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-white/45">
        <span>{label}</span>
        <span aria-hidden className="text-base">
          ✏️
        </span>
      </div>
      <div className="flex items-center justify-between text-white">
        <span className="text-lg font-medium">{displayValue}</span>
        <span aria-hidden className="text-xl">{icon}</span>
      </div>
    </button>
  );
};

export default OrganizerCreateEvent;
