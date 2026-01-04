import React from 'react';
import { motion } from 'framer-motion';

const MotionAside = motion.aside;

const OrganizerCreateEventSidebar = ({
  variants,
  coverPreview,
  imageUrl,
  onImageUrlChange,
  onCoverUpload,
  onRemoveCover,
}) => (
  <MotionAside className="lg:w-80 xl:w-96" variants={variants}>
    <div className="rounded-[22px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm transition dark:border-white/10 dark:bg-[#0f121d] dark:text-white/70 dark:shadow-[0_30px_80px_rgba(2,9,18,0.45)]">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">Event cover</p>
      <div className="mt-4 overflow-hidden rounded-[18px] border border-dashed border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-[#171b27]">
        {coverPreview ? (
          <img src={coverPreview} alt="Event cover preview" className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500 dark:text-white/40">
            <span className="text-4xl" aria-hidden>
              📁
            </span>
            <p className="text-sm">Upload a cover image</p>
            <p className="text-xs text-slate-400 dark:text-white/30">Recommended 1200 × 630px</p>
          </div>
        )}
      </div>

      <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#a7a7a7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b5b5b5]">
        <span className="text-lg" aria-hidden>
          ⬆️
        </span>
        Upload cover
        <input type="file" accept="image/*" className="hidden" onChange={onCoverUpload} />
      </label>

      {coverPreview && (
        <button
          type="button"
          onClick={onRemoveCover}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
        >
          Remove image
        </button>
      )}

      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-white/35">Or paste a link</p>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/banner.jpg"
          value={imageUrl}
          onChange={onImageUrlChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-[#1a1f2c] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
        />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500 dark:text-white/50">
        Uploading a cover helps attendees recognise your event instantly. You can update this later, but approvals go faster when the visual is ready.
      </p>
    </div>
  </MotionAside>
);

export default OrganizerCreateEventSidebar;
