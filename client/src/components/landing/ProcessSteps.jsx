import React from 'react';

const steps = [
  {
    title: 'Discover',
    description: 'Browse events tailored to your interests across campus.',
    Icon: () => (
      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="1.6" d="m11 3 1.2 2.9L15 7l-2 2.2L13.4 12 11 10.7 8.6 12 9 9.2 7 7l2.8-.1L11 3z" />
        <circle strokeWidth="1.6" cx="11" cy="11" r="7" />
      </svg>
    ),
  },
  {
    title: 'Book',
    description: 'Secure your spot instantly with a digital ticket.',
    Icon: () => (
      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect strokeWidth="1.6" x="4" y="5" width="16" height="14" rx="2" />
        <path strokeWidth="1.6" d="M4 9h16M10 13l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Check-in',
    description: 'Scan your QR code at the venue and join the fun.',
    Icon: () => (
      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="1.6" d="M3 4h18" />
        <path strokeWidth="1.6" d="M3 20h18" />
        <rect strokeWidth="1.6" x="7" y="8" width="4" height="4" rx="1" />
        <rect strokeWidth="1.6" x="13" y="8" width="4" height="4" rx="1" />
        <path strokeWidth="1.6" d="M7 16h4" />
        <path strokeWidth="1.6" d="M13 16h4" />
      </svg>
    ),
  },
];

const ProcessSteps = () => (
  <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12">
    <div className="space-y-4 text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">How Nexus Works</h2>
      <p className="text-base text-slate-600 dark:text-slate-400">
        Follow the simple journey to plan and enjoy unforgettable experiences.
      </p>
    </div>

    <div className="relative w-full">
      <svg
        className="pointer-events-none absolute top-8 left-0 h-20 w-full -z-0"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M120 140 C320 40 520 40 720 140 S1080 240 1080 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="stroke-slate-400 dark:stroke-slate-700"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-12 sm:flex-row sm:justify-between">
        {steps.map(({ title, description, Icon }) => (
          <div key={title} className="flex w-full max-w-[220px] flex-col items-center gap-6 text-center">
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
              <Icon />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSteps;
