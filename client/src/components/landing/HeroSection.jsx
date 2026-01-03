import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionH1 = motion.h1;

const HeroSection = () => (
  <div className="relative w-full overflow-hidden bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
    <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" aria-hidden />

    <MotionSection
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 pt-20 pb-24 text-center sm:px-10 lg:pt-32"
    >
      <div className="space-y-6">
        <MotionH1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
        A campus that connects. A community that grows.
      </MotionH1>
        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          The central hub for every event, workshop, and gathering at Bayero University Kano.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          Get Started
        </button>
      </div>

      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-end md:justify-center md:gap-0 md:-space-x-4">
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="h-96 w-full max-w-sm overflow-hidden rounded-t-[100px] rounded-b-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80"
            alt="Students discussing on campus"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ y: [0, -12, 0] }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, y: { duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }}
          className="h-[500px] w-full max-w-md overflow-hidden rounded-t-[150px] rounded-b-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
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
          className="h-96 w-full max-w-sm overflow-hidden rounded-t-[100px] rounded-b-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=600&q=80"
            alt="Graduation celebration"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </MotionDiv>
      </div>
    </MotionSection>
  </div>
);

export default HeroSection;
