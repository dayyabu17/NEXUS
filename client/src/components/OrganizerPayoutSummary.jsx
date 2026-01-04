import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const OrganizerPayoutSummary = ({ formattedNextPayout, formattedAverageDelay, feeRatePercent, tip, defaultSummaryTip }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.55, ease: [0.25, 0.8, 0.5, 1] }}
    className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_28px_80px_rgba(5,10,30,0.5)]"
  >
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-white/45">Payout summary</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Settlement timeline</h2>
    </div>
    <div className="mt-6 space-y-5 text-sm text-slate-600 dark:text-white/60">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-700/30">
        Next scheduled payout <span className="text-slate-900 dark:text-white">{formattedNextPayout}</span>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-700/30">
        Average settlement delay <span className="text-slate-900 dark:text-white">{formattedAverageDelay}</span>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-700/30">
        Nexus fee rate <span className="text-slate-900 dark:text-white">{feeRatePercent}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-white/40">{tip || defaultSummaryTip}</p>
    </div>
  </MotionDiv>
);

export default OrganizerPayoutSummary;
