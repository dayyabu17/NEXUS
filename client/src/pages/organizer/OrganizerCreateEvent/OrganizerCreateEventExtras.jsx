import React from 'react';
import { motion } from 'framer-motion';
import { EVENT_CATEGORIES } from '../../../constants/categories';

const MotionDiv = motion.div;

const OrganizerCreateEventExtras = ({ variants, formData, onCategorySelect, onChange }) => (
  <MotionDiv
    className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0c121d]/95 dark:shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8"
    variants={variants}
  >
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">Extras ✨</p>
    <div className="mt-5 space-y-3">
      <div className="space-y-4 rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-[#151b27]">
        <div className="flex items-center gap-3 text-slate-700 dark:text-white/85">
          <span aria-hidden>🗂️</span>
          <span className="text-sm font-medium">Category</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {EVENT_CATEGORIES.map((category) => {
            const isActive = formData.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategorySelect(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none ${
                  isActive
                    ? 'bg-accent-600 text-white border border-accent-600 shadow-lg shadow-accent-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-accent-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-4 transition dark:border-white/10 dark:bg-[#151b27] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-slate-700 dark:text-white/85">
          <span aria-hidden>🏷️</span>
          <span>Tags</span>
        </div>
        <input
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={onChange}
          placeholder="hackathon, coding, students"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-[#1b2330] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
        />
      </div>
    </div>
  </MotionDiv>
);

export default OrganizerCreateEventExtras;
