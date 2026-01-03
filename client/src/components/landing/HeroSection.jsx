import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionH1 = motion.h1;

const HeroSection = () => (
  <MotionSection
    initial="hidden"
    animate="visible"
    variants={fadeUp}
    className="relative flex flex-col items-center gap-12 text-center"
  >
    <div className="space-y-6">
      <MotionH1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
        A campus that connects. A community that grows.
      </MotionH1>
      <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        The central hub for every event, workshop, and gathering at Bayero University Kano.
      </p>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        Get Started
      </button>
    </div>

    <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-end md:justify-center">
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="h-72 w-full max-w-sm overflow-hidden rounded-t-[100px] rounded-b-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-white/15 dark:bg-white/5"
      >
        <img
          src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80"
          alt="Students discussing on campus"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="h-80 w-full max-w-md overflow-hidden rounded-t-[140px] rounded-b-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/40 dark:border-white/15 dark:bg-white/5"
      >
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"
          alt="Large lecture hall event"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="h-72 w-full max-w-sm overflow-hidden rounded-t-[100px] rounded-b-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-white/15 dark:bg-white/5"
      >
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80"
          alt="Graduation celebration"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </MotionDiv>
    </div>
  </MotionSection>
);

export default HeroSection;
