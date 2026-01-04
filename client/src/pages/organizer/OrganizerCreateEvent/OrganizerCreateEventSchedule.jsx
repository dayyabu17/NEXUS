import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const OrganizerCreateEventSchedule = ({
  variants,
  formData,
  formatDateDisplay,
  formatTimeDisplay,
  setActivePicker,
  setPickerMonthAnchor,
  selectedTimezone,
}) => (
  <MotionDiv
    className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm transition dark:border-white/10 dark:bg-[rgba(17,24,38,0.88)] dark:shadow-[0_25px_60px_rgba(7,11,20,0.6)] sm:p-8"
    variants={variants}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div className="flex-1 space-y-5">
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-6 dark:border-white/5 dark:bg-[rgba(25,27,29,0.78)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-900 dark:text-white/90">Start</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-[18px] sm:border sm:border-slate-200 dark:sm:border-[#2f3741]">
                <button
                  type="button"
                  className="group relative flex flex-1 items-center justify-between rounded-none bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-[#2b3239] dark:text-white dark:hover:bg-[#333a43] dark:focus-visible:outline-white"
                  onClick={() => {
                    const baseline = formData.date ? new Date(formData.date) : new Date();
                    setPickerMonthAnchor(baseline);
                    setActivePicker('date');
                  }}
                >
                  <span className="pointer-events-none select-none font-semibold text-slate-900 dark:text-white/90">{formatDateDisplay(formData.date)}</span>
                </button>
                <button
                  type="button"
                  className="group relative flex flex-1 items-center justify-between rounded-none bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-[#2b3239] dark:text-white dark:hover:bg-[#333a43] sm:border-l sm:border-slate-200 dark:sm:border-[#38404a] dark:focus-visible:outline-white"
                  onClick={() => {
                    setActivePicker('time');
                  }}
                >
                  <span className="pointer-events-none select-none font-medium text-slate-900 dark:text-white/90">{formatTimeDisplay(formData.time)}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-900 dark:text-white/90">End</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-[18px] sm:border sm:border-slate-200 dark:sm:border-[#2f3741]">
                <button
                  type="button"
                  className="group relative flex flex-1 items-center justify-between rounded-none bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-[#2b3239] dark:text-white dark:hover:bg-[#333a43] dark:focus-visible:outline-white"
                  onClick={() => {
                    const baseline = formData.endDate
                      ? new Date(formData.endDate)
                      : formData.date
                        ? new Date(formData.date)
                        : new Date();
                    setPickerMonthAnchor(baseline);
                    setActivePicker('endDate');
                  }}
                >
                  <span className="pointer-events-none select-none font-semibold text-slate-900 dark:text-white/90">{formatDateDisplay(formData.endDate)}</span>
                </button>
                <button
                  type="button"
                  className="group relative flex flex-1 items-center justify-between rounded-none bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-[#2b3239] dark:text-white dark:hover:bg-[#333a43] sm:border-l sm:border-slate-200 dark:sm:border-[#38404a] dark:focus-visible:outline-white"
                  onClick={() => {
                    setActivePicker('endTime');
                  }}
                >
                  <span className="pointer-events-none select-none font-medium text-slate-900 dark:text-white/90">{formatTimeDisplay(formData.endTime)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="hidden h-[140px] w-px rounded-full bg-gradient-to-b from-slate-300 via-slate-200 to-transparent dark:from-white/60 dark:via-white/20 lg:block" aria-hidden />

      <div className="relative min-w-[190px] rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm transition dark:border-white/10 dark:bg-[rgba(13,17,27,0.92)] dark:text-white/80 dark:shadow-[0_25px_70px_rgba(5,10,20,0.6)]">
        <span className="text-2xl" aria-hidden>
          🌐
        </span>
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 dark:text-white/45">GMT offset</p>
        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selectedTimezone.label}</p>
        <p className="text-xs text-slate-500 dark:text-white/60">{selectedTimezone.location}</p>
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
  </MotionDiv>
);

export default OrganizerCreateEventSchedule;
