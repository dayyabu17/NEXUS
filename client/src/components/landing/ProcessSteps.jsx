import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Ticket, QrCode } from 'lucide-react';
import { fadeUp } from './motionPresets';

const steps = [
  {
    title: 'Discover',
    description: 'Browse events tailored to you.',
    Icon: Compass,
  },
  {
    title: 'Book',
    description: 'Secure your spot digitally.',
    Icon: Ticket,
  },
  {
    title: 'Check-in',
    description: 'Scan and join the fun.',
    Icon: QrCode,
  },
];

const MotionSection = motion.section;
const MotionDiv = motion.div;

const ProcessSteps = () => (
  <MotionSection
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
    className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-10 shadow-lg shadow-slate-200/40 dark:border-white/10 dark:from-[#10192d] dark:to-[#0f1729]"
  >
    <div className="mx-auto max-w-4xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-300">
        How Nexus works
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">From discovery to check-in in minutes</h2>
    </div>
    <div className="relative mt-12 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
      <div className="pointer-events-none absolute left-12 right-12 top-[52%] hidden border-t border-dashed border-slate-300 dark:border-white/20 md:block" />
      {steps.map(({ title, description, Icon }) => (
        <MotionDiv
          key={title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-1 flex-col items-center gap-4 rounded-2xl border border-transparent bg-white/80 px-6 py-8 text-center shadow-sm shadow-slate-200/40 backdrop-blur dark:bg-white/5 dark:shadow-none"
        >
          <div className="rounded-full border border-emerald-200 bg-emerald-50 p-4 text-emerald-600 shadow dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200">
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </MotionDiv>
      ))}
    </div>
  </MotionSection>
);

export default ProcessSteps;
