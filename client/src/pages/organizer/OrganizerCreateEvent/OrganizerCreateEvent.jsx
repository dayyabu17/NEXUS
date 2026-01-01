import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OrganizerLayoutDark from '../../../layouts/OrganizerLayoutDark';
import OrganizerCreateEventSidebar from './OrganizerCreateEventSidebar';
import OrganizerCreateEventSchedule from './OrganizerCreateEventSchedule';
import OrganizerCreateEventDetails from './OrganizerCreateEventDetails';
import OrganizerCreateEventOptions from './OrganizerCreateEventOptions';
import OrganizerCreateEventExtras from './OrganizerCreateEventExtras';
import OrganizerCreateEventPickerOverlay from './OrganizerCreateEventPickerOverlay';
import useOrganizerCreateEvent from '../../../hooks/organizer/useOrganizerCreateEvent';
import {
  capacityLabel,
  formatDateDisplay,
  formatTimeDisplay,
  ticketPriceLabel,
} from '../../../utils/eventFormatters';

const MotionSection = motion.section;

const containerVars = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

const OrganizerCreateEvent = () => {
  const [activePicker, setActivePicker] = useState(null);
  const [pickerMonthAnchor, setPickerMonthAnchor] = useState(() => new Date());
  const [showTitleCaret, setShowTitleCaret] = useState(true);

  const {
    formData,
    setFormData,
    coverPreview,
    submitting,
    error,
    success,
    handleChange,
    handleCoverUpload,
    handleRemoveCover,
    handleLocationSelect,
    handleCategorySelect,
    handleSubmit,
    clearSuccess,
    selectedTimezone,
    timezoneOptions,
    titlePlaceholder,
  } = useOrganizerCreateEvent();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShowTitleCaret((prev) => !prev);
    }, 650);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <OrganizerLayoutDark>
      <MotionSection className="pb-16" initial="hidden" animate="show" variants={containerVars}>
        <motion.header className="mb-10 space-y-3" variants={itemVars}>
          <p className="text-sm font-medium uppercase tracking-wide text-white/50">Create event</p>
          <h1 className="text-4xl font-semibold text-white">Create a new event</h1>
          <p className="text-base text-white/60">
            Provide the details, pick the perfect time, and submit for approval. Newly created events stay
            pending until an admin reviews them.
          </p>
        </motion.header>

        <AnimatePresence>
          {success && (
            <motion.div
              className="pointer-events-none fixed left-1/2 top-6 z-[1100] w-full max-w-xl -translate-x-1/2 rounded-3xl border border-white/15 bg-[rgba(20,26,36,0.85)] px-6 py-4 text-center text-sm font-medium text-white/90 shadow-[0_25px_70px_rgba(5,10,20,0.6)] backdrop-blur"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form onSubmit={handleSubmit} className="flex flex-col gap-8 lg:flex-row" variants={itemVars}>
          <OrganizerCreateEventSidebar
            variants={itemVars}
            coverPreview={coverPreview}
            imageUrl={formData.imageUrl}
            onImageUrlChange={handleChange}
            onCoverUpload={handleCoverUpload}
            onRemoveCover={handleRemoveCover}
          />

          <motion.div className="flex-1 space-y-8" variants={itemVars}>
            <motion.div variants={itemVars}>
              <button
                type="button"
                aria-label="Set event name"
                className="relative flex min-h-[72px] w-full items-center rounded-none bg-transparent text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                onClick={() => {
                  clearSuccess();
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
                  {formData.title || titlePlaceholder}
                </span>
              </button>
            </motion.div>

            <OrganizerCreateEventSchedule
              variants={itemVars}
              formData={formData}
              formatDateDisplay={formatDateDisplay}
              formatTimeDisplay={formatTimeDisplay}
              setActivePicker={setActivePicker}
              setPickerMonthAnchor={setPickerMonthAnchor}
              selectedTimezone={selectedTimezone}
            />

            <OrganizerCreateEventDetails
              variants={itemVars}
              formData={formData}
              onLocationChange={handleLocationSelect}
              onChange={handleChange}
            />

            <OrganizerCreateEventOptions
              variants={itemVars}
              formData={formData}
              capacityLabel={capacityLabel}
              ticketPriceLabel={ticketPriceLabel}
              setActivePicker={setActivePicker}
            />

            <OrganizerCreateEventExtras
              variants={itemVars}
              formData={formData}
              onCategorySelect={handleCategorySelect}
              onChange={handleChange}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="flex flex-col gap-4" variants={itemVars}>
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
            </motion.div>
          </motion.div>
        </motion.form>
      </MotionSection>

      <OrganizerCreateEventPickerOverlay
        activePicker={activePicker}
        onClose={() => setActivePicker(null)}
        formData={formData}
        setFormData={setFormData}
        pickerMonthAnchor={pickerMonthAnchor}
        setPickerMonthAnchor={setPickerMonthAnchor}
        timezoneOptions={timezoneOptions}
      />
    </OrganizerLayoutDark>
  );
};

export default OrganizerCreateEvent;
