import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const FeatureShowcase = () => (
  <MotionSection
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
    className="space-y-20"
  >
    <div className="flex flex-col items-center gap-10 md:flex-row md:items-center">
      <div className="flex-1 space-y-4 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">For organizers</p>
        <h2 className="text-3xl font-semibold tracking-tight">Real-time Analytics</h2>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Monitor ticket velocity, attendance benchmarks, and payment settlements as they happen.
        </p>
      </div>
      <MotionDiv
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="grid w-full grid-cols-2 gap-4">
            <img
              src="/images/organizer-earnings.png"
              alt="Organizer earnings dashboard"
              className="col-span-2 h-auto w-full rounded-xl border border-slate-800 shadow-lg"
            />
            <img
              src="/images/organizer-feedback.png"
              alt="Organizer feedback panel"
              className="h-full w-full rounded-xl border border-slate-800 object-cover object-top shadow-lg"
            />
            <img
              src="/images/organizer-guest.png"
              alt="Organizer guest list"
              className="h-full w-full rounded-xl border border-slate-800 object-cover object-top shadow-lg"
            />
          </div>
        </div>
      </MotionDiv>
    </div>

    <div className="flex flex-col items-center gap-10 md:flex-row md:items-center">
      <MotionDiv
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-auto md:flex md:justify-start"
      >
        <img
          src="/images/smart-notifications.png"
          alt="Smart notifications on mobile"
          className="mx-auto w-full max-w-[300px] rounded-[2rem] border-[8px] border-slate-800 shadow-2xl"
        />
      </MotionDiv>
      <div className="flex-1 space-y-4 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">For students</p>
        <h2 className="text-3xl font-semibold tracking-tight">Smart Alerts</h2>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Receive curated alerts the moment new events match your interests, location, or clubs.
        </p>
      </div>
    </div>
  </MotionSection>
);

export default FeatureShowcase;
