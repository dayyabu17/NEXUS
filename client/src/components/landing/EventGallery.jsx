import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const activityImages = [
  {
    src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    alt: 'Campus concert crowd',
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=700',
    alt: 'Hackathon collaboration',
  },
  {
    src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=700',
    alt: 'Seminar presentation',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=700',
    alt: 'Students cheering',
  },
  {
    src: 'https://images.unsplash.com/photo-1557804506-e969d0fc95cd?auto=format&fit=crop&q=80&w=700',
    alt: 'Tech lecture hall',
  },
  {
    src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=700',
    alt: 'Group workshop',
  },
];

const MotionSection = motion.section;
const MotionDiv = motion.div;

const EventGallery = () => (
  <MotionSection
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
    className="space-y-8"
  >
    <div className="space-y-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-300">
        Previous activity
      </p>
      <h2 className="text-3xl font-semibold tracking-tight">Moments captured by Nexus</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">
        Concerts, hackathons, seminars, and everything in between.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      {activityImages.map(({ src, alt, className }, index) => (
        <MotionDiv
          key={src}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/30 dark:border-white/10 dark:bg-white/5 ${className ?? ''}`}
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        </MotionDiv>
      ))}
    </div>
  </MotionSection>
);

export default EventGallery;
