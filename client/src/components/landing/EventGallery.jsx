import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './motionPresets';

const MotionSection = motion.section;
const MotionTrack = motion.div;

const row1Images = [
  { src: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80', alt: 'Developers collaborating at a hackathon' },
  { src: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80', alt: 'Students coding together in a lab' },
  { src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80', alt: 'Speaker presenting at a seminar' },
  { src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', alt: 'Laptop with code during workshop session' },
  { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', alt: 'Developer typing lines of code at night' },
  { src: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=800&q=80', alt: 'Team planning on whiteboard' },
  { src: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=800&q=80', alt: 'Young professionals at a tech meetup' },
  { src: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80', alt: 'MacBooks with code editor open' },
  { src: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=800&q=80', alt: 'Students building a hardware prototype' },
  { src: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=800&q=80', alt: 'Mentor guiding student during workshop' },
];

const row2Images = [
  { src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80', alt: 'Friends celebrating at a campus festival' },
  { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', alt: 'Outdoor concert crowd cheering' },
  { src: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=800&q=80', alt: 'University sports team huddle' },
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', alt: 'Students laughing together on campus' },
  { src: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=800&q=80', alt: 'Graduates tossing caps in the air' },
  { src: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=800&q=80', alt: 'Campus festival with lights' },
  { src: 'https://images.unsplash.com/photo-1512427691650-1e0c2f9a2f04?auto=format&fit=crop&w=800&q=80', alt: 'Students cheering at a sporting event' },
  { src: 'https://images.unsplash.com/photo-1502810190503-8303352d5b8c?auto=format&fit=crop&w=800&q=80', alt: 'Friends enjoying music at sunset' },
  { src: 'https://images.unsplash.com/photo-1430263326118-b75aa0da770b?auto=format&fit=crop&w=800&q=80', alt: 'Students playing basketball on campus' },
  { src: 'https://images.unsplash.com/photo-1526178612370-3e18c2dce025?auto=format&fit=crop&w=800&q=80', alt: 'Cheering crowd at a cultural event' },
];

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

    <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden py-10">
      <div className="absolute inset-0 bg-slate-900/20" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950 to-transparent" aria-hidden />

      <div className="relative flex flex-col gap-8">
        <div className="overflow-hidden">
          <MotionTrack
            className="flex min-w-full w-max gap-6"
            initial={{ x: '0%' }}
            animate={{ x: '-50%' }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          >
            {[...row1Images, ...row1Images].map((image, index) => (
              <motion.div
                key={`${image.src}-row1-${index}`}
                whileHover={{ scale: 1.05 }}
                className="h-48 w-72 flex-shrink-0 overflow-hidden rounded-xl"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </MotionTrack>
        </div>

        <div className="overflow-hidden">
          <MotionTrack
            className="flex min-w-full w-max gap-6"
            initial={{ x: '-50%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          >
            {[...row2Images, ...row2Images].map((image, index) => (
              <motion.div
                key={`${image.src}-row2-${index}`}
                whileHover={{ scale: 1.05 }}
                className="h-48 w-72 flex-shrink-0 overflow-hidden rounded-xl"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </MotionTrack>
        </div>
      </div>
    </div>
  </MotionSection>
);

export default EventGallery;
