import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const OptionCard = ({ label, icon, displayValue, onClick }) => (
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

const OrganizerCreateEventOptions = ({ variants, formData, capacityLabel, ticketPriceLabel, setActivePicker }) => (
  <MotionDiv
    className="rounded-[22px] border border-white/10 bg-[#0c121d]/95 p-6 shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8"
    variants={variants}
  >
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
        displayValue={ticketPriceLabel(formData.price)}
        onClick={() => setActivePicker('ticketPrice')}
      />
    </div>
  </MotionDiv>
);

export default OrganizerCreateEventOptions;
