import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const OptionCard = ({ label, icon, displayValue, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-white px-5 py-4 text-left text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-[#151b27] dark:text-white/80 dark:hover:border-white/25 dark:hover:bg-[#1b2332]"
  >
    <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
      <span>{label}</span>
      <span aria-hidden className="text-base">✏️</span>
    </div>
    <div className="flex items-center justify-between text-slate-900 dark:text-white">
      <span className="text-lg font-medium">{displayValue}</span>
      <span aria-hidden className="text-xl">{icon}</span>
    </div>
  </button>
);

const OrganizerCreateEventOptions = ({ variants, formData, capacityLabel, ticketPriceLabel, setActivePicker }) => (
  <MotionDiv
    className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0c121d]/95 dark:shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8"
    variants={variants}
  >
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">Event options</p>
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
        displayValue={ticketPriceLabel(formData.price)}
        onClick={() => setActivePicker('ticketPrice')}
      />
    </div>
  </MotionDiv>
);

export default OrganizerCreateEventOptions;
