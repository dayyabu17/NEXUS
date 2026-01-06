import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;

const GALLERY_ITEMS = [
  { src: 'https://images.unsplash.com/photo-1503424886307-b090341d25d1?auto=format&fit=crop&w=800&q=80', alt: 'Students cheering at a concert' },
  { src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80', alt: 'Tech workshop in session' },
  { src: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=800&q=80', alt: 'Outdoor networking event' },
  { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80', alt: 'Students discussing in a lecture hall' },
  { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', alt: 'Hackathon teams coding' },
  { src: 'https://images.unsplash.com/photo-1526178612370-3e18c2dce025?auto=format&fit=crop&w=800&q=80', alt: 'Cheering crowd at a cultural event' },
];

const EventGallery = () => (
  <MotionSection
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
    className="space-y-8 text-slate-900 transition-colors duration-300 dark:text-white"
  >
    <div className="space-y-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 transition-colors duration-300 dark:text-slate-300">
        Previous activity
      </p>
      <h2 className="text-3xl font-semibold tracking-tight">Moments captured by Nexus</h2>
      <p className="text-base text-slate-600 transition-colors duration-300 dark:text-slate-400">
        Concerts, hackathons, seminars, and everything in between.
      </p>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {GALLERY_ITEMS.map(({ src, alt }) => (
        <div
          key={src}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  </MotionSection>
);

export default EventGallery;
