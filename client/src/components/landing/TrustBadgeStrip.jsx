import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;

const TrustBadgeStrip = () => (
  <MotionSection
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
    className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-200/40 transition-colors duration-300 backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
  >
    <p className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 transition-colors duration-300 dark:text-slate-300">
      Presented to
    </p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-10 text-sm font-semibold tracking-widest text-slate-500 transition-colors duration-300 dark:text-slate-400">
      <span className="uppercase">Dept of Software Engineering</span>
      {/* <span className="uppercase">Student Affairs</span>
      <span className="uppercase">Tech Club</span>
      <span className="uppercase">MSSN</span> */}
    </div>
  </MotionSection>
);

export default TrustBadgeStrip;
