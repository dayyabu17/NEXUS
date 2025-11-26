import React from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from './OrganizerLayoutDark';

const MotionSection = motion.section;

const OrganizerEarnings = () => (
  <OrganizerLayoutDark>
    <MotionSection
      className="pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="pt-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Earnings</h1>
        <p className="mt-4 max-w-xl text-sm text-white/60">
          Earnings analytics for organizers are coming soon. Check back later to see revenue trends and payout summaries.
        </p>
      </div>
    </MotionSection>
  </OrganizerLayoutDark>
);

export default OrganizerEarnings;
