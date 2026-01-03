import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, BellRing } from 'lucide-react';
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
      <div className="flex-1 space-y-4">
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
        className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl shadow-emerald-200/30 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_80px_rgba(12,40,90,0.45)]"
      >
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-white">
            <LineChart className="h-5 w-5 text-emerald-500" />
            Session Metrics
          </span>
          <span>Live</span>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-inner dark:bg-white/5">
          <div className="flex items-end gap-3">
            <div className="h-24 w-8 rounded-full bg-emerald-200" />
            <div className="h-32 w-8 rounded-full bg-emerald-300" />
            <div className="h-20 w-8 rounded-full bg-emerald-400" />
            <div className="h-36 w-8 rounded-full bg-emerald-500" />
            <div className="h-28 w-8 rounded-full bg-emerald-300" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Today vs. Yesterday</span>
          <span className="font-semibold text-emerald-500 dark:text-emerald-300">+18.4%</span>
        </div>
      </MotionDiv>
    </div>

    <div className="flex flex-col items-center gap-10 md:flex-row-reverse md:items-center">
      <div className="flex-1 space-y-4 text-left md:text-right">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">For students</p>
        <h2 className="text-3xl font-semibold tracking-tight">Smart Notifications</h2>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Receive curated alerts the moment new events match your interests, location, or clubs.
        </p>
      </div>
      <MotionDiv
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-4 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl shadow-blue-200/30 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_80px_rgba(12,40,90,0.45)]"
      >
        <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 text-left shadow-md dark:border-white/10 dark:bg-[#111d33]/80">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/20 p-2 text-blue-600 dark:text-blue-300">
              <BellRing className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">New Event Alert</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tech Club • 5 min ago</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            “Design Thinking Bootcamp” opens RSVPs at 7 PM. Reserve your seat before spots run out.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
            >
              View details
            </button>
            <button
              type="button"
              className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 hover:border-blue-300 hover:text-blue-700 dark:border-blue-500/40 dark:text-blue-300"
            >
              Remind me
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Notifications adapt to your categories, schedule, and campus location.
        </p>
      </MotionDiv>
    </div>
  </MotionSection>
);

export default FeatureShowcase;
