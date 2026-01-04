import React from 'react';
import { formatDateTime } from './eventViewUtils';

const OrganizerEventFeedback = ({
  feedbackList,
  feedbackLoading,
  feedbackError,
  resolveProfileImage,
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
        Attendee feedback
      </h3>
      <span className="text-xs text-slate-500 dark:text-white/50">{feedbackList.length} entries</span>
    </div>

    {feedbackLoading ? (
      <p className="mt-6 text-sm text-slate-500 dark:text-white/60">Loading feedback...</p>
    ) : feedbackError ? (
      <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {feedbackError}
      </p>
    ) : feedbackList.length === 0 ? (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
        No feedback has been submitted yet. Encourage attendees to share their thoughts after the event.
      </p>
    ) : (
      <ul className="mt-6 space-y-4">
        {feedbackList.map((entry) => {
          const avatarSrc = resolveProfileImage(entry.user?.avatar);
          const ratingLabel = entry.rating ? `${entry.rating}/5` : null;

          return (
            <li
              key={entry.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 transition dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-white/15 dark:bg-white/10">
                    <img
                      src={avatarSrc}
                      alt={entry.user?.name || 'Attendee'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{entry.user?.name || 'Attendee'}</p>
                    <p className="text-xs text-slate-600 dark:text-white/60">
                      {entry.user?.email || 'unknown@nexus.app'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-white/50">
                  {entry.createdAt ? formatDateTime(entry.createdAt) : 'Time unknown'}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-700 dark:text-white/80">{entry.message}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                {ratingLabel ? (
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
                    Rating: {ratingLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
                    No rating provided
                  </span>
                )}
                <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-white/35">
                  Feedback #{entry.id?.toString().slice(-6) || '—'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default OrganizerEventFeedback;
